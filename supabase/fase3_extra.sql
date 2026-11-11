-- =============================================================================
-- Sunbiotan — Fase 3: extras (handle_new_user, create_order, índices)
-- =============================================================================
-- ORDEN DE EJECUCIÓN (SQL editor de Supabase, a mano):
--   1. supabase/rls_policies.sql   (idempotente; refleja el estado de producción)
--   2. supabase/fase3_extra.sql    (este archivo; idempotente)
-- Se puede re-ejecutar sin efectos secundarios.
--
-- VERIFICAR ANTES DE CORRER — columnas asumidas (inferidas del código; no hay
-- CREATE TABLE en el repo):
--   orders:      id uuid (default), professional_id uuid, center_id uuid null,
--                message text null, status text ('pending'|'confirmed'|'shipped'|'delivered'),
--                created_at timestamptz (default now())
--   order_items: id (default), order_id uuid → orders.id, product_id uuid → products.id,
--                quantity integer
--   products:    id uuid, active boolean
--   profiles:    id, role, approved, full_name, email, locale, center_id, password_set
-- Comprobación rápida:
--   select table_name, column_name, data_type, column_default
--   from information_schema.columns
--   where table_schema = 'public' and table_name in ('orders','order_items')
--   order by table_name, ordinal_position;
-- =============================================================================


-- -----------------------------------------------------------------------------
-- a) handle_new_user endurecido
-- -----------------------------------------------------------------------------
-- Antes tomaba el rol de raw_user_meta_data, que el propio usuario controla en
-- un signUp. Ahora el rol y la aprobación los decide siempre el servidor:
-- todo usuario nuevo nace professional y NO aprobado. La aprobación la hace el
-- dashboard (service role) al aprobar la candidatura.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_locale    text := new.raw_user_meta_data ->> 'locale';
  v_full_name text := nullif(btrim(left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 200)), '');
begin
  if v_locale is null or v_locale not in ('pt', 'es', 'en', 'it', 'fr') then
    v_locale := 'pt';
  end if;

  insert into public.profiles (id, role, approved, full_name, email, locale)
  values (new.id, 'professional', false, v_full_name, lower(new.email), v_locale)
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- b) create_order(p_message, p_items) → uuid
-- -----------------------------------------------------------------------------
-- SECURITY INVOKER (decisión): la función corre con los permisos del
-- profesional, así que TODAS las policies RLS siguen aplicando
-- (orders_insert_own, order_items_insert_own, products_select_*). Encima se
-- validan explícitamente sesión, aprobación, forma del payload, cantidades y
-- productos activos. Con DEFINER habría que replicar a mano cada regla de RLS
-- y un descuido abriría inserts sin control; INVOKER es defensa en profundidad.
-- Al ser una sola función plpgsql, orders + order_items van en la misma
-- transacción: si algo falla no queda un pedido sin líneas.
create or replace function public.create_order(p_message text, p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_center  uuid;
  v_order   uuid;
  v_item    jsonb;
  v_qty_num numeric;
  v_count   int;
begin
  if v_uid is null then
    raise exception 'create_order: not authenticated' using errcode = '42501';
  end if;

  if not public.is_approved_professional() then
    raise exception 'create_order: not an approved professional' using errcode = '42501';
  end if;

  if p_message is not null and char_length(p_message) > 2000 then
    raise exception 'create_order: message too long' using errcode = '22023';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'create_order: p_items must be an array' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_items);
  if v_count = 0 or v_count > 100 then
    raise exception 'create_order: p_items must have between 1 and 100 items' using errcode = '22023';
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(v_item) <> 'object'
       or jsonb_typeof(v_item -> 'product_id') is distinct from 'string'
       or jsonb_typeof(v_item -> 'quantity') is distinct from 'number' then
      raise exception 'create_order: invalid item shape' using errcode = '22023';
    end if;

    if (v_item ->> 'product_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'create_order: invalid product_id' using errcode = '22023';
    end if;

    v_qty_num := (v_item ->> 'quantity')::numeric;
    if v_qty_num <> trunc(v_qty_num) or v_qty_num < 1 or v_qty_num > 1000 then
      raise exception 'create_order: quantity must be an integer between 1 and 1000' using errcode = '22023';
    end if;

    if not exists (
      select 1 from public.products p
      where p.id = (v_item ->> 'product_id')::uuid and p.active = true
    ) then
      raise exception 'create_order: product not available' using errcode = '22023';
    end if;
  end loop;

  -- Mismo producto repetido: se suman las cantidades (y se respeta el tope).
  if exists (
    select 1
    from jsonb_array_elements(p_items) e
    group by (e ->> 'product_id')::uuid
    having sum((e ->> 'quantity')::numeric) > 1000
  ) then
    raise exception 'create_order: quantity per product exceeds 1000' using errcode = '22023';
  end if;

  -- Igual que el código anterior del portal: center_id del perfil (o null),
  -- message opcional, status 'pending'.
  select pr.center_id into v_center from public.profiles pr where pr.id = v_uid;

  insert into public.orders (professional_id, center_id, message, status)
  values (v_uid, v_center, nullif(btrim(coalesce(p_message, '')), ''), 'pending')
  returning id into v_order;

  insert into public.order_items (order_id, product_id, quantity)
  select v_order, (e ->> 'product_id')::uuid, sum((e ->> 'quantity')::numeric)::int
  from jsonb_array_elements(p_items) e
  group by (e ->> 'product_id')::uuid;

  return v_order;
end;
$$;

revoke all on function public.create_order(text, jsonb) from public, anon;
grant execute on function public.create_order(text, jsonb) to authenticated;


-- -----------------------------------------------------------------------------
-- c) Índices y normalización para las consultas nuevas
-- -----------------------------------------------------------------------------
-- La API guarda los emails en minúscula y deduplica con igualdad exacta:
-- normalizar las filas viejas.
update public.partner_requests
set email = lower(btrim(email))
where email is distinct from lower(btrim(email));

-- Dedupe (email + últimos 7 días) y marca de duplicados en la bandeja.
create index if not exists partner_requests_email_created_idx
  on public.partner_requests (email, created_at desc);
-- Rate limit (ip_hash + última hora).
create index if not exists partner_requests_ip_created_idx
  on public.partner_requests (ip_hash, created_at desc);
-- Pestañas de la bandeja y contador de pendientes.
create index if not exists partner_requests_status_created_idx
  on public.partner_requests (status, created_at desc);

-- Búsqueda de perfiles por email (aprobación, recuperación de contraseña).
create index if not exists profiles_email_idx
  on public.profiles (email);

-- Dashboard de pedidos (orden por fecha, contador de pendientes) y portal.
create index if not exists orders_created_idx
  on public.orders (created_at desc);
create index if not exists orders_status_idx
  on public.orders (status);
create index if not exists orders_professional_created_idx
  on public.orders (professional_id, created_at desc);
create index if not exists order_items_order_idx
  on public.order_items (order_id);

-- Bloque destacado del portal (category='sistema' AND featured AND active).
create index if not exists resources_category_featured_idx
  on public.resources (category, featured, active, created_at desc);


-- -----------------------------------------------------------------------------
-- VERIFY
-- -----------------------------------------------------------------------------
--   select proname, prosecdef from pg_proc
--   where proname in ('handle_new_user','create_order','is_approved_professional');
--   -- create_order: prosecdef = false (INVOKER); handle_new_user: true (DEFINER)
--
--   select has_function_privilege('anon', 'public.create_order(text, jsonb)', 'execute');          -- false
--   select has_function_privilege('authenticated', 'public.create_order(text, jsonb)', 'execute'); -- true
-- =============================================================================

-- =============================================================================
-- Sunbiotan — Row Level Security (estado de producción, fase 3)
-- =============================================================================
-- ORDEN DE EJECUCIÓN (SQL editor de Supabase, a mano):
--   1. supabase/rls_policies.sql   (este archivo)
--   2. supabase/fase3_extra.sql    (handle_new_user, create_order, índices)
--
-- Idempotente: borra TODAS las policies de las 7 tablas de la app y las vuelve
-- a crear tal como están en producción. Re-ejecutarlo no revierte nada de la
-- fase 3 (incluye is_approved_professional, las policies de lectura solo para
-- aprobados, la ausencia de insert público en partner_requests, el bucket
-- portal-resources y sus policies, y los checks de resources).
--
-- No crea ni borra columnas. Columnas añadidas en la fase 3 (ya aplicadas):
--   partner_requests: website_or_instagram, activity_type, locale, admin_notes,
--                     reviewed_at, reviewed_by, user_id, center_id, invited_at, ip_hash
--                     checks: status in (pending, approved, rejected);
--                             activity_type in (salao, estetica, spa, clinica,
--                             solario, ginasio, outro); locale in (pt, es, en, it, fr)
--   profiles:         email, locale, password_set (default true; los invitados
--                     se crean con false)
--   resources:        featured, storage_path, locale (null = todos los idiomas);
--                     url pasa a ser nullable
--   products:         sin columna price.
--
-- Tablas: centers, profiles, products, resources, orders, order_items,
-- partner_requests. orders usa professional_id como dueño.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. AUDIT (opcional, correr solo)
-- -----------------------------------------------------------------------------
--   SELECT * FROM pg_policies WHERE schemaname IN ('public','storage') ORDER BY schemaname, tablename, policyname;
--   SELECT relname, relrowsecurity FROM pg_class
--   WHERE relnamespace = 'public'::regnamespace
--     AND relname IN ('centers','profiles','products','resources','orders','order_items','partner_requests');


-- -----------------------------------------------------------------------------
-- 1. Helpers (SECURITY DEFINER: leen profiles/orders sin recursión de RLS)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_approved_professional()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'professional' and p.approved = true
  );
$$;

create or replace function public.owns_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.orders o
    where o.id = p_order_id and o.professional_id = auth.uid()
  );
$$;

revoke all on function public.is_admin()                  from public;
revoke all on function public.is_approved_professional()  from public;
revoke all on function public.owns_order(uuid)            from public;
grant execute on function public.is_admin()                 to anon, authenticated;
grant execute on function public.is_approved_professional() to authenticated;
grant execute on function public.owns_order(uuid)           to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 2. Guard de profiles: un no-admin no puede escalar su propio perfil
-- -----------------------------------------------------------------------------
-- Fija role/approved/id/center_id/email en escrituras de usuarios autenticados
-- no admin. Service role, SQL editor y el trigger de auth.users (auth.uid()
-- null) y los admins pasan sin cambios.
create or replace function public.enforce_profile_self_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.id <> auth.uid() then
      raise exception 'profiles: cannot insert a row for another user';
    end if;
    new.role     := 'professional';
    new.approved := false;
  elsif tg_op = 'UPDATE' then
    new.id        := old.id;
    new.role      := old.role;
    new.approved  := old.approved;
    new.center_id := old.center_id;
    new.email     := old.email;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_self_write on public.profiles;
create trigger trg_enforce_profile_self_write
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_self_write();


-- -----------------------------------------------------------------------------
-- 3. Borrar TODAS las policies de las tablas de la app
-- -----------------------------------------------------------------------------
do $$
declare
  pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'centers','profiles','products','resources',
        'orders','order_items','partner_requests'
      )
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. RLS activado en todas las tablas
-- -----------------------------------------------------------------------------
alter table public.centers          enable row level security;
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.resources        enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.partner_requests enable row level security;


-- =============================================================================
-- 5. POLICIES
-- =============================================================================

-- -------------------------------------------------------------------- centers --
-- Mapa público: cualquiera (incluida la anon key) lee los centros.
create policy "centers_select_public"
  on public.centers for select
  to anon, authenticated
  using (true);

create policy "centers_insert_admin"
  on public.centers for insert
  to authenticated
  with check (public.is_admin());

create policy "centers_update_admin"
  on public.centers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "centers_delete_admin"
  on public.centers for delete
  to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------------- profiles --
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------------- products --
-- Catálogo: solo profesionales aprobados o admin. Nada para anon.
create policy "products_select_approved_or_admin"
  on public.products for select
  to authenticated
  using (public.is_approved_professional() or public.is_admin());

create policy "products_insert_admin"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------------ resources --
create policy "resources_select_approved_or_admin"
  on public.resources for select
  to authenticated
  using (public.is_approved_professional() or public.is_admin());

create policy "resources_insert_admin"
  on public.resources for insert
  to authenticated
  with check (public.is_admin());

create policy "resources_update_admin"
  on public.resources for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "resources_delete_admin"
  on public.resources for delete
  to authenticated
  using (public.is_admin());


-- --------------------------------------------------------------------- orders --
create policy "orders_select_own_or_admin"
  on public.orders for select
  to authenticated
  using (professional_id = auth.uid() or public.is_admin());

-- Insert: solo un profesional aprobado, para sí mismo y en estado pending.
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (
    professional_id = auth.uid()
    and public.is_approved_professional()
    and status = 'pending'
  );

create policy "orders_update_admin"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_delete_admin"
  on public.orders for delete
  to authenticated
  using (public.is_admin());


-- ---------------------------------------------------------------- order_items --
create policy "order_items_select_own_or_admin"
  on public.order_items for select
  to authenticated
  using (public.owns_order(order_id) or public.is_admin());

create policy "order_items_insert_own"
  on public.order_items for insert
  to authenticated
  with check (
    public.owns_order(order_id)
    and public.is_approved_professional()
    and quantity > 0
  );

create policy "order_items_update_admin"
  on public.order_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_delete_admin"
  on public.order_items for delete
  to authenticated
  using (public.is_admin());


-- ----------------------------------------------------------- partner_requests --
-- SIN policy de insert: el formulario público inserta solo vía
-- app/api/candidatura (service role, que ignora RLS) con validación,
-- honeypot y rate limit. La anon key no puede insertar directo.
create policy "partner_requests_select_admin"
  on public.partner_requests for select
  to authenticated
  using (public.is_admin());

create policy "partner_requests_update_admin"
  on public.partner_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "partner_requests_delete_admin"
  on public.partner_requests for delete
  to authenticated
  using (public.is_admin());


-- -----------------------------------------------------------------------------
-- 6. Checks de resources (fase 3)
-- -----------------------------------------------------------------------------
alter table public.resources drop constraint if exists resources_category_chk;
alter table public.resources add  constraint resources_category_chk
  check (category in ('formacao', 'marketing', 'marca', 'sistema'));

alter table public.resources drop constraint if exists resources_source_chk;
alter table public.resources add  constraint resources_source_chk
  check (url is not null or storage_path is not null);

alter table public.resources drop constraint if exists resources_locale_chk;
alter table public.resources add  constraint resources_locale_chk
  check (locale is null or locale in ('pt', 'es', 'en', 'it', 'fr'));


-- -----------------------------------------------------------------------------
-- 7. Storage: bucket privado portal-resources
-- -----------------------------------------------------------------------------
-- No toca los buckets 'centers' (público) ni 'resources' (público, legado).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portal-resources', 'portal-resources', false, 52428800,
  array[
    'application/pdf',
    'video/mp4',
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portal_resources_read"   on storage.objects;
drop policy if exists "portal_resources_insert" on storage.objects;
drop policy if exists "portal_resources_update" on storage.objects;
drop policy if exists "portal_resources_delete" on storage.objects;

create policy "portal_resources_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'portal-resources'
         and (public.is_approved_professional() or public.is_admin()));

create policy "portal_resources_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'portal-resources' and public.is_admin());

create policy "portal_resources_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'portal-resources' and public.is_admin())
  with check (bucket_id = 'portal-resources' and public.is_admin());

create policy "portal_resources_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'portal-resources' and public.is_admin());


-- =============================================================================
-- 8. VERIFY
-- =============================================================================
--   SELECT tablename, policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, cmd, policyname;
--   -- partner_requests: 3 policies (select/update/delete), ninguna INSERT.
--
-- Smoke tests:
--   * Sin sesión: GET centers -> filas; GET products/resources/profiles/orders -> 0 filas
--   * Sin sesión: POST partner_requests directo con la anon key -> rechazado
--   * Profesional NO aprobado: GET products/resources -> 0 filas; INSERT orders -> rechazado
--   * Profesional aprobado: GET products/resources -> filas; solo ve sus orders/order_items
--   * Profesional: PATCH su perfil role='admin' / email='x' -> sin cambios
--   * Admin: CRUD completo en centers/products/resources; lee todos los profiles y partner_requests
-- =============================================================================

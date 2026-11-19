-- =============================================================================
-- Sunbiotan — Fase 4: leads del flujo profesional (formulario → presentación)
-- =============================================================================
-- Correr A MANO en el SQL editor de Supabase, DESPUÉS de rls_policies.sql y
-- fase3_extra.sql (usa public.is_admin(), definida en rls_policies.sql).
--
-- Idempotente: se puede volver a correr. No toca partner_requests ni ninguna
-- tabla existente.
--
-- Escritura: SOLO desde las rutas /api/profissionais/* y /api/admin/contactos/*
-- con service role (ignora RLS). No hay policy de INSERT: la anon key no puede
-- escribir. El dashboard (admin autenticado) lee/edita/borra vía RLS.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tablas
-- -----------------------------------------------------------------------------
create table if not exists public.pro_leads (
  id                        uuid primary key default gen_random_uuid(),
  is_test                   boolean not null default false,

  name                      text not null,
  business_name             text not null,
  city                      text not null,
  phone                     text not null,
  email                     text not null,           -- siempre en minúsculas
  activity_type             text not null,
  website_or_instagram      text,                    -- "@usuario" o URL http/https
  no_instagram              boolean not null default false,
  locale                    text not null default 'pt',
  ip_hash                   text,                    -- sha256(ip + IP_HASH_SALT) del último envío

  -- Consentimientos: texto exacto mostrado (resuelto en el servidor) + versión.
  privacy_consent_at        timestamptz not null,
  privacy_consent_version   text not null,
  privacy_consent_text      text not null,
  marketing_consent         boolean not null default false,
  marketing_consent_at      timestamptz,
  marketing_consent_text    text,
  marketing_unsubscribed_at timestamptz,             -- reservado para la baja futura

  -- Actividad
  access_count              integer not null default 1,   -- envíos del formulario
  view_count                integer not null default 0,   -- visitas a la presentación
  first_viewed_at           timestamptz,
  last_viewed_at            timestamptz,
  whatsapp_clicks           integer not null default 0,
  last_whatsapp_click_at    timestamptz,

  -- Resultado del último aviso interno
  notify_email_status       text,
  notify_email_error        text,
  notify_telegram_status    text,
  notify_telegram_error     text,
  last_notified_at          timestamptz,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Checks (con nombre, para poder recrearlos de forma idempotente).
-- activity_type: misma lista que lib/partners/activity.ts (ACTIVITY_TYPES).
alter table public.pro_leads drop constraint if exists pro_leads_activity_type_check;
alter table public.pro_leads add constraint pro_leads_activity_type_check
  check (activity_type in ('salao', 'estetica', 'spa', 'clinica', 'ginasio', 'solario', 'outro'));

alter table public.pro_leads drop constraint if exists pro_leads_locale_check;
alter table public.pro_leads add constraint pro_leads_locale_check
  check (locale in ('pt', 'es', 'en', 'it', 'fr'));

alter table public.pro_leads drop constraint if exists pro_leads_email_lower_check;
alter table public.pro_leads add constraint pro_leads_email_lower_check
  check (email = lower(email));

alter table public.pro_leads drop constraint if exists pro_leads_notify_status_check;
alter table public.pro_leads add constraint pro_leads_notify_status_check
  check (
    (notify_email_status is null or notify_email_status in ('sent', 'error', 'skipped'))
    and (notify_telegram_status is null or notify_telegram_status in ('sent', 'error', 'skipped'))
  );

-- Un mismo email que vuelve actualiza su fila (una por email en real y otra en pruebas).
alter table public.pro_leads drop constraint if exists pro_leads_email_is_test_key;
alter table public.pro_leads add constraint pro_leads_email_is_test_key unique (email, is_test);


create table if not exists public.pro_lead_events (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references public.pro_leads (id) on delete cascade,
  type       text not null,
  ip_hash    text,
  created_at timestamptz not null default now()
);

alter table public.pro_lead_events drop constraint if exists pro_lead_events_type_check;
alter table public.pro_lead_events add constraint pro_lead_events_type_check
  check (type in ('form', 'view', 'whatsapp'));


-- -----------------------------------------------------------------------------
-- 2. Índices
-- -----------------------------------------------------------------------------
create index if not exists pro_leads_created_idx          on public.pro_leads (created_at desc);
create index if not exists pro_leads_is_test_created_idx  on public.pro_leads (is_test, created_at desc);
create index if not exists pro_lead_events_ip_created_idx on public.pro_lead_events (ip_hash, created_at);
create index if not exists pro_lead_events_lead_type_idx  on public.pro_lead_events (lead_id, type);


-- -----------------------------------------------------------------------------
-- 3. updated_at automático
-- -----------------------------------------------------------------------------
create or replace function public.pro_leads_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pro_leads_touch_updated_at on public.pro_leads;
create trigger pro_leads_touch_updated_at
  before update on public.pro_leads
  for each row execute function public.pro_leads_touch_updated_at();


-- -----------------------------------------------------------------------------
-- 4. Funciones atómicas (solo service role)
-- -----------------------------------------------------------------------------

-- Alta o actualización de un lead por (email, is_test) + evento 'form', en una
-- sola transacción. Reglas:
--   · nuevo: access_count = 1.
--   · existente: access_count + 1 y se pisan los datos de contacto.
--   · privacidad: se guarda siempre el último texto/versión/fecha aceptados.
--   · marketing: solo pasa de false a true (o renueva fecha y texto si vuelve
--     a marcarse). Un envío sin la casilla NUNCA lo borra. Si vuelve a marcarse
--     después de una baja, la baja se anula (es un consentimiento nuevo).
-- Devuelve el id, si es nuevo y el last_notified_at ANTERIOR (para decidir el aviso).
create or replace function public.pro_upsert_lead(
  p_is_test boolean,
  p_name text,
  p_business_name text,
  p_city text,
  p_phone text,
  p_email text,
  p_activity_type text,
  p_website_or_instagram text,
  p_no_instagram boolean,
  p_locale text,
  p_ip_hash text,
  p_privacy_version text,
  p_privacy_text text,
  p_marketing boolean,
  p_marketing_text text
)
returns table (lead_id uuid, is_new boolean, access_count integer, last_notified_at timestamptz)
language plpgsql
set search_path = public
as $$
-- Las columnas de salida (lead_id, access_count, last_notified_at) se llaman
-- igual que columnas de las tablas: ante ambigüedad, gana la columna.
#variable_conflict use_column
declare
  v_now timestamptz := now();
  v_id uuid;
  v_inserted boolean;
  v_count integer;
  v_prev_notified timestamptz;
begin
  -- last_notified_at previo (null si es nuevo). Se lee antes del upsert.
  select l.last_notified_at into v_prev_notified
  from public.pro_leads l
  where l.email = lower(p_email) and l.is_test = p_is_test;

  insert into public.pro_leads as l (
    is_test, name, business_name, city, phone, email, activity_type,
    website_or_instagram, no_instagram, locale, ip_hash,
    privacy_consent_at, privacy_consent_version, privacy_consent_text,
    marketing_consent, marketing_consent_at, marketing_consent_text
  ) values (
    p_is_test, p_name, p_business_name, p_city, p_phone, lower(p_email), p_activity_type,
    p_website_or_instagram, p_no_instagram, p_locale, p_ip_hash,
    v_now, p_privacy_version, p_privacy_text,
    p_marketing, case when p_marketing then v_now end, case when p_marketing then p_marketing_text end
  )
  on conflict (email, is_test) do update set
    name                    = excluded.name,
    business_name           = excluded.business_name,
    city                    = excluded.city,
    phone                   = excluded.phone,
    activity_type           = excluded.activity_type,
    website_or_instagram    = excluded.website_or_instagram,
    no_instagram            = excluded.no_instagram,
    locale                  = excluded.locale,
    ip_hash                 = excluded.ip_hash,
    privacy_consent_at      = excluded.privacy_consent_at,
    privacy_consent_version = excluded.privacy_consent_version,
    privacy_consent_text    = excluded.privacy_consent_text,
    marketing_consent       = l.marketing_consent or excluded.marketing_consent,
    marketing_consent_at    = case when excluded.marketing_consent then excluded.marketing_consent_at else l.marketing_consent_at end,
    marketing_consent_text  = case when excluded.marketing_consent then excluded.marketing_consent_text else l.marketing_consent_text end,
    marketing_unsubscribed_at = case when excluded.marketing_consent then null else l.marketing_unsubscribed_at end,
    access_count            = l.access_count + 1
  returning l.id, (l.xmax = 0), l.access_count into v_id, v_inserted, v_count;

  insert into public.pro_lead_events (lead_id, type, ip_hash) values (v_id, 'form', p_ip_hash);

  return query select v_id, v_inserted, v_count, case when v_inserted then null else v_prev_notified end;
end;
$$;

-- Visita a la presentación: cuenta solo si la anterior fue hace más de
-- p_min_interval (update condicional atómico). Devuelve true si contó.
create or replace function public.pro_register_view(
  p_lead_id uuid,
  p_ip_hash text,
  p_min_interval interval default interval '5 minutes'
)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_counted boolean;
begin
  update public.pro_leads
  set view_count      = view_count + 1,
      first_viewed_at = coalesce(first_viewed_at, now()),
      last_viewed_at  = now()
  where id = p_lead_id
    and (last_viewed_at is null or last_viewed_at < now() - p_min_interval);
  v_counted := found;

  if v_counted then
    insert into public.pro_lead_events (lead_id, type, ip_hash) values (p_lead_id, 'view', p_ip_hash);
  end if;
  return v_counted;
end;
$$;

-- Clic en un CTA de WhatsApp de la presentación. Devuelve false si el lead no existe.
create or replace function public.pro_register_whatsapp(
  p_lead_id uuid,
  p_ip_hash text
)
returns boolean
language plpgsql
set search_path = public
as $$
begin
  update public.pro_leads
  set whatsapp_clicks        = whatsapp_clicks + 1,
      last_whatsapp_click_at = now()
  where id = p_lead_id;
  if not found then
    return false;
  end if;
  insert into public.pro_lead_events (lead_id, type, ip_hash) values (p_lead_id, 'whatsapp', p_ip_hash);
  return true;
end;
$$;

-- Nadie más que el service role puede ejecutarlas.
revoke all on function public.pro_upsert_lead(boolean, text, text, text, text, text, text, text, boolean, text, text, text, text, boolean, text) from public, anon, authenticated;
revoke all on function public.pro_register_view(uuid, text, interval) from public, anon, authenticated;
revoke all on function public.pro_register_whatsapp(uuid, text) from public, anon, authenticated;
revoke all on function public.pro_leads_touch_updated_at() from public, anon, authenticated;
grant execute on function public.pro_upsert_lead(boolean, text, text, text, text, text, text, text, boolean, text, text, text, text, boolean, text) to service_role;
grant execute on function public.pro_register_view(uuid, text, interval) to service_role;
grant execute on function public.pro_register_whatsapp(uuid, text) to service_role;


-- -----------------------------------------------------------------------------
-- 5. RLS (mismo patrón que partner_requests en rls_policies.sql)
-- -----------------------------------------------------------------------------
alter table public.pro_leads enable row level security;
alter table public.pro_lead_events enable row level security;

drop policy if exists "pro_leads_select_admin" on public.pro_leads;
drop policy if exists "pro_leads_update_admin" on public.pro_leads;
drop policy if exists "pro_leads_delete_admin" on public.pro_leads;
drop policy if exists "pro_lead_events_select_admin" on public.pro_lead_events;
drop policy if exists "pro_lead_events_update_admin" on public.pro_lead_events;
drop policy if exists "pro_lead_events_delete_admin" on public.pro_lead_events;

-- SIN policy de insert en ninguna de las dos.
create policy "pro_leads_select_admin"
  on public.pro_leads for select
  to authenticated
  using (public.is_admin());

create policy "pro_leads_update_admin"
  on public.pro_leads for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "pro_leads_delete_admin"
  on public.pro_leads for delete
  to authenticated
  using (public.is_admin());

create policy "pro_lead_events_select_admin"
  on public.pro_lead_events for select
  to authenticated
  using (public.is_admin());

create policy "pro_lead_events_update_admin"
  on public.pro_lead_events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "pro_lead_events_delete_admin"
  on public.pro_lead_events for delete
  to authenticated
  using (public.is_admin());


-- -----------------------------------------------------------------------------
-- 6. Verificación (opcional, correr suelto)
-- -----------------------------------------------------------------------------
--   select relname, relrowsecurity from pg_class
--   where relnamespace = 'public'::regnamespace and relname in ('pro_leads', 'pro_lead_events');
--   select policyname, cmd, roles from pg_policies
--   where schemaname = 'public' and tablename in ('pro_leads', 'pro_lead_events') order by tablename, policyname;
--   select has_function_privilege('anon', 'public.pro_upsert_lead(boolean, text, text, text, text, text, text, text, boolean, text, text, text, text, boolean, text)', 'execute'); -- false
--   select has_function_privilege('service_role', 'public.pro_register_view(uuid, text, interval)', 'execute');                                                           -- true

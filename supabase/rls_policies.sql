-- =============================================================================
-- Sunbiotan — Row Level Security audit & hardening
-- =============================================================================
-- Run this whole file in the Supabase SQL editor (it is idempotent — safe to
-- re-run). It drops every existing policy on the 7 app tables and recreates a
-- known-good set, so there is nothing to reconcile by hand.
--
-- Tables covered: centers, profiles, products, resources, orders, order_items,
-- partner_requests
--
-- Column note: `orders` keys the owning professional as `professional_id`
-- (not `user_id` as the ticket assumed) — verified against
-- app/[locale]/portal/encomendas/nova/page.tsx. Policies below use the real
-- column.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. AUDIT — inspect what exists today. Run this block on its own first.
-- -----------------------------------------------------------------------------
-- Existing policies:
--   SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
-- RLS enabled / forced per table:
--   SELECT relname, relrowsecurity, relforcerowsecurity
--   FROM pg_class
--   WHERE relnamespace = 'public'::regnamespace
--     AND relname IN ('centers','profiles','products','resources','orders','order_items','partner_requests')
--   ORDER BY relname;
--
-- Anon/public grants that could bypass the point of RLS (RLS still applies, but
-- worth knowing what the anon key can even attempt):
--   SELECT table_name, privilege_type, grantee
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public' AND grantee IN ('anon','authenticated')
--   ORDER BY table_name, grantee, privilege_type;


-- -----------------------------------------------------------------------------
-- 1. Helper functions (SECURITY DEFINER — bypass RLS, so no policy recursion)
-- -----------------------------------------------------------------------------

-- True when the current user's profile row has role = 'admin'.
-- SECURITY DEFINER + owned by postgres => reads profiles without triggering
-- the profiles RLS policies (which would otherwise recurse).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- True when the given order belongs to the current user.
create or replace function public.owns_order(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and o.professional_id = auth.uid()
  );
$$;

revoke all on function public.is_admin()            from public;
revoke all on function public.owns_order(uuid)      from public;
grant execute on function public.is_admin()         to anon, authenticated;
grant execute on function public.owns_order(uuid)   to anon, authenticated;


-- -----------------------------------------------------------------------------
-- 2. Guard: stop non-admins from escalating their own profile
-- -----------------------------------------------------------------------------
-- The profiles policies below let a user write their OWN row (needed for the
-- portal). Without this trigger a professional could PATCH their row to
-- role='admin' / approved=true straight through the anon key. The trigger
-- silently pins role/approved/id/center_id for non-admin, authenticated writes
-- and leaves service-role / SQL-editor / auth-trigger writes (auth.uid() null)
-- untouched so seeding still works.
create or replace function public.enforce_profile_self_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No end-user identity (service role, SQL editor, auth.users trigger) → allow.
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
    new.id         := old.id;
    new.role       := old.role;
    new.approved   := old.approved;
    new.center_id  := old.center_id;  -- only admins assign a center
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_profile_self_write on public.profiles;
create trigger trg_enforce_profile_self_write
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_self_write();


-- -----------------------------------------------------------------------------
-- 3. Drop ALL existing policies on the target tables (resolves conflicts)
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
-- 4. Enable RLS on every table
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
-- Public map: anyone (incl. anon key, no session) can read every center.
-- Detail page loads inactive centers too (getCenterById has no active filter),
-- so SELECT is unconditional.
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
-- SELECT: own row, plus admin reads all (dashboard/profissionais + dashboard
-- home counts). Ticket said "own row only"; admin read is required for the
-- admin panel to function and is added deliberately.
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- INSERT: only your own row (trigger in §2 forces role/approved for non-admins).
create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

-- UPDATE: own row, or admin (admin toggles `approved`). Column-level escalation
-- is blocked by trg_enforce_profile_self_write.
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
-- Portal catalogue: any signed-in user reads. No public/anon access.
create policy "products_select_authenticated"
  on public.products for select
  to authenticated
  using (true);

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
create policy "resources_select_authenticated"
  on public.resources for select
  to authenticated
  using (true);

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
-- Owner column is professional_id.
create policy "orders_select_own_or_admin"
  on public.orders for select
  to authenticated
  using (professional_id = auth.uid() or public.is_admin());

create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (professional_id = auth.uid());

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
-- Visibility/ownership derived from the parent order via owns_order().
create policy "order_items_select_own_or_admin"
  on public.order_items for select
  to authenticated
  using (public.owns_order(order_id) or public.is_admin());

create policy "order_items_insert_own"
  on public.order_items for insert
  to authenticated
  with check (public.owns_order(order_id));

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
-- INSERT is public: the candidatura form must submit with no session.
-- (The current API route at app/api/candidatura/route.ts uses the service-role
-- key, which bypasses RLS anyway — this policy keeps the form working if it is
-- ever moved to the client. If you never want anon inserts, drop this one
-- policy; nothing else depends on it.)
create policy "partner_requests_insert_public"
  on public.partner_requests for insert
  to anon, authenticated
  with check (true);

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


-- =============================================================================
-- 6. VERIFY — run after applying
-- =============================================================================
-- Every target table should show rowsecurity = true:
--   SELECT relname AS table, relrowsecurity AS rls_enabled
--   FROM pg_class
--   WHERE relnamespace = 'public'::regnamespace
--     AND relname IN ('centers','profiles','products','resources','orders','order_items','partner_requests')
--   ORDER BY relname;
--
-- Full policy list (expect 4 per table, 3 for none):
--   SELECT tablename, policyname, cmd, roles, qual, with_check
--   FROM pg_policies WHERE schemaname = 'public'
--   ORDER BY tablename, cmd, policyname;
--
-- Smoke tests:
--   * Logged out: GET centers  -> rows returned
--   * Logged out: POST partner_requests -> succeeds
--   * Logged out: GET products / profiles / orders -> 0 rows
--   * Professional A: GET orders -> only A's rows; cannot see B's order_items
--   * Professional: PATCH own profile set role='admin' -> value stays 'professional'
--   * Admin: full CRUD on centers/products/resources; can read all profiles
-- =============================================================================

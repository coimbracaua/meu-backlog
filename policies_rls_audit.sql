-- Fase 1 — políticas RLS para a tabela public.jogos
-- IMPORTANTE:
-- 1) Confirme antes de executar que public.jogos.user_id existe e é UUID compatível com auth.uid().
-- 2) Reveja as políticas já existentes em Supabase > Authentication/Policies ou em pg_policies.
-- 3) Políticas permissivas antigas podem continuar a conceder acesso (políticas permissivas combinam-se por OR).
-- 4) Faça backup e teste com duas contas distintas. Este script não pode verificar o seu projeto Supabase.
--
-- Consulta recomendada para inspeção antes da aplicação:
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies where schemaname = 'public' and tablename = 'jogos';

alter table public.jogos enable row level security;

drop policy if exists jogos_select_own_audit on public.jogos;
create policy jogos_select_own_audit
on public.jogos
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists jogos_insert_own_audit on public.jogos;
create policy jogos_insert_own_audit
on public.jogos
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists jogos_update_own_audit on public.jogos;
create policy jogos_update_own_audit
on public.jogos
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists jogos_delete_own_audit on public.jogos;
create policy jogos_delete_own_audit
on public.jogos
for delete
to authenticated
using ((select auth.uid()) = user_id);

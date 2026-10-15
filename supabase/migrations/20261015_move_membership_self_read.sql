-- Move database: first narrowly scoped read policy.
-- Applied to styhag_db Supabase project ywrcbxcykazoezudtynz.
-- Does not expose the move schema in the Supabase Data API.
-- Every other Move table remains inaccessible to API roles.
create policy "move_membership_self_read"
on move.memberships
for select to authenticated
using (user_id = (select auth.uid()));
grant usage on schema move to authenticated;
grant select on move.memberships to authenticated;

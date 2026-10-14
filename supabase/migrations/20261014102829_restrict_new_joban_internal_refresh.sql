-- Match existing internal importer permissions; no new privilege is granted.
revoke execute on function public.refresh_joban_source_continuity() from public,anon,authenticated;

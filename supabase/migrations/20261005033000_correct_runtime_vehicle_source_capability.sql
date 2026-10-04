-- Correct runtime vehicle source capability against the production ODPT endpoint model.
-- Networks whose operator has train: null cannot treat SQL evidence as realtime fallback.
-- JR-East Keiyo/Saikyo keep realtime availability, but vehicle identity capability
-- remains unknown until an observed Train payload proves an explicit vehicle field.

update public.runtime_vehicle_source_policy
set realtime_api_available = case when network_key in ('keiyo','saikyo') then true else false end,
    realtime_vehicle_identity_status = case when network_key in ('keiyo','saikyo') then 'unknown' else 'absent' end,
    sql_evidence_role = case when network_key in ('keiyo','saikyo') then 'fallback' else 'primary' end,
    notes = case
      when network_key in ('keiyo','saikyo')
        then 'Production ODPT config has an active JR-East Train endpoint; vehicle identity capability remains unverified, so SQL remains fallback evidence.'
      else 'Production ODPT config has no active Train endpoint for this network/operator; SQL is primary vehicle evidence.'
    end,
    updated_at = now()
where network_key in ('keiyo','saikyo','sotetsu','odakyu-main','oimachi','tozai','iketama');

update public.runtime_vehicle_operation_evidence e
set sql_evidence_role = p.sql_evidence_role
from public.runtime_vehicle_source_policy p
where p.network_key=e.network_key
  and e.sql_evidence_role is distinct from p.sql_evidence_role;

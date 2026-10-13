
insert into public.vehicle_type_aliases(alias,canonical_vehicle_type,normalization_reason)
values
 ('東京メトロ16000系','16000系','operator_qualified_exact_series_for_existing_native_png'),
 ('JR東日本E233系2000番台','E233系2000番台','operator_qualified_exact_subseries_for_existing_native_png')
on conflict(alias) do nothing;


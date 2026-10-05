alter table public.railway_lines
  add column if not exists odpt_operator text,
  add column if not exists odpt_railway text,
  add column if not exists odpt_base_url text;

update public.railway_lines
set odpt_operator = null, odpt_railway = null, odpt_base_url = null;

update public.railway_lines r
set odpt_operator = v.odpt_operator,
    odpt_railway = v.odpt_railway,
    odpt_base_url = v.odpt_base_url
from (values
  ('Asakusa','Toei','Asakusa','https://api.odpt.org/api/v4/'),
  ('ChuoRapid','JR-East','ChuoRapid','https://api-challenge.odpt.org/api/v4/'),
  ('Ginza','TokyoMetro','Ginza','https://api.odpt.org/api/v4/'),
  ('Hibiya','TokyoMetro','Hibiya','https://api.odpt.org/api/v4/'),
  ('Joban','JR-East','JobanRapid','https://api-challenge.odpt.org/api/v4/'),
  ('JobanLocal','JR-East','JobanLocal','https://api-challenge.odpt.org/api/v4/'),
  ('KeihinTohoku','JR-East','KeihinTohokuNegishi','https://api-challenge.odpt.org/api/v4/'),
  ('Keisei','Keisei','Main','https://api-challenge.odpt.org/api/v4/'),
  ('Keiyo','JR-East','Keiyo','https://api-challenge.odpt.org/api/v4/'),
  ('Marunouchi','TokyoMetro','Marunouchi','https://api.odpt.org/api/v4/'),
  ('Mita','Toei','Mita','https://api.odpt.org/api/v4/'),
  ('Musashino','JR-East','Musashino','https://api-challenge.odpt.org/api/v4/'),
  ('Nambu','JR-East','Nambu','https://api-challenge.odpt.org/api/v4/'),
  ('Odawara','Odakyu','Odawara','https://api-challenge.odpt.org/api/v4/'),
  ('Oedo','Toei','Oedo','https://api.odpt.org/api/v4/'),
  ('Saikyo','JR-East','SaikyoKawagoe','https://api-challenge.odpt.org/api/v4/'),
  ('SeibuChichibu','Seibu','SeibuChichibu','https://api-challenge.odpt.org/api/v4/'),
  ('SeibuShinjuku','Seibu','Shinjuku','https://api-challenge.odpt.org/api/v4/'),
  ('SeibuTamagawa','Seibu','Tamagawa','https://api-challenge.odpt.org/api/v4/'),
  ('SeibuTamako','Seibu','Tamako','https://api-challenge.odpt.org/api/v4/'),
  ('Shinjuku','Toei','Shinjuku','https://api.odpt.org/api/v4/'),
  ('ShonanShinjuku','JR-East','ShonanShinjuku','https://api-challenge.odpt.org/api/v4/'),
  ('Takasaki','JR-East','Takasaki','https://api-challenge.odpt.org/api/v4/'),
  ('TobuIsesaki','Tobu','Isesaki','https://api-challenge.odpt.org/api/v4/'),
  ('TobuNikko','Tobu','Nikko','https://api-challenge.odpt.org/api/v4/'),
  ('TobuSkytree','Tobu','TobuSkytree','https://api-challenge.odpt.org/api/v4/'),
  ('TokyuToyoko','Tokyu','Toyoko','https://api-challenge.odpt.org/api/v4/'),
  ('Tozai','TokyoMetro','Tozai','https://api.odpt.org/api/v4/'),
  ('Tsurumi','JR-East','Tsurumi','https://api-challenge.odpt.org/api/v4/'),
  ('Yamanote','JR-East','Yamanote','https://api-challenge.odpt.org/api/v4/'),
  ('YokohamaBlue','YokohamaMunicipal','Blue','https://api.odpt.org/api/v4/'),
  ('Yokosuka','JR-East','Yokosuka','https://api-challenge.odpt.org/api/v4/'),
  ('Yurakucho','TokyoMetro','Yurakucho','https://api.odpt.org/api/v4/'),
  ('Yurikamome','Yurikamome','Yurikamome','https://api.odpt.org/api/v4/')
) as v(id,odpt_operator,odpt_railway,odpt_base_url)
where r.id = v.id;

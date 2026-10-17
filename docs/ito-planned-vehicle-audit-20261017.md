# 伊东线计划车型修正


## 2026-10-17 JST — ITO-PLANNED-VEHICLES / agent

Status REVIEW pending deployment. Browser confirmed 5641M had E233-1000 / Izukyu8000 legacy candidates and no proper native plan. Added four canonical SQL Grade C families:36 JR ordinary numbers -> E231-1000/E233-3000;34 Izukyu ordinary numbers ->8000/3000/2100;8 Odoriko ->E257-2000;3001M/3002M Saphir ->E261. Exact regular-number and train-type admission; no broad M suffix inference. Corrected152 SQL/local reference labels only; no stop/clock/topology changes. Added explicit Izukyu owner label to the shared parser and native8000 planned representative/E261 catalogue entries. Izukyu3000 lacks native artwork;2100 only has old original livery, so neither borrows another image. All candidates retained with8000 representative, not daily carset claims. SQL migration20261017023833 applied/read back. Tests152rows x realtime/SQL final-marker PNG plus blank/legacy label, unknown/type guard and actual priority PASS. Full regression and deployed browser verification pending. Files:js/train-vehicle.js,2evidence snapshots,Ito-manual.js,trains/realtime resource versions,migration,tools/ito-planned-vehicles.test.js. Recovery:recovery/ito-plans-20261017/.

Sources:
- https://timetables.jreast.co.jp/2610/timetable-v/101d1p.html
- https://timetables.jreast.co.jp/2610/timetable-v/101u1p.html
- https://www.jreast.co.jp/train/local/e231.html
- https://www.jreast.co.jp/train/local/e233.html
- https://www.izukyu.co.jp/train/train.php
- https://www.jreast.co.jp/train/express/odoriko.html
- https://www.jreast.co.jp/saphir/

Validation: all61 full-suite entries PASS, including65 node:test cases,4Python guards, mapping guard and304 Ito final-marker cases.152 timetable rows preserve all non-model fields; prior actual/dated/reference evidence unchanged. Browser before-fix3025M unresolved confirmed; deployed browser check pending.

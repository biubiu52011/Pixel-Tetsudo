# Planned vehicle and PNG coverage — 2026-10-16

The single production chain remains ODPT/SQL train number → canonical line/working fleet → TrainOperationEvidence → TrainVehicle → native PNG. This supplements recurring planned stock, not the observed daily carset. Actual supplied models retain priority.

157 added Grade C rules across 69 canonical line IDs; 83 catalogue records added. Canonical snapshot now contains 255 family rules and 35 network aliases. Existing observations, dated records, carsets and 10,777 train references retained. No topology changes.

Applied and read back migrations: 20261016102543, 20261016140956, 20261016141956, 20261016142346.

## Reference replay

218 datasets / 102,755 rows. With original candidate labels, missing local artwork reduced from 41456 to 14922 (26534 additional drawable references); 92 line datasets improved, zero regressions. These are reference replay counts, not live screen counts.

When candidate labels are intentionally blanked, the diagnostic residual is 50794 versus 80046 before. This isolates number/line/type-only coverage and is not a count of actual SQL/UI failures. Many source templates already carry candidate labels.

## Checks and limits

All 59 verification entry points passed, including 65 node:test cases and four architecture/UI guards. Final targeted tests cover 45 line/type cases, model priority, scoped through workings, airport restrictions, TH-LINER annotations, Laview versus S-TRAIN, representative versus exact artwork and existing PNG paths. Final affected three datasets replayed in full after the full 218-dataset pass. Browser runtime NOT VERIFIED (browser connection unavailable). Public HTTP/artifact verification recorded separately in recovery/remaining-plans-20261016/.

Missing matching artwork remains neutral. In particular, a West/Kyushu local model or Nishi-Kyushu six-car N700S must not borrow an unrelated body/operator image. Other residuals include qualified model aliases, unsupported subseries and legacy source fleet claims requiring source verification; the table does not claim every residual is a missing PNG file. Complete samples and before/after data are in the local recovery folder.

Primary references: [JR East E233](https://www.jreast.co.jp/train/local/e233.html), [JR East E235](https://www.jreast.co.jp/train/local/e235.html), [Keikyu fleet](https://www.keikyu.co.jp/ride/train/), [Seibu 001 Laview](https://www.seiburailway.jp/railway/encyclopedia/001/), [Seibu 40000](https://www.seiburailway.jp/railway/encyclopedia/40000/). Per-rule provenance is retained in SQL and the canonical evidence snapshot.

## Residual reference rows

| Canonical line | Total | Missing artwork | First sample model/label |
| --- | ---: | ---: | --- |
| Ako | 87 | 87 | No supported model evidence |
| Bantan | 119 | 119 | No supported model evidence |
| Chikuhi | 65 | 65 | No supported model evidence |
| Chikuho | 95 | 95 | No supported model evidence |
| ChuoTatsuno | 268 | 268 | 211系 / E127系100番台 |
| Fukuchiyama | 383 | 383 | No supported model evidence |
| Gakkentoshi | 420 | 420 | No supported model evidence |
| Gotoji | 68 | 68 | No supported model evidence |
| Hachiko | 298 | 298 | 209系3000番台 |
| Haijima | 443 | 15 | 40000系（Laview） |
| Hanwa | 651 | 651 | No supported model evidence |
| HimejiLine | 97 | 97 | No supported model evidence |
| Hohi | 185 | 185 | No supported model evidence |
| IbusukiMakurazaki | 108 | 108 | No supported model evidence |
| Ishinomaki | 84 | 4 | キハ110系0番台（快速南三陸） |
| Ito | 152 | 20 | E257系1500番台（踊り子） |
| Iwakado | 87 | 87 | No supported model evidence |
| Kabe | 87 | 87 | No supported model evidence |
| KagoshimaMain | 911 | 911 | No supported model evidence |
| KakogawaLine | 86 | 86 | No supported model evidence |
| KansaiMain | 46 | 46 | No supported model evidence |
| Karatsu | 43 | 43 | No supported model evidence |
| KashiiLine | 172 | 172 | No supported model evidence |
| Kashima | 64 | 64 | E131系 |
| Kawagoe | 186 | 186 | 209系3000番台 |
| KeiseiChiba | 408 | 408 | No supported model evidence |
| KeiseiChihara | 206 | 206 | No supported model evidence |
| KeiseiKanamachi | 328 | 328 | No supported model evidence |
| KiseiWest | 87 | 87 | No supported model evidence |
| Kitto | 6 | 6 | No supported model evidence |
| Koizumi | 126 | 126 | 10000系10050型 |
| Komii | 108 | 108 | キハ110系100番台 |
| Kosei | 180 | 180 | No supported model evidence |
| Kure | 87 | 87 | No supported model evidence |
| Kyudai | 130 | 130 | No supported model evidence |
| Maizuru | 87 | 87 | No supported model evidence |
| Misumi | 68 | 68 | No supported model evidence |
| MiyazakiAirport | 13 | 13 | No supported model evidence |
| Miyo | 94 | 94 | E127系 |
| NagasakiMain | 284 | 284 | No supported model evidence |
| Nara | 331 | 331 | No supported model evidence |
| NaritaSkyAccess | 310 | 43 | 3900系（アクセス線普通） |
| Nichinan | 28 | 28 | No supported model evidence |
| Nikkoku | 138 | 4 | 6050系100番台 |
| Nippo | 781 | 781 | No supported model evidence |
| NishiKyushuShinkansen | 45 | 45 | かもめ |
| Oito | 181 | 181 | E127系100番台 |
| Omura | 25 | 25 | No supported model evidence |
| OsakaHigashi | 379 | 379 | No supported model evidence |
| OsakaLoop | 1057 | 1057 | No supported model evidence |
| OuMain | 776 | 776 | 701系 / E721系 |
| SaninMain | 53 | 53 | No supported model evidence |
| Sano | 126 | 122 | 10000系10000型 / 10050型 |
| SanyoMain | 58 | 58 | No supported model evidence |
| Sasaguri | 260 | 260 | No supported model evidence |
| Sasebo | 194 | 194 | No supported model evidence |
| SeibuShinjuku | 1419 | 15 | 40000系（Laview） |
| SeibuToshima | 305 | 305 | 2000系（8両編成・池袋線直通） |
| Senzan | 214 | 214 | E721系 / 701系 |
| Shinetsu | 584 | 16 | E653系（しらゆき） |
| Shinonoi | 288 | 288 | 211系 / E127系100番台 |
| SobuMain | 522 | 22 | E257系500番台（しおさい） |
| Sotobo | 426 | 37 | E257系500番台（わかしお） |
| TobuIsesaki | 698 | 90 | 東武70090系（THライナー専用・日比谷線直通） |
| TobuNikko | 670 | 120 | N100系「スペーシアX」 / 100系「スペーシア」 / 500系「リバティ」 |
| TobuSkytree | 1732 | 212 | 東武30000系 / 50050系（半蔵門線・東急田園都市線直通） |
| TohokuMain | 1264 | 1264 | 701系 / E721系 |
| Tokaido | 692 | 8 | E261系（サフィール踊り子） |
| TokaidoKansai | 46 | 46 | No supported model evidence |
| TokaidoMain | 692 | 8 | E261系（サフィール踊り子） |
| Tsugaru | 36 | 36 | キハ40系 |
| Ube | 87 | 87 | No supported model evidence |
| Uchibo | 370 | 7 | E257系500番台（さざなみ） |
| UenoTokyo | 673 | 673 | No supported model evidence |
| Uetsu | 308 | 273 | 701系 / E721系 |
| Yamaguchi | 87 | 87 | No supported model evidence |

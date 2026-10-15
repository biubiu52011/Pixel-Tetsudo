# 车辆映射检查：2026-10-15（JST）

> 专项报告：结论仅适用于正文注明的日期、样本和版本。 最新进度见 [PROGRESS](../../PROGRESS.md)；分类入口见 [文档索引](../README.md)。

后续进展：[第二批修复报告](vehicle-mapping-batch2-20261015.md)。同一份样本新增107条图标映射，有图273→380；以下保留第一批原始检查结果。

检查现有223条canonical线路，读取210个非FULL线路的SQL时刻表入口、4家运营商的887条ODPT源记录。原始样本、修正前后结果保存在 recovery/live-vehicle-audit-20261015。

## 时间与范围

- 当前SQL位置评估：2026-10-15T00:33:37.616Z（UTC；JST加9小时）。111个线路范围有车，1677条位置记录，273条有确定车型及PNG。父子线路/组合线路可能重复收录同一车，不能当作物理列车总数。
- 收到的ODPT更新时间范围：2026-10-15T09:01:00+09:00 至 2026-10-15T09:12:50+09:00。评估时已超有效期，生产保持原有过期排除，未延长实时有效期。
- 另在源更新时间回放同一ODPT样本，检查源列车号→既有判定→PNG，共44个线路范围、1029条源位置记录。回放不是当前实时位置。
- 无车或无源记录的线路明确列为无样本，不能据此判定映射正确或“无缺失”。SQL时刻表仍保留原始有效性说明，计划车型不证明当天实际编组。

## 已修复

官方现役车型列表支持丸ノ内線2000系、銀座線1000系；两线缺少SQL证据规则及唯一车型目录条目。新增有来源、有到期日的模型证据，经现有TrainOperationEvidence→TrainVehicle→原生PNG投影。方南町内部支线通过同一证据域接入，未再拆卡片。生效2026-10-15至2026-11-30；没有编组、涂装或车号推定。

同一时间、相同输入对照新增PNG：Ginza 30；Marunouchi 43；MarunouchiBranch 5。

来源：[东京Metro现役车辆](https://www.tokyometro.jp/corporate/enterprise/passenger_rail/cars/working/index.html)、[官方02系退役说明](https://www.tokyometro.jp/news/images_h/metroNews250402_25.pdf)。

## 尚未补齐／不能确认

- 新宿线回放：13条已确定都营10-300形但无PNG投影。图库只有1/2次车与3次车以后两种外观，源记录没有批次/实体编组，不能挑选其中一种冒充确定外观。
- 荒川线ODPTnnnn为运行ID，没有物理车号，仍不能据此判定车型/颜色。
- 多车型及直通线路存在大量无匹配证据。下面逐线列出有车但车型未定的数量，保留原列车号，供下一轮逐号核验。未知不等于错配；本次未取得全部当天编组实证，不能宣称所有已有映射均正确。
- 已登记的原86个车型与新增2个车型原生PNG路径均存在；未发现已登记路径指向不存在文件。

## 逐线检查

“当前”是当前SQL/有效实时融合结果；“源回放”是上文带时间的ODPT记录。缺车型数量包含UNKNOWN/NARROWED；“缺图”仅指EXACT但无PNG。空样本不是通过。

| 线路ID | 当前记录 | 当前有图 | 当前缺车型 | 源回放记录 | 源回放有图 | 源回放缺图 | 状态 |
|---|---:|---:|---:|---:|---:|---:|---|
| KeihinTohoku | 67 | 0 | 67 | 74 | 0 | 0 | 存在待判定 |
| Yokosuka | 24 | 0 | 24 | 29 | 0 | 0 | 存在待判定 |
| ChuoRapid | 43 | 43 | 0 | 59 | 57 | 0 | 当前样本已映射 |
| SaikyoKawagoe | 0 | 0 | 0 | 25 | 23 | 0 | 存在待判定 |
| Joban | 22 | 21 | 1 | 24 | 24 | 0 | 存在待判定 |
| Keiyo | 24 | 0 | 24 | 30 | 0 | 0 | 存在待判定 |
| Musashino | 22 | 0 | 22 | 23 | 0 | 0 | 存在待判定 |
| ShonanShinjuku | 15 | 0 | 15 | 19 | 0 | 0 | 存在待判定 |
| Takasaki | 20 | 0 | 20 | 21 | 0 | 0 | 存在待判定 |
| Tsurumi | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| Nambu | 19 | 0 | 19 | 22 | 0 | 0 | 存在待判定 |
| Tokaido | 56 | 0 | 56 | 0 | 0 | 0 | 存在待判定 |
| JobanLocal | 10 | 10 | 0 | 9 | 9 | 0 | 当前样本已映射 |
| Ginza | 30 | 30 | 0 | 0 | 0 | 0 | 当前样本已映射 |
| Marunouchi | 43 | 43 | 0 | 0 | 0 | 0 | 当前样本已映射 |
| Hibiya | 40 | 0 | 40 | 0 | 0 | 0 | 存在待判定 |
| Yurakucho | 30 | 0 | 30 | 0 | 0 | 0 | 存在待判定 |
| Tozai | 40 | 5 | 35 | 0 | 0 | 0 | 存在待判定 |
| Asakusa | 0 | 0 | 0 | 24 | 7 | 0 | 存在待判定 |
| Mita | 28 | 0 | 28 | 33 | 0 | 0 | 存在待判定 |
| Shinjuku | 0 | 0 | 0 | 22 | 0 | 13 | 存在缺图／待核验 |
| Oedo | 0 | 0 | 0 | 45 | 0 | 0 | 存在待判定 |
| Chiyoda | 33 | 33 | 0 | 0 | 0 | 0 | 当前样本已映射 |
| Hanzomon | 25 | 0 | 25 | 0 | 0 | 0 | 存在待判定 |
| Namboku | 22 | 0 | 22 | 0 | 0 | 0 | 存在待判定 |
| Fukutoshin | 17 | 1 | 16 | 0 | 0 | 0 | 存在待判定 |
| Yurikamome | 22 | 0 | 22 | 0 | 0 | 0 | 存在待判定 |
| SeibuShinjuku | 30 | 0 | 30 | 0 | 0 | 0 | 存在待判定 |
| TobuIsesaki | 14 | 0 | 14 | 12 | 0 | 0 | 存在待判定 |
| TokyuToyoko | 30 | 1 | 29 | 0 | 0 | 0 | 存在待判定 |
| YokohamaBlue | 25 | 0 | 25 | 0 | 0 | 0 | 存在待判定 |
| Keisei | 32 | 1 | 31 | 0 | 0 | 0 | 存在待判定 |
| SeibuChichibu | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| SeibuTamako | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| OdakyuEnoshima | 20 | 0 | 20 | 0 | 0 | 0 | 存在待判定 |
| TamaMonorail | 11 | 0 | 11 | 0 | 0 | 0 | 存在待判定 |
| Ome | 9 | 0 | 9 | 13 | 0 | 0 | 存在待判定 |
| Itsukaichi | 2 | 0 | 2 | 2 | 0 | 0 | 存在待判定 |
| SobuRapid | 14 | 0 | 14 | 19 | 0 | 0 | 存在待判定 |
| TokyuDenEn | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Keikyu | 74 | 0 | 74 | 0 | 0 | 0 | 存在待判定 |
| MinatoMirai | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SotetsuMain | 22 | 0 | 22 | 0 | 0 | 0 | 存在待判定 |
| SeibuYamaguchi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SeibuEn | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Yamanote | 39 | 39 | 0 | 43 | 43 | 0 | 当前样本已映射 |
| Agatsuma | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Arakawa | 0 | 0 | 0 | 20 | 0 | 0 | 存在待判定 |
| BanetsuEast | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| BanetsuWest | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| ChuoSobuLocal | 50 | 0 | 50 | 55 | 0 | 0 | 存在待判定 |
| Daishi_Keikyu | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Daishi_Tobu | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Echigo | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| Gono | 5 | 0 | 5 | 0 | 0 | 0 | 存在待判定 |
| Hachinohe | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| Hakushin | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Haijima | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| Iiyama | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Ikebukuro | 38 | 0 | 38 | 0 | 0 | 0 | 存在待判定 |
| Ishinomaki | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| Ito | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Joetsu | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kamaishi | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| Kitakami | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Karasuyama | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kashima | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| Kawagoe | 0 | 0 | 0 | 3 | 0 | 0 | 存在待判定 |
| KeikyuAirport | 13 | 0 | 13 | 0 | 0 | 0 | 存在待判定 |
| KeikyuKurihama | 7 | 0 | 7 | 0 | 0 | 0 | 存在待判定 |
| KeikyuZushi | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| KeioInokashira | 0 | 0 | 0 | 26 | 0 | 0 | 存在待判定 |
| KeioKeibajo | 0 | 0 | 0 | 1 | 0 | 0 | 存在待判定 |
| KeioMain | 0 | 0 | 0 | 46 | 0 | 0 | 存在待判定 |
| KeioSagami | 0 | 0 | 0 | 11 | 0 | 0 | 存在待判定 |
| KeioShin | 0 | 0 | 0 | 2 | 0 | 0 | 存在待判定 |
| KeioTakao | 0 | 0 | 0 | 5 | 0 | 0 | 存在待判定 |
| KeioZoo | 0 | 0 | 0 | 1 | 0 | 0 | 存在待判定 |
| Kesennuma | 5 | 0 | 5 | 0 | 0 | 0 | 存在待判定 |
| Kiryu | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| Koizumi | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| Kokubunji | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Komii | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kounan | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kururi | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| Mito | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| Miyo | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Narita | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Nikkoku | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Nippori_Toneri | 18 | 0 | 18 | 0 | 0 | 0 | 存在待判定 |
| Noda | 0 | 0 | 0 | 26 | 0 | 0 | 存在待判定 |
| OdakyuTama | 7 | 0 | 7 | 0 | 0 | 0 | 存在待判定 |
| Ofunato | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Oga | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| Ogose | 0 | 0 | 0 | 4 | 0 | 0 | 存在待判定 |
| Oito | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Ominato | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| OuMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| RikutoEast | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| RikutsuWest | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Rinkai | 9 | 0 | 9 | 0 | 0 | 0 | 存在待判定 |
| Ryomo | 7 | 0 | 7 | 0 | 0 | 0 | 存在待判定 |
| Sagami | 9 | 0 | 9 | 0 | 0 | 0 | 存在待判定 |
| Sano | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| Yamada | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| Seibu_Sayama | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SeibuToshima | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| Senseki | 11 | 0 | 11 | 0 | 0 | 0 | 存在待判定 |
| SensekiTohoku | 8 | 0 | 8 | 0 | 0 | 0 | 存在待判定 |
| Senzan | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| Shinetsu | 9 | 0 | 9 | 0 | 0 | 0 | 存在待判定 |
| Shinonoi | 9 | 0 | 9 | 0 | 0 | 0 | 存在待判定 |
| Sotobo | 9 | 0 | 9 | 0 | 0 | 0 | 存在待判定 |
| Suigun | 5 | 0 | 5 | 0 | 0 | 0 | 存在待判定 |
| SuigunBranch | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| Tazawako | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| Tobu_Kameido | 0 | 0 | 0 | 2 | 0 | 0 | 存在待判定 |
| TohokuMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Tojo | 0 | 0 | 0 | 36 | 0 | 0 | 存在待判定 |
| TokyuTamagawa | 5 | 0 | 5 | 0 | 0 | 0 | 存在待判定 |
| Tsugaru | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| TsukubaExpress | 24 | 0 | 24 | 0 | 0 | 0 | 存在待判定 |
| Uchibo | 11 | 0 | 11 | 0 | 0 | 0 | 存在待判定 |
| Uetsu | 7 | 0 | 7 | 0 | 0 | 0 | 存在待判定 |
| TobuUtsunomiya | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Yamagata | 6 | 0 | 6 | 0 | 0 | 0 | 存在待判定 |
| YokohamaGreen | 7 | 0 | 7 | 0 | 0 | 0 | 存在待判定 |
| Yonezawa | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Yurakucho_Seibu | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Odawara | 59 | 3 | 56 | 0 | 0 | 0 | 存在待判定 |
| SeibuTamagawa | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| TobuNikko | 12 | 0 | 12 | 14 | 0 | 0 | 存在待判定 |
| TobuSkytree | 0 | 0 | 0 | 38 | 0 | 0 | 存在待判定 |
| Yokohama | 19 | 0 | 19 | 20 | 0 | 0 | 存在待判定 |
| TokyuOimachi | 20 | 0 | 20 | 0 | 0 | 0 | 存在待判定 |
| TokyuMeguro | 17 | 1 | 16 | 0 | 0 | 0 | 存在待判定 |
| TokyuIkegami | 15 | 0 | 15 | 0 | 0 | 0 | 存在待判定 |
| TokyuSetagaya | 8 | 0 | 8 | 0 | 0 | 0 | 存在待判定 |
| TokyuKodomonokuni | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Hachiko | 8 | 0 | 8 | 0 | 0 | 0 | 存在待判定 |
| KeiseiOshiage | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KeiseiKanamachi | 2 | 0 | 2 | 0 | 0 | 0 | 存在待判定 |
| KeiseiChiba | 4 | 0 | 4 | 0 | 0 | 0 | 存在待判定 |
| KeiseiChihara | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| NaritaSkyAccess | 5 | 2 | 3 | 0 | 0 | 0 | 存在待判定 |
| SotetsuIzumino | 5 | 0 | 5 | 0 | 0 | 0 | 存在待判定 |
| SotetsuShin-Yokohama | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| NewShuttle | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TokyoMonorail | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SobuMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| ChuoMain | 0 | 0 | 0 | 12 | 2 | 0 | 存在待判定 |
| TokaidoMain | 56 | 0 | 56 | 96 | 0 | 0 | 存在待判定 |
| Tadami | 3 | 0 | 3 | 0 | 0 | 0 | 存在待判定 |
| UtsunomiyaJR | 27 | 0 | 27 | 27 | 0 | 0 | 存在待判定 |
| MarunouchiBranch | 5 | 5 | 0 | 0 | 0 | 0 | 当前样本已映射 |
| ChiyodaBranch | 19 | 19 | 0 | 0 | 0 | 0 | 当前样本已映射 |
| ChuoTatsuno | 3 | 0 | 3 | 4 | 0 | 0 | 存在待判定 |
| TsurumiUmiShibaura | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TsurumiOkawa | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| JobanMain | 29 | 15 | 14 | 30 | 14 | 0 | 存在待判定 |
| Togane | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| NaritaAbikoBranch | 3 | 1 | 2 | 0 | 0 | 0 | 存在待判定 |
| NaritaAirportBranch | 1 | 0 | 1 | 0 | 0 | 0 | 存在待判定 |
| NambuBranch | 1 | 0 | 1 | 1 | 0 | 0 | 存在待判定 |
| UenoTokyo | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| ChibaMonorail1 | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| ChibaMonorail2 | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| ShonanMonorail | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TohokuShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| JoetsuShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| HokurikuShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| YamagataShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| AkitaShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| HokkaidoShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TokaidoShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SanyoShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KyushuShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| NishiKyushuShinkansen | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| OsakaLoop | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SanyoMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KansaiMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Hanwa | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Nara | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kosei | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SaninMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Fukuchiyama | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| OsakaHigashi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Bantan | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| HimejiLine | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KakogawaLine | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Gakkentoshi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TokaidoKansai | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KagoshimaMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| NagasakiMain | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Nippo | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kyudai | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Hohi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Sasaguri | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Misumi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| IbusukiMakurazaki | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| HakataMinami | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KashiiLine | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Sasebo | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Ako | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| KiseiWest | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Maizuru | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kure | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kabe | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Yamaguchi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Iwakado | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Ube | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Chikuho | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Gotoji | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Omura | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Nichinan | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Karatsu | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Chikuhi | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| MiyazakiAirport | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| Kitto | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| TokyuShinYokohama | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SotetsuJRDirect | 0 | 0 | 0 | 1 | 0 | 0 | 存在待判定 |
| ToyoRapid | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |
| SaitamaRapid | 0 | 0 | 0 | 0 | 0 | 0 | 无运行样本 |

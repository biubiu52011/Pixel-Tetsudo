# 列车计划车型与图标

本页维护现役链路、已确认的计划和已知缺口。历史执行记录保存在本地归档，不作为运行时输入。线路拓扑仍由 canonical railway data 管理。

## 唯一链路与职责

`ODPT／SQL 列车号 → 线路／运用车型规则 → TrainOperationEvidence → TrainVehicle → PNG`

- Supabase `operation_family_rules` 保存有来源、运营日和车号／种别范围的计划规则。
- `tools/export-vehicle-operation-evidence.js` 从规范数据库导出两份 `vehicle-operation-evidence` 快照；不得另外手写第二份车号映射。
- `js/train-vehicle.js` 是车型判定、候选计划和图标目录的唯一代码所有者。
- 位置与融合脚本使用上述结果；renderer 只负责图标和目的地的布局，不自行猜车型。
- 实际车辆证据优先于计划。候选计划不表示当天编组；未知临时车号不得凭后缀强套定期车型。
- 图片文件名本身不能作为车型或配属证据。`asset` 与仅供计划代表展示的 `plannedAsset` 保持区分。

## 已接入的计划

以下输入数量属于 2026-10-17 的验收范围；现役规则数量以规范快照为准。

| 线路／班次组 | 计划车型 | 约束与验证 |
| --- | --- | --- |
| 中央本线区域普通 | 211系（長野地区）／E131系（長野地区） | 168个已收录定期车号；无需旧SQL车型提示，覆盖实时及空提示输入。E131为公告计划，不能据此认定当班车组。 |
| 中央快速直通／特急 | T/H运用E233系0番台；有明确来源的E353系 | 与区域M车号分开；保留带Green车、实际证据优先和未知临时车号隔离。 |
| 伊东线JR普通 | E231系1000番台／E233系3000番台 | 36个定期车号，与伊豆急普通分开。 |
| 伊东线伊豆急普通 | 伊豆急8000／3000／2100系 | 34个定期车号；保留全部候选，以8000原生图片作计划代表。 |
| 伊东线踊り子／サフィール | E257系2000番台／E261系 | 踊り子8个车号；3001M、3002M单独使用E261，不能统一按特急等级选图。 |
| 八高线南段电车 | E231系3000番台／209系3500番台 | 148个定期E车号；八王子—高丽川，不能延伸到非电化区间。 |
| 八高线北段混合动力 | HB-E220系（八高線） | 54个定期D车号；高丽川—高崎；2026-03-14之后的计划，不再沿用209系3000番台。 |

相关回归继续维护在既有 `tools/*planned-vehicles.test.js` 等测试中，不建立日期版执行器。伊东152行、八高298行的时刻／停站／日历未因车型补充而改变。

## 时刻表核对的边界

中央本线核对了JR东日本2610版四张上下行、平日／土休日表中的539条明确常规记录，按站点与时刻比对生产接口，均有对应；没有据此虚构新班次。条件运行日、季节列车和时变附注不在539条完整性声明之内。边界仅一个有效时刻站的记录不能自动扩成主线列车。

此前218个数据集、102755行的全量参考回放是历史诊断，不是当前实时缺图数量。其原始缺口表与详细报告已封存，不能把旧表中已修正的伊东／八高条目当成现役状态。

## 图片来源与审核

作者：curoka／Train Front View。图片直接使用作者原始PNG字节，不经过AI重绘，不把不同线路涂装或历史图片充当现役精确车辆。

| 用途 | 来源原图 |
| --- | --- |
| 伊豆急8000计划代表、黑色排障器 | [izq8000b.png](http://www.trainfrontview.net/bp/izq8000b.png) |
| 八高E231系3000番台 | [e231hk.png](http://www.trainfrontview.net/b/e231hk.png) |
| 八高HB-E220计划代表 | [ee220gms.png](http://www.trainfrontview.net/b/ee220gms.png) |

伊豆急原本的本地文件缺少透明信息，已恢复带透明色的原始文件并更换路径避开旧缓存。新增图片应检查透明信息、原图一致性和已有原生资源；图片审核锁维护在 `tools/vehicle-image-lock-baseline.json`，不能自动重建整份清单绕过检查。

[作者使用说明](http://www.trainfrontview.net/iconinfo.htm)要求网站利用届出，允许事后报告，同一网站一次届出后可追加素材；禁止作为图标集公开转载。尚未确认项目此前是否已届出，代理没有代提交。下载原图与来源清单仅作为本地审阅资料。

## 已知缺口

- 伊豆急3000缺少已接入的合适原生图片；2100现有旧原色图不能代表当前黑船／キンメ涂装。
- 京叶E233系1000番台、武藏野209系500番台等仍须核对正确线路图，不能借用蓝色京滨东北或房总涂装。
- 下载页面的另一车头、灯具、配属、观光／历史版本不能仅凭“未匹配本地文件”直接生成车型规则。
- 中央本线专项浏览器运行时未在此前验收中完成；伊东及八高实页已分别验证过正确图标。后续状态以PROGRESS为准。

## 核对来源

- [中央本线平日下行](https://timetables.jreast.co.jp/2610/timetable-v/223d1p.html)、[平日上行](https://timetables.jreast.co.jp/2610/timetable-v/223u1p.html)、[土休日下行](https://timetables.jreast.co.jp/2610/timetable-v/223d2p.html)、[土休日上行](https://timetables.jreast.co.jp/2610/timetable-v/223u2p.html)
- [长野E131公告](https://www.jreast.co.jp/press/2026/nagano/20260507_na01.pdf)、[E353车型](https://www.jreast.co.jp/train/express/azusa_kaiji.html)
- [伊豆急车型](https://www.izukyu.co.jp/train/train.php)、[踊り子](https://www.jreast.co.jp/train/express/odoriko.html)、[サフィール](https://www.jreast.co.jp/saphir/)
- [八高南段两种车型](https://www.jreast.co.jp/press/2026/hachioji/20260501_hc01.pdf)、[北段旧车退出说明](https://media.jreast.co.jp/articles/5917)

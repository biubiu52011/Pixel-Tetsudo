/*
 * Pixel Tetsudo - Train Icon Mapping
 * 列车车型图标映射表
 * 图标来源: trainfrontview.net (32x38px)
 *
 * Current gallery uses the later large vehicle artwork set. Earlier small-image
 * recognition notes about non-train placeholders were false positives and are removed.
 * 车辆图按车型命名原则：一个车型图可服务多条线路（如 E129系 → 信越/白新/越後/弥彦/羽越/上越）。
 */
(function() {
  "use strict";

  function _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    // Zero-fallback policy: operational context is never vehicle identity.
    // Concrete vehicle artwork must come from explicit upstream vehicle evidence.
    return null;
  }

  function getTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    return _resolveTrainIcon(lineId, operator, trainId, stationIndex, trainType, byOperator);
  }

  // 车型判断（数据层）——复用与 getTrainIcon 完全相同的选择逻辑，返回型号名（图标文件名去扩展名）
  // Provider: TrainIcons.getTrainClass  Consumer: TrainPositionEstimator / DataFusion（position.trainClass）
  function getTrainClass(lineId, operator, trainId, stationIndex, trainType, byOperator) {
    try {
      return _resolveTrainRuleDisplayName(lineId, operator, trainId, stationIndex, trainType, byOperator) || '';
    } catch(e) { return ''; }
  }

  // v4.3.940: 车型名 → 图标路径 反查表（从现有所有图标路径自动反推，零维护）
  var VEHICLE_NAME_TO_ICON = {
  "E235系山手線": "../images/列车/JR東日本/JR東日本_E235系_0番台.png",
  "E233系1000番台": "../images/列车/JR東日本/JR東日本_E233系_1000番代.png",
  "E233系0番台": "../images/列车/JR東日本/JR東日本_E233系_0番代.png",
  "E233系青梅線": "../images/列车/JR東日本/JR東日本_E233系_0番代_青梅線.png",
  "E233系7000番台": "../images/列车/JR東日本/JR東日本_E233系_7000番台.png",
  "209系3500番台（八高・川越線）": "../images/列车/JR東日本/JR東日本_209系_3500番台.png",
  "E233系3000番台": "../images/列车/JR東日本/JR東日本_E233系3000番台.png",
  "E235系1000番台": "../images/列车/JR東日本/JR東日本_E235系_1000番台.png",
  "E231系常磐LED": "../images/列车/JR東日本/JR東日本_E231系_0番台_常磐快速線.png",
  "E531系": "../images/列车/JR東日本/JR東日本_E531系.png",
  "JR E531系": "../images/列车/JR東日本/JR東日本_E531系.png",
  "E233系2000番台": "../images/列车/JR東日本/JR東日本_E233系_2000番台.png",
  "E231系0番台": "../images/列车/JR東日本/JR東日本_E231系_0番台.png",
  "E131系600番台": "../images/列车/JR東日本/JR東日本_E131系_600番代.png",
  "HB-E220系": "../images/列车/JR東日本/JR東日本_HB-E220系.png",
  "E233系6000番台": "../images/列车/JR東日本/JR東日本_E233系_6000番代.png",
  "701系100番台": "../images/列车/JR東日本/JR東日本_701系_100番代.png",
  "211系湘南色": "../images/列车/JR東日本/JR東日本_211系_湘南色.png",
  "キハ110系": "../images/列车/JR東日本/JR東日本_キハ110系.png",
  "E721系": "../images/列车/JR東日本/JR東日本_E721系_0番代.png",
  "701系盛岡": "../images/列车/JR東日本/JR東日本_701系_盛岡地区.png",
  "E131系800番台": "../images/列车/JR東日本/JR東日本_E131系_800番代.png",
  "E233系5000番台": "../images/列车/JR東日本/JR東日本_E233系5000番台.png",
  "EV-E301系": "../images/列车/JR東日本/JR東日本_EV-E301系.png",
  "キハE130系100番台": "../images/列车/JR東日本/JR東日本_キハE130系100番台.png",
  "キハE130系0番台": "../images/列车/JR東日本/JR東日本_キハE130系0番台.png",
  "E131系0番台": "../images/列车/JR東日本/JR東日本_E131系_0番代.png",
  "80000系": "../images/列车/東武鉄道/東武鉄道_80000系.png",
  "E127系0番台": "../images/列车/JR東日本/JR東日本_E127系_0番代_新潟色.png",
  "E129系": "../images/列车/JR東日本/JR東日本_E129系.png",
  "211系長野色": "../images/列车/JR東日本/JR東日本_211系_長野色.png",
  "E131系1000番台": "../images/列车/JR東日本/JR東日本_E131系_1000番代.png",
  "30000系": "../images/列车/西武鉄道/西武鉄道_30000系_スマイルトレイン.png",
  "8000系": "../images/列车/東武鉄道/東武鉄道_8000型.png",
  "1000系": "../images/列车/多摩都市モノレール/多摩都市モノレール_1000系_標準塗装.png",
  "2000系": "../images/列车/東京メトロ/東京メトロ_2000系.png",
  "13000系": "../images/列车/東京メトロ/東京メトロ_13000系.png",
  "15000系": "../images/列车/東京メトロ/東京メトロ_15000系.png",
  "16000系": "../images/列车/東京メトロ/東京メトロ_16000系.png",
  "17000系": "../images/列车/東京メトロ/東京メトロ_17000系.png",
  "9000系": "../images/列车/東京メトロ/東京メトロ_9000系.png",
  "10000系": "../images/列车/東京メトロ/東京メトロ_10000系.png",
  "05系（北綾瀬）": "../images/列车/東京メトロ/東京メトロ_05系_区間列車車両.png",
  "5500形": "../images/列车/都営地下鉄/都営地下鉄_5500形.png",
  "8500形": "../images/列车/都営地下鉄/都営地下鉄_8500形.png",
  "50000系": "../images/列车/東武鉄道/東武鉄道_50000型.png",
  "60000系": "../images/列车/東武鉄道/東武鉄道_60000系.png",
  "50090系": "../images/列车/東武鉄道/東武鉄道_50090型.png",
  "20400系": "../images/列车/東武鉄道/東武鉄道_20400型.png",
  "5000系": "../images/列车/小田急電鉄/小田急電鉄_5000形_標準色.png",
  "3000形": "../images/列车/小田急電鉄/小田急電鉄_3000形_標準色.png",
  "E233系8000番台": "../images/列车/JR東日本/JR東日本_E233系_8000番代.png",
  "E131系500番台": "../images/列车/JR東日本/JR東日本_E131系_500番代.png",
  "8500系": "../images/列车/西武鉄道/西武鉄道_8500系_レオライナー.png",
  "4000系": "../images/列车/西武鉄道/西武鉄道_4000系_赤白塗装.png",
  "40050系": "../images/列车/西武鉄道/西武鉄道_40050系_緑帯.png",
  "3020系": "../images/列车/東急電鉄/東急電鉄_3020系.png",
  "7000系": "../images/列车/東急電鉄/東急電鉄_7000系.png",
  "6020系": "../images/列车/東急電鉄/東急電鉄_6020系.png",
  "Y000系": "../images/列车/東急電鉄/東急電鉄_Y000系_通常塗装.png",
  "5050系": "../images/列车/東急電鉄/東急電鉄_5050系.png",
  "80000形": "../images/列车/京成電鉄/京成電鉄_80000形.png",
  "Number_prefix_Chiba_monorail": "../images/鉄道/千葉都市モノレール/Number_prefix_Chiba_monorail.png",
  "ShonanMonorail_logo_M": "../images/鉄道/湘南モノレール/ShonanMonorail_logo_M.png",
  "11000系（新塗装）": "../images/列车/相模鉄道/相模鉄道_11000系_相鉄グループカラー.png",
  "4000形": "../images/列车/横浜市交通局/横浜市交通局_4000形.png",
  "71-000形": "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_71-000形.png",
  "7300系": "../images/列车/ゆりかもめ/ゆりかもめ_7300系.png",
  "GV-E400系": "../images/列车/JR東日本/JR東日本_GV-E400系.png",
  "330形": "../images/列车/都営地下鉄/都営地下鉄_330形.png",
  "キハE130系500番台": "../images/列车/JR東日本/JR東日本_キハE130系500番台.png",
  "E231系1000番台": "../images/列车/JR東日本/JR東日本_E231系_1000番台.png",
  "HB-E210系": "../images/列车/JR東日本/JR東日本_HB-E210系.png",
  "E5系": "../images/列车/JR東日本/JR東日本_E5系.png",
  "E7系": "../images/列车/JR東日本/JR東日本_E7系.png",
  "E8系つばさ": "../images/列车/JR東日本/JR東日本_E8系.png",
  "E6系こまち": "../images/列车/JR東日本/JR東日本_E6系.png",
  "H5系": "../images/列车/JR北海道/JR北海道_H5系.png",
  "N700系（東海）": "../images/列车/JR東海/JR東海_N700系.png",
  "500系": "../images/列车/JR西日本/JR西日本_500系.png",
  "800系": "../images/列车/JR九州/JR九州_800系.png",
  "E657系": "../images/列车/JR東日本/JR東日本_E657系.png",
  "E257系500番台": "../images/列车/JR東日本/JR東日本_E257系_500番代.png",
  "E353系": "../images/列车/JR東日本/JR東日本_E353系.png",
  "E259系": "../images/列车/JR東日本/JR東日本_E259系.png",
  "E751系": "../images/列车/JR東日本/JR東日本_E751系.png",
  "E653系": "../images/列车/JR東日本/JR東日本_E653系.png",
  "E257系5500番台": "../images/列车/JR東日本/JR東日本_E257系_5500番代.png",
  "E653系1000番台": "../images/列车/JR東日本/JR東日本_E653系_1000番代.png",
  "100系（スペーシア）": "../images/列车/東武鉄道/東武鉄道_東武100系（スペーシア）.png",
  "250系": "../images/列车/東武鉄道/東武鉄道_250系.png",
  "AE形": "../images/列车/京成電鉄/京成電鉄_AE形.png",
  "70000形": "../images/列车/小田急電鉄/小田急電鉄_70000形_GSE.png",
  "60000形": "../images/列车/小田急電鉄/小田急電鉄_60000形_MSE.png",
  "30000形": "../images/列车/小田急電鉄/小田急電鉄_30000形_EXE.png",
  "40000系": "../images/列车/西武鉄道/西武鉄道_40000系_赤帯.png",
  "E257系2000番台": "../images/列车/JR東日本/JR東日本_E257系_2000番台.png",
  "E257系2500番台": "../images/列车/JR東日本/JR東日本_E257系_2500番台.png",
  "E926系East-i": "../images/列车/JR東日本/JR東日本_E926形_East-i.png",
  "N700系": "../images/列车/JR西日本/JR西日本_N700系.png",
  "N700系（青）": "../images/列车/JR西日本/JR西日本_N700系_7000番台.png",
  "500系（ピンク）": "../images/列车/JR西日本/JR西日本_500系_ハローキティ新幹線.png",
  "京成電鉄3000形": "../images/列车/京成電鉄/京成電鉄_3000形.png",
  "8800形": "../images/列车/京成電鉄/京成電鉄_8800形.png",
  "京成電鉄8800形": "../images/列车/京成電鉄/京成電鉄_8800形.png",
  "8900形": "../images/列车/京成電鉄/京成電鉄_8900形.png",
  "京成電鉄8900形": "../images/列车/京成電鉄/京成電鉄_8900形.png",
  "京王電鉄2000系": "../images/列车/京王電鉄/京王電鉄_2000系.png",
  "京王電鉄5000系": "../images/列车/京王電鉄/京王電鉄_5000系.png",
  "京王電鉄8000系": "../images/列车/京王電鉄/京王電鉄_8000系.png",
  "京王電鉄9000系": "../images/列车/京王電鉄/京王電鉄_9000系.png",
  "都営8800形": "../images/列车/都営地下鉄/都営地下鉄_8800形_イエロー.png",
  "都営8900形": "../images/列车/都営地下鉄/都営地下鉄_8900形_イエロー.png",
  "2000系（01編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png",
  "埼玉新都市交通2000系（01編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png",
  "2000系（02編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png",
  "埼玉新都市交通2000系（02編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png",
  "2000系（03編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png",
  "埼玉新都市交通2000系（03編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png",
  "2000系（04編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png",
  "埼玉新都市交通2000系（04編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png",
  "2000系（05編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png",
  "埼玉新都市交通2000系（05編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png",
  "2000系（06編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png",
  "埼玉新都市交通2000系（06編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png",
  "2000系（07編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png",
  "埼玉新都市交通2000系（07編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png",
  "相模鉄道13000系": "../images/列车/相模鉄道/相模鉄道_13000系_YOKOHAMA_NAVYBLUE.png",
  "相模鉄道11000系（新塗装）": "../images/列车/相模鉄道/相模鉄道_11000系_相鉄グループカラー.png",
  "12000系": "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png",
  "相模鉄道12000系": "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png",
  "20000系": "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png",
  "相模鉄道20000系": "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png",
  "1000形": "../images/列车/小田急電鉄/小田急電鉄_1000形_標準色.png",
  "小田急電鉄1000形": "../images/列车/小田急電鉄/小田急電鉄_1000形_標準色.png",
  "1500形": "../images/列车/京浜急行電鉄/京浜急行電鉄_1500形.png",
  "京浜急行電鉄1500形": "../images/列车/京浜急行電鉄/京浜急行電鉄_1500形.png",
  "JR東日本E231系1000番台": "../images/列车/JR東日本/JR東日本_E231系_1000番台.png",
  "JR東日本E233系1000番台": "../images/列车/JR東日本/JR東日本_E233系_1000番代.png",
  "JR東日本E233系3000番台": "../images/列车/JR東日本/JR東日本_E233系3000番台.png",
  "383系": "../images/列车/JR東海/JR東海_383系.png",
  "JR東海383系": "../images/列车/JR東海/JR東海_383系.png",
  "285系": "../images/列车/JR西日本/JR西日本_285系_サンライズエクスプレス.png",
  "JR西日本285系": "../images/列车/JR西日本/JR西日本_285系_サンライズエクスプレス.png",
  "Y500系": "../images/列车/横浜高速鉄道/横浜高速鉄道_Y500系.png",
  "横浜高速鉄道Y500系": "../images/列车/横浜高速鉄道/横浜高速鉄道_Y500系.png",
  "小田急電鉄60000形MSE": "../images/列车/小田急電鉄/小田急電鉄_60000形_MSE.png",
  "小田急電鉄70000形GSE": "../images/列车/小田急電鉄/小田急電鉄_70000形_GSE.png",
  "小田急電鉄4000形": "../images/列车/小田急電鉄/小田急電鉄_4000形_標準色.png",
  "東武30000系": "../images/列车/東武鉄道/東武鉄道_30000系.png",
  "東武9000系": "../images/列车/東武鉄道/東武鉄道_9000型.png",
  "9050系": "../images/列车/東武鉄道/東武鉄道_9050型.png",
  "東武9050系": "../images/列车/東武鉄道/東武鉄道_9050型.png",
  "東武50000系": "../images/列车/東武鉄道/東武鉄道_50000型.png",
  "東武50050系": "../images/列车/東武鉄道/東武鉄道_50050型.png",
  "50070系": "../images/列车/東武鉄道/東武鉄道_50070型.png",
  "東武50070系": "../images/列车/東武鉄道/東武鉄道_50070型.png",
  "東武50090系": "../images/列车/東武鉄道/東武鉄道_50090型.png",
  "東武8000系": "../images/列车/東武鉄道/東武鉄道_8000型.png",
  "東武20400系": "../images/列车/東武鉄道/東武鉄道_20400型.png",
  "東武100系（スペーシア）": "../images/列车/東武鉄道/東武鉄道_東武100系（スペーシア）.png",
  "N100系": "../images/列车/東武鉄道/東武鉄道_N100系_SPACIA_X.png",
  "東武N100系（スペーシアX）": "../images/列车/東武鉄道/東武鉄道_N100系_SPACIA_X.png",
  "500系（リバティ）": "../images/列车/東武鉄道/東武鉄道_500系_リバティ.png",
  "東武500系（リバティ）": "../images/列车/東武鉄道/東武鉄道_500系_リバティ.png",
  "東武500系（リバティ会津）": "../images/列车/東武鉄道/東武鉄道_500系_リバティ.png",
  "東武500系（リバティりょうもう）": "../images/列车/東武鉄道/東武鉄道_500系_リバティ.png",
  "200系（りょうもう）": "../images/列车/東武鉄道/東武鉄道_200型_りょうもう_赤.png",
  "東武200系（りょうもう）": "../images/列车/東武鉄道/東武鉄道_200型_りょうもう_赤.png",
  "70000系": "../images/列车/東武鉄道/東武鉄道_70000系.png",
  "東武70000系": "../images/列车/東武鉄道/東武鉄道_70000系.png",
  "70090系": "../images/列车/東武鉄道/東武鉄道_70090型.png",
  "東武70090系": "../images/列车/東武鉄道/東武鉄道_70090型.png",
  "東武60000系": "../images/列车/東武鉄道/東武鉄道_60000系.png",
  "東武80000系": "../images/列车/東武鉄道/東武鉄道_80000系.png",
  "001系（ラビュー）": "../images/列车/西武鉄道/西武鉄道_001系_Laview.png",
  "西武001系": "../images/列车/西武鉄道/西武鉄道_001系_Laview.png",
  "西武10000系": "../images/列车/西武鉄道/西武鉄道_10000系_ニューレッドアロー.png",
  "西武2000系": "../images/列车/西武鉄道/西武鉄道_2000系_黄色塗装.png",
  "西武20000系": "../images/列车/西武鉄道/西武鉄道_20000系_標準塗装.png",
  "西武30000系": "../images/列车/西武鉄道/西武鉄道_30000系_スマイルトレイン.png",
  "西武40000系": "../images/列车/西武鉄道/西武鉄道_40000系_赤帯.png",
  "6000系": "../images/列车/西武鉄道/西武鉄道_6000系_標準塗装.png",
  "西武6000系": "../images/列车/西武鉄道/西武鉄道_6000系_標準塗装.png",
  "西武4000系": "../images/列车/西武鉄道/西武鉄道_4000系_赤白塗装.png",
  "西武40050系": "../images/列车/西武鉄道/西武鉄道_40050系_緑帯.png",
  "西武8500系": "../images/列车/西武鉄道/西武鉄道_8500系_レオライナー.png",
  "L00系": "../images/列车/西武鉄道/西武鉄道_L00系_れおけい.png",
  "西武L00系": "../images/列车/西武鉄道/西武鉄道_L00系_れおけい.png",
  "東京メトロ1000系": "../images/列车/東京メトロ/東京メトロ_1000系.png",
  "東京メトロ2000系": "../images/列车/東京メトロ/東京メトロ_2000系.png",
  "東京メトロ13000系": "../images/列车/東京メトロ/東京メトロ_13000系.png",
  "東京メトロ16000系": "../images/列车/東京メトロ/東京メトロ_16000系.png",
  "16000系（北綾瀬）": "../images/列车/東京メトロ/東京メトロ_16000系.png",
  "東京メトロ16000系（北綾瀬）": "../images/列车/東京メトロ/東京メトロ_16000系.png",
  "18000系": "../images/列车/東京メトロ/東京メトロ_18000系.png",
  "東京メトロ18000系": "../images/列车/東京メトロ/東京メトロ_18000系.png",
  "東京メトロ9000系": "../images/列车/東京メトロ/東京メトロ_9000系.png",
  "東京メトロ9000系（5次車）": "../images/列车/東京メトロ/東京メトロ_9000系.png",
  "05系（リニューアル）": "../images/列车/東京メトロ/東京メトロ_05系_8～13次車.png",
  "東京メトロ05系（北綾瀬）": "../images/列车/東京メトロ/東京メトロ_05系_区間列車車両.png",
  "07系": "../images/列车/東京メトロ/東京メトロ_07系.png",
  "東京メトロ07系": "../images/列车/東京メトロ/東京メトロ_07系.png",
  "08系": "../images/列车/東京メトロ/東京メトロ_08系.png",
  "東京メトロ08系": "../images/列车/東京メトロ/東京メトロ_08系.png",
  "東京メトロ15000系": "../images/列车/東京メトロ/東京メトロ_15000系.png",
  "5000系（リニューアル）": "../images/列车/東急電鉄/東急電鉄_5000系_リニューアル車.png",
  "西武鉄道20000系": "../images/列车/西武鉄道/西武鉄道_20000系_標準塗装.png",
  "東急電鉄1000系": "../images/列车/東急電鉄/東急電鉄_1000系_1012F.png",
  "埼玉高速鉄道2000形": "../images/列车/埼玉高速鉄道/埼玉高速鉄道_2000系.png",
  "多摩都市モノレール1000系": "../images/列车/多摩都市モノレール/多摩都市モノレール_1000系_標準塗装.png",
  "小田急電鉄2000形": "../images/列车/小田急電鉄/小田急電鉄_2000形_標準色.png",
  "小田急電鉄4000系": "../images/列车/小田急電鉄/小田急電鉄_4000形_標準色.png",
  "東京メトロ8000系": "../images/列车/東京メトロ/東京メトロ_8000系.png",
  "東京モノレール10000形": "../images/列车/東京モノレール/東京モノレール_10000形.png",
  "東武鉄道30000系": "../images/列车/東武鉄道/東武鉄道_30000系.png",
  "東武鉄道9000系": "../images/列车/東武鉄道/東武鉄道_9000型.png",
  "東葉高速鉄道2000系": "../images/列车/東葉高速鉄道/東葉高速鉄道_2000系.png",
  "西武鉄道10000系": "../images/列车/西武鉄道/西武鉄道_10000系_ニューレッドアロー.png",
  "西武鉄道2000系": "../images/列车/西武鉄道/西武鉄道_2000系_黄色塗装.png",
  "西武鉄道7000系": "../images/列车/西武鉄道/西武鉄道_7000系_サステナ車両.png",
  "12系客車（ばんえつ物語・別）": "../images/列车/JR東日本/JR東日本_12系客車_SLばんえつ物語_オコジョ展望車.png",
  "12系客車（ばんえつ物語）": "../images/列车/JR東日本/JR東日本_12系客車_SLばんえつ物語_展望車.png",
  "211系（甲信越）": "../images/列车/JR東日本/JR東日本_211系_長野色.png",
  "211系（首都圏）": "../images/列车/JR東日本/JR東日本_211系_湘南色.png",
  "253系（日光・きぬがわ）": "../images/列车/JR東日本/JR東日本_253系_1000番台.png",
  "701系（仙台）": "../images/列车/JR東日本/JR東日本_701系_仙台地区.png",
  "C57形（ばんえつ物語）": "../images/列车/JR東日本/JR東日本_C57形_180号機_SLばんえつ物語.png",
  "E001系（四季島）": "../images/列车/JR東日本/JR東日本_E001形_TRAIN_SUITE四季島.png",
  "E127系（南武支線）": "../images/列车/JR東日本/JR東日本_E127系_0番代_南武支線.png",
  "E131系（長野）": "../images/列车/JR東日本/JR東日本_E131系_長野地区.png",
  "E231系800番台（東西線直通）": "../images/列车/JR東日本/JR東日本_E231系_800番台.png",
  "E231系総武中央線": "../images/列车/JR東日本/JR東日本_E231系_0番台_中央・総武線各駅停車.png",
  "E261系（サフィール踊り子）": "../images/列车/JR東日本/JR東日本_E261系_サフィール踊り子.png",
  "E353系（あずさ・かいじ）": "../images/列车/JR東日本/JR東日本_E353系.png",
  "E501系（さきがけ・別）": "../images/列车/JR東日本/JR東日本_E501系_E501_SAKIGAKE.png",
  "E501系（さきがけ）": "../images/列车/JR東日本/JR東日本_E501系（さきがけ）.png",
  "E501系（常磐線）": "../images/列车/JR東日本/JR東日本_E501系.png",
  "E531系3000番台": "../images/列车/JR東日本/JR東日本_E531系_3000番代.png",
  "E531系（水戸線）": "../images/列车/JR東日本/JR東日本_E531系_水戸線.png",
  "E531系（赤電）": "../images/列车/JR東日本/JR東日本_E531系_赤電.png",
  "E653系（いなほ）": "../images/列车/JR東日本/JR東日本_E653系（いなほ）.png",
  "E653系（水戸地区・別）": "../images/列车/JR東日本/JR東日本_E653系（水戸地区）.png",
  "E653系（水戸地区）": "../images/列车/JR東日本/JR東日本_E653系（水戸地区）.png",
  "E655系（なごみ）": "../images/列车/JR東日本/JR東日本_E655系_なごみ（和）.png",
  "E657系（ルナ・アズール・別）": "../images/列车/JR東日本/JR東日本_E657系（ルナ・アズール）.png",
  "E657系（ルナ・アズール）": "../images/列车/JR東日本/JR東日本_E657系（ルナ・アズール）.png",
  "E721系（仙台・別）": "../images/列车/JR東日本/JR東日本_E721系_仙台地区.png",
  "EV-E801系（男鹿線）": "../images/列车/JR東日本/JR東日本_EV-E801系.png",
  "FV-E991系（HYBARI）": "../images/列车/JR東日本/JR東日本_FV-E991系_HYBARI.png",
  "GV-E400系（米坂線）": "../images/列车/JR東日本/JR東日本_GV-E400系_米坂線.png",
  "HB-E300系（さとの）": "../images/列车/JR東日本/JR東日本_HB-E300系_SATONO_1号車.png",
  "HB-E300系（ひなび）": "../images/列车/JR東日本/JR東日本_HB-E300系_ひなび（陽旅）.png",
  "HB-E300系（リゾートしらかみ・橅・別）": "../images/列车/JR東日本/JR東日本_HB-E300系_リゾートしらかみ「橅」_HB-E302-5.png",
  "HB-E300系（リゾートしらかみ・橅）": "../images/列车/JR東日本/JR東日本_HB-E300系_リゾートしらかみ「橅」_HB-E301-5.png",
  "HB-E300系（海里）": "../images/列车/JR東日本/JR東日本_HB-E300系_海里.png",
  "キハ110系（おいこっと）": "../images/列车/JR東日本/JR東日本_キハ110系_おいこっと.png",
  "キハ110系（おもいで号）": "../images/列车/JR東日本/JR東日本_キハ110系_おもいで車両.png",
  "キハ110系（ハイレール1375）": "../images/列车/JR東日本/JR東日本_キハ100・110系_HIGH_RAIL_1375.png",
  "キハ110系（只見線）": "../images/列车/JR東日本/JR東日本_キハ110系（只見線）.png",
  "キハ110系（大船渡線）": "../images/列车/JR東日本/JR東日本_キハ110系（大船渡線）.png",
  "キハ110系（小海線）": "../images/列车/JR東日本/JR東日本_キハ110系（小海線）.png",
  "キハ110系（東北エモーション）": "../images/列车/JR東日本/JR東日本_キハ110系_TOHOKU_EMOTION.png",
  "キハ110系（甲信越）": "../images/列车/JR東日本/JR東日本_キハ110系（甲信越）.png",
  "キハ110系（盛岡・幌付）": "../images/列车/JR東日本/JR東日本_キハ110系（盛岡・幌付）.png",
  "キハ110系（盛岡）": "../images/列车/JR東日本/JR東日本_キハ110系（盛岡）.png",
  "キハ110系（陸羽東・左沢・別）": "../images/列车/JR東日本/JR東日本_キハ110系（陸羽東・左沢・別）.png",
  "キハ110系（陸羽東・左沢）": "../images/列车/JR東日本/JR東日本_キハ110系（陸羽東・左沢）.png",
  "キハ40系（越乃シュクラ）": "../images/列车/JR東日本/JR東日本_キハ40・48形_越乃Shu＊Kura.png",
  "キハE120系（只見線・別）": "../images/列车/JR東日本/JR東日本_キハE120形_只見線色.png",
  "キハE120系（只見線）": "../images/列车/JR東日本/JR東日本_キハE120形_只見線色.png",
  "キハE200系（小海線）": "../images/列车/JR東日本/JR東日本_キハE200系（小海線）.png",
  "7500系": "../images/列车/ゆりかもめ/ゆりかもめ_7500系.png",
  "1000形（1300番台）": "../images/列车/京浜急行電鉄/京浜急行電鉄_1000形_1300番台.png",
  "1000形（1500番台）": "../images/列车/京浜急行電鉄/京浜急行電鉄_1000形_1500番台.png",
  "1000形（1800番台）": "../images/列车/京浜急行電鉄/京浜急行電鉄_1000形_1800番台.png",
  "2100形": "../images/列车/京浜急行電鉄/京浜急行電鉄_2100形.png",
  "3000形（LED）": "../images/列车/京成電鉄/京成電鉄_3000形.png",
  "3700形（LED）": "../images/列车/京成電鉄/京成電鉄_3700形.png",
  "2020系（21編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_21編成_グリーンクリスタル.png",
  "2020系（22編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_22編成_ブライトアンバー.png",
  "2020系（23編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_23編成_ピュアルビー.png",
  "2020系（24編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_24編成_ゴールデントパーズ.png",
  "2020系（25編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_25編成_トワイライトアメジスト.png",
  "2020系（26編成）": "../images/列车/埼玉新都市交通/埼玉新都市交通_2020系_26編成_ブルーサファイア＆クリソベリル.png",
  "10000系（8両）": "../images/列车/東京メトロ/東京メトロ_10000系_8両編成.png",
  "東京モノレール2000形": "../images/列车/東京モノレール/東京モノレール_2000形.png",
  "70-000形": "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_70-000形.png",
  "1000系（いけたまハッピートレイン）": "../images/列车/東急電鉄/東急電鉄_1000系_1500番台_1522F_いけたまハッピートレイン.png",
  "3000系（リニューアル）": "../images/列车/東急電鉄/東急電鉄_3000系_リニューアル車.png",
  "300系（301編成）": "../images/列车/東急電鉄/東急電鉄_300系_301編成_玉電カラー.png",
  "300系（302編成）": "../images/列车/東急電鉄/東急電鉄_300系_302編成_モーニングブルー.png",
  "300系（303編成）": "../images/列车/東急電鉄/東急電鉄_300系_303編成_クラシックブルー.png",
  "300系（304編成）": "../images/列车/東急電鉄/東急電鉄_300系_304編成_アップルグリーン.png",
  "300系（305編成・別）": "../images/列车/東急電鉄/東急電鉄_300系_305編成_チェリーレッド.png",
  "300系（305編成）": "../images/列车/東急電鉄/東急電鉄_300系_305編成_チェリーレッド.png",
  "300系（306編成）": "../images/列车/東急電鉄/東急電鉄_300系_306編成_レリーフイエロー.png",
  "300系（307編成）": "../images/列车/東急電鉄/東急電鉄_300系_307編成_ブルーイッシュラベンダー.png",
  "300系（308編成・別）": "../images/列车/東急電鉄/東急電鉄_300系_308編成_サンシャイン.png",
  "300系（308編成）": "../images/列车/東急電鉄/東急電鉄_300系_308編成_サンシャイン.png",
  "300系（309編成）": "../images/列车/東急電鉄/東急電鉄_300系_309編成_バーントオレンジ.png",
  "300系（310編成）": "../images/列车/東急電鉄/東急電鉄_300系_310編成_ターコイズグリーン.png",
  "10030系（近鉄色）": "../images/列车/東武鉄道/東武鉄道_10030型_近鉄特急色.png",
  "100系（DRCカラー）": "../images/列车/東武鉄道/東武鉄道_100系_DRCカラー.png",
  "12系客車（SL大樹）": "../images/列车/東武鉄道/東武鉄道_12系客車（SL大樹）.png",
  "14系客車（SL大樹）": "../images/列车/東武鉄道/東武鉄道_14系客車（SL大樹）.png",
  "20400系（ベリーハッピー）": "../images/列车/東武鉄道/東武鉄道_20400型_ベリーハッピートレイン.png",
  "634系（スカイツリートレイン）": "../images/列车/東武鉄道/東武鉄道_634型_スカイツリートレイン.png",
  "8000系（亀戸線）": "../images/列车/東武鉄道/東武鉄道_8000型_亀戸線.png",
  "90000系": "../images/列车/東武鉄道/東武鉄道_90000系.png",
  "C11形（SL大樹ふたら）": "../images/列车/東武鉄道/東武鉄道_C11形（SL大樹ふたら）.png",
  "C11形（SL大樹）": "../images/列车/東武鉄道/東武鉄道_C11形（SL大樹）.png",
  "DE10形（ブルーサンダー）": "../images/列车/東武鉄道/東武鉄道_DE10形（ブルーサンダー）.png",
  "11000系（おかいもの）": "../images/列车/相模鉄道/相模鉄道_11000系_おかいもの電車.png",
  "11000系（ほほえみ）": "../images/列车/相模鉄道/相模鉄道_11000系_11003編成_ほほえみ号.png",
  "10000系（観光特急）": "../images/列车/西武鉄道/西武鉄道_10000系_レッドアロークラシック.png",
  "2000系（2色塗り）": "../images/列车/西武鉄道/西武鉄道_2000系_ツートンカラー.png",
  "40000系（トキイロ）": "../images/列车/西武鉄道/西武鉄道_40000系（トキイロ）.png",
  "40050系（ラッピング）": "../images/列车/西武鉄道/西武鉄道_40050系（ラッピング）.png",
  "320形": "../images/列车/都営地下鉄/都営地下鉄_320形.png",
  "6500形": "../images/列车/都営地下鉄/都営地下鉄_6500形.png",
  "7700形": "../images/列车/都営地下鉄/都営地下鉄_7700形_あお.png",
  "都電9000形": "../images/列车/都営地下鉄/都営地下鉄_都電9000形.png",
  "東武100系": "../images/列车/東武鉄道/東武鉄道_東武100系（スペーシア）.png",
  "東武200系": "../images/列车/東武鉄道/東武鉄道_200系（別）.png",
  "横浜市交通局4000形": "../images/列车/横浜市交通局/横浜市交通局_4000形.png",
  "相模鉄道10000系": "../images/列车/相模鉄道/相模鉄道_10000系_相鉄グループカラー.png",
  "相模鉄道11000系": "../images/列车/相模鉄道/相模鉄道_11000系_相鉄グループカラー.png",
  "都営12-600形": "../images/列车/都営地下鉄/都営地下鉄_12-600形_前期車.png",
  "都営300形": "../images/列车/都営地下鉄/都営地下鉄_300形.png",
  "都営320形": "../images/列车/都営地下鉄/都営地下鉄_320形.png",
  "都営330形": "../images/列车/都営地下鉄/都営地下鉄_330形.png",
  "都営5500形": "../images/列车/都営地下鉄/都営地下鉄_5500形.png",
  "都営6500形": "../images/列车/都営地下鉄/都営地下鉄_6500形.png",
  "東京モノレール1000形": "../images/列车/東京モノレール/東京モノレール_1000形_新塗装.png",
  "東武250系": "../images/列车/東武鉄道/東武鉄道_250系.png",
  "東武634型（スカイツリートレイン）": "../images/列车/東武鉄道/東武鉄道_634型_スカイツリートレイン.png",
  "東武634系（スカイツリートレイン）": "../images/列车/東武鉄道/東武鉄道_634型_スカイツリートレイン.png",
  "東武90000系": "../images/列车/東武鉄道/東武鉄道_90000系.png",  "相模鉄道8000系": "../images/列车/相模鉄道/相模鉄道_8000系_赤帯塗装.png",
  "相模鉄道9000系": "../images/列车/相模鉄道/相模鉄道_9000系_旧塗装.png",
  "小田急電鉄8000系": "../images/列车/小田急電鉄/小田急電鉄_8000形_標準色_更新車.png",
  "東武10000系": "../images/列车/東武鉄道/東武鉄道_10000型_更新車.png",
  "東武鉄道10000型": "../images/列车/東武鉄道/東武鉄道_10000型_更新車.png",
  "東武鉄道10000系": "../images/列车/東武鉄道/東武鉄道_10000型_更新車.png",
  "都営6300形": "../images/列车/都営地下鉄/都営地下鉄_6300形_3次車.png",
  "6300形": "../images/列车/都営地下鉄/都営地下鉄_6300形_3次車.png",
  "都営10-300形": "../images/列车/都営地下鉄/都営地下鉄_10-300形_1・2次車.png",
  "10-300形": "../images/列车/都営地下鉄/都営地下鉄_10-300形_1・2次車.png",
  "都営12-000形": "../images/列车/都営地下鉄/都営地下鉄_12-000形_4次車.png",
  "12-000形": "../images/列车/都営地下鉄/都営地下鉄_12-000形_4次車.png",
  "東京メトロ05系": "../images/列车/東京メトロ/東京メトロ_05系_8～13次車.png",
  "横浜市交通局10000形": "../images/列车/横浜市交通局/横浜市交通局_10000形_1次車.png",
  "10000形": "../images/列车/横浜市交通局/横浜市交通局_10000形_1次車.png",

};

  // 2026-09 runtime policy: retired stock may remain as gallery assets, but must not win
  // vehicle identity by exact filename lookup. These names fall through to aliases below.
  [
    "AE100形",
    "京成電鉄AE100形",
    "都営5300形",
    "都営6300形",
    "6300形",
    "東武20000系",
    "東武鉄道20000系",
    "20050系",
    "相鉄7000系",
    "相鉄新7000系",
    "新7000系",
    "小田急50000形",
    "小田急50000形VSE",
    "小田急50000形（VSE）",
    "50000形",
    "ロマンスカー 10000形",
    "東京メトロ02系",
    "東京メトロ03系",
    "東京メトロ6000系",
    "東京メトロ7000系",
    "メトロ02系",
    "メトロ03系",
    "メトロ6000系",
    "メトロ7000系"
  ].forEach(function(name) {
    delete VEHICLE_NAME_TO_ICON[name];
  });

  // Ambiguous bare series names are not global vehicle identities. They occur across
  // multiple operators/modes and must resolve through line/operator-qualified context.
  [
    "1000系", "2000系", "3000系", "5000系", "6000系",
    "7000系", "8000系", "9000系", "10000系"
  ].forEach(function(name) { delete VEHICLE_NAME_TO_ICON[name]; });

  Object.assign(VEHICLE_NAME_TO_ICON, {
    "多摩都市モノレール1000系": "../images/列车/多摩都市モノレール/多摩都市モノレール_1000系_標準塗装.png",
    "東武10030系": "../images/列车/東武鉄道/東武鉄道_10030型_未更新車.png",
    "東武30000系": "../images/列车/東武鉄道/東武鉄道_30000系.png",
    "東武50000系": "../images/列车/東武鉄道/東武鉄道_50000型.png",
    "東武50070系": "../images/列车/東武鉄道/東武鉄道_50070型.png",
    "東武70000系": "../images/列车/東武鉄道/東武鉄道_70000系.png",
    "東武70090系": "../images/列车/東武鉄道/東武鉄道_70090型.png",
    "東武70090系(TH-LINER)": "../images/列车/東武鉄道/東武鉄道_70090型.png",
    "東武80000系": "../images/列车/東武鉄道/東武鉄道_80000系.png",
    "相模鉄道10000系": "../images/列车/相模鉄道/相模鉄道_10000系_相鉄グループカラー.png",
    "相模鉄道20000系": "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png",
    "東急5050系": "../images/列车/東急電鉄/東急電鉄_5050系.png",
    "京王電鉄5000系": "../images/列车/京王電鉄/京王電鉄_5000系.png",
    "東葉高速2000系": "../images/列车/東葉高速鉄道/東葉高速鉄道_2000系.png",
    "E235系0番台（山手線）": "../images/列车/JR東日本/JR東日本_E235系_0番台.png"
  });

  // v4.3.940: 给车型候选字符串（"A / B / C"），返回第一个有图标的完整路径；都没图返回 null
  // Multi-candidate fleet strings are evidence constraints only. Never choose a
  // concrete vehicle from fleet proportions or time-window hashing; concrete
  // vehicle identity must come from train/date/operation evidence upstream.
var CANONICAL_VEHICLES = {
  "sotetsu-11000-11003-hohoemi": { displayName: "相鉄11000系(10両)（11003F）", iconName: "相鉄11000系(10両)（11003F）", asset: "../images/列车/相模鉄道/相模鉄道_11000系_11003編成_ほほえみ号.png", validFrom: "2026-08-30", validTo: "", evidenceGrade: "A", evidenceSource: "https://www.sotetsu.co.jp/pressrelease/train/r26-132/", aliases: ["相鉄11000系(10両)（11003F）"] },
  "new-shuttle-2000-01": { displayName: "埼玉新都市交通2000系（01編成）", iconName: "埼玉新都市交通2000系（01編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_01編成_レッドパープル.png", aliases: ["2000系（01編成）","埼玉新都市交通2000系（01編成）"] },
  "new-shuttle-2000-02": { displayName: "埼玉新都市交通2000系（02編成）", iconName: "埼玉新都市交通2000系（02編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_02編成_オレンジ.png", aliases: ["2000系（02編成）","埼玉新都市交通2000系（02編成）"] },
  "new-shuttle-2000-03": { displayName: "埼玉新都市交通2000系（03編成）", iconName: "埼玉新都市交通2000系（03編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_03編成_グリーン.png", aliases: ["2000系（03編成）","埼玉新都市交通2000系（03編成）"] },
  "new-shuttle-2000-04": { displayName: "埼玉新都市交通2000系（04編成）", iconName: "埼玉新都市交通2000系（04編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_04編成_イエロー.png", aliases: ["2000系（04編成）","埼玉新都市交通2000系（04編成）"] },
  "new-shuttle-2000-05": { displayName: "埼玉新都市交通2000系（05編成）", iconName: "埼玉新都市交通2000系（05編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_05編成_ブルー.png", aliases: ["2000系（05編成）","埼玉新都市交通2000系（05編成）"] },
  "new-shuttle-2000-06": { displayName: "埼玉新都市交通2000系（06編成）", iconName: "埼玉新都市交通2000系（06編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_06編成_レッド.png", aliases: ["2000系（06編成）","埼玉新都市交通2000系（06編成）"] },
  "new-shuttle-2000-07": { displayName: "埼玉新都市交通2000系（07編成）", iconName: "埼玉新都市交通2000系（07編成）", asset: "../images/列车/埼玉新都市交通/埼玉新都市交通_2000系_07編成_さくら色.png", aliases: ["2000系（07編成）","埼玉新都市交通2000系（07編成）"] },

  "keikyu-1500": { displayName: "京急1500形", iconName: "京急1500形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_1500形.png", aliases: ["京急1500形","京浜急行電鉄1500形"] },
  "keikyu-600": { displayName: "京急600形", iconName: "京急600形", asset: "../images/列车/京浜急行電鉄/京浜急行電鉄_600形.png", aliases: ["京急600形","京浜急行電鉄600形"] },
  "keisei-3000": { displayName: "京成3000形", iconName: "京成3000形", asset: "../images/列车/京成電鉄/京成電鉄_3000形.png", aliases: ["京成3000形","京成電鉄3000形"] },
  "keisei-3100": { displayName: "京成3100形", iconName: "京成3100形", asset: "../images/列车/京成電鉄/京成電鉄_3100形.png", aliases: ["京成3100形","京成電鉄3100形"] },
  "keisei-3400": { displayName: "京成3400形", iconName: "京成3400形", asset: "../images/列车/京成電鉄/京成電鉄_3400形.png", aliases: ["京成3400形","京成電鉄3400形"] },
  "keisei-3700": { displayName: "京成3700形", iconName: "京成3700形", asset: "../images/列车/京成電鉄/京成電鉄_3700形.png", aliases: ["京成3700形","京成電鉄3700形"] },
  "keio-5000": { displayName: "京王5000系", iconName: "京王5000系", asset: "../images/列车/京王電鉄/京王電鉄_5000系.png", aliases: ["京王5000系","京王電鉄5000系"] },
  "odakyu-4000": { displayName: "小田急4000形", iconName: "小田急4000形", asset: "../images/列车/小田急電鉄/小田急電鉄_4000形_標準色.png", aliases: ["小田急4000形","小田急電鉄4000形"] },
  "metro-07-10": { displayName: "東京メトロ07系", iconName: "東京メトロ07系", asset: "../images/列车/東京メトロ/東京メトロ_07系.png", aliases: ["東京メトロ07系(10両)","東京メトロ07系"] },
  "metro-15000-10": { displayName: "東京メトロ15000系", iconName: "東京メトロ15000系", asset: "../images/列车/東京メトロ/東京メトロ_15000系.png", aliases: ["東京メトロ15000系(10両)","東京メトロ15000系"] },
  "tokyu-2020-10": { displayName: "東急2020系", iconName: "東急2020系", asset: "../images/列车/東急電鉄/東急電鉄_2020系.png", aliases: ["東急2020系(10両)","東急2020系"] },
  "tokyu-5080": { displayName: "東急5080系", iconName: "東急5080系", asset: "../images/列车/東急電鉄/東急電鉄_5080系.png", aliases: ["東急5080系"] },
  "tokyu-6020": { displayName: "東急6020系", iconName: "東急6020系", asset: "../images/列车/東急電鉄/東急電鉄_6020系.png", aliases: ["東急6020系(5両)","東急6020系(7両)","東急6020系"] },
  "tokyu-7000": { displayName: "東急7000系", iconName: "東急7000系", asset: "../images/列车/東急電鉄/東急電鉄_7000系.png", aliases: ["東急7000系"] },
  "tobu-50000-10": { displayName: "東武50000系", iconName: "東武50000系", asset: "../images/列车/東武鉄道/東武鉄道_50000型.png", aliases: ["東武50000系(10両)","東武50000系"] },
  "tobu-50050-10": { displayName: "東武50050系", iconName: "東武50050系", asset: "../images/列车/東武鉄道/東武鉄道_50050型.png", aliases: ["東武50050系(10両)","東武50050系"] },
  "tobu-70090": { displayName: "東武70090型", iconName: "東武70090型", asset: "../images/列车/東武鉄道/東武鉄道_70090型.png", aliases: ["東武70090型","東武70090系"] },
  "sotetsu-12000-10": { displayName: "相鉄12000系", iconName: "相鉄12000系", asset: "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄12000系(10両)"] },
  "sotetsu-13000-8": { displayName: "相鉄13000系", iconName: "相鉄13000系", asset: "../images/列车/相模鉄道/相模鉄道_13000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄13000系(8両)","相鉄13000系"] },
  "sotetsu-20000-10": { displayName: "相鉄20000系", iconName: "相鉄20000系", asset: "../images/列车/相模鉄道/相模鉄道_20000系_YOKOHAMA_NAVYBLUE.png", aliases: ["相鉄20000系(10両)"] },
  "sotetsu-21000": { displayName: "相鉄21000系", iconName: "相鉄21000系", asset: "../images/列车/相模鉄道/相模鉄道_21000系.png", aliases: ["相鉄21000系"] },

  "jr-east-209-500-keiyo": {
    displayName: "209系500番台（京葉線）",
    iconName: "209系500番台（京葉線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_500番台_京葉線.png",
    aliases: ["209系500番台（京葉線）", "JR 209系500番台", "JR東日本209系500番台"]
  },
  "sotetsu-12000": {
    displayName: "相模鉄道12000系",
    iconName: "相模鉄道12000系",
    asset: "../images/列车/相模鉄道/相模鉄道_12000系_YOKOHAMA_NAVYBLUE.png",
    aliases: ["相模鉄道12000系", "相鉄12000系"]
  },
  "odakyu-5000": {
    displayName: "小田急5000形",
    iconName: "小田急5000形",
    asset: "../images/列车/小田急電鉄/小田急電鉄_5000形_標準色.png",
    aliases: ["小田急5000形", "小田急電鉄5000形"]
  },
  "jr-east-e235-0-yamanote": {
    displayName: "E235系0番台（山手線）",
    iconName: "E235系山手線",
    asset: "../images/列车/JR東日本/JR東日本_E235系_0番台.png",
    aliases: ["E235系0番台（山手線）", "E235系山手線", "JR E235系0番台"]
  },
  "jr-east-e231-800-tozai-through": {
    displayName: "E231系800番台（東西線直通）",
    iconName: "E231系800番台（東西線直通）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_800番台.png",
    aliases: ["E231系800番台（東西線直通）"]
  },
  "toyo-rapid-2000-tozai-through": {
    displayName: "東葉高速2000系",
    iconName: "東葉高速鉄道2000系",
    asset: "../images/列车/東葉高速鉄道/東葉高速鉄道_2000系.png",
    aliases: ["東葉高速2000系", "東葉高速鉄道2000系"]
  },
  "jr-east-e233-2000-joban-local-chiyoda": {
    displayName: "E233系2000番台",
    iconName: "E233系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_2000番台.png",
    aliases: ["E233系2000番台"]
  },
  "jr-east-e531-joban-medium": {
    displayName: "E531系",
    iconName: "E531系",
    asset: "../images/列车/JR東日本/JR東日本_E531系.png",
    aliases: ["E531系"]
  },
  "jr-east-e231-0-joban-rapid": {
    displayName: "E231系0番台",
    iconName: "E231系0番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台.png",
    aliases: ["E231系0番台"]
  },
  "jr-east-e231-0-joban-rapid-led": {
    displayName: "E231系0番台（常磐快速線・LED）",
    iconName: "E231系0番台（常磐快速線・LED）",
    asset: "../images/列车/JR東日本/JR東日本_E231系_0番台_常磐快速線.png",
    aliases: ["E231系0番台（常磐快速線・LED）"]
  },
  "jr-east-e233-7000-saikyo": {
    displayName: "E233系7000番台",
    iconName: "E233系7000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系_7000番台.png",
    aliases: ["E233系7000番台", "JR E233系7000番台", "JR東日本E233系7000番台"]
  },
  "twr-70-000-rinkai": {
    displayName: "東京臨海高速鉄道70-000形",
    iconName: "東京臨海高速鉄道70-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_70-000形.png",
    aliases: ["東京臨海高速鉄道70-000形", "70-000形"]
  },
  "twr-71-000-rinkai": {
    displayName: "東京臨海高速鉄道71-000形",
    iconName: "東京臨海高速鉄道71-000形",
    asset: "../images/列车/東京臨海高速鉄道/東京臨海高速鉄道_71-000形.png",
    aliases: ["東京臨海高速鉄道71-000形", "71-000形"]
  },
  "jr-east-209-3500-hachiko-kawagoe": {
    displayName: "209系3500番台",
    iconName: "209系3500番台（八高・川越線）",
    asset: "../images/列车/JR東日本/JR東日本_209系_3500番台.png",
    aliases: ["209系3500番台", "209系3500番台（八高・川越線）"]
  },
  "jr-east-209-3000-hachiko-kawagoe": {
    displayName: "209系3000番台",
    iconName: "209系3000番台（八高・川越線）",
    asset: null,
    aliases: ["209系3000番台", "209系3000番台（八高・川越線）"]
  },
  "jr-east-209-3100-kawagoe": {
    displayName: "209系3100番台",
    iconName: "209系3100番台（川越線）",
    asset: null,
    aliases: ["209系3100番台", "209系3100番台（川越線）"]
  },
  "jr-east-209-2000-2100-boso-keiyo": {
    displayName: "209系2000番台 / 2100番台",
    iconName: "209系2000番台 / 2100番台",
    asset: "../images/列车/JR東日本/JR東日本_209系_2000・2100番台_房総地区.png",
    aliases: ["209系2000番台 / 2100番台"]
  },
  "jr-east-e233-5000-keiyo": {
    displayName: "E233系5000番台",
    iconName: "E233系5000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系5000番台.png",
    aliases: ["E233系5000番台", "JR E233系5000番台"]
  },
  "jr-east-e231-900-musashino": {
    displayName: "E231系900番台",
    iconName: "E231系900番台",
    asset: null,
    aliases: ["E231系900番台"]
  },
  "jr-east-e231-1000-shonan-shinjuku": {
    displayName: "E231系1000番台",
    iconName: "E231系1000番台",
    asset: "../images/列车/JR東日本/JR東日本_E231系_1000番台.png",
    aliases: ["E231系1000番台"]
  },
  "jr-east-e233-3000-shonan-shinjuku": {
    displayName: "E233系3000番台",
    iconName: "E233系3000番台",
    asset: "../images/列车/JR東日本/JR東日本_E233系3000番台.png",
    aliases: ["E233系3000番台"]
  },
  "jr-east-e257-2000-odoriko": {
    displayName: "E257系2000番台",
    iconName: "E257系2000番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2000番台.png",
    aliases: ["E257系2000番台"]
  },
  "jr-east-e257-2500-odoriko-shonan": {
    displayName: "E257系2500番台",
    iconName: "E257系2500番台",
    asset: "../images/列车/JR東日本/JR東日本_E257系_2500番台.png",
    aliases: ["E257系2500番台"]
  },
  "jr-east-253-1000-nikko-kinugawa": {
    displayName: "253系（日光・きぬがわ）",
    iconName: "253系（日光・きぬがわ）",
    asset: "../images/列车/JR東日本/JR東日本_253系_1000番台.png",
    aliases: ["253系（日光・きぬがわ）", "E253系（日光・きぬがわ）"]
  }
};
var CANONICAL_VEHICLE_ALIAS_INDEX = {};
var CANONICAL_VEHICLE_ALIAS_CONFLICTS = {};
function _registerCanonicalVehicleAlias(alias, rec) {
  var key = String(alias || "").trim();
  if (!key || CANONICAL_VEHICLE_ALIAS_CONFLICTS[key]) return;
  var existing = CANONICAL_VEHICLE_ALIAS_INDEX[key];
  if (existing && existing.id !== rec.id) {
    delete CANONICAL_VEHICLE_ALIAS_INDEX[key];
    CANONICAL_VEHICLE_ALIAS_CONFLICTS[key] = true;
    return;
  }
  CANONICAL_VEHICLE_ALIAS_INDEX[key] = rec;
}
Object.keys(CANONICAL_VEHICLES).forEach(function(id) {
  var rec = CANONICAL_VEHICLES[id];
  rec.id = id;
  // Dated artwork is a factual claim and must carry provenance.
  // Invalid dated records are deliberately not registered, so they cannot resolve.
  if ((rec.validFrom || rec.validTo) && (!rec.evidenceSource || rec.evidenceGrade !== "A")) {
    return;
  }
  _registerCanonicalVehicleAlias(id, rec);
  _registerCanonicalVehicleAlias(rec.displayName, rec);
  _registerCanonicalVehicleAlias(rec.iconName, rec);
  (rec.aliases || []).forEach(function(alias) {
    _registerCanonicalVehicleAlias(alias, rec);
  });
});

function resolveCanonicalVehicle(name) {
  var n = String(name || "").trim();
  if (!n || CANONICAL_VEHICLE_ALIAS_CONFLICTS[n]) return null;
  return CANONICAL_VEHICLE_ALIAS_INDEX[n] || null;
}

// SQL supplies a vetted path allowlist. The canonical identity resolver remains
// the only vehicle selector: catalog rows cannot guess a train's type.
var _verifiedSqlArtworkPaths = null;
var _verifiedSqlArtworkByExactName = null;
function hydrateVerifiedArtworkCatalog(rows) {
  if (!Array.isArray(rows)) return false;
  var paths = Object.create(null);
  var exact = Object.create(null);
  rows.forEach(function(row) {
    var path = row && String(row.image_path || "");
    if (!(path.startsWith("images/列车/") && path.endsWith(".png") && path.split("/").length === 4)) return;
    var artwork = "../" + path;
    paths[artwork] = true;
    // A database type name is eligible only when one certified generic vehicle
    // artwork exists for that *exact* name. Formation/livery/theme variants
    // cannot be chosen from a train's type alone.
    if (row.formation_id || row.livery || row.theme) return;
    var name = String(row.vehicle_type || "").trim();
    if (!name) return;
    if (!Object.prototype.hasOwnProperty.call(exact, name)) exact[name] = artwork;
    else if (exact[name] !== artwork) exact[name] = null;
  });
  _verifiedSqlArtworkPaths = paths;
  _verifiedSqlArtworkByExactName = exact;
  return true;
}
function refreshVerifiedArtworkCatalog() {
  if (typeof fetch !== "function") return Promise.resolve(false);
  return fetch("https://pnupwfmgbtxqhpzsrhfn.supabase.co/functions/v1/train-runs?catalog=vehicle-artwork",
    { credentials: "omit" }).then(function(res) {
      if (!res.ok) throw new Error("vehicle artwork catalog HTTP " + res.status);
      return res.json();
    }).then(function(body) {
      return body && body.ok === true && Array.isArray(body.assets)
        ? hydrateVerifiedArtworkCatalog(body.assets) : false;
    }).catch(function() { return false; });
}

function _canonicalVehicleIconPath(name, serviceDate) {
  var n = String(name || "").trim();
  if (!n) return null;
  var rec = resolveCanonicalVehicle(n);
  if (!rec) return null;
  if (rec.validFrom || rec.validTo) {
    var d = String(serviceDate || "").slice(0, 10);
    if (!d) return null;
    if (rec.validFrom && d < rec.validFrom) return null;
    if (rec.validTo && d > rec.validTo) return null;
  }
  // When SQL certifies the same canonical artwork, accept its path.
  // Otherwise keep the previously verified static mapping for offline use.
  if (_verifiedSqlArtworkPaths && _verifiedSqlArtworkPaths[rec.asset]) return rec.asset;
  return rec.asset;
}

function _resolveTrainRuleDisplayName(lineId, operator, trainId, stationIndex, trainType, byOperator) {
  // A line, operator, train type or train number pattern is not concrete vehicle evidence.
  // Vehicle class is supplied only by explicit upstream evidence.
  return '';
}

// Display-name normalization may only expand spelling variants within the same
  // canonical identity. It must never rewrite retired stock to a successor,
  // a generic family to a subseries, or an ambiguous candidate to one vehicle.
  function resolveVehicleDisplayName(vehicleIdentity) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    if (parts.length !== 1) return parts.length ? parts.join(' / ') : null;
    var name = parts[0];
    var canonical = resolveCanonicalVehicle(name);
    return canonical ? canonical.displayName : name;
  }

  // Fleet/livery pools are asset catalogs only. A confirmed vehicle type does not
  // prove a concrete formation or livery, so never hash-pick one at runtime.
  // Single artwork mapper. Input is an already-resolved vehicle identity only.
  // Operational context (line/operator/train number/source) is intentionally absent.
  function resolveVehicleArtwork(vehicleIdentity, serviceDate) {
    return _resolveVehicleArtworkBase(vehicleIdentity, serviceDate);
  }
  function _resolveVehicleArtworkBase(vehicleIdentity, serviceDate) {
    if (!vehicleIdentity) return null;
    var parts = String(vehicleIdentity).split('/').map(function(s){ return s.trim(); }).filter(Boolean);
    // A candidate list is not a concrete identity.
    if (parts.length !== 1) return null;
    var name = parts[0];

    // Canonical aliases are allowed only when they resolve to the same registered
    // identity record. No line override, replacement vehicle, base-name stripping,
    // retired-stock substitution, or approximate alias may select artwork.
    var canonical = _canonicalVehicleIconPath(name, serviceDate);
    if (canonical) return canonical;
    // A confirmed upstream vehicle type may use a SQL-certified PNG only on
    // exact, unambiguous type identity (never line-based fleet guessing).
    // Disallow a DB-only mapping for a name that the canonical registry marks
    // as conflicting, retired, or otherwise unsupported.
    if (CANONICAL_VEHICLE_ALIAS_CONFLICTS[name]) return null;
    if (_verifiedSqlArtworkByExactName &&
        Object.prototype.hasOwnProperty.call(_verifiedSqlArtworkByExactName, name)) {
      return _verifiedSqlArtworkByExactName[name] || null;
    }
    return null;
  }

  window.TrainIcons = {
    resolveVehicleArtwork: resolveVehicleArtwork,
    resolveVehicleDisplayName: resolveVehicleDisplayName,
    resolveCanonicalVehicle: resolveCanonicalVehicle,
    CANONICAL_VEHICLES: CANONICAL_VEHICLES,
    hydrateVerifiedArtworkCatalog: hydrateVerifiedArtworkCatalog,
    refreshVerifiedArtworkCatalog: refreshVerifiedArtworkCatalog
  };

  // Fire once after the canonical registry exists. The request is read-only,
  // never blocks rendering, and never grants identity to an UNKNOWN train.
  if (typeof fetch === "function") refreshVerifiedArtworkCatalog();

  console.debug("[TrainIcons] initialized with zero-fallback vehicle identity policy");
})();

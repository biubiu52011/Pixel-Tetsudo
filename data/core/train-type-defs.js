/**
 * 列車種別の表示名定義（i18n）
 * データソース: ODPT odpt:TrainType / 各社公式の種別名称
 * 用途: trains ページの列車ラベル・ツールチップで種別名（等级）を表示する
 * 東急 8 線分をまず定義（2026-09-16、ユーザー指示「车型・等级が確認できる時刻表」）
 */
window.TRAIN_TYPE_NAMES = {
  // ===== 東急 =====
  "odpt.TrainType:Tokyu.Local":                    { ja: "各駅停車", en: "Local", zh: "各站停车", ko: "각역정차" },
  "odpt.TrainType:Tokyu.Express":                  { ja: "急行",     en: "Express", zh: "急行", ko: "급행" },
  "odpt.TrainType:Tokyu.CommuterLimitedExpress":   { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },
  "odpt.TrainType:Tokyu.LimitedExpress":           { ja: "特急",     en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Tokyu.F-Liner":                  { ja: "Fライナー", en: "F-Liner", zh: "F-Liner", ko: "F라이너" },
  "odpt.TrainType:Tokyu.S-TRAIN":                  { ja: "S-TRAIN",  en: "S-TRAIN", zh: "S-TRAIN", ko: "S-TRAIN" },
  "odpt.TrainType:Tokyu.SemiExpress":              { ja: "準急",     en: "Semi Express", zh: "准急", ko: "준급" },

  // ===== 京成（2026-09-22 京成本線導入）=====
  "odpt.TrainType:Keisei.Skyliner":                 { ja: "スカイライナー", en: "Skyliner", zh: "Skyliner", ko: "스카이라이너" },
  "odpt.TrainType:Keisei.AccessExpress":            { ja: "アクセス特急", en: "Access Express", zh: "Access特急", ko: "액세스특급" },
  "odpt.TrainType:Keisei.RapidLimitedExpress":      { ja: "快速特急", en: "Rapid Ltd. Exp.", zh: "快速特急", ko: "쾌속특급" },
  "odpt.TrainType:Keisei.LimitedExpress":           { ja: "特急", en: "Limited Express", zh: "特急", ko: "특급" },
  "odpt.TrainType:Keisei.CommuterLimitedExpress":   { ja: "通勤特急", en: "Commuter Ltd. Exp.", zh: "通勤特急", ko: "통근특급" },
  "odpt.TrainType:Keisei.Rapid":                    { ja: "快速", en: "Rapid", zh: "快速", ko: "쾌속" },
  "odpt.TrainType:Keisei.Local":                    { ja: "普通", en: "Local", zh: "普通", ko: "보통" },
  "odpt.TrainType:Keisei.MorningLiner":             { ja: "モーニングライナー", en: "Morning Liner", zh: "Morning Liner", ko: "모닝라이너" },
  "odpt.TrainType:Keisei.EveningLiner":             { ja: "イブニングライナー", en: "Evening Liner", zh: "Evening Liner", ko: "이브닝라이너" },
};

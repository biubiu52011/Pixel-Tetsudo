// Pixel Tetsudo - ODPT Lazy Mode Flag (v4.3.590)
// home 页加载 odpt-unified.js 前的惰性标记。
// 必须用外部脚本（CSP script-src 'self' 阻止内联 script）——odpt-unified.js 检测
// window.ODPT_LAZY === true 时跳过全量 init（loadAllData 会拉全部 operator 实时/时刻表，
// 首页首屏不可承受）；搜索模块经 ODPTClient.getCompleteTimetable 按需拉取。
window.ODPT_LAZY = true;

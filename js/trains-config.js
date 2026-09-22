/* trains-config.js: 列车页 SVG 几何常量 */
window.TrainsConfig = {
  GEOM: {
    BRANCH_COL_W: 96,
    BRANCH_STUB: 20,
    MAIN_BASE_W_MOBILE: 410,
    MOBILE_CONTENT_W: 297,
    MAIN_BASE_W_MIN: 440,
    MAIN_BASE_W_MAX: 820
  }
  ,
  // v4.3.962: 缺色兜底——统一常量，避免散落各模块
  COLORS: {
    LINE_FALLBACK: "#008803",  // trains-geometry.js 主线颜色兜底
    LINE_UNKNOWN:  "#888888",  // trains-data.js 线路融合颜色兜底
    LABEL_FALLBACK: "#8a8a8a"  // trains-render.js 标签色兜底
  }
};
// 全局别名（trains-geometry.js / trains-render.js 直接用 GEOM.XXX）
window.GEOM = window.TrainsConfig.GEOM;
window.TrainsColors = window.TrainsConfig.COLORS;

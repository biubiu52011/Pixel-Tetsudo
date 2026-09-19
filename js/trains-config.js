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
};
// 全局别名（trains-geometry.js / trains-render.js 直接用 GEOM.XXX）
window.GEOM = window.TrainsConfig.GEOM;

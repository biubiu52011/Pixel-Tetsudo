/*
 * Pixel Tetsudo - Realtime 页面配置
 * v4.3.842: realtime 页不需要旅游数据（TOURISM_SPOTS/STATION_EXITS），
 * 设置 PT_SKIP_TOURISM 让 db-loader 跳过 tourism_data.json（2.24MB）的
 * 下载/解析/缓存读写。
 */
window.PT_SKIP_TOURISM = true;

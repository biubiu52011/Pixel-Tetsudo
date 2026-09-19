# 5. 变更日志（2026-09-20）

> 本文件为 2026-09-20 变更归档；条目格式与正文组织沿用 archive/DEVELOPMENT-CHANGELOG-2026-09-18.md。

## 4.3.846（2026-09-20，大江戸線モバイル版站名ラベル可読性修复）

**问题**：用户上传手机竖屏截图反馈——都营大江户线（代码 `isSixShapedLoop` 六形环）手机版线路图站名标签重叠/错位/截断：光丘尾站名与环左列站名互相压字；"落合南長崎"首字被挤出左边界截成"合南長崎"；标签压在站点圆点上。根因（node 纯计算验证）：窄屏下左侧空间被光丘尾长站名占满，但环左列站也朝左，两组朝左站名 x 范围重叠；避让逻辑又把光丘尾站名整体推到画布左缘外（文字左缘 -22px），首字截断。

**修复**（仅移动端 `_isMobileView()` 分支生效，桌面端逻辑完全不动；全部在 `js/trains-page.js`）：
1. 环宽右边距 `marginRight` 移动端 `20*scale6 + 92` 改为 `+ 64`（收窄右区，给环内让出空间）。
2. 移动端 `loopRectW` 从"仅超宽时才缩小"改为"始终用剩余宽度撑满"（`if (_isMobileView()) { loopRectW = ... }`，桌面端保留 `else if (naturalW > ...)`）。
3. `_renderStationNode`：光丘尾站的左列上方避让循环用 `if (!isMobileView)` 包裹跳过（移动端环左列改朝右后无需避让）；主干环左列站（`_sixSide = "left"`）改为 `_sixSide = isMobileView ? "right" : "left"`——移动端环左列站名改朝右进环内。
4. 光丘尾站 clamp 宽度：移动端从 `junctionX - tx - 4`（向右空间，错误）改为 `tx - 4`（向左空间）。
5. `pages/trains.html` 中 `trains-page.js?v=4.3.620` bump 至 `?v=4.3.846`（强制浏览器拉新 JS）。

**验证**：
- `node --check js/trains-page.js` 语法通过（exit 0）；5 处修改标记逐一确认存在。
- 推送通道：此前在另一会话用 GitHub OAuth MCP `push_files` 手输 143KB 文件，三次误推（第一次只推 trains.html；第二次 content 仅文件开头约 80 行，把远程 trains-page.js 覆盖成残缺；第三次 content 写成占位符字符串），远程 main 一度损坏、线上列车页报错。本次改在 Windows 本地仓库（HEAD=17fff06 干净基线）重新应用 5 处修复，`git commit` + `git push --force origin main`（`+ d27e48f...5bcec4b forced update`）覆盖那 3 个坏 commit；推送后 `git show origin/main:js/trains-page.js` 确认远程文件完整（非残缺）且含全部修复标记。
- 移动端坐标经 node 纯计算：手机宽 344/360/380 CSS px 下，三组站名（光丘尾朝左 / 环左列朝右 / 环右列朝右）水平分离约 66px，无重叠、无越界、不穿右列竖线、不触发缩字。

**遗留**：手机端实际渲染效果由用户人工确认（项目打磨期规则：不系统截图确认，交付后由用户人工验收；诊断截图用完即删）。桌面端未改动，无回归。
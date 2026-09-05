# Pixel Tetsudo（像素铁道）

東京首都圏の鉄道路線検索・運行状況・観光スポットを扱うピクセル風 Web アプリ。

## 运行方式（必须通过本地服务器）

项目数据通过 `fetch` 加载（`data/core/railway_data.json` 等），**双击 HTML（file:// 协议）无法工作**，必须用本地 HTTP 服务器：

```bash
python -m http.server 8017
```

然后访问：

```
http://localhost:8017/pages/home.html
```

数据加载成功的标志：浏览器控制台（F12）输出
`509 stations, 159 lines, 94 tourism stations`。

## 页面入口

| 页面 | 路径 |
|------|------|
| 首页（路线检索） | `pages/home.html`（唯一入口，`index.html` 会自动跳转） |
| 运行状况 | `pages/realtime.html` |
| 列车实时 | `pages/trains.html` |
| 搜索履历 | `pages/history.html` |

## 开发约定

详见 `AGENTS.md`（三层数据架构、显示身份规则、规范数据冻结等）。

import sys
sys.stdout.reconfigure(encoding='utf-8')

html = '''<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#00a04e">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="description" content="Pixel Tetsudo - Route Search">
    <title>路线搜索 | PIXEL TETSUDO</title>
    <link rel="icon" href="../pixel-tetsudo.ico" type="image/x-icon">
    <link rel="stylesheet" href="../css/style.css?v=120">
    <link rel="stylesheet" href="../css/lang-bar.css">
    <link rel="stylesheet" href="../css/tourism-styles.css?v=51">
</head>
<body>
<div id="app">
    <header class="pixel-header">
        <div class="header-container">
            <div class="lang-switcher-wrapper">
                <button id="langToggleBtn" class="lang-toggle-btn" title="Switch Language" aria-haspopup="listbox" aria-expanded="false" aria-label="Switch language">
                    <img src="../images/Language.png" alt="Language" class="lang-icon">
                </button>
                <div id="langSwitcher" class="lang-switcher">
                    <div class="lang-options" role="listbox" aria-label="Select language">
                        <button class="lang-btn active" data-lang="ja" role="option" aria-selected="true">日本語</button>
                        <button class="lang-btn" data-lang="zh" role="option" aria-selected="false">中文</button>
                        <button class="lang-btn" data-lang="ko" role="option" aria-selected="false">한국어</button>
                        <button class="lang-btn" data-lang="en" role="option" aria-selected="false">English</button>
                    </div>
                </div>
            </div>
            <div class="header-text">
                <h1 class="pixel-title" data-i18n="app.title">Pixel Tetsudo</h1>
                <p class="pixel-subtitle">PIXEL TETSUDO</p>
            </div>
        </div>
    </header>

    <nav class="pixel-tabs">
        <a href="home.html" class="tab-btn active" data-tab="search" data-i18n="tab.search">路线搜索</a>
        <a href="realtime.html" class="tab-btn" data-tab="status" data-i18n="tab.status">实时状态</a>
        <a href="trains.html" class="tab-btn" data-tab="trains" data-i18n="tab.realtime">列车时刻</a>
        <a href="history.html" class="tab-btn" data-tab="history" data-i18n="tab.history">历史记录</a>
    </nav>

    <section id="tab-search" class="tab-content active">
        <div id="searchContainer" class="search-card pixel-card">
            <div class="search-inputs">
                <div class="input-group">
                    <label class="input-label" data-i18n="search.fromLabel">出发站</label>
                    <input type="text" id="searchFrom" class="search-input" data-i18n-placeholder="search.fromPlaceholder" placeholder="出发站名称">
                    <div id="fromSuggestions" class="suggestions"></div>
                </div>
                <div class="input-group">
                    <label class="input-label" data-i18n="search.toLabel">到达站</label>
                    <input type="text" id="searchTo" class="search-input" data-i18n-placeholder="search.toPlaceholder" placeholder="到达站名称">
                    <div id="toSuggestions" class="suggestions"></div>
                </div>
                <button id="searchBtn" class="search-btn" data-i18n="search.btn">搜索</button>
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>

        <div id="smModule" class="sm-module pixel-card">
            <div id="smHeader" class="sm-header">
                <h2 data-i18n="tourism.title">观光信息</h2>
            </div>
            <div class="sm-location">
                <label class="sm-label" data-i18n="tourism.select_station">选择车站</label>
                <select id="smStationSelect" class="sm-select"></select>
            </div>
            <div id="smTagFilters" class="sm-tags"></div>
            <div id="smSearchSort" class="sm-search-sort">
                <div class="sm-search-wrap">
                    <span class="sm-search-icon">&#xE8B6;</span>
                    <input type="text" id="smSearchInput" class="sm-search-input" data-i18n-placeholder="tourism.search_placeholder" placeholder="搜索景点...">
                </div>
                <select id="smSortSelect" class="sm-sort-select">
                    <option value="dist" data-i18n="tourism.sort_distance">距离排序</option>
                    <option value="name" data-i18n="tourism.sort_name">名称排序</option>
                </select>
            </div>
            <div id="smGrid" class="sm-grid"></div>
            <div id="smEmpty" class="sm-empty hidden"></div>
        </div>
    </section>

    <section id="tab-status" class="tab-content"></section>
    <section id="tab-trains" class="tab-content"></section>
    <section id="tab-history" class="tab-content"></section>

    <footer class="pixel-footer" data-i18n="app.footer">© 2026 Pixel Tetsudo</footer>
</div>

<script src="../js/translations.js"></script>
<script src="../js/lang-init.js"></script>
<script src="../js/bundle-home.js?v=116"></script>
<script src="../js/route-search.js"></script>
<script src="../js/search-ui.js"></script>
<script src="../js/sightseeing.js"></script>
<script src="../js/tab-switch.js"></script>
</body>
</html>'''

with open('pages/home.html', 'w', encoding='utf-8', newline='') as f:
    f.write(html)
print('Written', len(html), 'chars')

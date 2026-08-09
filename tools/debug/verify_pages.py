"""验证页面数据正确性"""

﻿import os

base = r"C:\Users\80996\OneDrive\文档\项目\像素铁道\pages"

home = """<!DOCTYPE html>
<html lang="ja">
<head>
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' https:; connect-src 'self' https://lcaixnrzdwhpmdwdiedx.supabase.co">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="theme-color" content="#00a04e">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="description" content="Pixel Tetsudo - Route Search">
    <title>路線検索 | PIXEL TETSUDO</title>
    <link rel="icon" href="../pixel-tetsudo.ico" type="image/x-icon">
    <link rel="stylesheet" href="../css/style.css?v=120">
    <link rel="stylesheet" href="../css/lang-bar.css">
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
        <a href="home.html" class="tab-btn active" data-tab="search" data-i18n="tab.search">路線検索</a>
        <a href="realtime.html" class="tab-btn" data-tab="status" data-i18n="tab.status">運行状況</a>
        <a href="trains.html" class="tab-btn" data-tab="trains" data-i18n="tab.realtime">列車位置</a>
        <a href="history.html" class="tab-btn" data-tab="history" data-i18n="tab.history">履歴</a>
    </nav>

    <section id="tab-search" class="tab-content active">
        <div id="searchContainer" class="search-card pixel-card">
            <div class="search-inputs">
                <div class="input-group">
                    <label class="input-label" data-i18n="search.fromLabel">出発駅</label>
                    <input type="text" id="searchFrom" class="search-input" data-i18n-placeholder="search.fromPlaceholder" placeholder="出発駅を入力">
                    <div id="fromSuggestions" class="suggestions"></div>
                </div>
                <div class="input-group">
                    <label class="input-label" data-i18n="search.toLabel">到着駅</label>
                    <input type="text" id="searchTo" class="search-input" data-i18n-placeholder="search.toPlaceholder" placeholder="到着駅を入力">
                    <div id="toSuggestions" class="suggestions"></div>
                </div>
                <button id="searchBtn" class="search-btn" data-i18n="search.btn">検索</button>
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>

        <div id="smModule" class="sm-module pixel-card">
            <div id="smHeader" class="sm-header">
                <h2 data-i18n="tourism.title">観光情報</h2>
            </div>
            <div class="sm-location">
                <label class="sm-label" data-i18n="tourism.select_station">駅を選択</label>
                <select id="smStationSelect" class="sm-select"></select>
            </div>
            <div id="smTagFilters" class="sm-tags"></div>
            <div id="smGrid" class="sm-grid"></div>
            <div id="smEmpty" class="sm-empty hidden"></div>
        </div>
    </section>

    <section id="tab-status" class="tab-content"></section>
    <section id="tab-trains" class="tab-content"></section>
    <section id="tab-history" class="tab-content"></section>

    <footer class="pixel-footer" data-i18n="app.footer">© 2026 Pixel Tetsudo</footer>
</div>

<div id="dataSource" class="data-source data-source-cloud"></div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../js/translations.js"></script>
<script src="../js/lang-init.js"></script>
<script src="../js/bundle-home.js?v=116"></script>
<script src="../js/supabase-client.js"></script>
<script src="../js/route-search.js"></script>
<script src="../js/search-ui.js"></script>
<script src="../js/sightseeing.js"></script>
<script src="../js/tab-switch.js"></script>
</body>
</html>"""

with open(os.path.join(base, 'home.html'), 'w', encoding='utf-8') as f:
    f.write(home)
print('home.html written successfully')

# Verify all pages
for page in ['home.html', 'realtime.html', 'trains.html', 'history.html', 'tourism-detail.html']:
    path = os.path.join(base, page)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    has_wrapper = 'lang-switcher-wrapper' in content
    has_aria = 'aria-haspopup' in content
    has_lang = '日本語' in content
    has_collapsed = 'collapsed' in content
    status = 'OK' if (has_wrapper and has_aria and has_lang and not has_collapsed) else 'ISSUE'
    print(f'{page}: wrapper={has_wrapper} aria={has_aria} lang={has_lang} collapsed={has_collapsed} => {status}')

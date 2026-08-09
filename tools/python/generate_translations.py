"""生成翻译数据"""

import json

translations = {
    "en": {
        "app": {
            "title": "Pixel Tetsudo",
            "footer": "c 2026 Pixel Tetsudo PIXEL TETSUDO"
        },
        "tab": {
            "search": "Route Search",
            "status": "Running Status",
            "realtime": "Train Location",
            "history": "History"
        },
        "search": {
            "from": "From Station",
            "to": "To Station",
            "placeholder_from": "e.g., Tokyo",
            "placeholder_to": "e.g., Shibuya",
            "btn": "Search Route",
            "loading": "Searching...",
            "no_results": "No trains found for this route."
        },
        "history": {
            "title": "Search History",
            "clear": "Clear",
            "empty": "No search history yet"
        },
        "validate": {
            "input_required": "Please enter both stations"
        },
        "detail": {
            "type": "Type",
            "destination": "Destination",
            "cars": "Cars",
            "delay": "Delay",
            "normal": "On Time",
            "explanation": "This train information is based on real-time data."
        },
        "train_popup": {
            "stop_times_header": "Stop Times"
        },
        "line_map": {
            "back": "Back to List",
            "title": "Line List"
        },
        "status": {
            "arrival": "Arrival",
            "departure": "Departure",
            "normal": "Normal",
            "delayed": "Delayed",
            "suspended": "Suspended",
            "shuttle": "Shuttle service",
            "no_data": "No real-time data available",
            "kanto": "Kanto",
            "kansai": "Kansai / Chugoku",
            "other": "Other"
        }
    },
    "ja": {
        "app": {
            "title": "Pixel Tetsudo",
            "footer": "c 2026 Pixel Tetsudo PIXEL TETSUDO"
        },
        "tab": {
            "search": "ル－ト検索",
            "status": "運行状況",
            "realtime": "列車位置",
            "history": "履歴"
        },
        "search": {
            "from": "出発駅",
            "to": "到着駅",
            "placeholder_from": "例：東京",
            "placeholder_to": "例：渋谷",
            "btn": "検索",
            "loading": "検索中...",
            "no_results": "このルートの列車はありません。"
        },
        "history": {
            "title": "検索履歴",
            "clear": "クリア",
            "empty": "検索履歴はありません"
        },
        "validate": {
            "input_required": "両方の駅を入力してください"
        },
        "detail": {
            "type": "種別",
            "destination": "終点",
            "cars": "両数",
            "delay": "遅延",
            "normal": "正常",
            "explanation": "この列車情報は実データに基づいています。"
        },
        "train_popup": {
            "stop_times_header": "停車時間"
        },
        "line_map": {
            "back": "リストに戻る",
            "title": "路線一覧"
        },
        "status": {
            "arrival": "到着",
            "departure": "発車",
            "normal": "正常",
            "delayed": "遅延",
            "suspended": "運休",
            "shuttle": "代行輸送",
            "no_data": "実況データがありません",
            "kanto": "首都圏",
            "kansai": "関西・中国",
            "other": "その他"
        }
    },
    "zh": {
        "app": {
            "title": "Pixel Tetsudo",
            "footer": "c 2026 Pixel Tetsudo PIXEL TETSUDO"
        },
        "tab": {
            "search": "路?搜索",
            "status": "?行状?",
            "realtime": "列?位置",
            "history": "?史??"
        },
        "search": {
            "from": "出?站",
            "to": "到?站",
            "placeholder_from": "例如：?京",
            "placeholder_to": "例如：?谷",
            "btn": "搜索路?",
            "loading": "搜索中...",
            "no_results": "此路?没有列?。"
        },
        "history": {
            "title": "搜索?史",
            "clear": "清除",
            "empty": "?无搜索?史"
        },
        "validate": {
            "input_required": "??入?个?站"
        },
        "detail": {
            "type": "?型",
            "destination": "?点",
            "cars": "??数",
            "delay": "延?",
            "normal": "正常",
            "explanation": "此列?信息基于??数据。"
        },
        "train_popup": {
            "stop_times_header": "停???"
        },
        "line_map": {
            "back": "返回列表",
            "title": "?路列表"
        },
        "status": {
            "arrival": "到?",
            "departure": "??",
            "normal": "正常",
            "delayed": "延?",
            "suspended": "停?",
            "shuttle": "接???",
            "no_data": "?无??数据",
            "kanto": "首都圈",
            "kansai": "?西・中国",
            "other": "其他"
        }
    },
    "ko": {
        "app": {
            "title": "Pixel Tetsudo",
            "footer": "c 2026 Pixel Tetsudo PIXEL TETSUDO"
        },
        "tab": {
            "search": "?? ??",
            "status": "?? ??",
            "realtime": "?? ??",
            "history": "??"
        },
        "search": {
            "from": "???",
            "to": "???",
            "placeholder_from": "?: ??",
            "placeholder_to": "?: ???",
            "btn": "?? ??",
            "loading": "?? ?...",
            "no_results": "? ???? ??? ????."
        },
        "history": {
            "title": "?? ??",
            "clear": "???",
            "empty": "?? ??? ????"
        },
        "validate": {
            "input_required": "? ????? ?????"
        },
        "detail": {
            "type": "??",
            "destination": "???",
            "cars": "?? ?",
            "delay": "??",
            "normal": "??",
            "explanation": "? ?? ??? ??? ???? ?????."
        },
        "train_popup": {
            "stop_times_header": "?? ??"
        },
        "line_map": {
            "back": "???? ????",
            "title": "?? ??"
        },
        "status": {
            "arrival": "??",
            "departure": "??",
            "normal": "??",
            "delayed": "??",
            "suspended": "?? ??",
            "shuttle": "?? ??",
            "no_data": "??? ??? ??",
            "kanto": "???",
            "kansai": "???・???",
            "other": "??"
        }
    }
}

# Write as minified JS code matching original format
output = "(function(){\"use strict\";var I18N=" + json.dumps(translations, separators=(',', ':')) + ";var CURRENT_LANG=\"ja\";"

# Read the original file and preserve everything after the I18N declaration
with open('js/translations.js', 'r', encoding='utf-8') as f:
    full_content = f.read()

# Find where I18N is defined and replace only that part
import re
match = re.search(r'(var I18N=.*?);var CURRENT_LANG', full_content, re.DOTALL)
if match:
    new_content = full_content[:match.start(1)] + output + full_content[match.end(1):]
else:
    # If pattern not found, rebuild whole file
    new_content = '(function(){\"use strict\";' + output + '''

var CURRENT_LANG="ja";function t(k,f){var p=k.split(""),l=CURRENT_LANG||"ja",o=I18N[l];for(var i=0;i<p.length;i++){if(!o)return f||k;o=o[p[i]]}return o!==undefined?o:f||k}function A(){try{var e=document.querySelectorAll("[data-i18n]");for(var i=0;i<e.length;i++){var k=e[i].getAttribute("data-i18n");if(k)e[i].textContent=t(k)}catch(x){}var ph=document.querySelectorAll("[data-i18n-placeholder]");for(var j=0;j<ph.length;j++){var k=ph[j].getAttribute("data-i18n-placeholder");if(k)ph[j].placeholder=t(k)}}function S(l){if(!I18N[l])console.log("Unknown:",l);CURRENT_LANG=l;localStorage.setItem("pixeltetsudo_lang",l);U(l);A();if(typeof window.refreshHeight==="function")try{window.refreshHeight()}catch(e){}try{var b=document.querySelectorAll(".lang-btn");for(var k=0;k<b.length;k++)b[k].classList.toggle("active",b[k].getAttribute("data-lang")===l)}catch(e){}} function U(l){var F={"en":"FusionPixel-Latin,sans-serif","ja":"FusionPixel-JA,Yu Gothic,Hiragino Kaku Gothic Pro,sans-serif","zh":"FusionPixel-ZH,Microsoft YaHei,SimHei,sans-serif","ko":"FusionPixel-KO,Malgun Gothic,Datum,sans-serif"};document.documentElement.style.fontFactor=F[l]||F["ja"]}function I(){try{var s=localStorage.getItem("pixeltetsudo_lang");if(s&&I18N[s])CURRENT_LANG=s;U(CURRENT_LANG);var b=document.querySelectorAll(".lang-btn");for(var i=0;i<b.length;i++)b[i].classList.toggle("active",b[i].getAttribute("data-lang")===CURRENT_LANG)}catch(e){}}if(document.readyState==="loading")addEventListener("DOMContentLoaded",I);else I());}(())'''

with open('js/translations.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Generated translations.js")



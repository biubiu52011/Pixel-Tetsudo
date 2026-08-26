import json, os, re
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Load existing reconciliation data
line_recon = json.load(open(os.path.join(repo,"recovery/reconciliation/line_reconciliation.json"),"r",encoding="utf-8"))

# ========== Helper: detect mojibake ==========
def is_mojibake(s):
    """Check if a string looks like mojibake (garbled UTF-8 interpreted as something else)"""
    if not isinstance(s, str):
        return False
    # Common mojibake patterns: replacement characters, unusual unicode ranges
    # Latin-1 Supplement range (0x80-0xFF) used as Chinese chars is a classic sign
    for ch in s:
        cp = ord(ch)
        # Check for common mojibake signatures
        if 0x3000 <= cp <= 0x303F:  # CJK symbols - could be garbled
            pass  # might be legitimate
        if cp > 0xFFFF:
            return True  # definitely suspicious for Japanese text
    # Check for specific mojibake patterns
    if any(c in s for c in ["ﾅ","ｶ","ｲ","ｻ","ｼ","ｵ","ｱ","ｳ","ｴ","ｵ","ｰ","ﾊ","ﾐ","ﾘ","ﾗ","ｹ","ﾒ","ﾄ","ﾝ","ﾞ","ﾟ"]):
        return True
    # Check for non-Japanese ASCII乱码 patterns
    if "・" in s and len(s) < 10:
        # Short strings with middle dot are often mojibake
        pass
    # Check for double-byte characters in wrong positions
    half_width_kana = any('\uFF61' <= c <= '\uFF9F' for c in s)
    if half_width_kana:
        return True
    return False

def clean_japanese(text):
    """Check if Japanese text looks clean"""
    if not isinstance(text, str) or not text:
        return False
    if is_mojibake(text):
        return False
    # Must contain at least one valid Japanese character type
    has_ja = any('\u4E00' <= c <= '\u9FFF' for c in text)  # CJK Unified
    has_kana = any('\u3040' <= c <= '\u309F' for c in text)  # Hiragana
    has_kana2 = any('\u30A0' <= c <= '\u30FF' for c in text)  # Katakana
    return has_ja or has_kana or has_kana2

# ========== 1.7.1 Line Field Resolution ==========
resolutions = []
stats = {"ACCEPT_SOURCE": 0, "ACCEPT_CURRENT": 0, "MERGE": 0, "UNRESOLVED": 0, "NOT_USED": 0}

for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    if sl == cl:
        continue

    line_entry = {
        "line_id": lid,
        "source_station_count": len(sl.get("stations", [])),
        "current_station_count": len(cl.get("stations", [])),
        "fields": {}
    }

    # --- image field ---
    sv = sl.get("image", "")
    cv = cl.get("image", "")
    if sv != cv:
        src_bad = is_mojibake(sv) if sv else False
        cur_bad = is_mojibake(cv) if cv else False
        if src_bad and not cur_bad:
            decision = "ACCEPT_CURRENT"
            reason = "Source image path is mojibake-corrupted; current has correct relative path"
            stats["ACCEPT_CURRENT"] += 1
        elif cur_bad and not src_bad:
            decision = "ACCEPT_SOURCE"
            reason = "Current image path is mojibake-corrupted; source has correct path"
            stats["ACCEPT_SOURCE"] += 1
        elif src_bad and cur_bad:
            decision = "UNRESOLVED"
            reason = "Both image paths are corrupted"
            stats["UNRESOLVED"] += 1
        else:
            decision = "ACCEPT_CURRENT"
            reason = "Prefer current production path (more reliable)"
            stats["ACCEPT_CURRENT"] += 1
        line_entry["fields"]["image"] = {
            "decision": decision, "reason": reason,
            "source": sv, "current": cv
        }

    # --- nameJa field ---
    sv = sl.get("nameJa", "")
    cv = cl.get("nameJa", "")
    if sv != cv:
        src_clean = clean_japanese(sv) if sv else False
        cur_clean = clean_japanese(cv) if cv else False
        if src_clean and not cur_clean:
            decision = "ACCEPT_SOURCE"
            reason = "Source has valid Japanese name; current is missing"
            stats["ACCEPT_SOURCE"] += 1
        elif cur_clean and not src_clean:
            decision = "ACCEPT_CURRENT"
            reason = "Current has valid Japanese name; source is missing or corrupted"
            stats["ACCEPT_CURRENT"] += 1
        elif src_clean and cur_clean:
            decision = "UNRESOLVED"
            reason = "Both have different valid Japanese names; needs manual review"
            stats["UNRESOLVED"] += 1
        elif not src_clean and not cur_clean:
            decision = "ACCEPT_CURRENT"
            reason = "Both are empty/mojibake; prefer current (empty is safer than garbled)"
            stats["ACCEPT_CURRENT"] += 1
        elif not sv and cv:
            decision = "ACCEPT_CURRENT"
            reason = "Source missing; current has value"
            stats["ACCEPT_CURRENT"] += 1
        elif sv and not cv:
            decision = "ACCEPT_SOURCE" if src_clean else "UNRESOLVED"
            reason = "Source has value (clean: " + str(src_clean) + "); current missing"
            stats[decision] += 1
        else:
            decision = "UNRESOLVED"
            reason = "Both present but different"
            stats["UNRESOLVED"] += 1
        line_entry["fields"]["nameJa"] = {
            "decision": decision, "reason": reason,
            "source": sv, "current": cv
        }

    # --- stations field ---
    ss = sl.get("stations", [])
    cs = cl.get("stations", [])
    if ss != cs:
        # Check for mojibake in source station names
        src_has_mojibake = any(is_mojibake(s) for s in ss)
        cur_has_mojibake = any(is_mojibake(s) for s in cs)
        if src_has_mojibake and not cur_has_mojibake:
            decision = "ACCEPT_CURRENT"
            reason = "Source station list contains mojibake entries; current has corrected names"
            stats["ACCEPT_CURRENT"] += 1
        elif cur_has_mojibake and not src_has_mojibake:
            decision = "ACCEPT_SOURCE"
            reason = "Current station list contains mojibake entries; source has corrected names"
            stats["ACCEPT_SOURCE"] += 1
        elif len(ss) != len(cs):
            decision = "UNRESOLVED"
            reason = f"Station count differs: source={len(ss)}, current={len(cs)}; needs manual review"
            stats["UNRESOLVED"] += 1
        else:
            # Same count but different order/content
            decision = "UNRESOLVED"
            reason = "Same station count but different sequences; needs manual review"
            stats["UNRESOLVED"] += 1
        line_entry["fields"]["stations"] = {
            "decision": decision, "reason": reason,
            "source_count": len(ss), "current_count": len(cs),
            "source_first": ss[:3], "current_first": cs[:3]
        }

    # --- durations field ---
    sd = sl.get("durations", [])
    cd = cl.get("durations", [])
    if sd != cd:
        # Durations are derived from stations, so if stations differ, durations will too
        # Accept current if it's consistent with current stations
        decision = "UNRESOLVED"
        reason = f"Durations differ (source={len(sd)}, current={len(cd)}). Will be recomputed from resolved stations."
        stats["UNRESOLVED"] += 1
        line_entry["fields"]["durations"] = {
            "decision": decision, "reason": reason,
            "source": sd, "current": cd
        }

    # --- code field ---
    sv = sl.get("code", "")
    cv = cl.get("code", "")
    if sv != cv:
        # Code is usually an operator-assigned identifier
        decision = "ACCEPT_CURRENT"
        reason = "Current production code is authoritative; source may have outdated code"
        stats["ACCEPT_CURRENT"] += 1
        line_entry["fields"]["code"] = {
            "decision": decision, "reason": reason,
            "source": sv, "current": cv
        }

    # --- branchOf field ---
    sv = sl.get("branchOf")
    cv = cl.get("branchOf")
    if sv != cv:
        decision = "ACCEPT_CURRENT"
        reason = "Current production branchOf is authoritative"
        stats["ACCEPT_CURRENT"] += 1
        line_entry["fields"]["branchOf"] = {
            "decision": decision, "reason": reason,
            "source": sv, "current": cv
        }

    # Other fields check (name, nameEn, color, operator, region, type, durationTotalMin)
    for f in ["name", "nameEn", "color", "operator", "region", "type", "durationTotalMin"]:
        sv = sl.get(f)
        cv = cl.get(f)
        if sv != cv:
            # These should generally be identical; if different, prefer current
            decision = "ACCEPT_CURRENT"
            reason = f"Field {f} differs; current production is authoritative"
            stats["ACCEPT_CURRENT"] += 1
            line_entry["fields"][f] = {
                "decision": decision, "reason": reason,
                "source": sv, "current": cv
            }

    resolutions.append(line_entry)

# Summary
total_fields = sum(len(r["fields"]) for r in resolutions)
print(f"Line field resolutions: {len(resolutions)} lines, {total_fields} field decisions")
print(f"\nStatistics:")
for k, v in sorted(stats.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

# Save
out = {
    "timestamp": datetime.now().isoformat(),
    "task": "1.7.1 Line Field Resolution",
    "total_lines_analyzed": len(resolutions),
    "total_field_decisions": total_fields,
    "statistics": stats,
    "resolutions": resolutions,
}
out_path = os.path.join(repo, "recovery", "reconciliation", "1_7_1_line_field_resolution.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {out_path}")
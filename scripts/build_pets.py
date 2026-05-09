#!/usr/bin/env python3
"""Build public/pets.json from the biligame wiki spirit list + rocom.aoe.top game data.

The wiki page (https://wiki.biligame.com/rocom/精灵图鉴) is the source of truth for
"which pets are available in the game" and for the evolution stage of each card. Pet
stats, type, form names, habitat and area belonging come from rocom.aoe.top.

Usage:
  python scripts/build_pets.py \
      --rocom ~/rocom.aoe.top \
      --output public/pets.json

  # use a local copy of the wiki HTML to skip the network round-trip:
  python scripts/build_pets.py --rocom ~/rocom.aoe.top --wiki-html /tmp/wiki.html \
      --output public/pets.json
"""

import argparse
import json
import os
import re
import sys
import urllib.request

DEFAULT_WIKI_URL = "https://wiki.biligame.com/rocom/%E7%B2%BE%E7%81%B5%E5%9B%BE%E9%89%B4"


def fetch_wiki(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "rocodle-build/1.0"})
    return urllib.request.urlopen(req, timeout=60).read().decode("utf-8")


def parse_wiki(html: str):
    """Yield one dict per pet card on the wiki spirit-list page."""
    cards = list(re.finditer(r'<div class="divsort"\s+([^>]+)>', html))
    for idx, m in enumerate(cards):
        attrs = dict(re.findall(r'data-(\w+)="([^"]*)"', m.group(1)))
        start = m.end()
        end = cards[idx + 1].start() if idx + 1 < len(cards) else len(html)
        chunk = html[start:end]
        no_m = re.search(r"NO\.?\s*(\d+)", chunk)
        name_m = re.search(
            r'class="rocom_prop_name new_page_link block_2"><a [^>]*title="([^"]+)"',
            chunk,
        )
        full_name = name_m.group(1) if name_m else None
        base_name, form = full_name, None
        if full_name:
            paren = re.match(r"^(.+?)（(.+)）$", full_name)
            if paren:
                base_name, form = paren.group(1), paren.group(2)
        yield {
            "no": no_m.group(1) if no_m else None,
            "full_name": full_name,
            "base_name": base_name,
            "form": form,
            "stage": attrs.get("param1"),
            "main_type": attrs.get("param2"),
            "sub_type": attrs.get("param3"),
            "form_type": attrs.get("param4"),
        }


def build_rocom_index(rocom_root: str):
    """Return ((zh_name, form_str_or_empty) -> rocom_entry) and area-id-to-name."""
    pb = json.load(
        open(os.path.join(rocom_root, "public/data/tables/PETBASE_CONF.json"))
    )["RocoDataRows"]
    top = json.load(open(os.path.join(rocom_root, "public/data/Pets.json")))
    ah = json.load(
        open(os.path.join(rocom_root, "public/data/BinData/AREA_HANDBOOK.json"))
    )["RocoDataRows"]
    pets_dir = os.path.join(rocom_root, "public/data/pets")

    area_names = {int(k): v.get("name") for k, v in ah.items()}
    top_by_id = {p["id"]: p for p in top}

    index = {}
    for pid_str, row in pb.items():
        pid = int(pid_str)
        top_p = top_by_id.get(pid)
        if not top_p:
            continue
        zh = top_p["localized"]["zh"]["name"]
        form = row.get("form")
        # The wiki labels single-form pets like 迪莫 / 鸭吉吉 as 最终形态 even though
        # they have no evolutionary predecessor in the catalog. Per spec these should
        # be 未进化. We treat a pet as truly 已进化 only when both: wiki stage == 最终
        # 形态 AND it has an `evolves_from_id` parent.
        area_ids = []
        try:
            detail = json.load(open(os.path.join(pets_dir, f"{pid}.json")))
            area_ids = detail.get("world_profile", {}).get("handbook_area_ids") or []
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        has_predecessor = top_p.get("evolves_from_id") is not None
        entry = {
            "id": pid,
            "name": top_p["name"],
            "zh_name": zh,
            "form": form,
            "main_type": top_p.get("main_type"),
            "sub_type": top_p.get("sub_type"),
            "habitat": row.get("habit_1"),
            "area_ids": area_ids,
            "has_predecessor": has_predecessor,
            "stats": {
                "hp": top_p.get("base_hp"),
                "phyAtk": top_p.get("base_phy_atk"),
                "magAtk": top_p.get("base_mag_atk"),
                "phyDef": top_p.get("base_phy_def"),
                "magDef": top_p.get("base_mag_def"),
                "spd": top_p.get("base_spd"),
            },
        }
        key = (zh, form or "")
        # Prefer the lowest id when multiple PETBASE rows share the same (name, form)
        if key not in index or pid < index[key]["id"]:
            index[key] = entry
    return index, area_names


def make_type(t):
    if not t:
        return None
    return {"id": t["id"], "name": t["name"], "zh": t["localized"]["zh"]}


_ROMAN_MAP = {"Ⅰ": "I", "Ⅱ": "II", "Ⅲ": "III", "Ⅳ": "IV", "Ⅴ": "V",
              "Ⅵ": "VI", "Ⅶ": "VII", "Ⅷ": "VIII", "Ⅸ": "IX", "Ⅹ": "X"}


def _normalize(s: str) -> str:
    if not s:
        return ""
    out = s
    for k, v in _ROMAN_MAP.items():
        out = out.replace(k, v)
    # treat 储水期 vs 储水时 as equal — wiki/PETBASE disagree on this
    out = out.replace("期", "时")
    return out


def lookup(index: dict, base_name: str, form: str | None):
    """Try exact (name, form) match, then fallbacks for known wiki/data drift."""
    key = (base_name, form or "")
    if key in index:
        return index[key]
    # fallback 1: wiki uses "本来的样子" as a "this is just the base form" placeholder
    # for pets whose other forms are real variants; some PETBASE rows store form=None
    if form == "本来的样子" and (base_name, "") in index:
        return index[(base_name, "")]
    # fallback 2: normalize roman numerals and 期/时 typos
    nb, nf = _normalize(base_name), _normalize(form or "")
    for (k_name, k_form), v in index.items():
        if _normalize(k_name) == nb and _normalize(k_form) == nf:
            return v
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wiki-url", default=DEFAULT_WIKI_URL)
    ap.add_argument(
        "--wiki-html",
        help="Path to a saved copy of the wiki HTML; if set, skips network fetch.",
    )
    ap.add_argument("--rocom", required=True, help="Path to rocom.aoe.top repo root.")
    ap.add_argument("--output", required=True)
    args = ap.parse_args()

    rocom_root = os.path.expanduser(args.rocom)

    if args.wiki_html:
        html = open(args.wiki_html, encoding="utf-8").read()
    else:
        print(f"fetching wiki: {args.wiki_url}", file=sys.stderr)
        html = fetch_wiki(args.wiki_url)

    all_cards = list(parse_wiki(html))
    # 首领形态 (leader/boss forms, e.g. 鸭吉吉国王) are filter-only entries on the
    # wiki — they aren't part of the regular catalog of catchable pets, so drop them.
    wiki_cards = [c for c in all_cards if c["form_type"] != "首领形态"]
    print(
        f"parsed {len(all_cards)} wiki cards "
        f"(dropped {len(all_cards) - len(wiki_cards)} 首领形态)",
        file=sys.stderr,
    )

    index, area_names = build_rocom_index(rocom_root)
    print(f"indexed {len(index)} rocom (name, form) pairs", file=sys.stderr)

    pets_out = []
    unmatched = []
    for c in wiki_cards:
        rocom = lookup(index, c["base_name"], c["form"])
        if not rocom:
            unmatched.append(c)
            continue
        area = sorted(
            {area_names[i] for i in rocom["area_ids"] if i in area_names}
        )
        pets_out.append(
            {
                "id": rocom["id"],
                "name": rocom["name"],
                "displayName": c["full_name"],
                "form": c["form"],
                "mainType": make_type(rocom["main_type"]),
                "subType": make_type(rocom["sub_type"]),
                "area": area,
                "habitat": rocom["habitat"],
                "evolved": (
                    c["stage"] == "最终形态" and rocom["has_predecessor"]
                ),
                "stats": rocom["stats"],
            }
        )

    print(
        f"matched {len(pets_out)} / {len(wiki_cards)} wiki cards "
        f"(unmatched: {len(unmatched)})",
        file=sys.stderr,
    )
    if unmatched:
        print("unmatched samples:", file=sys.stderr)
        for u in unmatched[:25]:
            print(
                f"  NO.{u['no']:>3} {u['full_name']!r} stage={u['stage']}",
                file=sys.stderr,
            )

    out_path = os.path.expanduser(args.output)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(pets_out, f, ensure_ascii=False, indent=2)
    print(f"wrote {len(pets_out)} pets -> {out_path}", file=sys.stderr)


if __name__ == "__main__":
    main()

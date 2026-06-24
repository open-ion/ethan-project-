#!/usr/bin/env python3
"""
イーサン投資ダッシュボード v0
イオンの家計・投資状況を一画面にまとめる。月1回これを開けば、
今のフェーズ・防衛資金の進捗・次の一手・確定申告の残り日数が分かる。

使い方:  python3 tools/dashboard.py
データ:  data/profile.json / data/portfolio.json / data/candidates.json
"""
import json
import os
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")


def load(name):
    with open(os.path.join(DATA, name), encoding="utf-8") as f:
        return json.load(f)


def yen(n):
    return f"{round(n):,}円"


def man(n):
    return f"{n/10000:,.0f}万円"


def bar(cur, target, width=24):
    ratio = 0 if target == 0 else min(cur / target, 1.0)
    filled = int(ratio * width)
    return "[" + "#" * filled + "-" * (width - filled) + f"] {ratio*100:4.0f}%"


def fv_annuity(monthly, years, annual):
    """毎月積立の将来価値(複利)。"""
    r = annual / 12
    n = int(years * 12)
    if r == 0:
        return monthly * n
    return monthly * (((1 + r) ** n - 1) / r)


def section(title):
    print("\n" + "─" * 56)
    print(f"  {title}")
    print("─" * 56)


def main():
    profile = load("profile.json")
    portfolio = load("portfolio.json")

    today = date.today()
    df = profile["defense_fund"]
    cur = df["現在額"]
    gate = df["個別株解禁ライン"]
    phase = "A（防衛資金づくり）" if cur < gate else "B（投資加速・個別株解禁）"

    print("=" * 56)
    print("  🦔  イーサン投資ダッシュボード")
    print(f"  {today.isoformat()}  /  現在フェーズ: {phase}")
    print("=" * 56)

    # --- 毎月のお金の流れ ---
    section("毎月のお金の流れ")
    inc = profile["income"]
    sp = profile["side_income_split_月"]
    print(f"  本業＋バイト : {yen(inc['本業バイト_月'])}  → 生活費でほぼ消費")
    print(f"  副業         : {yen(inc['副業_月'])}  （{inc['副業_内訳']}）")
    print(f"    ├ 税金     : {yen(sp['税金'])}  → 隔離キープ")
    print(f"    ├ 現金バッファ: {yen(sp['現金バッファ'])}  → 防衛資金へ")
    print(f"    └ 投資準備 : {yen(sp['投資準備'])}  → オルカン積立")

    # --- 防衛資金 ---
    section("防衛資金（投資の大前提）")
    tmin = df["目標_最低_3か月"]
    tfull = df["目標_安心_6か月"]
    monthly = df["毎月積立"]
    print(f"  現在額       : {man(cur)}")
    print(f"  最低(3か月)  : {man(tmin)}  {bar(cur, tmin)}")
    print(f"  安心(6か月)  : {man(tfull)}  {bar(cur, tfull)}")
    if cur < tmin:
        months = (tmin - cur) / monthly
        print(f"  → 最低ラインまであと {man(tmin-cur)}（{monthly/10000:.0f}万/月で約{months:.0f}か月）")
        print(f"  → 個別株はまだ解禁しない。投資は全額オルカン。")
    elif cur < tfull:
        print(f"  → 最低ライン突破！個別株フェーズB解禁OK。安心ラインへ継続。")
    else:
        print(f"  → 防衛資金フル。バッファ{monthly/10000:.0f}万が投資に合流可能 → 二段ロケット点火🚀")

    # --- NISA枠の消化 ---
    section("NISA枠の消化（楽天証券）")
    invested = sum(h.get("invested_jpy", 0) for h in portfolio["nisa_tsumitate"])
    invested += sum(h.get("invested_jpy", 0) for h in portfolio["nisa_growth"])
    cap = profile["nisa"]["生涯上限"]
    print(f"  生涯上限     : {man(cap)}")
    print(f"  投資済み     : {man(invested)}  {bar(invested, cap)}")
    holds = portfolio["nisa_tsumitate"] + portfolio["nisa_growth"]
    if holds:
        print("  保有/積立予定:")
        for h in holds:
            mj = h.get("monthly_jpy")
            extra = f"（毎月{mj/10000:.1f}万 {h.get('started','')}〜）" if mj else ""
            print(f"    ・{h['name']} {extra}")

    # --- 20年見通し（二段ロケット） ---
    section("20年見通し（5%想定・税引前のざっくり）")
    a = profile["assumptions"]
    rate = a["想定利回り_年"]
    pa = sp["投資準備"]          # フェーズA: 投資準備のみ
    pb = a["フェーズB_月額投資"]  # フェーズB: バッファ合流後
    # 防衛資金フルまでの月数 → フェーズA期間
    a_months = max(0, (tfull - cur) / monthly)
    a_years = a_months / 12
    b_years = max(0, 20 - a_years)
    r = rate / 12
    pot = fv_annuity(pa, a_years, rate)
    pot = pot * ((1 + r) ** int(b_years * 12))  # フェーズA分をさらに運用
    pot += fv_annuity(pb, b_years, rate)
    print(f"  フェーズA: 月{pa/10000:.1f}万 を約{a_years:.1f}年（防衛資金づくり中）")
    print(f"  フェーズB: 月{pb/10000:.1f}万 を約{b_years:.1f}年（バッファ合流後）")
    print(f"  → 20年後の資産（5%想定）: 約{man(pot)}")

    # --- 確定申告カウントダウン ---
    section("確定申告アラート")
    tax = profile["tax"]
    # 申告期間の開始日（対象年の翌年2/16）
    start = date(tax["確定申告_対象年"] + 1, 2, 16)
    end = date(tax["確定申告_対象年"] + 1, 3, 15)
    days = (start - today).days
    print(f"  対象年       : {tax['確定申告_対象年']}年分")
    print(f"  申告期間     : {start.isoformat()} 〜 {end.isoformat()}")
    if today > end:
        print("  状態         : 今期は終了。来年分の対象年を profile.json で更新を。")
    elif days <= 0:
        print("  🔴 申告期間中！ 今すぐ着手。")
    elif days <= 60:
        print(f"  🔴 あと{days}日。イオンに確認：①税金プールは足りてる？②申告のやり方OK？")
        print("     → docs/06_tax-filing-prep.md を一緒に開くこと。")
    elif days <= 120:
        print(f"  🟡 あと{days}日。そろそろ書類(支払調書・経費)を集め始める。")
    else:
        print(f"  🟢 あと{days}日。今は気にしなくてOK（月1でこの画面を見れば自動で警告が出る）。")
    print(f"  住民税       : {tax['住民税']}（副業を本業にバレにくくする）")
    print(f"  申告方式     : {tax['申告方式']}")

    # --- 次の一手 ---
    section("次の一手")
    steps = []
    if portfolio["nisa_tsumitate"] and invested == 0:
        steps.append("楽天証券でオルカン月3.5万の自動積立を設定（7月開始）")
    if cur < tmin:
        steps.append("現金バッファ7万を住信SBIで防衛資金へ。100万超えたら個別株フェーズBへ")
    else:
        steps.append("個別株フェーズB：三菱HCキャピタル/KDDI/三井物産を単元未満で開始検討")
    steps.append("月1回このダッシュボードを開く（python3 tools/dashboard.py）")
    for i, s in enumerate(steps, 1):
        print(f"  {i}. {s}")
    print()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# 受診先ナビの画面イメージ(SVG)を生成する。
# 実ブラウザが無い環境向けに、実CSSの配色・レイアウトを再現したモックアップ。
import html

W = 414  # スマホ幅
PRIMARY = "#1d6fb8"; PRIMARY_D = "#155a96"
EMG = "#c0392b"; EMG_BG = "#fdecea"
BG = "#f4f6f8"; CARD = "#ffffff"; BORDER = "#e2e8f0"
MUTED = "#6b7280"; TEXT = "#1f2933"
DISC_BG = "#fff8e1"; DISC_BD = "#f0d98c"
FONT = 'font-family="Hiragino Sans, Noto Sans JP, sans-serif"'

def esc(s): return html.escape(s)

class SVG:
    def __init__(self, w):
        self.w = w; self.y = 0; self.el = []
    def rect(self, x, y, w, h, fill, rx=0, stroke=None, sw=1):
        s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ''
        self.el.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}/>')
    def text(self, x, y, t, size=14, fill=TEXT, weight="400", anchor="start"):
        self.el.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" '
                       f'font-weight="{weight}" text-anchor="{anchor}" {FONT}>{esc(t)}</text>')
    def render(self, h):
        body = "\n".join(self.el)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{h}" '
                f'viewBox="0 0 {self.w} {h}">\n<rect width="{self.w}" height="{h}" fill="{BG}"/>\n{body}\n</svg>')

def card(s, y, h):
    s.rect(12, y, W-24, h, CARD, rx=12, stroke=BORDER)

# ---------- 画面1: トップ（症状選択） ----------
def screen_top():
    s = SVG(W); y = 0
    # ヘッダ
    s.text(W/2, 36, "受診先ナビ", 22, TEXT, "800", "middle")
    s.rect(W/2+58, 24, 46, 16, PRIMARY, rx=8)
    s.text(W/2+81, 36, "試作版", 10, "#fff", "700", "middle")
    s.text(W/2, 58, "症状から受診先の目安と徒歩圏内の病院を案内", 11, MUTED, "400", "middle")
    # 免責
    y = 74
    s.rect(12, y, W-24, 70, DISC_BG, rx=12, stroke=DISC_BD)
    s.text(24, y+24, "⚠ これは医師の診断に代わるものではありません。", 11.5, TEXT, "700")
    s.text(24, y+44, "迷う場合は医療機関や救急(#7119 / 119)に", 11, TEXT)
    s.text(24, y+60, "相談してください。病名診断・薬の推奨はしません。", 11, TEXT)
    # カード: 症状選択
    y = 158
    card(s, y, 330)
    s.text(28, y+28, "1. 当てはまる症状を選んでください", 14, TEXT, "700")
    s.text(28, y+48, "赤色の症状は緊急性が高い可能性があります", 10.5, EMG)
    # 症状タイル
    sy = y+62
    tiles = [("胸の痛み・締めつけ", True), ("激しい息苦しさ", True),
             ("意識がもうろう", True), ("片側手足のまひ", True),
             ("発熱", False), ("咳・のどの痛み", False),
             ("腹痛", False), ("頭痛", False),
             ("めまい", False), ("けが・打撲", False),
             ("皮膚の異常", False), ("歯の痛み", False)]
    cols = 2; tw = (W-24-16-12)/cols; th = 34
    for i,(label,emg) in enumerate(tiles):
        c = i % cols; r = i // cols
        tx = 28 + c*(tw+8); ty = sy + r*(th+8)
        bg = EMG_BG if emg else CARD
        bd = "#f1b0a8" if emg else BORDER
        s.rect(tx, ty, tw, th, bg, rx=8, stroke=bd)
        s.rect(tx+10, ty+11, 13, 13, "#fff", rx=3, stroke=bd)
        s.text(tx+32, ty+22, label, 11.5, EMG if emg else TEXT, "600" if emg else "400")
    # ボタン
    by = y+300
    s.rect(28, by, W-80, 36, PRIMARY, rx=9)
    s.text(28+(W-80)/2, by+23, "受診先の目安を見る", 14, "#fff", "700", "middle")
    return s.render(500)

# ---------- 画面2: 結果（緊急） ----------
def screen_emergency():
    s = SVG(W); y = 12
    card(s, y, 470)
    yy = y+16
    # 緊急バナー
    s.rect(28, yy, W-56, 188, EMG_BG, rx=10, stroke=EMG, sw=2)
    s.text(44, yy+30, "🚨 今すぐ救急車(119)または", 15, EMG, "800")
    s.text(44, yy+50, "    救急外来へ", 15, EMG, "800")
    s.text(44, yy+72, "緊急性が高い可能性のある症状が選択されました", 10.5, EMG)
    s.text(44, yy+92, "・胸の痛み・締めつけ", 11, EMG)
    s.text(44, yy+108, "・片側手足のまひ", 11, EMG)
    # 通話ボタン
    bw = (W-56-12)/2
    s.rect(28, yy+122, bw, 38, EMG, rx=9)
    s.text(28+bw/2, yy+146, "119 に電話", 13, "#fff", "800", "middle")
    s.rect(28+bw+12, yy+122, bw, 38, "#fff", rx=9, stroke=EMG, sw=2)
    s.text(28+bw+12+bw/2, yy+146, "#7119 に相談", 12.5, EMG, "800", "middle")
    s.text(44, yy+178, "迷う場合も診療科案内より救急を優先してください", 9.5, EMG)
    # 免責(結果)
    ry = yy+200
    s.rect(28, ry, W-56, 44, DISC_BG, rx=10, stroke=DISC_BD)
    s.text(40, ry+19, "⚠ これは診断ではありません。", 11, TEXT, "700")
    s.text(40, ry+35, "以下はあくまで受診先の目安です。", 10.5, TEXT)
    # 推奨診療科
    dy = ry+62
    s.text(28, dy, "受診先の目安", 14, TEXT, "700")
    s.rect(28, dy+12, 150, 36, PRIMARY, rx=9)
    s.text(28+75, dy+36, "脳神経外科", 16, "#fff", "800", "middle")
    s.text(28, dy+70, "関連候補：神経内科 / 救急科", 11, MUTED)
    return s.render(494)

# ---------- 画面3: 結果（通常） ----------
def screen_normal():
    s = SVG(W); y = 12
    card(s, y, 446)
    yy = y+20
    s.text(28, yy, "2. 結果", 15, TEXT, "700")
    # 免責
    ry = yy+12
    s.rect(28, ry, W-56, 44, DISC_BG, rx=10, stroke=DISC_BD)
    s.text(40, ry+19, "⚠ これは診断ではありません。", 11, TEXT, "700")
    s.text(40, ry+35, "以下はあくまで受診先の目安です。", 10.5, TEXT)
    # 推奨診療科
    dy = ry+74
    s.text(28, dy, "受診先の目安", 14, TEXT, "700")
    s.rect(28, dy+12, 110, 36, PRIMARY, rx=9)
    s.text(28+55, dy+36, "内科", 16, "#fff", "800", "middle")
    s.text(28, dy+70, "関連候補：消化器内科 / 耳鼻咽喉科", 11, MUTED)
    # 病院候補
    hy = dy+96
    s.text(28, hy, "徒歩圏内の病院候補", 14, TEXT, "700")
    s.rect(178, hy-13, 78, 17, "#6b7280", rx=8)
    s.text(178+39, hy-1, "ダミーデータ", 9.5, "#fff", "700", "middle")
    hospitals = [("みなと総合クリニック", "🚶約3分(220m)", "内科・循環器内科", True),
                 ("けやき脳神経クリニック", "🚶約10分(750m)", "神経内科・内科", True),
                 ("市民中央病院(救急対応)", "🚶約12分(900m)", "救急・内科・外科", True)]
    cy = hy+12
    for name, dist, dept, openf in hospitals:
        s.rect(28, cy, W-56, 74, CARD, rx=10, stroke=BORDER)
        s.text(40, cy+24, name, 13, TEXT, "700")
        tag = "診療中の可能性" if openf else "時間外の可能性"
        tbg = "#e3f4e8" if openf else "#f1f1f1"; tcol = "#1d7a3e" if openf else "#888"
        s.rect(W-56-78, cy+10, 74, 17, tbg, rx=8)
        s.text(W-56-78+37, cy+22, tag, 9, tcol, "600", "middle")
        s.text(40, cy+44, dist, 11.5, PRIMARY_D, "600")
        s.text(40, cy+62, "診療科：" + dept, 10.5, MUTED)
        cy += 84
    return s.render(470)

for fn, gen in [("screen-1-top.svg", screen_top),
                ("screen-2-emergency.svg", screen_emergency),
                ("screen-3-result.svg", screen_normal)]:
    with open("/home/user/ethan-project-/mockups/"+fn, "w") as f:
        f.write(gen())
    print("wrote", fn)

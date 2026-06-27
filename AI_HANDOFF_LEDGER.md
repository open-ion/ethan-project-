# AI_HANDOFF_LEDGER.md — Claude Code引き継ぎ台帳

## 2026-06-27 — Codex主導: AI自動音声受付Web MVP

## 完了したこと
- 既存の静的Node/HTML/CSS/JS構成を維持したまま、`/voice-reception` にAI自動音声受付デモを追加。
- Web Speech API対応ブラウザでマイク入力、未対応環境でテキスト入力フォールバックを提供。
- 予約・FAQ・営業電話・一般問い合わせを簡易分類する受付ロジックを追加。
- 予約希望日時、人数、名前、電話番号の簡易抽出を追加。
- 会話ログと構造化予約情報を `localStorage` の `agathon-voice-reception-records` に保存。
- `/admin` に予約一覧と会話ログの管理画面を追加。
- READMEに起動方法、環境変数、設計判断、未実装、拡張方針を追記。
- 商品化ロードマップを `docs/product/voice-reception-roadmap.md` に追加。

## 変更したファイル
- `src/app.js`
- `src/styles.css`
- `scripts/build.mjs`
- `scripts/smoke-test.mjs`
- `README.md`
- `AI_HANDOFF_LEDGER.md`
- `docs/product/voice-reception-roadmap.md`

## 変更理由
- Claude Codeが2026-07-01まで使えないため、Codexが一時的に開発主担当として、明日中に営業デモ可能なAI自動音声受付MVPを作る必要があった。
- 既存アーキテクチャを大きく変えずに、Ionの営業検証時間を増やすため、最短で動くWebデモを優先した。

## 残タスク
- OpenAI等のAI応答/API接続。
- DB永続化。
- 店舗設定編集UI。
- 電話番号連携。
- LINE通知。
- Googleカレンダー連携。
- 認証・店舗別テナント分離。
- 予約日時・電話番号の厳密なバリデーション。

## 次にやるべきこと
1. OpenAI Responses APIで `intent`, `reply`, `reservation`, `missingFields`, `riskFlags` をJSON出力する受付サービスを作る。
2. SQLiteまたはPostgreSQLに `conversations` と `reservations` を保存するAPI層を追加する。
3. 店舗設定をデータ化し、FAQ応答を店舗ごとに変更可能にする。
4. Twilio等の電話番号連携候補を比較し、Webデモの会話状態をそのまま電話に流用する。
5. LINE通知とGoogleカレンダーのPoCを小さく作る。

## Ethanへの引き継ぎ事項
- 現状は営業デモ優先のルールベース実装。商品化にはAI抽出/API/DB/認証が必須。
- 既存ニュースダッシュボードを壊さないため、Voice Receptionはルート追加とlocalStorage分離で実装した。
- Claude Code復帰後は、静的MVPを残しながら本番用のサービス境界を設計してほしい。

---

## 2026-06-27 — Codex継続: 商品プロトタイプ化

## 完了したこと
- `/voice-reception` を単発応答から会話状態つき受付フローへ改善。
- 初回挨拶、聞き返し、予約内容確認、「はい」による仮予約完了メッセージを追加。
- 予約情報に `request`（要望）と `status`（未確認/確認済み）を追加。
- 営業電話を `kind: sales` として予約・通常会話から分離。
- `/admin` に予約件数、営業電話件数、会話ログ件数の概要、予約ステータス変更、営業電話ログ、店舗設定フォームを追加。
- 店舗設定（店舗名、業種、営業時間、定休日、住所、駐車場、FAQ、AI受付の口調）を `localStorage` に保存し、受付応答へ反映。
- Smoke testに商品プロトタイプ化の存在チェックを追加。

## 変更したファイル
- `src/app.js`
- `src/styles.css`
- `scripts/smoke-test.mjs`
- `README.md`
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- AGATHON LABS最初の商品として、営業時に「これ欲しい」と言われる体験へ近づけるため。
- 電話番号連携前でも、予約完了・営業電話分離・スタッフ管理画面・店舗設定反映が一連で見える状態にするため。

## 残タスク
- 現在の会話はルールベース。OpenAI等で自然言語理解・応答品質を上げる必要がある。
- 保存はlocalStorageのため、本番ではDB/API/認証/複数店舗対応が必要。
- 予約日時の正規化、営業時間内判定、重複予約/満席判定は未実装。
- LINE通知、Googleカレンダー連携、電話番号連携は未実装。

## 次にやるべきこと
1. `conversation`, `reservation`, `sales_call`, `store_settings` のデータモデルを決める。
2. OpenAI Responses APIで構造化抽出JSONを返すPoCを作る。
3. SQLite/PostgreSQL永続化を追加し、管理画面をAPI駆動にする。
4. Twilio/LINE/Google Calendar連携の最小PoCを別ブランチで検証する。

## Ethanへの引き継ぎ事項
- 今回の目的は商品デモの説得力向上。アーキテクチャはまだ静的MVPの範囲。
- Claude Code復帰後は、このUXを壊さずにAI/API/DB境界へ分離してほしい。

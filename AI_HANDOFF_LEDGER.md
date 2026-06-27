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

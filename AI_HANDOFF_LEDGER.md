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

---

## 2026-06-27 — Codex CEO実行: Restaurant AI Reception MVP完成化

## 完了したこと
- 受付ロジックを `src/voice-reception.js` に分離し、UIから再利用しやすい構造にした。
- 電話着信開始、AI挨拶、用件判定、予約、FAQ、営業電話、人への転送、終了までの流れを実装。
- FAQを飲食店向けに拡張（営業時間、定休日、駐車場、席数、支払方法、個室、禁煙/喫煙、テイクアウト）。
- 人への転送条件を追加（3回聞き取れない、スタッフ希望、想定外、怒り、緊急）。
- 空入力/無言/雑音/想定外へのエラー処理と聞き返しを追加。
- `scripts/voice-reception-test.mjs` を追加し、予約成功、FAQ成功、営業電話成功、転送成功、例外成功を検証。
- `npm test` にVoice Receptionのフローテストを組み込んだ。
- build/dev serverに `voice-reception.js` のルート配信を追加。

## 変更したファイル
- `src/voice-reception.js`
- `src/app.js`
- `src/styles.css`
- `scripts/build.mjs`
- `scripts/dev-server.mjs`
- `scripts/smoke-test.mjs`
- `scripts/voice-reception-test.mjs`
- `package.json`
- `README.md`
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- AGATHON LABS初プロダクトとして、機能追加より「今日最後まで動く」ことを優先するため。
- 予約/FAQ/営業/転送/例外を最低限すべて動作確認できる状態にするため。

## 残タスク
- Web Speech APIの認識精度はブラウザ依存。本番電話品質はTwilio等で別検証が必要。
- 予約日時の厳密な正規化、営業時間外判定、満席判定は未実装。
- localStorage保存のため、DB/API/認証/複数店舗対応が必要。
- AI応答はまだルールベース。OpenAI等の構造化抽出・自然応答へ置き換える。

## 次にやるべきこと
1. SQLite/PostgreSQLで `stores`, `conversations`, `reservations`, `sales_calls`, `transfers` を永続化する。
2. OpenAI Responses APIで予約抽出と意図判定をJSON Schema化する。
3. Twilioで実電話着信WebhookのPoCを作る。
4. LINE通知とGoogleカレンダー登録を予約完了時のイベントとして接続する。

## Ethanへの引き継ぎ事項
- 今日のデモ範囲は完成。次は本番化のため、現在の `src/voice-reception.js` の純粋ロジックをAPI層へ移すのが最短。

## 2026-06-28 — Codex: GitHub Connector検証コミットの整理

## ①何を変更したか
- 前回のGitHub Connector検証で追加された一時ファイル `test.txt` を削除。
- Codexの役割分担ルールに合わせ、Push/PR/MergeはClaude Code担当であることを前提に、作業終了時の引き継ぎ情報をこの台帳へ記録。

## ②追加したファイル
- なし。

## ③変更したファイル
- `AI_HANDOFF_LEDGER.md`

## ④削除したファイル
- `test.txt`

## ⑤次の担当AIがやること
- Claude CodeはGitHub側の正式Workspace/Connector環境で `open-ion/agathon-voice-reception` を最新状態から確認する。
- 必要なら今回の整理コミットを確認後、GitHubへPushし、Pull Requestを作成する。
- Connector APIの有無は、シェルの `git push` ではなく、利用可能なGitHub Connector/ネイティブGitツール一覧で確認する。

## ⑥懸念事項
- この実行環境にはGitHub Connector APIが提供されておらず、ネイティブConnector経由のcommit/push検証はできない。
- `gh` CLIも未インストールのため、GitHub認証状態はCLIでは確認できない。
- 前回のシェル `git push` 試行は `CONNECT tunnel failed, response 403` で失敗しており、以後この環境からシェルPushを実行しないこと。

## ⑦コミットメッセージ案
- `chore: remove connector verification artifact`

## 完了したこと
- 一時検証ファイルを削除し、作業終了時に必要なAI Handoff Ledger項目を記録した。

## 変更したファイル
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- GitHub Connector検証用の一時ファイルをアプリケーションコードベースへ残さないため。
- AGATHON LABS開発ルールに従い、次担当AIが迷わず引き継げる状態にするため。

## 残タスク
- GitHub Connectorが提供されている正式環境で、Connector経由のcommit/push可否を確認する。

## 次にやるべきこと
- Claude CodeがGitHub Push / Pull Request / Merge / Vercel Deployを担当する。

## Ethanへの引き継ぎ事項
- Codex環境ではConnector APIが見えないため、GitHub側操作はClaude CodeまたはConnector提供済みWorkspaceで継続してほしい。

---

## 2026-06-28 — Codex Lead Software Engineer: スタッフ通知キューMVP

## 実装内容
- AGATHON Voice Receptionの次価値として、予約・人への転送・営業電話からスタッフ向け通知文を自動生成する通知キューMVPを追加。
- 管理画面に通知キュー件数と通知本文を表示し、外部LINE/メール連携前に「何をスタッフへ届けるか」を確認できる状態にした。
- 店舗設定に通知先メモを追加し、通知文の宛先として保存・表示できるようにした。
- 実装前設計として、通知MVPの目的・範囲・非対象・受け入れ条件を設計メモに記録。

## 追加ファイル
- `docs/product/voice-reception-notification-mvp-design.md`

## 変更ファイル
- `src/voice-reception.js`
- `src/app.js`
- `src/styles.css`
- `scripts/voice-reception-test.mjs`
- `scripts/smoke-test.mjs`
- `README.md`
- `AI_HANDOFF_LEDGER.md`

## 削除ファイル
- なし。

## 次担当AI
- Claude Code: GitHub Push / Pull Request / Merge / Vercel Deployを担当。
- Claude Codeまたは次のCodex: 通知キューをLINE/メール/Webhookへ接続する前に、DB/API永続化の境界を決める。

## 懸念事項
- 現在の通知は外部送信ではなく、localStorage内の通知キュー生成・管理画面表示まで。
- localStorage保存のため、別端末スタッフ共有や本番運用にはDB/API/認証が必要。
- 通知文はルールベース生成のため、本番ではOpenAI構造化抽出結果や店舗別通知テンプレートと接続したい。

## コミットメッセージ案
- `feat: add staff notification queue for voice reception`

## 次に実装すべき機能
- 通知キューを永続化するAPI/DB層を追加し、予約・転送・営業電話の通知をLINEまたはメールへ送信できるようにする。

## 完了したこと
- 小さく設計し、小さく実装し、`npm test`で既存MVPの受付・ログ・管理画面・通知キューの最低限の動作を確認した。

## 変更理由
- 飲食店オーナーが「AIが受けた重要な電話をスタッフが見落とさない」と判断できることが、販売可能性を上げる直近の顧客価値だから。

## 残タスク
- 外部通知送信、DB永続化、認証、店舗別テンプレート、通知済みステータス管理。

## Ethanへの引き継ぎ事項
- 通知キューは外部連携前の仕様固定レイヤーとして実装済み。次はDB/API化してLINE/メール送信へ接続するのが最短。

---

## 2026-06-28 — Codex Lead Software Engineer: Twilio電話接続Webhook MVP

## 実装内容
- 「実際に電話をかけ、AIが応答すること」を今日の最優先目標として、Twilio Voice互換のTwiML Webhookを追加。
- `POST /api/twilio/voice` で着信時のAI挨拶と日本語音声入力Gatherを返すようにした。
- `POST /api/twilio/respond` でTwilioの `SpeechResult` を既存のAI受付ロジックへ渡し、予約/FAQ/営業電話/転送の応答をTwiMLで返すようにした。
- ローカル開発サーバーでも `/api/twilio/voice` と `/api/twilio/respond` を検証できるようにした。
- Twilio Webhookのユニットテストを追加し、`npm test` に組み込んだ。

## 追加ファイル
- `src/twilio-voice-webhook.js`
- `api/twilio/voice.js`
- `api/twilio/respond.js`
- `scripts/twilio-voice-webhook-test.mjs`

## 変更ファイル
- `scripts/dev-server.mjs`
- `scripts/smoke-test.mjs`
- `package.json`
- `.env.example`
- `README.md`
- `AI_HANDOFF_LEDGER.md`

## 削除ファイル
- なし。

## 次担当AI
- Claude Codeまたは次の実装AI: Vercelへ反映後、Twilioで電話番号を購入/設定し、Voice Webhookに `https://<公開URL>/api/twilio/voice` を指定して実機通話テストを行う。

## 懸念事項
- この環境では外部公開URLとTwilio番号がないため、実電話の発着信テストは未実施。
- Webhook通話セッションは現時点でプロセス内メモリ保存。本番ではDB/Redis等に移す必要がある。
- Twilio署名検証、認証、録音/個人情報同意、営業時間外ルール、満席判定は未実装。
- 現在のAI応答はルールベース。OpenAI構造化抽出/自然応答への置換が必要。

## コミットメッセージ案
- `feat: add twilio voice webhook mvp`

## 次に実装すべき機能
- Vercel公開URLにデプロイし、Twilio Voice Webhookへ接続して実電話で「着信→AI挨拶→発話認識→AI応答」まで確認する。

## 完了したこと
- 電話接続に必要な最小Webhook入口、TwiML応答、既存受付ロジック接続、ローカルテストを実装した。

## 変更理由
- Webデモだけでは販売に届かないため、実電話番号からAI受付へ接続するための最短経路を作る必要があった。

## 残タスク
- Twilio番号設定、公開URLでの実通話テスト、通話セッション永続化、Twilio署名検証、外部通知送信、DB/API化。

## Ethanへの引き継ぎ事項
- GitHubではなく電話接続が優先。次はTwilio番号と公開Webhook URLを用意して、実電話でTwiML応答を確認すること。

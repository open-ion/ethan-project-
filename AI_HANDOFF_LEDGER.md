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

---

## 2026-06-28 — Codex緊急修正: 公開URLの製品分離

## 完了したこと
- トップページ `/` を AGATHON Bistro Demo のAI電話受付専用に変更。
- `/voice-reception` も同じAI電話受付MVPを表示する構成に統一。
- `/admin` を飲食店AI電話受付の管理画面専用に維持。
- 公開ビルド `dist/` からニュース/朝ダッシュボード系の成果物を除外。
- `src/index.html`, `src/app.js`, `README.md`, `dist/` から旧アプリ文言が混入しないことを smoke test に追加。
- Vercel rewrites を `/voice-reception`, `/admin`, `/` のみへ整理。

## 変更したファイル
- `src/index.html`
- `src/app.js`
- `scripts/build.mjs`
- `scripts/dev-server.mjs`
- `scripts/smoke-test.mjs`
- `README.md`
- `package.json`
- `package-lock.json`
- `vercel.json`
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- 全国公開・営業デモURLに旧ETHAN朝ダッシュボード/ニュース要素が混在することを防ぐため。
- Vercel公開時に `/` を開いた瞬間、飲食店AI電話受付だけが表示される状態にするため。

## 残タスク
- GitHub/Vercelへの実Pushと再デプロイは、この環境にremoteがないため外部で実施が必要。

## Ethanへの引き継ぎ事項
- `dist/` はAI電話受付専用成果物のみを出力する。
- 旧ニュース/朝ダッシュボードの公開混入検知は `scripts/smoke-test.mjs` に入っている。

---

## 2026-06-28 — Codex: Product Isolation Constitution Update

## 完了したこと
- `AGATHON_CONSTITUTION.md` に Product Isolation Rule / Single Source of Truth を追加。
- `AGENTS.md` に実務上の製品分離運用ルールを追加。
- `RULES.md` を新規作成し、製品ごとにRepository/Vercel/URL/原本を分離する必須ルールを明文化。

## 変更したファイル
- `AGATHON_CONSTITUTION.md`
- `AGENTS.md`
- `RULES.md`
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- AI電話受付MVPを既存プロダクトへ同居させた設計ミスを再発させないため。
- 今後のAGATHON LABS全製品で、1製品=1Repository=1Vercel Project=1Public URLを強制するため。

## 残タスク
- 既に同居してしまったAI電話受付MVPは、GitHub上で新規Repository `agathon-voice-reception` へ移管する必要がある。

## Ethanへの引き継ぎ事項
- 今後、新規サービス開発依頼への初動は必ず「新しいRepositoryを作成します。」から始める。

---

## 2026-06-28 — Codex: AGATHON LABS Constitution v1.0 Rebuild

## 完了したこと
- `AGATHON_CONSTITUTION.md` を v1.0 としてゼロベース再構成。
- Product Isolation, Repository First, Original Source, AI Handoff, Naming, No Mixed Products, Release Checklist, AI Self Check, Constitution Priority, Future Proof を憲法化。
- `AGENTS.md` を Constitution v1.0 に従う運用ルールとして再構成。
- `RULES.md` を Constitution v1.0 のクイックルールとして再構成。
- AI視点の「まだ足りないルール / Risk Register」を Constitution に追加。

## 変更したファイル
- `AGATHON_CONSTITUTION.md`
- `AGENTS.md`
- `RULES.md`
- `AI_HANDOFF_LEDGER.md`

## 変更理由
- AGATHON LABSが100製品、100Repository、100Vercel、100AIになっても破綻しない開発憲法を作るため。
- 今後、新規サービスを既存Repositoryへ混在させる事故を制度として防止するため。

## 残タスク
- Constitution v1.0 を全既存/新規Repositoryへ配布するテンプレート化。
- 新規Repository作成、Vercel作成、汚染スキャン、Release Checklistを自動化するCLIまたはGitHub Actionを作る。

## Ethanへの引き継ぎ事項
- 今後の新規プロダクト開発依頼は、必ず「新しいRepositoryを作成します。」から始める。
- 既存Repositoryへの新規製品追加指示は、Constitution違反として停止する。

# Tool: LINE Messaging API
## LINE へのダイジェスト配信

---

## Status: 未実装（Email 配信安定後に実装予定）

実装予定ファイル: `scripts/send-line.mjs`（未作成）  
環境変数（予定）: `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_USER_ID`

---

## Purpose

生成された朝のニュースダイジェストを Ion の LINE に自動送信する。Ion が毎日使っている LINE に直接届けることで、新しいアプリを開く手間をゼロにする。

**実装順序:** Email 配信が安定してから LINE 配信を追加する。Email が先の理由は実装・テストが単純で、LINE API 審査フローが不要なため。

---

## Provider: LINE Messaging API

- 個人用 LINE アカウントへの Push Message
- LINE Developers でチャネルを作成
- 個人ユーザーへの送信: Push Message API（`https://api.line.me/v2/bot/message/push`）
- 事前に Ion が LINE Official Account を「友達追加」する必要あり

---

## Configuration（実装時に設定）

| 環境変数 | 必須 | 説明 |
|---------|------|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | Yes | LINE Developers チャネルのアクセストークン |
| `LINE_USER_ID` | Yes | Ion の LINE ユーザー ID（`U` から始まる文字列）|

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| ダイジェストデータ | `src/generated/news.json` | Guard PASS 済みの要約データ |
| LINE User ID | 環境変数 `LINE_USER_ID` | 送信先 |

---

## Outputs

| Output | Description |
|--------|-------------|
| 送信成功 | Ion の LINE にダイジェストメッセージが届く |
| 配信ログ | 送信時刻・ステータスをログに記録 |

---

## Message Format（推奨）

LINE は文字数制限と改行の扱いに注意が必要。以下のフォーマット推奨:

```
おはよう、Ion。今日の重要ニュース ✅

① [Title]
→ [一言要約]
📌 [なぜ重要か]
🔗 [link]

② [Title]
...

---
詳細はアプリで確認 → [URL]
```

**注意:** LINE メッセージは1通あたり5,000文字制限。ニュースが多い場合は複数メッセージに分割。

---

## Error Handling（実装時に対応）

| エラー | 対応 |
|--------|------|
| トークン未設定 | 配信スキップ + エラーログ（アプリは停止しない）|
| 送信失敗 | リトライ最大2回 → 失敗をログに記録 |
| ユーザーがブロック | エラーログに記録 → Ethan へ通知 |

---

## Guard チェック項目（実装時に必須）

- [ ] `LINE_CHANNEL_ACCESS_TOKEN` がログに出力されないこと
- [ ] `LINE_USER_ID` がコードにハードコードされていないこと
- [ ] メッセージ内容に個人情報（メールアドレス等）が含まれないこと
- [ ] 配信停止の手段が存在すること（環境変数を削除すれば停止できる等）
- [ ] LINE Developers チャネルが適切な用途（個人利用）で設定されていること

---

## Implementation Steps（未実装 → 実装の手順）

1. Email 配信が安定していることを確認（前提条件）
2. LINE Developers でプロバイダー・チャネル作成
3. Ion が Official Account を友達追加し、User ID を取得
4. `scripts/send-line.mjs` 実装
5. `.env.example` に環境変数追加
6. Guard チェック実施（外部通信 + 個人情報取り扱い）
7. `npm run send:line` コマンド追加
8. `.github/workflows/update-news.yml` に配信ステップ追加
9. Ion の LINE で受信確認

---

## Related

- [`docs/tools/email.md`](email.md) — 先に実装するべき Email 配信
- [`docs/workflows/morning-digest.md`](../workflows/morning-digest.md) — このツールを使うWorkflow（Step 5）
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — Guard チェック基準
- [`docs/rag/ion-profile.md`](../rag/ion-profile.md) — Ion のプロフィール

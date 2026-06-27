# Tool: Email (Resend)
## 朝のダイジェスト配信

---

## Status: 未実装

実装予定ファイル: `scripts/send-email.mjs`（未作成）  
環境変数（予定）: `RESEND_API_KEY`, `DIGEST_EMAIL_TO`, `DIGEST_EMAIL_FROM`

---

## Purpose

生成された朝のニュースダイジェストを Ion のメールアドレスに自動送信する。Ion が何もしなくても朝にメールが届いている状態を実現する。

---

## Provider: Resend

推奨プロバイダー: [Resend](https://resend.com)

理由:
- シンプルな API（1行でメール送信）
- Node.js SDK あり（`npm install resend`）
- 無料枠: 3,000通/月・100通/日（MVP に十分）
- 開発者向けで設定が最小限

代替: SendGrid / SMTP（より複雑だが既存インフラがある場合）

---

## Configuration（実装時に設定）

| 環境変数 | 必須 | 説明 |
|---------|------|------|
| `RESEND_API_KEY` | Yes | Resend ダッシュボードで発行 |
| `DIGEST_EMAIL_TO` | Yes | 配信先メールアドレス（Ion のメール）|
| `DIGEST_EMAIL_FROM` | Yes | 送信元アドレス（Resend で認証済みドメイン必要）|

---

## Inputs

| Input | Source | Description |
|-------|--------|-------------|
| ダイジェストデータ | `src/generated/news.json` | Guard PASS 済みの要約データ |
| 配信先 | 環境変数 `DIGEST_EMAIL_TO` | 送信先メールアドレス |

---

## Outputs

| Output | Description |
|--------|-------------|
| 送信成功 | Ion のメールにダイジェストが届く |
| 配信ログ | 送信時刻・ステータスをログに記録 |
| エラーレコード | 失敗時のエラー内容・リトライ状態 |

---

## Email Format（推奨）

```
件名: 【ETHAN】おはよう Ion。今日の重要ニュース（YYYY/MM/DD）

本文:
おはよう、Ion。
今日5分で押さえるべきニュースです。

1. [Title]
一言要約: ...
なぜ重要か: ...
忙しい人向けの結論: ...
読む: [link]

---
ETHAN より
```

---

## Error Handling（実装時に対応）

| エラー | 対応 |
|--------|------|
| API キー未設定 | 配信スキップ + エラーログ（アプリは停止しない）|
| 送信失敗 | リトライ最大2回 → 失敗をログに記録 → Ethan へ通知 |
| レートリミット | 翌日に自動リトライ（1通/日なので通常は発生しない）|

---

## Guard チェック項目（初回実装時に必須）

- [ ] `DIGEST_EMAIL_TO` が環境変数からのみ読み込まれること（コードにハードコードしない）
- [ ] `RESEND_API_KEY` がログに出力されないこと
- [ ] 配信解除 / 停止の手段が存在すること（環境変数で配信を無効化できる等）
- [ ] 送信内容に個人情報が含まれないこと（Ion のメールアドレスをログに記録しない）

---

## Implementation Steps（未実装 → 実装の手順）

1. Resend アカウント作成・API キー発行
2. 送信元ドメイン認証（または `@resend.dev` のサンドボックス利用）
3. `scripts/send-email.mjs` 実装
4. `.env.example` に環境変数追加
5. Guard チェック実施
6. `npm run send:email` コマンド追加
7. `.github/workflows/update-news.yml` に配信ステップ追加
8. Ion のメールで受信確認

---

## Related

- [`docs/workflows/morning-digest.md`](../workflows/morning-digest.md) — このツールを使うWorkflow（Step 5）
- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — 外部送信の Guard チェック基準
- [`docs/rag/ion-profile.md`](../rag/ion-profile.md) — 配信先情報
- `.env.example` — 環境変数ドキュメント

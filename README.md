# AGATHON Bistro Demo — AI電話受付MVP

飲食店向けAI電話受付サービスの公開デモ用MVPです。

このプロジェクトは **AGATHON Bistro Demo のAI電話受付** 専用です。トップページ `/`、`/voice-reception`、`/admin` はすべて飲食店AI電話受付だけを表示します。

## できること

- 通話開始ボタン
- ブラウザのマイク入力（Web Speech API）
- テキスト入力フォールバック
- AI受付の挨拶と用件判定
- 予約受付
- FAQ回答
- 営業電話判定
- 人への転送判定
- 会話ログ、予約ログ、営業電話ログ、転送ログの管理画面表示
- 店舗設定の編集

## 起動方法

```bash
npm install
npm run build
npm start
```

開くURL:

- 受付: <http://localhost:3000/>
- 受付別ルート: <http://localhost:3000/voice-reception>
- 管理画面: <http://localhost:3000/admin>

## デモ手順

1. `/` を開く。
2. 「☎️ 通話開始」を押す。
3. 予約例を入力する。
   - `明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。席は窓側希望です。`
4. AIが復唱したら `はい` と入力する。
5. FAQ例を入力する。
   - `駐車場はありますか`
   - `支払方法は何がありますか`
6. 営業電話例を入力する。
   - `SEO集客サービスの営業です`
7. 転送例を入力する。
   - `スタッフにつないでください`
8. `/admin` で予約、営業電話、転送、会話ログを確認する。

## Vercel設定

`vercel.json` で以下を設定しています。

- Build Command: `npm run build`
- Output Directory: `dist`
- `/`、`/voice-reception`、`/admin` の静的ルート

## テスト

```bash
npm test
npm run test:voice
```

`npm test` はビルド、公開物の分離確認、音声受付フローテスト、オーケストレーターの既存テストを実行します。

## 保存方式

このMVPは外部DBを使わず、ブラウザの `localStorage` に保存します。

- 会話/予約/営業/転送ログ: `agathon-voice-reception-records`
- 会話セッション: `agathon-voice-reception-active-session`
- 店舗設定: `agathon-voice-store-settings`

## 既知の制限

- 本番電話番号連携は未実装です。
- 外部AI APIは未接続です。
- データは端末ごとの `localStorage` 保存です。
- 本番化ではDB、認証、複数店舗対応、電話番号連携、通知連携が必要です。

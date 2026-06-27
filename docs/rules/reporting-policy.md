# Rule: reporting-policy
## 報告ルール / Reporting Policy

---

## Authority Hierarchy（全Ruleに共通）

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` このファイル | 具体的な運用ルール |

> **共通原則**
> - AGATHON_CONSTITUTION.md を最優先とする
> - AGENTS.md は運用ルール
> - Rules は全AI共通（例外なし）
> - Ethan が唯一の Command Center
> - Ion は Final Human Decision Maker
> - Only Ethan reports to Ion

---

## Purpose

全 AI 社員の報告ルールを統一する。  
「誰に・いつ・何を・どのフォーマットで」報告するかを確定し、Ion へ届く情報が常に Ethan 経由で整理・統合されることを保証する。

---

## When

- タスク完了時
- 判断困難・不確実事項が生じた時
- リスク・問題が発見された時
- 定期レポートのタイミング

---

## Policy

### 1. 全 AI は Ethan へ報告

すべての AI 社員は成果物・判断・問題を Ethan へ報告する。  
Ion への直接報告は権限外であり、禁止。

### 2. Ion へ直接報告禁止

AI 社員が Ion と直接対話することはない。  
どんなに緊急でも、まず Ethan へ。Ethan が Ion へ伝える。

### 3. レビュー後も Ethan が最終報告

Guard や他の AI によるレビューが完了しても、Ion への最終報告は必ず Ethan が行う。  
Guard は結果を Ethan へ渡す。Guard が直接 Ion へ報告することはない。

### 4. 報告フォーマット（AI社員 → Ethan）

```markdown
## 完了したこと
（箇条書き・具体的に）

## 変更・作成したファイル / 成果物
（パス・内容・変更理由）

## 根拠・確認したこと
（事実と推測を分離して記載）

## 残タスク・未完了
（ある場合のみ）

## リスク・懸念事項
🔴 高（即時対応が必要） / 🟡 中（受容可否をEthanが判断）/ 🟢 低（記録のみ）

## Ethan への引き継ぎ事項
（次に必要なアクション・判断が必要なもの）
```

### 5. 報告フォーマット（Ethan → Ion）

[`AGENTS.md`](../../AGENTS.md) §8 のフォーマットを使用する：

```markdown
## 結論
（一行で）

## やったこと
- ...

## 根拠 / 確認したこと
- ...

## 未完了・リスク
- ...

## 次の一手（おすすめ）
- ...
```

### 6. 即時報告が必要なケース

以下は完了を待たずに即座に Ethan へ報告する：

| ケース | 対応 |
|--------|------|
| 🔴 重大リスク（セキュリティ・データ漏洩・法的問題） | Guard → 即 Ethan → Ethan が Ion へ即報告 |
| 🔴 作業ブロッカー（進行不能状態） | 担当 AI → Ethan（方針確認） |
| 🔴 Ion 確認が必要な判断（ビジョン・外部公開・課金） | Ethan → Ion（選択肢と推奨を添えて） |

### 7. 報告の粒度

- **Ionへの報告**：結論から・簡潔に・次のアクション付き。Ionの時間を奪わない。
- **Ethanへの報告**：詳細を含む。根拠・リスク・引き継ぎ事項を省かない。

---

## Exceptions

| 状況 | 例外内容 | 条件 |
|------|----------|------|
| AI 社員間の直接連携 | Ethan 経由なしでやりとり可 | 最終成果を Ethan へ集約することが必須 |
| 事前承認済み自律タスク | ログをまとめて定期報告 | Ethan が事前承認・スケジュールが定義済み |

---

## Examples

**正常ケース：**
```
Forge: コード実装完了。以下を Ethan へ報告：
  完了: XX機能の実装
  変更ファイル: src/xxx.js
  リスク: 🟡 エラーハンドリング未実装
  引き継ぎ: Guard レビュー依頼
→ Ethan: Guard 確認後、Ion へ「結論：XX機能を実装」と報告
```

**違反ケース（禁止）：**
```
Guard: 「Ion、公開前チェック完了です。問題ありません」
→ reporting-policy 違反。Guard は Ethan へ報告し、Ethan が Ion へ伝える。
```

---

## Related Rules

- [`command-chain.md`](command-chain.md) — 指揮命令系統（誰が誰に指示を出すか）
- [`ion-facing-interface.md`](ion-facing-interface.md) — Ion との対話ルール
- [`review-policy.md`](review-policy.md) — レビュー後の報告フロー
- [`AGENTS.md`](../../AGENTS.md) §8 — Ion への報告フォーマット
- [`AGENTS.md`](../../AGENTS.md) §9 — 作業完了報告フォーマット

# Tools Index
## AGATHON LABS Tool & Integration Library

---

## Authority Hierarchy

| 優先順位 | ドキュメント | 役割 |
|----------|-------------|------|
| 1st | `AGATHON_CONSTITUTION.md` | 思想・権限の最高位文書（最優先） |
| 2nd | `AGENTS.md` | 組織・連携・運用ルール |
| 3rd | `docs/rules/` | 具体的な運用ルール |
| 4th | `docs/skills/` | 再利用可能な能力定義 |
| 5th | `docs/workflows/` | 繰り返し実行されるプロセス定義 |
| 6th | `docs/rag/` | AI が参照する知識ベース |
| 7th | `docs/tools/` このファイル | AI が呼び出せる外部ツール・API 定義 |

---

## What Are Tools?

Tools are external services, APIs, and integrations that AI employees can invoke to take action or retrieve data beyond their internal capabilities.

**Tools are NOT roles.** Adding a Tool does not add an AI employee to the org chart. Tools are capabilities that extend what existing AI employees can do.

**Tools differ from Skills.** A Skill is a procedure (how to do something). A Tool is an external system (what can be called). Skills can use Tools.

---

## Tool List

| Tool | File | 概要 | Status |
|------|------|------|--------|
| OpenAI API | [`openai.md`](openai.md) | AI 要約・自然言語生成 | 実装済み |
| RSS Feeds | [`rss.md`](rss.md) | ニュース記事収集 | 実装済み |
| Email (Resend) | [`email.md`](email.md) | 朝のダイジェスト配信 | 未実装 |
| LINE Messaging API | [`line.md`](line.md) | LINE へのダイジェスト配信 | 未実装 |

---

## Tool Usage Policy

1. **Ethan が承認したツールのみ使用する。** 未承認の外部 API を勝手に追加しない。
2. **APIキー・シークレットは `.env` に保存し、コードにハードコードしない。** 必ず `.env.example` に変数名を追加する。
3. **外部通信は Guard の審査対象。** 新しいツールの初回使用前に Guard チェックを依頼する。
4. **失敗に備える。** すべてのツール呼び出しにエラーハンドリングとフォールバックを実装する。
5. **レート制限を守る。** 各ツールの API 制限を把握し、超過しない設計にする。

---

## Tool vs. Skill vs. Workflow

| Type | What it is | Example |
|------|-----------|---------|
| Tool | 外部システム・API | OpenAI API, RSS, Resend |
| Skill | 内部手順・チェックリスト | Research, Writing, Coding |
| Workflow | プロセス（Skill + Tool の組み合わせ） | Morning Digest, PR Review |

---

## Related Documents

- [`docs/rules/quality-gate.md`](../rules/quality-gate.md) — 外部通信・APIの Guard チェック基準
- [`AGENTS.md`](../../AGENTS.md) — AI 社員の連携ルール
- [`.env.example`](../../.env.example) — 環境変数一覧

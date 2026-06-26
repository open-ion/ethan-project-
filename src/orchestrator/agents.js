// AGATHON LABS — Agent Registry
//
// Data-driven registry of AI employees. Adding a new agent = add one entry.
// Each entry mirrors the persona files at the repository root (see AGENTS.md).
// The router/analyzer reads `triggers` to score which agent owns a task.
//
// Keep this in sync with the persona .md files. The persona file is the
// behavioral source of truth; this registry is the machine-readable index.

/**
 * @typedef {Object} AgentDef
 * @property {string} id            Stable lowercase id (e.g. "forge").
 * @property {string} name          Display name (e.g. "Forge").
 * @property {string} division      Division label.
 * @property {string} persona       Path to the persona file at repo root.
 * @property {RegExp} triggers      Keyword pattern used for relevance scoring.
 * @property {string[]} keywords    Human-readable trigger samples (for output).
 * @property {string} responsibility Short responsibility summary.
 * @property {boolean} [routable]   Can own a task (default true).
 * @property {boolean} [qualityGate] Acts as the pre-delivery quality gate (Guard).
 * @property {boolean} [orchestrator] Is the CEO orchestrator (Ethan).
 */

/** @type {AgentDef[]} */
export const AGENTS = [
  {
    id: 'ethan',
    name: 'Ethan',
    division: 'Executive',
    persona: 'ETHAN.md',
    triggers: /統括|orchestrat|報告|まとめて全体|ceo/i,
    keywords: ['統括', 'orchestration', '最終報告'],
    responsibility: 'タスク分解・割り振り・統合・Ionへの最終報告',
    routable: false,
    orchestrator: true,
  },
  {
    id: 'nova',
    name: 'Nova',
    division: 'News',
    persona: 'NOVA.md',
    triggers: /ニュース|news|トレンド|trend|速報|記事|rss|業界動向|最新情報|時事/i,
    keywords: ['ニュース', 'トレンド', '速報', 'RSS'],
    responsibility: '最新トレンド・業界ニュースの収集と重要度判定',
  },
  {
    id: 'atlas',
    name: 'Atlas',
    division: 'Research',
    persona: 'ATLAS.md',
    triggers: /調査|リサーチ|research|分析|analyze|analysis|市場|market|競合|データ分析|根拠|比較検討|事業判断|フィージビリティ/i,
    keywords: ['調査', 'リサーチ', '分析', '市場', '競合', '根拠'],
    responsibility: '市場・競合・データ分析と事業判断の根拠づくり',
  },
  {
    id: 'sage',
    name: 'Sage',
    division: 'Knowledge',
    persona: 'SAGE.md',
    triggers: /ナレッジ|knowledge|読書|読んだ|メモ|概念|学習|まとめて整理|要点整理|用語|チートシート|notion(?:.*整理)?/i,
    keywords: ['ナレッジ', '読書メモ', '概念整理', '学習', 'Notion整理'],
    responsibility: '知識の体系化・概念整理・学習コンテンツ作成',
  },
  {
    id: 'echo',
    name: 'Echo',
    division: 'Memory',
    persona: 'ECHO.md',
    triggers: /記憶|履歴|memory|過去|文脈|議事|決定履歴|前に(?:言|決|話)|あの時|ログ(?!イン|アウト)|思い出/i,
    keywords: ['記憶', '履歴', '過去の文脈', '決定履歴'],
    responsibility: '会話・意思決定・文脈の記録と再利用',
  },
  {
    id: 'forge',
    name: 'Forge',
    division: 'Engineering',
    persona: 'FORGE.md',
    triggers: /実装|コード|code|開発|プログラム|build|ビルド|アプリ|app|ツール|github|バグ|bug|リファクタ|refactor|api|デプロイ|deploy|エンジニア|engineer|スクリプト|機能(?:追加|実装)/i,
    keywords: ['実装', 'コード', '開発', 'GitHub', 'バグ修正', 'API'],
    responsibility: 'コード生成・GitHub整理・アプリ/ツール構築',
  },
  {
    id: 'vision',
    name: 'Vision',
    division: 'Design',
    persona: 'VISION.md',
    triggers: /デザイン|design|スライド|slide|canva|ui|ux|図解|資料(?:作成|化)?|見せ方|ビジュアル|プレゼン|レイアウト|モック/i,
    keywords: ['デザイン', 'スライド', 'Canva', 'UI', '図解', '資料'],
    responsibility: 'スライド・UI・図解・見せ方の設計',
  },
  {
    id: 'flow',
    name: 'Flow',
    division: 'Automation',
    persona: 'FLOW.md',
    triggers: /自動化|automation|automate|make|n8n|workflow|ワークフロー|gmail|calendar|カレンダー連携|連携|定期実行|トリガー|cron|通知|webhook/i,
    keywords: ['自動化', 'Make', 'n8n', 'Gmail連携', '定期実行', '通知'],
    responsibility: 'Notion/Make/n8n/Gmail/Calendar の自動化設計',
  },
  {
    id: 'guard',
    name: 'Guard',
    division: 'Security & Quality',
    persona: 'GUARD.md',
    triggers: /セキュリティ|security|品質|quality|リスク|risk|個人情報|privacy|公開前|チェック|脆弱性|保護|監査|レビュー|安全/i,
    keywords: ['セキュリティ', '品質', 'リスク', '個人情報', '公開前チェック'],
    responsibility: 'リスク・個人情報・品質保証・公開前チェック',
    qualityGate: true,
  },
  {
    id: 'pulse',
    name: 'Pulse',
    division: 'Scheduling',
    persona: 'PULSE.md',
    triggers: /スケジュール|schedule|カレンダー|calendar|タスク管理|リマインダー|reminder|習慣|振り返り|予定|入院|タイムスケジュール|段取り/i,
    keywords: ['スケジュール', 'カレンダー', 'リマインダー', '習慣', '振り返り'],
    responsibility: 'カレンダー・タスク・習慣・タイムスケジュール管理',
  },
];

const BY_ID = new Map(AGENTS.map((a) => [a.id, a]));

/** Get an agent definition by id. */
export function getAgent(id) {
  return BY_ID.get(String(id || '').toLowerCase());
}

/** All agents that can own a task (excludes Ethan). */
export function routableAgents() {
  return AGENTS.filter((a) => a.routable !== false);
}

/** The CEO orchestrator (Ethan). */
export function orchestrator() {
  return AGENTS.find((a) => a.orchestrator);
}

/** The pre-delivery quality gate (Guard). */
export function qualityGate() {
  return AGENTS.find((a) => a.qualityGate);
}

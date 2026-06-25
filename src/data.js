export const categories = [
  { id: 'ai-technology', label: 'AI・テクノロジー', emoji: '🤖', description: 'AI、プロダクト、開発者向け技術の重要アップデート。' },
  { id: 'markets', label: '投資・株式市場', emoji: '📈', description: '株式、為替、金利、企業決算など市場を見るための材料。' },
  { id: 'medical-nursing', label: '医療・看護', emoji: '🏥', description: '医療現場、看護、ヘルスケア制度、研究動向。' },
  { id: 'business-startups', label: 'ビジネス・スタートアップ', emoji: '🚀', description: '新規事業、資金調達、経営、スタートアップの動き。' },
  { id: 'politics-economy', label: '政治・経済', emoji: '🏛️', description: '政策、マクロ経済、社会に影響する意思決定。' },
  { id: 'sports', label: 'スポーツ', emoji: '🏟️', description: '主要試合、選手、チーム、スポーツビジネス。' },
  { id: 'cost-of-living', label: '物価・生活', emoji: '🛒', description: '生活費、物価、家計、日々の意思決定に関わるニュース。' }
];

export const newsItems = [
  {
    id: 'ai-agents-workflow',
    categoryId: 'ai-technology',
    title: 'AIエージェント活用が業務ワークフローの標準機能へ拡大',
    source: 'AGATHON Sample News',
    publishedAt: '2026-06-25T06:30:00+09:00',
    summary: 'AIエージェントが単発チャットから、調査・整理・実行を担う業務基盤へ移りつつあります。',
    whyImportant: 'AGATHON LABSのようなAI社員モデルと相性がよく、Ethanが各部署を統括する設計の妥当性を高めます。',
    takeaway: 'Ionは、まず毎朝ニュース収集と要約を自動化する小さな業務からAI社員運用を始めるべきです。',
    url: 'https://example.com/news/ai-agents-workflow'
  },
  {
    id: 'market-rate-watch',
    categoryId: 'markets',
    title: '市場は金利見通しと企業業績の両方を注視',
    source: 'AGATHON Market Brief',
    publishedAt: '2026-06-25T07:05:00+09:00',
    summary: '投資家は金利の方向性と企業収益の耐久力を見ながらリスク判断を続けています。',
    whyImportant: '金利と業績は株価・為替・資金調達環境に広く影響するため、ビジネス判断にも関係します。',
    takeaway: '短期の値動きより、金利・業績・消費の3点をセットで見るのが安全です。',
    url: 'https://example.com/news/market-rate-watch'
  },
  {
    id: 'nursing-digital-tools',
    categoryId: 'medical-nursing',
    title: '看護現場で記録業務を支援するデジタルツール導入が進む',
    source: 'AGATHON Healthcare Note',
    publishedAt: '2026-06-25T07:20:00+09:00',
    summary: '医療・看護領域では、人手不足対策として記録や申し送り支援のデジタル化が進んでいます。',
    whyImportant: '現場の負担軽減と医療安全の両立が重要で、AI要約にも正確性と慎重さが求められます。',
    takeaway: '医療カテゴリの要約は断定を避け、必ず出典と不確実性を残す設計にすべきです。',
    url: 'https://example.com/news/nursing-digital-tools'
  },
  {
    id: 'startup-efficiency',
    categoryId: 'business-startups',
    title: 'スタートアップは成長率だけでなく効率性を重視する流れへ',
    source: 'AGATHON Startup Digest',
    publishedAt: '2026-06-25T07:40:00+09:00',
    summary: '資金調達環境の変化により、売上成長と同時に収益性・運用効率が重視されています。',
    whyImportant: '小さなチームほど、自動化と意思決定の速さが競争力になります。',
    takeaway: 'News Digest MVPも、まず個人の時間を増やす明確な価値に絞るのがよいです。',
    url: 'https://example.com/news/startup-efficiency'
  },
  {
    id: 'cost-living-prices',
    categoryId: 'cost-of-living',
    title: '生活必需品の価格変動が家計の見直し需要を後押し',
    source: 'AGATHON Life Brief',
    publishedAt: '2026-06-25T08:00:00+09:00',
    summary: '食品や日用品の価格変動により、家計管理と買い方の見直しへの関心が高まっています。',
    whyImportant: '物価・生活カテゴリは毎日の意思決定に直結し、ユーザー継続率にも影響します。',
    takeaway: '生活カテゴリでは、抽象的な経済ニュースより「今日の判断に効く結論」を優先すべきです。',
    url: 'https://example.com/news/cost-living-prices'
  }
];

export function getCategory(categoryId) {
  return categories.find((category) => category.id === categoryId);
}

export function getNewsItem(newsId) {
  return newsItems.find((item) => item.id === newsId);
}

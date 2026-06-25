import { readFile, writeFile } from 'node:fs/promises';

const inputPath = process.argv.find((arg) => arg.startsWith('--in='))?.slice('--in='.length) || 'src/generated/news.json';
const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) || inputPath;
const model = process.env.AI_MODEL || 'gpt-4.1-mini';
const summaryLimit = Number(process.env.AI_SUMMARY_LIMIT || 20);

const payload = JSON.parse(await readFile(inputPath, 'utf8'));
const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

const SIGNAL_RULES = [
  { label: '災害・安全', score: 98, confidence: 0.88, pattern: /地震|津波|噴火|台風|豪雨|大雨|洪水|避難|災害|火災|事故|警報|停電|断水|不明者|死者|負傷|救助/ },
  { label: '世界的ニュース', score: 92, confidence: 0.82, pattern: /米国|中国|ロシア|ウクライナ|イスラエル|EU|国連|NATO|首脳|大統領|戦争|停戦|制裁|関税|外交|世界|グローバル/ },
  { label: '日本の重大ニュース', score: 88, confidence: 0.84, pattern: /政府|首相|国会|選挙|法案|最高裁|日銀|内閣|省庁|知事|自治体|日本|全国|逮捕|判決/ },
  { label: '金融・市場', score: 84, confidence: 0.78, pattern: /日経平均|株価|為替|円安|円高|金利|利上げ|利下げ|物価|インフレ|決算|金融|市場|投資|債券|原油|GDP/ },
  { label: 'AI・テクノロジー', score: 80, confidence: 0.76, pattern: /AI|人工知能|OpenAI|ChatGPT|生成AI|半導体|サイバー|セキュリティ|クラウド|データセンター|ロボット|量子|アプリ/ },
  { label: '医療・ヘルスケア', score: 78, confidence: 0.74, pattern: /医療|病院|看護|感染|ワクチン|薬|治療|患者|健康|介護|医師|研究|がん|救急/ }
];

function cleanText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

function estimateReadingTime(item) {
  const text = `${item.title || ''} ${item.rawDescription || ''} ${item.summary || ''}`.trim();
  return Math.max(1, Math.ceil(text.length / 450));
}

function getGroundingText(item) {
  return cleanText(`${item.title || ''} ${item.rawDescription || item.summary || ''}`);
}

function detectSignal(item) {
  const text = getGroundingText(item);
  const matched = SIGNAL_RULES.find((rule) => rule.pattern.test(text));
  if (matched) return matched;

  const categoryScores = {
    'politics-economy': { label: '政治・経済', score: 70, confidence: 0.66 },
    markets: { label: '金融・市場', score: 72, confidence: 0.66 },
    'ai-technology': { label: 'AI・テクノロジー', score: 68, confidence: 0.64 },
    'medical-nursing': { label: '医療・ヘルスケア', score: 68, confidence: 0.63 },
    'business-startups': { label: 'ビジネス', score: 62, confidence: 0.6 },
    'cost-of-living': { label: '生活', score: 62, confidence: 0.6 },
    sports: { label: 'スポーツ', score: 54, confidence: 0.58 }
  };
  return categoryScores[item.categoryId] || { label: '通常ニュース', score: 55, confidence: 0.56 };
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 55;
  return Math.max(1, Math.min(100, Math.round(score)));
}

function clampConfidence(value) {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return 0.55;
  return Math.max(0.05, Math.min(0.98, confidence > 1 ? confidence / 100 : confidence));
}

function extractKeywords(item, topic) {
  const sourceText = getGroundingText(item);
  const candidates = sourceText
    .split(/[\s、。・／\/｜|:：（）()「」『』【】\[\]!-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2 && !/^(https?|www)$/i.test(word));
  return [...new Set([topic, ...candidates])].filter(Boolean).slice(0, 6);
}

function buildConfidenceReason({ item, confidence, provider, signal }) {
  if (provider === 'openai') {
    if (confidence < 0.55) return 'RSS本文が短い、または要約根拠が限られるため低めに表示しています。';
    return 'RSSのタイトル・説明文に基づいて要約できています。';
  }
  const descriptionLength = cleanText(item.rawDescription || item.summary || '').length;
  if (descriptionLength < 45) return 'RSS本文が短いため、タイトル中心の判定です。';
  if (signal.score >= 88) return `${signal.label}に関する明確なシグナルがあります。`;
  return 'RSS本文のみを根拠にしたテンプレート判定です。';
}

function fallbackSummary(item) {
  const signal = detectSignal(item);
  const topic = signal.label;
  const confidence = clampConfidence(signal.confidence - (cleanText(item.rawDescription || '').length < 45 ? 0.12 : 0));
  const source = item.sourceName || item.source || item.sourceId || 'RSS';
  const title = cleanText(item.title || 'ニュース');
  const description = cleanText(item.rawDescription || item.summary || '');
  const shortDescription = description && description !== title ? description.slice(0, 90) : title;

  return {
    summary: shortDescription,
    whyImportant: `${topic}としてIonの朝の判断に関係する可能性があります。出典は${source}です。`,
    takeaway: signal.score >= 85
      ? '今日の優先確認ニュースです。まず本文リンクで一次情報を確認してください。'
      : '見出しと出典を確認し、必要な場合だけ詳細リンクを開いてください。',
    importanceScore: clampScore(signal.score),
    confidence,
    confidenceReason: buildConfidenceReason({ item, confidence, provider: 'template', signal }),
    readingTime: estimateReadingTime(item),
    topic,
    keywords: extractKeywords(item, topic)
  };
}

function extractResponseText(responseJson) {
  if (typeof responseJson.output_text === 'string') return responseJson.output_text;

  const textParts = [];
  for (const output of responseJson.output || []) {
    for (const content of output.content || []) {
      if (content.type === 'output_text' && content.text) textParts.push(content.text);
    }
  }
  return textParts.join('\n');
}

function parseSummaryJson(text) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(trimmed);
  return {
    summary: String(parsed.summary || '').trim(),
    whyImportant: String(parsed.whyImportant || '').trim(),
    takeaway: String(parsed.takeaway || '').trim(),
    importanceScore: clampScore(parsed.importanceScore || 55),
    confidence: clampConfidence(parsed.confidence || 0.7),
    confidenceReason: String(parsed.confidenceReason || '').trim(),
    readingTime: Number(parsed.readingTime || 1),
    topic: String(parsed.topic || '').trim(),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 6) : []
  };
}

async function summarizeWithOpenAI(item) {
  const prompt = `あなたはAGATHON LABSのCEO AI Ethanです。Ionが毎朝5分で世界を把握できるよう、RSS記事を日本語で短く要約してください。

絶対制約:
- 根拠は下のRSSタイトル・RSS説明文・ソース名・カテゴリだけ
- RSSにない背景、数字、因果、将来予測を推測しない
- 不確かな場合はconfidenceを下げ、confidenceReasonに理由を書く
- 医療・金融・法律は断定的助言にしない
- JSONのみ返す

重要度ルール:
- 90-100: 災害・安全、国際危機、日本の重大ニュース、生活に即影響する政策
- 80-89: 金融市場、医療、AI/サイバーなど広い影響のあるニュース
- 60-79: 主要カテゴリの通常重要ニュース
- 1-59: 個別企業・娯楽・スポーツなど影響範囲が限定的なニュース

keys:
summary: 45字以内の一言要約
whyImportant: 70字以内でなぜ重要か
takeaway: 70字以内で忙しい人向け結論
importanceScore: 1-100の整数
confidence: 0-1
confidenceReason: confidenceが低い/高い理由を50字以内
readingTime: 1以上の整数分
topic: 主要トピック
keywords: 最大6個

RSS記事:
Title: ${item.title}
Source: ${item.sourceName || item.source || item.sourceId || 'Unknown'}
Category: ${item.categoryId}
URL: ${item.url}
Description: ${item.rawDescription || item.summary || ''}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.1,
      text: { format: { type: 'json_object' } }
    })
  });

  if (!response.ok) throw new Error(`OpenAI API HTTP ${response.status}: ${await response.text()}`);

  const responseJson = await response.json();
  return parseSummaryJson(extractResponseText(responseJson));
}

function mergeSummary(item, summary, provider) {
  const fallback = fallbackSummary(item);
  const confidence = clampConfidence(summary.confidence || fallback.confidence);
  const merged = {
    ...item,
    summary: summary.summary || fallback.summary,
    whyImportant: summary.whyImportant || fallback.whyImportant,
    takeaway: summary.takeaway || fallback.takeaway,
    importanceScore: clampScore(summary.importanceScore || fallback.importanceScore),
    confidence,
    confidenceReason: summary.confidenceReason || buildConfidenceReason({ item, confidence, provider, signal: detectSignal(item) }),
    readingTime: Math.max(1, Number(summary.readingTime || fallback.readingTime)),
    topic: summary.topic || fallback.topic,
    keywords: summary.keywords?.length ? summary.keywords : fallback.keywords,
    summaryProvider: provider
  };
  return merged;
}

async function summarizeItem(item, index) {
  if (!hasOpenAiKey || index >= summaryLimit) {
    return mergeSummary(item, fallbackSummary(item), hasOpenAiKey && index >= summaryLimit ? 'template-fallback-limit' : 'template-fallback');
  }

  try {
    return mergeSummary(item, await summarizeWithOpenAI(item), 'openai');
  } catch (error) {
    console.warn(`OpenAI summary failed for ${item.id}: ${error instanceof Error ? error.message : String(error)}`);
    return {
      ...mergeSummary(item, fallbackSummary(item), 'template-fallback-error'),
      summaryError: error instanceof Error ? error.message : String(error)
    };
  }
}

const summarizedItems = [];
for (const [index, item] of payload.items.entries()) {
  summarizedItems.push(await summarizeItem(item, index));
}

summarizedItems.sort((a, b) => {
  const scoreDiff = clampScore(b.importanceScore) - clampScore(a.importanceScore);
  if (scoreDiff !== 0) return scoreDiff;
  return Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0);
});

const summarized = {
  ...payload,
  summarizedAt: new Date().toISOString(),
  summaryMode: hasOpenAiKey ? 'openai-with-fallback' : 'template-fallback',
  summaryModel: hasOpenAiKey ? model : null,
  rankingPolicy: 'importanceScore desc, publishedAt desc; disaster/safety, global, Japan-critical, finance, AI, medical signals boosted',
  items: summarizedItems
};

await writeFile(outputPath, `${JSON.stringify(summarized, null, 2)}\n`);
console.log(`AI summary complete (${summarized.summaryMode}): ${summarized.items.length} items -> ${outputPath}`);

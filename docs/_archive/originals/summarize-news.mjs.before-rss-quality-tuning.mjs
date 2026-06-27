import { readFile, writeFile } from 'node:fs/promises';

const inputPath = process.argv.find((arg) => arg.startsWith('--in='))?.slice('--in='.length) || 'src/generated/news.json';
const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) || inputPath;
const model = process.env.AI_MODEL || 'gpt-4.1-mini';
const summaryLimit = Number(process.env.AI_SUMMARY_LIMIT || 20);

const payload = JSON.parse(await readFile(inputPath, 'utf8'));
const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

function estimateReadingTime(item) {
  const text = `${item.title || ''} ${item.rawDescription || ''} ${item.summary || ''}`.trim();
  return Math.max(1, Math.ceil(text.length / 450));
}

function fallbackSummary(item) {
  const topic = item.title?.split(/[、。:：｜|]/)[0]?.slice(0, 40) || item.categoryId || 'news';
  const keywords = [...new Set(`${item.title || ''} ${item.rawDescription || item.summary || ''}`
    .split(/[\s、。・／\/｜|:：-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3))].slice(0, 5);

  return {
    summary: item.summary || item.title,
    whyImportant: item.whyImportant && !item.whyImportant.includes('AI要約フェーズ')
      ? item.whyImportant
      : 'このニュースは選択カテゴリに関連するため、朝の確認候補として抽出されています。',
    takeaway: item.takeaway && item.takeaway !== '詳細は元記事を確認してください。'
      ? item.takeaway
      : 'まず見出しと出典を確認し、必要なら詳細リンクを開いてください。',
    importanceScore: 3,
    confidence: 0.55,
    readingTime: estimateReadingTime(item),
    topic,
    keywords
  };
}


function extractResponseText(responseJson) {
  if (typeof responseJson.output_text === 'string') {
    return responseJson.output_text;
  }

  const textParts = [];
  for (const output of responseJson.output || []) {
    for (const content of output.content || []) {
      if (content.type === 'output_text' && content.text) {
        textParts.push(content.text);
      }
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
    importanceScore: Number(parsed.importanceScore || 3),
    confidence: Number(parsed.confidence || 0.7),
    readingTime: Number(parsed.readingTime || 1),
    topic: String(parsed.topic || '').trim(),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 6) : []
  };
}

async function summarizeWithOpenAI(item) {
  const prompt = `あなたはAGATHON LABSのCEO AI Ethanです。Ionが毎朝5分で世界を把握できるよう、RSS記事を日本語で短く要約してください。\n\n制約:\n- 記事本文にない事実を追加しない\n- 医療・金融・法律は断定的助言にしない\n- JSONのみ返す\n- keys: summary, whyImportant, takeaway, importanceScore, confidence, readingTime, topic, keywords\n\n記事:\nTitle: ${item.title}\nSource: ${item.sourceName || item.source || item.sourceId || 'Unknown'}\nCategory: ${item.categoryId}\nURL: ${item.url}\nDescription: ${item.rawDescription || item.summary || ''}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: prompt,
      temperature: 0.2,
      text: {
        format: {
          type: 'json_object'
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API HTTP ${response.status}: ${await response.text()}`);
  }

  const responseJson = await response.json();
  return parseSummaryJson(extractResponseText(responseJson));
}

async function summarizeItem(item, index) {
  if (!hasOpenAiKey || index >= summaryLimit) {
    return {
      ...item,
      ...fallbackSummary(item),
      summaryProvider: hasOpenAiKey && index >= summaryLimit ? 'template-fallback-limit' : 'template-fallback'
    };
  }

  try {
    const aiSummary = await summarizeWithOpenAI(item);
    return {
      ...item,
      summary: aiSummary.summary || fallbackSummary(item).summary,
      whyImportant: aiSummary.whyImportant || fallbackSummary(item).whyImportant,
      takeaway: aiSummary.takeaway || fallbackSummary(item).takeaway,
      importanceScore: Math.min(5, Math.max(1, aiSummary.importanceScore || fallbackSummary(item).importanceScore)),
      confidence: Math.min(1, Math.max(0, aiSummary.confidence || fallbackSummary(item).confidence)),
      readingTime: Math.max(1, aiSummary.readingTime || fallbackSummary(item).readingTime),
      topic: aiSummary.topic || fallbackSummary(item).topic,
      keywords: aiSummary.keywords?.length ? aiSummary.keywords : fallbackSummary(item).keywords,
      summaryProvider: 'openai'
    };
  } catch (error) {
    console.warn(`OpenAI summary failed for ${item.id}: ${error instanceof Error ? error.message : String(error)}`);
    return {
      ...item,
      ...fallbackSummary(item),
      summaryProvider: 'template-fallback-error',
      summaryError: error instanceof Error ? error.message : String(error)
    };
  }
}

const summarizedItems = [];
for (const [index, item] of payload.items.entries()) {
  summarizedItems.push(await summarizeItem(item, index));
}

const summarized = {
  ...payload,
  summarizedAt: new Date().toISOString(),
  summaryMode: hasOpenAiKey ? 'openai-with-fallback' : 'template-fallback',
  summaryModel: hasOpenAiKey ? model : null,
  items: summarizedItems
};

await writeFile(outputPath, `${JSON.stringify(summarized, null, 2)}\n`);
console.log(`AI summary complete (${summarized.summaryMode}): ${summarized.items.length} items -> ${outputPath}`);

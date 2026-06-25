import { readFile, writeFile } from 'node:fs/promises';

const inputPath = process.argv.find((arg) => arg.startsWith('--in='))?.slice('--in='.length) || 'src/generated/news.json';
const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) || inputPath;

const payload = JSON.parse(await readFile(inputPath, 'utf8'));

const summarized = {
  ...payload,
  summarizedAt: new Date().toISOString(),
  summaryMode: process.env.OPENAI_API_KEY ? 'ready-for-api' : 'template-fallback',
  items: payload.items.map((item) => ({
    ...item,
    summary: item.summary || item.title,
    whyImportant: item.whyImportant && !item.whyImportant.includes('AI要約フェーズ')
      ? item.whyImportant
      : 'このニュースは選択カテゴリに関連するため、朝の確認候補として抽出されています。',
    takeaway: item.takeaway && item.takeaway !== '詳細は元記事を確認してください。'
      ? item.takeaway
      : 'まず見出しと出典を確認し、必要なら詳細リンクを開いてください。'
  }))
};

await writeFile(outputPath, `${JSON.stringify(summarized, null, 2)}\n`);
console.log(`AI summary foundation complete (${summarized.summaryMode}): ${summarized.items.length} items -> ${outputPath}`);

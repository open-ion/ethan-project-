import { mkdir, writeFile } from 'node:fs/promises';
import { rssSources } from './rss-sources.mjs';

const outputPath = process.argv.find((arg) => arg.startsWith('--out='))?.slice('--out='.length) || 'src/generated/news.json';
const limitPerSource = Number(process.env.RSS_FETCH_LIMIT_PER_SOURCE || 8);
const retryCount = Number(process.env.RSS_FETCH_RETRIES || 2);
const timeoutMs = Number(process.env.RSS_FETCH_TIMEOUT_MS || 12000);

function decodeHtml(value = '') {
  return value
    .replaceAll('<![CDATA[', '')
    .replaceAll(']]>', '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .trim();
}

function stripTags(value = '') {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function readTag(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return match ? decodeHtml(match[1]) : '';
}

function readLink(block) {
  const linkTag = readTag(block, 'link');
  if (linkTag) return linkTag;
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return hrefMatch ? decodeHtml(hrefMatch[1]) : '';
}

function normalizePublishedAt(value) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function parseFeed(xml, source) {
  const blocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  return blocks.slice(0, limitPerSource).map((block, index) => {
    const title = stripTags(readTag(block, 'title'));
    const url = readLink(block);
    const description = stripTags(readTag(block, 'description'));
    const publishedAt = readTag(block, 'pubDate') || readTag(block, 'dc:date') || new Date().toISOString();
    const stableId = `${source.id}-${Buffer.from(url || title || String(index)).toString('base64url').slice(0, 16)}`;

    return {
      id: stableId,
      categoryId: source.categoryId,
      sourceId: source.id,
      sourceName: source.name,
      title,
      url,
      publishedAt: normalizePublishedAt(publishedAt),
      summary: description || title,
      whyImportant: 'RSS取得記事のため、重要度判定はAI要約フェーズで生成します。',
      takeaway: '詳細は元記事を確認してください。',
      rawDescription: description
    };
  }).filter((item) => item.title && item.url);
}

async function fetchWithTimeout(url, attempt) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'AGATHON-LABS-News-Digest/0.1 (+https://open-ion.github.io/ethan-project-/)',
        accept: 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`attempt ${attempt} failed: ${reason}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchSource(source) {
  const errors = [];

  for (let attempt = 1; attempt <= retryCount + 1; attempt += 1) {
    try {
      console.log(`[RSS] Fetching ${source.name} (${attempt}/${retryCount + 1})`);
      const response = await fetchWithTimeout(source.url, attempt);
      if (!response.ok) {
        throw new Error(`attempt ${attempt} failed: HTTP ${response.status}`);
      }
      const xml = await response.text();
      const items = parseFeed(xml, source);
      console.log(`[RSS] ${source.name}: ${items.length} items`);
      return {
        source,
        ok: true,
        attempts: attempt,
        items
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
      console.warn(`[RSS] ${source.name}: ${message}`);
    }
  }

  return {
    source,
    ok: false,
    attempts: retryCount + 1,
    error: errors.at(-1) || 'unknown error',
    errors,
    items: []
  };
}

const results = await Promise.all(rssSources.map(fetchSource));
const items = results.flatMap((result) => result.items);
const payload = {
  generatedAt: new Date().toISOString(),
  sourceMode: 'rss',
  fetchSettings: {
    limitPerSource,
    retryCount,
    timeoutMs
  },
  sources: results.map((result) => ({
    id: result.source.id,
    name: result.source.name,
    url: result.source.url,
    categoryId: result.source.categoryId,
    ok: result.ok,
    attempts: result.attempts,
    error: result.error || null,
    errors: result.errors || [],
    itemCount: result.items.length
  })),
  items
};

await mkdir(outputPath.split('/').slice(0, -1).join('/') || '.', { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);

const failed = payload.sources.filter((source) => !source.ok);
console.log(`RSS fetch complete: ${items.length} items from ${payload.sources.length} sources -> ${outputPath}`);
if (failed.length > 0) {
  console.warn(`RSS skipped failed sources: ${failed.map((source) => `${source.name}: ${source.error}`).join('; ')}`);
}

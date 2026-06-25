import { access, readFile } from 'node:fs/promises';
import { categories, newsItems, getCategory, getNewsItem } from '../src/data.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const requiredCategoryLabels = [
  'AI・テクノロジー',
  '投資・株式市場',
  '医療・看護',
  'ビジネス・スタートアップ',
  '政治・経済',
  'スポーツ',
  '物価・生活'
];

assert(categories.length === requiredCategoryLabels.length, `Expected ${requiredCategoryLabels.length} categories, got ${categories.length}`);
for (const label of requiredCategoryLabels) {
  assert(categories.some((category) => category.label === label), `Missing category: ${label}`);
}

assert(newsItems.length >= 5, `Expected at least 5 sample news items, got ${newsItems.length}`);
for (const item of newsItems) {
  assert(item.id, 'News item is missing id');
  assert(item.title, `News item ${item.id} is missing title`);
  assert(item.summary, `News item ${item.id} is missing summary`);
  assert(item.whyImportant, `News item ${item.id} is missing whyImportant`);
  assert(item.takeaway, `News item ${item.id} is missing takeaway`);
  assert(item.url, `News item ${item.id} is missing url`);
  assert(getCategory(item.categoryId), `News item ${item.id} has unknown category ${item.categoryId}`);
  assert(getNewsItem(item.id)?.id === item.id, `getNewsItem failed for ${item.id}`);
}

const appSource = await readFile('src/app.js', 'utf8');
assert(appSource.includes('renderHome'), 'Home render function is missing');
assert(appSource.includes('renderDetail'), 'Detail render function is missing');
assert(appSource.includes('関心カテゴリ'), 'Category heading is missing from app source');
assert(appSource.includes('今日の重要ニュース'), 'News list heading is missing from app source');
assert(appSource.includes('忙しい人向けの結論'), 'Busy-reader takeaway label is missing from app source');
assert(appSource.includes('localStorage'), 'Category localStorage persistence is missing');
assert(appSource.includes('generated/news.json'), 'Generated news JSON loading is missing');
assert(appSource.includes('getRankedNewsItems'), 'importanceScore ranking is missing');
assert(appSource.includes('AI Confidence'), 'confidence display is missing');
assert(appSource.includes('confidenceReason'), 'confidence reason display is missing');

const htmlSource = await readFile('src/index.html', 'utf8');
assert(htmlSource.includes('<meta name="viewport"'), 'Viewport meta tag is missing');
assert(htmlSource.includes('Ethan → Ion Daily Brief'), 'AGATHON header badge is missing');
assert(htmlSource.includes('href="styles.css"'), 'Stylesheet should use a route-relative path for static hosting');
assert(htmlSource.includes('src="app.js"'), 'App script should use a route-relative path for static hosting');

const cssSource = await readFile('src/styles.css', 'utf8');
assert(cssSource.includes('@media (max-width: 760px)'), 'Mobile media query is missing');
assert(cssSource.includes('grid-template-columns: 1fr'), 'Mobile one-column grid rule is missing');
assert(cssSource.includes('accent-color'), 'Category checkbox accent styling is missing');
assert(cssSource.includes('trust-row'), 'Trust metadata styling is missing');
assert(cssSource.includes('top-news-card'), 'Top news card styling is missing');


const updateWorkflowSource = await readFile('.github/workflows/update-news.yml', 'utf8');
assert(updateWorkflowSource.includes('OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}'), 'Update workflow must pass OPENAI_API_KEY from secrets');
assert(updateWorkflowSource.includes('npm run fetch:rss'), 'Update workflow must fetch RSS before summarizing');
assert(updateWorkflowSource.includes('npm run summarize'), 'Update workflow must summarize generated RSS data');
assert(updateWorkflowSource.includes('git add src/generated/news.json'), 'Update workflow must commit generated news JSON only');
assert(updateWorkflowSource.includes('actions/deploy-pages@v4'), 'Update workflow must deploy through GitHub Pages');

const legacyWorkflowSource = await readFile('.github/workflows/news-schedule.yml', 'utf8');
assert(!legacyWorkflowSource.includes('cron:'), 'Legacy workflow must not run on a schedule');
assert(legacyWorkflowSource.includes('Legacy Python News Brief workflow is intentionally disabled.'), 'Legacy workflow should explain that it is disabled');

for (const file of ['dist/index.html', 'dist/404.html', 'dist/news/index.html', 'dist/news/app.js', 'dist/news/generated/news.json', 'dist/dashboard/index.html']) {
  try {
    await access(file);
  } catch (error) {
    throw new Error(`Expected build output is missing: ${file}`);
  }
}

console.log('Smoke checks passed:', {
  categories: categories.length,
  newsItems: newsItems.length
});

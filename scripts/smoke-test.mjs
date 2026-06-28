import { access, readFile } from 'node:fs/promises';
import { categories, newsItems, getCategory, getNewsItem, userPresets, getPreset, dashboardWidgets } from '../src/data.js';

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

// --- AI朝ダッシュボード: プリセットとウィジェットのデータ契約 ---
const requiredPresetLabels = ['AI・ビジネス型', '投資型', '医療・看護型', 'サーファー型', '学習型', '自由カスタム型'];
assert(userPresets.length === requiredPresetLabels.length, `Expected ${requiredPresetLabels.length} presets, got ${userPresets.length}`);
for (const label of requiredPresetLabels) {
  assert(userPresets.some((preset) => preset.label === label), `Missing preset: ${label}`);
}
for (const preset of userPresets) {
  assert(preset.id, 'Preset is missing id');
  assert(getPreset(preset.id)?.id === preset.id, `getPreset failed for ${preset.id}`);
  assert(Array.isArray(preset.widgets) && preset.widgets.length > 0, `Preset ${preset.id} has no widgets`);
  assert(typeof preset.ethanComment === 'string' && preset.ethanComment.length > 0, `Preset ${preset.id} is missing ethanComment`);
  for (const widgetId of preset.widgets) {
    assert(dashboardWidgets[widgetId], `Preset ${preset.id} references unknown widget ${widgetId}`);
  }
}
assert(getPreset('does-not-exist')?.id, 'getPreset should fall back to a default preset');

const appSource = await readFile('src/app.js', 'utf8');
const voiceSource = await readFile('src/voice-reception.js', 'utf8');
assert(appSource.includes('renderHome'), 'Home render function is missing');
assert(appSource.includes('renderDetail'), 'Detail render function is missing');
assert(appSource.includes('renderDashboard'), 'Morning dashboard render function is missing');
assert(appSource.includes('あなた専用AI朝ダッシュボード'), 'Dashboard hero eyebrow copy is missing');
assert(appSource.includes('5分で今日を決めよう'), 'Dashboard hero headline copy is missing');
assert(appSource.includes('今日読むべき3件'), 'Top-three section is missing');
assert(appSource.includes('Ethanからの一言'), 'Ethan voice section is missing');
assert(appSource.includes('1日1アイデア'), 'One-idea-per-day section is missing');
assert(appSource.includes('USER_SETTINGS_KEY'), 'User settings localStorage key is missing');
assert(appSource.includes('data-preset'), 'Preset picker binding is missing');
assert(appSource.includes('関心カテゴリ'), 'Category heading is missing from app source');
assert(appSource.includes('今日の重要ニュース'), 'News list heading is missing from app source');
assert(appSource.includes('忙しい人向けの結論'), 'Busy-reader takeaway label is missing from app source');
assert(appSource.includes('localStorage'), 'Category localStorage persistence is missing');
assert(appSource.includes('generated/news.json'), 'Generated news JSON loading is missing');
assert(appSource.includes('getRankedNewsItems'), 'importanceScore ranking is missing');
assert(appSource.includes('AI Confidence'), 'confidence display is missing');
assert(appSource.includes('confidenceReason'), 'confidence reason display is missing');

assert(appSource.includes('Product Prototype'), 'Voice reception demo route is missing');
assert(voiceSource.includes('VOICE_RECEPTION_STORAGE_KEY'), 'Voice reception storage key is missing');
assert(appSource.includes('SpeechRecognition'), 'Web Speech API microphone path is missing');
assert(voiceSource.includes('extractReservation'), 'Reservation extraction logic is missing');
assert(voiceSource.includes('営業のご提案はお電話ではお受けしておりません'), 'Sales-call handling copy is missing');
assert(appSource.includes('電話受付 管理画面'), 'Voice admin screen is missing');

assert(voiceSource.includes('VOICE_STORE_SETTINGS_KEY'), 'Store settings storage key is missing');
assert(voiceSource.includes('buildVoiceReply'), 'Voice conversation flow is missing');
assert(voiceSource.includes('receptionStyleProfiles'), 'Reception style profiles are missing');
assert(voiceSource.includes('restaurant') && voiceSource.includes('izakaya'), 'Restaurant/izakaya style profiles are missing');
assert(!voiceSource.includes('salon') && !voiceSource.includes('clinic') && !voiceSource.includes('hotel'), 'Non-restaurant style profiles should not be present in Phase 5');
assert(voiceSource.includes('normalizeAmbiguousDateTime'), 'Ambiguous date/time normalization is missing');
assert(voiceSource.includes('detectCustomerMood'), 'Customer mood detection is missing');
assert(voiceSource.includes('createEmptyMemory') && voiceSource.includes('reservationToMemory'), 'Reception memory engine is missing');
assert(voiceSource.includes('buildRecoveryReturnReply') && voiceSource.includes('replaceTimeInDateTime'), 'Conversation recovery engine is missing');
assert(voiceSource.includes('detectReceptionPersonality') && voiceSource.includes('completionClosing'), 'Reception personality engine is missing');
assert(voiceSource.includes('chooseAcknowledgement') && voiceSource.includes('humanTempoBridge'), 'Human conversation engine is missing');
assert(appSource.includes('接客スタイル'), 'Reception style selector is missing');
assert(appSource.includes('アレルギー') && appSource.includes('遅刻連絡') && appSource.includes('貸切相談'), 'Restaurant-specific settings are missing');
assert(voiceSource.includes('needs_confirmation'), 'Reservation confirmation stage is missing');
assert(voiceSource.includes('ご連絡先は') && voiceSource.includes('控えております'), 'Reservation completion message is missing');
assert(appSource.includes('営業電話ログ'), 'Sales-call admin log is missing');
assert(appSource.includes('人への転送ログ'), 'Human transfer admin log is missing');
assert(appSource.includes('店舗設定'), 'Store settings admin UI is missing');
assert(appSource.includes('data-confirm-record'), 'Admin confirmation action is missing');
assert(appSource.includes('data-incoming-call'), 'Incoming call simulator is missing');
assert(voiceSource.includes('お電話の内容を十分に確認できなかった'), 'Three-strike transfer handling is missing');
assert(voiceSource.includes('席数'), 'Restaurant FAQ structure is missing seats');
assert(voiceSource.includes('支払'), 'Restaurant FAQ structure is missing payment');



const htmlSource = await readFile('src/index.html', 'utf8');
assert(htmlSource.includes('<meta name="viewport"'), 'Viewport meta tag is missing');
assert(htmlSource.includes('あなた専用AI朝ダッシュボード'), 'AI morning dashboard framing is missing from index.html');
assert(htmlSource.includes('5分で今日を決める'), 'Dashboard header badge is missing');
assert(htmlSource.includes('href="styles.css"'), 'Stylesheet should use a route-relative path for static hosting');
assert(htmlSource.includes('src="app.js"'), 'App script should use a route-relative path for static hosting');

const cssSource = await readFile('src/styles.css', 'utf8');
assert(cssSource.includes('@media (max-width: 760px)'), 'Mobile media query is missing');
assert(cssSource.includes('grid-template-columns: 1fr'), 'Mobile one-column grid rule is missing');
assert(cssSource.includes('accent-color'), 'Category checkbox accent styling is missing');
assert(cssSource.includes('trust-row'), 'Trust metadata styling is missing');
assert(cssSource.includes('top-news-card'), 'Top news card styling is missing');
assert(cssSource.includes('preset-card'), 'Preset card styling is missing');
assert(cssSource.includes('widget-grid'), 'Dashboard widget grid styling is missing');
assert(cssSource.includes('widget-card'), 'Widget card styling is missing');
assert(cssSource.includes('idea-input'), 'One-idea input styling is missing');
assert(cssSource.includes('voice-grid'), 'Voice reception grid styling is missing');
assert(cssSource.includes('admin-row'), 'Voice admin row styling is missing');
assert(cssSource.includes('status-badge'), 'Admin reservation status styling is missing');
assert(cssSource.includes('settings-form'), 'Store settings form styling is missing');


const updateWorkflowSource = await readFile('.github/workflows/update-news.yml', 'utf8');
assert(updateWorkflowSource.includes('OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}'), 'Update workflow must pass OPENAI_API_KEY from secrets');
assert(updateWorkflowSource.includes('npm run fetch:rss'), 'Update workflow must fetch RSS before summarizing');
assert(updateWorkflowSource.includes('npm run summarize'), 'Update workflow must summarize generated RSS data');
assert(updateWorkflowSource.includes('git add src/generated/news.json'), 'Update workflow must commit generated news JSON only');
assert(updateWorkflowSource.includes('actions/deploy-pages@v4'), 'Update workflow must deploy through GitHub Pages');

const legacyWorkflowSource = await readFile('.github/workflows/news-schedule.yml', 'utf8');
assert(!legacyWorkflowSource.includes('cron:'), 'Legacy workflow must not run on a schedule');
assert(legacyWorkflowSource.includes('Legacy Python News Brief workflow is intentionally disabled.'), 'Legacy workflow should explain that it is disabled');

for (const file of ['dist/index.html', 'dist/404.html', 'dist/news/index.html', 'dist/news/app.js', 'dist/news/voice-reception.js', 'dist/news/generated/news.json', 'dist/dashboard/index.html', 'dist/voice-reception/index.html', 'dist/admin/index.html', 'dist/moneyclip/index.html', 'dist/moneyclip/app.js', 'dist/moneyclip/sw.js']) {
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

const readmeSource = await readFile('README.md', 'utf8');
assert(readmeSource.includes('AGATHON Voice Reception MVP'), 'README voice reception section is missing');
assert(readmeSource.includes('http://localhost:3000/voice-reception'), 'README voice reception route is missing');

const handoffSource = await readFile('AI_HANDOFF_LEDGER.md', 'utf8');
assert(handoffSource.includes('AI自動音声受付Web MVP'), 'Handoff ledger voice MVP entry is missing');

const roadmapSource = await readFile('docs/product/voice-reception-roadmap.md', 'utf8');
assert(roadmapSource.includes('商品化ロードマップ'), 'Voice reception roadmap is missing');
const phase5Source = await readFile('docs/product/phase5-restaurant-definition-of-done.md', 'utf8');
assert(phase5Source.includes('Restaurant First Definition of Done'), 'Phase 5 restaurant DoD is missing');

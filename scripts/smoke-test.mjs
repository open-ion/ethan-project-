import { access, readFile } from 'node:fs/promises';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const forbiddenCopy = [
  'ETHAN',
  'あなた専用AI朝ダッシュボード',
  '5分で今日',
  'ニュースアプリ',
  '今日読むべき3件',
  'Ethanからの一言',
  'AI・テクノロジー',
  'News Digest'
];

for (const file of ['src/index.html', 'src/app.js', 'README.md']) {
  const source = await readFile(file, 'utf8');
  for (const copy of forbiddenCopy) {
    assert(!source.includes(copy), `${file} must not include previous dashboard copy: ${copy}`);
  }
}

const htmlSource = await readFile('src/index.html', 'utf8');
assert(htmlSource.includes('AGATHON Bistro Demo のAI電話受付'), 'Product-only title is missing');
assert(htmlSource.includes('飲食店AI受付MVP'), 'Restaurant reception header badge is missing');
assert(htmlSource.includes('src="app.js"'), 'App script should use route-relative app.js');

const appSource = await readFile('src/app.js', 'utf8');
assert(htmlSource.includes('AGATHON Bistro Demo'), 'Voice reception app must render the restaurant product');
assert(appSource.includes('data-incoming-call'), 'Call start button is missing');
assert(appSource.includes('AI電話受付 管理画面'), 'Restaurant admin screen is missing');
assert(!appSource.includes('renderDashboard'), 'Dashboard renderer must not be present');
assert(!appSource.includes('renderNewsCard'), 'News renderer must not be present');

const voiceSource = await readFile('src/voice-reception.js', 'utf8');
assert(voiceSource.includes('VOICE_RECEPTION_STORAGE_KEY'), 'Voice reception storage key is missing');
assert(voiceSource.includes('VOICE_STORE_SETTINGS_KEY'), 'Store settings storage key is missing');
assert(voiceSource.includes('予約を受付しました'), 'Reservation completion message is missing');
assert(voiceSource.includes('営業・ご提案'), 'Sales-call handling copy is missing');
assert(voiceSource.includes('3回聞き取れなかった'), 'Transfer handling is missing');

const cssSource = await readFile('src/styles.css', 'utf8');
assert(cssSource.includes('voice-grid'), 'Voice reception grid styling is missing');
assert(cssSource.includes('settings-form'), 'Store settings form styling is missing');

for (const file of ['dist/index.html', 'dist/404.html', 'dist/app.js', 'dist/voice-reception.js', 'dist/styles.css', 'dist/voice-reception/index.html', 'dist/voice-reception/app.js', 'dist/admin/index.html', 'dist/admin/app.js']) {
  try {
    await access(file);
  } catch (error) {
    throw new Error(`Expected build output is missing: ${file}`);
  }
}

for (const file of ['dist/index.html', 'dist/app.js', 'dist/voice-reception/index.html', 'dist/admin/index.html']) {
  const source = await readFile(file, 'utf8');
  for (const copy of forbiddenCopy) {
    assert(!source.includes(copy), `${file} must not include previous dashboard copy: ${copy}`);
  }
}

for (const file of ['dist/data.js', 'dist/generated/news.json', 'dist/news/index.html', 'dist/dashboard/index.html']) {
  try {
    await access(file);
    throw new Error(`Previous product artifact must not be published: ${file}`);
  } catch (error) {
    if (!String(error.message).includes('ENOENT')) throw error;
  }
}

console.log('Restaurant reception smoke checks passed.');

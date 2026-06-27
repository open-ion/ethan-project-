import {
  categories,
  newsItems as sampleNewsItems,
  getCategory,
  userPresets,
  getPreset,
  getWidget,
  defaultPresetId
} from './data.js';

const app = document.querySelector('#app');
const CATEGORY_STORAGE_KEY = 'agathon-news-selected-categories';
const USER_SETTINGS_KEY = 'ethan-user-settings';

const VOICE_RECEPTION_STORAGE_KEY = 'agathon-voice-reception-records';
const storeProfile = {
  name: 'AGATHON Cafe Demo',
  hours: '営業時間は平日11:00〜22:00、土日祝10:00〜21:00です。',
  closed: '定休日は毎週火曜日です。祝日の場合は翌営業日に振り替えます。',
  access: 'アクセスは駅東口から徒歩5分、サンプル通り沿いです。',
  parking: '駐車場は店舗裏に3台分あります。満車の場合は近隣コインパーキングをご利用ください。'
};

function loadVoiceRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOICE_RECEPTION_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.warn('Failed to load voice reception records', error);
    return [];
  }
}

function saveVoiceRecord(record) {
  const records = [record, ...loadVoiceRecords()].slice(0, 100);
  localStorage.setItem(VOICE_RECEPTION_STORAGE_KEY, JSON.stringify(records));
  return records;
}

function classifyIntent(text) {
  if (/営業|提案|広告|集客|媒体|取材|代理店|サービス紹介|セールス|売り込み/.test(text)) return 'sales';
  if (/予約|席|名|人数|伺|行き|空いて|空席|来店/.test(text)) return 'reservation';
  if (/営業時間|何時|定休日|休み|アクセス|場所|駅|駐車場|駐車|パーキング/.test(text)) return 'faq';
  return 'general';
}

function extractReservation(text) {
  const people = text.match(/(\d+|[一二三四五六七八九十]+)\s*(名|人)/)?.[0] || '';
  const phone = text.match(/0\d{1,4}[-ー\s]?\d{1,4}[-ー\s]?\d{3,4}/)?.[0] || '';
  const dateTime = text.match(/(今日|明日|明後日|\d{1,2}[月\/\-]\d{1,2}日?|\d{1,2}日|月曜|火曜|水曜|木曜|金曜|土曜|日曜).{0,16}?(\d{1,2}時|\d{1,2}:\d{2})?/)?.[0] || '';
  const name = text.match(/(?:名前|氏名|名義|私は|わたしは|僕は|ぼくは)\s*([^、。\s]+)|([^、。\s]+)\s*(?:です|と申します)/)?.[1]
    || text.match(/(?:名前|氏名|名義|私は|わたしは|僕は|ぼくは)\s*([^、。\s]+)|([^、。\s]+)\s*(?:です|と申します)/)?.[2]
    || '';
  return { dateTime, people, name, phone };
}

function missingReservationFields(reservation) {
  return [
    ['dateTime', 'ご希望の日時'],
    ['people', '人数'],
    ['name', 'お名前'],
    ['phone', '電話番号']
  ].filter(([key]) => !reservation[key]).map(([, label]) => label);
}

function buildVoiceReply(text, reservation) {
  const intent = classifyIntent(text);
  if (intent === 'sales') {
    return { intent, reply: 'お電話ありがとうございます。営業・ご提案のお電話ですね。担当者へ共有しますので、会社名、ご担当者名、ご連絡先、要件を簡潔にお願いいたします。予約のお客様とは別で記録いたします。' };
  }
  if (/営業時間|何時/.test(text)) return { intent, reply: storeProfile.hours };
  if (/定休日|休み/.test(text)) return { intent, reply: storeProfile.closed };
  if (/アクセス|場所|駅/.test(text)) return { intent, reply: storeProfile.access };
  if (/駐車場|駐車|パーキング/.test(text)) return { intent, reply: storeProfile.parking };
  const missing = missingReservationFields(reservation);
  if (intent === 'reservation' || missing.length < 4) {
    return {
      intent: 'reservation',
      reply: missing.length === 0
        ? `ありがとうございます。${reservation.dateTime}、${reservation.people}、${reservation.name}様、電話番号${reservation.phone}で仮予約として承りました。店舗スタッフが確認後、必要があれば折り返します。`
        : `ご予約ですね。${missing.slice(0, 2).join('と')}を教えていただけますか。`
    };
  }
  return { intent: 'general', reply: 'お電話ありがとうございます。ご予約、営業時間、定休日、アクセス、駐車場についてご案内できます。ご用件をお聞かせください。' };
}

function renderVoiceReception() {
  app.innerHTML = `
    <section class="hero voice-hero">
      <p class="eyebrow">AGATHON Voice Reception / Web MVP</p>
      <h1>AI自動音声受付デモ</h1>
      <p class="hero-lead">電話番号連携前の営業デモです。ブラウザのマイク入力またはテキスト入力で、店舗スタッフとして予約・FAQ・営業電話の一次対応を行います。</p>
      <div class="hero-actions"><a class="primary-link" href="./admin">管理画面を見る</a><a class="secondary-link" href="./">ETHANへ戻る</a></div>
    </section>
    <section class="section voice-console">
      <div class="section-heading"><p class="eyebrow">Reception Console</p><h2>受付会話</h2><p>Chrome/Safari系ブラウザでは Web Speech API の音声入力を利用できます。未対応環境ではテキスト入力で同じ保存処理を確認できます。</p></div>
      <div class="voice-grid">
        <div class="voice-panel"><label for="voice-input"><strong>お客様の発話</strong></label><textarea id="voice-input" class="idea-input" rows="5" placeholder="例: 明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。"></textarea><div class="idea-actions"><button type="button" class="primary-link" data-start-voice>🎙️ マイク入力</button><button type="button" class="secondary-link" data-send-voice>AI受付に送信</button></div><small class="idea-note" data-voice-status>待機中</small></div>
        <div class="voice-panel"><strong>AIスタッフ応答</strong><p class="voice-reply" data-voice-reply>いらっしゃいませ。AGATHON Cafe Demoでございます。ご予約でしょうか。</p><div class="store-faq"><p>${storeProfile.hours}</p><p>${storeProfile.closed}</p><p>${storeProfile.access}</p><p>${storeProfile.parking}</p></div></div>
      </div>
    </section>`;
}

function renderVoiceAdmin() {
  const records = loadVoiceRecords();
  const reservations = records.filter((record) => record.intent === 'reservation');
  app.innerHTML = `
    <section class="hero"><p class="eyebrow">Admin</p><h1>予約・会話ログ管理</h1><p class="hero-lead">localStorage保存のMVP管理画面です。将来はDB/API、電話番号連携、LINE通知、Googleカレンダー連携に置き換えます。</p><div class="hero-actions"><a class="primary-link" href="./voice-reception">受付デモへ戻る</a></div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Reservations</p><h2>予約一覧</h2><p>${reservations.length}件</p></div><div class="admin-table">${reservations.map((record) => `<article class="admin-row"><strong>${escapeHtml(record.reservation.name || '名前未取得')}</strong><span>${escapeHtml(record.reservation.dateTime || '日時未取得')}</span><span>${escapeHtml(record.reservation.people || '人数未取得')}</span><span>${escapeHtml(record.reservation.phone || '電話未取得')}</span><small>${formatDate(record.createdAt)}</small></article>`).join('') || '<p class="empty">予約ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Conversation Logs</p><h2>会話ログ</h2><p>${records.length}件</p></div><div class="news-list">${records.map((record) => `<article class="news-card"><div class="card-meta"><span>${escapeHtml(record.intent)}</span><span>${formatDate(record.createdAt)}</span></div><h3>お客様</h3><p>${escapeHtml(record.transcript)}</p><h3>AI受付</h3><p>${escapeHtml(record.reply)}</p></article>`).join('') || '<p class="empty">会話ログはまだありません。</p>'}</div></section>`;
}

let activeNewsItems = sampleNewsItems;
let generatedMeta = { generatedAt: null };

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function loadUserSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(USER_SETTINGS_KEY) || '{}');
    return {
      presetId: getPreset(saved.presetId)?.id || defaultPresetId,
      dailyIdea: typeof saved.dailyIdea === 'string' ? saved.dailyIdea : '',
      ideaSavedAt: saved.ideaSavedAt || null
    };
  } catch (error) {
    console.warn('Failed to load user settings', error);
    return { presetId: defaultPresetId, dailyIdea: '', ideaSavedAt: null };
  }
}

function saveUserSettings(patch) {
  const next = { ...loadUserSettings(), ...patch };
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(next));
  return next;
}

function formatDate(value) {
  if (!value) return '更新時刻不明';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '更新時刻不明';
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function normalizeScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(1, Math.min(100, Math.round(score > 0 && score <= 5 ? score * 20 : score))) : 55;
}

function normalizeConfidence(value) {
  const confidence = Number(value);
  if (!Number.isFinite(confidence)) return 55;
  return Math.round(confidence <= 1 ? confidence * 100 : confidence);
}

function getImportanceTier(item) {
  const score = normalizeScore(item.importanceScore);
  if (score >= 85) return { label: '今日一番重要', className: 'tier-top' };
  if (score >= 68) return { label: '重要', className: 'tier-important' };
  return { label: '通常', className: 'tier-normal' };
}

function getRankedNewsItems(items = activeNewsItems) {
  return [...items].sort((a, b) => {
    const scoreDiff = normalizeScore(b.importanceScore) - normalizeScore(a.importanceScore);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0);
  });
}

function getSourceName(item) {
  return item.sourceName || item.source || 'AGATHON News';
}

function getUpdatedAt(item) {
  return item.updatedAt || item.publishedAt || generatedMeta.generatedAt;
}


function loadSelectedCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((id) => categories.some((category) => category.id === id)) : [];
  } catch (error) {
    console.warn('Failed to load category settings', error);
    return [];
  }
}

function saveSelectedCategories(selectedCategoryIds) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(selectedCategoryIds));
}

function toggleSavedCategory(categoryId) {
  const selected = loadSelectedCategories();
  const next = selected.includes(categoryId)
    ? selected.filter((id) => id !== categoryId)
    : [...selected, categoryId];
  saveSelectedCategories(next);
  renderHome();
}

function getCategoryStats(categoryId) {
  const items = getRankedNewsItems().filter((item) => item.categoryId === categoryId);
  return {
    total: items.length,
    important: items.filter((item) => normalizeScore(item.importanceScore) >= 68).length,
    latest: items[0] ? formatDate(getUpdatedAt(items[0])) : '未更新'
  };
}

function renderCategoryPills(activeCategoryId = 'all') {
  const allClass = activeCategoryId === 'all' ? 'pill active' : 'pill';
  const categoryLinks = categories.map((category) => {
    const activeClass = activeCategoryId === category.id ? 'pill active' : 'pill';
    const stats = getCategoryStats(category.id);
    return `<a class="${activeClass}" href="?category=${category.id}">${category.emoji} ${category.label}<span class="pill-count">${stats.total}</span></a>`;
  }).join('');

  return `<nav class="pill-list" aria-label="ニュースカテゴリ"><a class="${allClass}" href="./">すべて<span class="pill-count">${activeNewsItems.length}</span></a>${categoryLinks}</nav>`;
}


function getNewsHref(newsId) {
  return window.location.pathname.includes('/news/') ? `./${newsId}` : `news/${newsId}`;
}

function renderNewsCard(item, index = 0) {
  const category = getCategory(item.categoryId);
  const tier = getImportanceTier(item);
  const confidence = normalizeConfidence(item.confidence);
  return `
    <article class="news-card ${index === 0 ? 'top-news-card' : ''}">
      <div class="card-meta"><span>${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'}</span><span>${formatDate(getUpdatedAt(item))}</span></div>
      <div class="trust-row"><span class="${tier.className}">${tier.label}</span><span>重要度 ${normalizeScore(item.importanceScore)}</span><span class="${confidence < 55 ? 'confidence-low' : ''}">AI Confidence ${confidence}%</span><span>${getSourceName(item)}</span></div>
      ${confidence < 55 ? `<p class="warning-note">⚠ ${item.confidenceReason || 'RSS本文が短いため出典確認を推奨します。'}</p>` : ''}
      <h3><a href="${getNewsHref(item.id)}">${item.title}</a></h3>
      <p class="summary"><strong>一言:</strong> ${item.summary}</p>
      <dl>
        <dt>なぜ重要か</dt>
        <dd>${item.whyImportant}</dd>
        <dt>忙しい人向けの結論</dt>
        <dd>${item.takeaway}</dd>
      </dl>
      <a class="read-more" href="${getNewsHref(item.id)}">詳細を見る</a>
    </article>
  `;
}

function getSelectedCategoryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'all';
}

function renderPresetPicker(activePresetId) {
  return userPresets.map((preset) => {
    const activeClass = preset.id === activePresetId ? 'preset-card active' : 'preset-card';
    return `
      <button type="button" class="${activeClass}" data-preset="${preset.id}" aria-pressed="${preset.id === activePresetId}">
        <span class="preset-emoji">${preset.emoji}</span>
        <strong>${preset.label}</strong>
        <small>${preset.tagline}</small>
      </button>
    `;
  }).join('');
}

function renderWidgetCard(widgetId) {
  const widget = getWidget(widgetId);
  if (!widget) return '';

  if (widget.kind === 'news') {
    const stats = getCategoryStats(widget.categoryId);
    return `
      <article class="widget-card widget-news">
        <div class="widget-head"><span>${widget.emoji}</span><strong>${widget.label}</strong></div>
        <p class="widget-value">${stats.total}<span class="widget-unit">件</span></p>
        <small class="widget-note">重要 ${stats.important}件 / 更新 ${stats.latest}</small>
        <a class="widget-link" href="?category=${widget.categoryId}#digest">一覧を見る →</a>
      </article>
    `;
  }

  return `
    <article class="widget-card widget-${widget.kind}">
      <div class="widget-head"><span>${widget.emoji}</span><strong>${widget.label}</strong></div>
      <p class="widget-placeholder">${widget.placeholder ?? '—'}</p>
      <small class="widget-note">${widget.kind === 'metric' ? 'placeholder（API連携は今後）' : 'placeholder'}</small>
    </article>
  `;
}

function renderTopThree(items) {
  const top = items.slice(0, 3);
  if (top.length === 0) {
    return '<p class="empty">表示できるニュースがまだありません。</p>';
  }
  return `<ol class="top-three">${top.map((item) => {
    const category = getCategory(item.categoryId);
    return `
      <li class="top-three-item">
        <span class="top-three-cat">${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'}</span>
        <a class="top-three-title" href="${getNewsHref(item.id)}">${item.title}</a>
        <p class="top-three-takeaway">${item.takeaway ?? item.summary ?? ''}</p>
      </li>
    `;
  }).join('')}</ol>`;
}

function renderDashboard(preset, rankedItems) {
  const presetItems = preset.categories.length === 0
    ? rankedItems
    : rankedItems.filter((item) => preset.categories.includes(item.categoryId));
  const topThreeItems = (presetItems.length > 0 ? presetItems : rankedItems);
  const settings = loadUserSettings();
  const ideaValue = escapeHtml(settings.dailyIdea);
  const ideaSavedNote = settings.ideaSavedAt
    ? `最後に保存: ${formatDate(settings.ideaSavedAt)}`
    : 'この端末に保存されます。';

  return `
    <section class="hero dashboard-hero">
      <p class="eyebrow">ETHAN / あなた専用AI朝ダッシュボード</p>
      <h1>おはよう。5分で今日を決めよう。</h1>
      <p class="hero-lead">情報を増やすのではなく、迷いを減らす。${preset.emoji} <strong>${preset.label}</strong>として、今日の判断に効くものだけを並べています。</p>
      <div class="hero-actions">
        <a class="primary-link" href="#top-three">今日読むべき3件へ</a>
        <a class="secondary-link" href="#digest">ニュース一覧へ</a>
      </div>
    </section>

    <section class="section preset-section">
      <div class="section-heading">
        <p class="eyebrow">Your Type</p>
        <h2>あなたのタイプを選ぶ</h2>
        <p>その人による、その人のための画面に切り替わります。選択はこの端末に保存されます。</p>
      </div>
      <div class="preset-grid">${renderPresetPicker(preset.id)}</div>
    </section>

    <section class="section dashboard-section">
      <div class="section-heading">
        <p class="eyebrow">Dashboard</p>
        <h2>今日のダッシュボード</h2>
        <p>${preset.tagline}（天気・波・株価などは placeholder。今後ウィジェットとしてAPI連携します。）</p>
      </div>
      <div class="widget-grid">${preset.widgets.map(renderWidgetCard).join('')}</div>
    </section>

    <section id="top-three" class="section">
      <div class="section-heading">
        <p class="eyebrow">Top 3</p>
        <h2>今日読むべき3件</h2>
        <p>あなたのタイプに合わせて、まず読むべきものを3つだけ選びました。</p>
      </div>
      ${renderTopThree(topThreeItems)}
    </section>

    <section class="section ethan-voice">
      <div class="section-heading">
        <p class="eyebrow">Ethan's Voice</p>
        <h2>Ethanからの一言</h2>
      </div>
      <blockquote class="ethan-comment">${preset.ethanComment}</blockquote>
    </section>

    <section class="section idea-section">
      <div class="section-heading">
        <p class="eyebrow">One Idea / Day</p>
        <h2>1日1アイデア</h2>
        <p>今日思いついたことを1つだけ書き留めよう。継続が力になる。</p>
      </div>
      <div class="idea-box">
        <textarea id="daily-idea" class="idea-input" rows="3" placeholder="例: 朝の準備をテンプレ化して10分短縮する">${ideaValue}</textarea>
        <div class="idea-actions">
          <button type="button" class="primary-link" data-save-idea>保存</button>
          <small class="idea-note" data-idea-note>${ideaSavedNote}</small>
        </div>
      </div>
    </section>
  `;
}

function renderHome() {
  const selectedCategoryId = getSelectedCategoryId();
  const savedCategoryIds = loadSelectedCategories();
  const rankedItems = getRankedNewsItems();
  const categoryFilteredItems = savedCategoryIds.length === 0
    ? rankedItems
    : rankedItems.filter((item) => savedCategoryIds.includes(item.categoryId));
  const visibleItems = selectedCategoryId === 'all'
    ? categoryFilteredItems
    : categoryFilteredItems.filter((item) => item.categoryId === selectedCategoryId);
  const settings = loadUserSettings();
  const preset = getPreset(settings.presetId);

  app.innerHTML = `
    ${renderDashboard(preset, rankedItems)}

    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">Categories</p>
        <h2>関心カテゴリ</h2>
      </div>
      ${renderCategoryPills(selectedCategoryId)}
      <p class="settings-note">表示カテゴリはこの端末に保存されます。未選択の場合はすべて表示します。</p>
      <div class="category-grid">
        ${categories.map((category) => {
          const checked = savedCategoryIds.includes(category.id);
          return `
            <label class="category-card">
              <input type="checkbox" data-category-toggle="${category.id}" ${checked ? 'checked' : ''} />
              <span>${category.emoji}</span>
              <strong>${category.label}</strong>
              <small>${category.description}</small>
              <em>${getCategoryStats(category.id).total}件 / 重要 ${getCategoryStats(category.id).important}件 / 更新 ${getCategoryStats(category.id).latest}</em>
            </label>
          `;
        }).join('')}
      </div>
    </section>

    <section id="digest" class="section">
      <div class="section-heading">
        <p class="eyebrow">Digest</p>
        <h2>今日の重要ニュース</h2>
        <p>${visibleItems.length}件を表示中。各記事に一言要約、重要性、忙しい人向けの結論を付けています。</p>
      </div>
      <div class="news-list">
        ${visibleItems.map(renderNewsCard).join('') || '<p class="empty">このカテゴリのニュースはまだありません。RSS取得に失敗してもサンプルを表示します。</p>'}
      </div>
    </section>
  `;
}

function renderDetail(newsId) {
  const item = getRankedNewsItems().find((newsItem) => newsItem.id === newsId);

  if (!item) {
    app.innerHTML = `
      <section class="section detail-panel">
        <p class="eyebrow">Not Found</p>
        <h1>ニュースが見つかりません</h1>
        <p>指定されたニュースはダミーデータ内に存在しません。</p>
        <a class="primary-link" href="./">ホームへ戻る</a>
      </section>
    `;
    return;
  }

  const category = getCategory(item.categoryId);
  app.innerHTML = `
    <article class="section detail-panel">
      <a class="back-link" href="./">← ホームへ戻る</a>
      <p class="eyebrow">${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'} / ${item.source ?? item.sourceName ?? 'AGATHON Sample News'}</p>
      <h1>${item.title}</h1>
      <p class="published">更新: ${formatDate(getUpdatedAt(item))} / 重要度 ${normalizeScore(item.importanceScore)} / AI Confidence ${normalizeConfidence(item.confidence)}%</p>

      <div class="detail-grid">
        <section>
          <h2>一言要約</h2>
          <p>${item.summary}</p>
        </section>
        <section>
          <h2>なぜ重要か</h2>
          <p>${item.whyImportant}</p>
        </section>
        <section>
          <h2>忙しい人向けの結論</h2>
          <p>${item.takeaway}</p>
        </section>
      </div>

      ${item.confidenceReason ? `<div class="source-box"><strong>Confidence理由</strong><p>${item.confidenceReason}</p></div>` : ''}
      <div class="source-box">
        <strong>詳細を読みたい人向けリンク</strong>
        <a href="${item.url}" target="_blank" rel="noreferrer">${item.url}</a>
      </div>
    </article>
  `;
}

function bindVoiceEvents() {
  const input = app.querySelector('#voice-input');
  const status = app.querySelector('[data-voice-status]');
  const replyBox = app.querySelector('[data-voice-reply]');
  const send = () => {
    const transcript = input?.value.trim() || '';
    if (!transcript) { if (status) status.textContent = '発話またはテキストを入力してください。'; return; }
    const reservation = extractReservation(transcript);
    const { intent, reply } = buildVoiceReply(transcript, reservation);
    saveVoiceRecord({ id: `voice-${Date.now()}`, createdAt: new Date().toISOString(), intent, transcript, reply, reservation });
    if (replyBox) replyBox.textContent = reply;
    if (status) status.textContent = `保存しました（${intent}）`;
  };
  app.querySelector('[data-send-voice]')?.addEventListener('click', send);
  app.querySelector('[data-start-voice]')?.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { if (status) status.textContent = 'このブラウザは音声入力に未対応です。テキスト入力を使ってください。'; return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognition.onstart = () => { if (status) status.textContent = '聞き取り中です...'; };
    recognition.onerror = () => { if (status) status.textContent = '音声入力に失敗しました。テキスト入力を使ってください。'; };
    recognition.onresult = (event) => { input.value = event.results[0][0].transcript; if (status) status.textContent = '聞き取り完了。AI受付に送信できます。'; };
    recognition.start();
  });
}

function bindEvents() {
  app.querySelectorAll('[data-category-toggle]').forEach((input) => {
    input.addEventListener('change', () => toggleSavedCategory(input.dataset.categoryToggle));
  });

  app.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      saveUserSettings({ presetId: button.dataset.preset });
      render();
    });
  });

  const saveIdeaButton = app.querySelector('[data-save-idea]');
  if (saveIdeaButton) {
    saveIdeaButton.addEventListener('click', () => {
      const input = app.querySelector('#daily-idea');
      const note = app.querySelector('[data-idea-note]');
      const next = saveUserSettings({ dailyIdea: input?.value ?? '', ideaSavedAt: new Date().toISOString() });
      if (note) note.textContent = `保存しました（${formatDate(next.ideaSavedAt)}）`;
    });
  }
}

function render() {
  const detailMatch = window.location.pathname.match(/\/news\/([^/]+)\/?$/);
  if (window.location.pathname.includes('/admin')) {
    renderVoiceAdmin();
    return;
  }
  if (window.location.pathname.includes('/voice-reception')) {
    renderVoiceReception();
    bindVoiceEvents();
    return;
  }
  if (detailMatch) {
    renderDetail(detailMatch[1]);
  } else {
    renderHome();
  }
  bindEvents();
}

async function loadGeneratedNews() {
  try {
    const response = await fetch('generated/news.json', { cache: 'no-store' });
    if (!response.ok) return;
    const payload = await response.json();
    generatedMeta = { generatedAt: payload.generatedAt || payload.summarizedAt || null };
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      activeNewsItems = payload.items;
    }
  } catch (error) {
    console.warn('Generated news data unavailable; using sample data.', error);
  }
}

await loadGeneratedNews();
render();

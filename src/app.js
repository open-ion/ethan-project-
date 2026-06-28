import {
  categories,
  newsItems as sampleNewsItems,
  getCategory,
  userPresets,
  getPreset,
  getWidget,
  defaultPresetId
} from './data.js';
import {
  buildVoiceReply,
  defaultStoreSettings,
  formatReservationSummary,
  loadStoreSettings,
  loadVoiceRecords,
  loadVoiceSession,
  resetVoiceSession,
  saveStoreSettings,
  saveVoiceRecord,
  startIncomingCall,
  updateVoiceRecord
} from './voice-reception.js';

const app = document.querySelector('#app');
const CATEGORY_STORAGE_KEY = 'agathon-news-selected-categories';
const USER_SETTINGS_KEY = 'ethan-user-settings';


function renderStoreFacts(settings) {
  return `
    <div class="store-faq">
      <p><strong>店舗:</strong> ${escapeHtml(settings.name)}（${escapeHtml(settings.businessType)}）</p>
      <p><strong>営業時間:</strong> ${escapeHtml(settings.hours)}</p>
      <p><strong>定休日:</strong> ${escapeHtml(settings.closed)}</p>
      <p><strong>住所:</strong> ${escapeHtml(settings.address)}</p>
      <p><strong>駐車場:</strong> ${escapeHtml(settings.parking)}</p>
      <p><strong>席数:</strong> ${escapeHtml(settings.seats)}</p>
      <p><strong>支払方法:</strong> ${escapeHtml(settings.payment)}</p>
      <p><strong>個室:</strong> ${escapeHtml(settings.privateRoom)}</p>
      <p><strong>禁煙/喫煙:</strong> ${escapeHtml(settings.smoking)}</p>
      <p><strong>テイクアウト:</strong> ${escapeHtml(settings.takeout)}</p>
      <p><strong>FAQ:</strong> ${escapeHtml(settings.faq)}</p>
      <p><strong>口調:</strong> ${escapeHtml(settings.tone)}</p>
    </div>`;
}

function renderVoiceReception() {
  const settings = loadStoreSettings();
  const session = loadVoiceSession();
  app.innerHTML = `
    <section class="hero voice-hero">
      <p class="eyebrow">AGATHON Voice Reception / Product Prototype</p>
      <h1>${escapeHtml(settings.name)}のAI電話受付</h1>
      <p class="hero-lead">電話着信 → AI挨拶 → 用件判定 → 予約/FAQ/営業電話/人への転送 → 終了まで、今日デモできる飲食店向け商品MVPです。</p>
      <div class="hero-actions"><button type="button" class="primary-link" data-incoming-call>☎️ 電話着信を開始</button><a class="secondary-link" href="./admin">管理画面を見る</a><button type="button" class="secondary-link" data-reset-voice>会話をリセット</button></div>
    </section>
    <section class="section voice-console">
      <div class="section-heading"><p class="eyebrow">Reception Console</p><h2>受付会話</h2><p>予約例:「明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。席は窓側希望です。」→ AIが復唱 →「はい」で予約受付完了。</p></div>
      <div class="voice-grid">
        <div class="voice-panel">
          <label for="voice-input"><strong>お客様の発話</strong></label>
          <textarea id="voice-input" class="idea-input" rows="5" placeholder="予約、FAQ、営業電話、スタッフ転送の内容を話す/入力してください"></textarea>
          <div class="idea-actions"><button type="button" class="primary-link" data-start-voice>🎙️ マイク入力</button><button type="button" class="secondary-link" data-send-voice>AI受付に送信</button></div>
          <small class="idea-note" data-voice-status>現在の状態: ${escapeHtml(session.stage)} / ${escapeHtml(formatReservationSummary(session.reservation))}</small>
        </div>
        <div class="voice-panel"><strong>AIスタッフ応答</strong><p class="voice-reply" data-voice-reply>電話着信を開始するとAI受付が挨拶します。</p>${renderStoreFacts(settings)}</div>
      </div>
    </section>`;
}

function getStatusLabel(status) {
  return ({ unconfirmed: '未確認', confirmed: '確認済み', needs_confirmation: '確認待ち', draft: '入力中', ai_confirmed: 'AI受付済み', retrying: '聞き返し中' }[status] || status || '未確認');
}

function renderVoiceAdmin() {
  const settings = loadStoreSettings();
  const records = loadVoiceRecords();
  const reservations = records.filter((record) => record.kind === 'reservation');
  const salesLogs = records.filter((record) => record.kind === 'sales');
  const transfers = records.filter((record) => record.kind === 'transfer');
  const conversations = records.filter((record) => record.kind === 'conversation');
  const settingLabels = { name: '店舗名', businessType: '業種', hours: '営業時間', closed: '定休日', address: '住所', parking: '駐車場', seats: '席数', payment: '支払方法', privateRoom: '個室', smoking: '禁煙・喫煙', takeout: 'テイクアウト', faq: 'FAQ', tone: 'AI受付の口調' };
  app.innerHTML = `
    <section class="hero"><p class="eyebrow">Store Admin</p><h1>AI電話受付 管理画面</h1><p class="hero-lead">予約、会話ログ、営業電話ログ、人への転送、店舗設定を1画面で確認できます。現在はlocalStorage保存のプロトタイプです。</p><div class="hero-actions"><a class="primary-link" href="./voice-reception">受付デモへ戻る</a></div></section>
    <section class="section admin-stats"><div class="stat-card"><strong>${reservations.length}</strong><span>予約</span></div><div class="stat-card"><strong>${salesLogs.length}</strong><span>営業電話</span></div><div class="stat-card"><strong>${transfers.length}</strong><span>転送</span></div><div class="stat-card"><strong>${conversations.length}</strong><span>会話ログ</span></div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Reservations</p><h2>予約一覧</h2><p>AI受付済み予約はスタッフ確認後に「確認済み」へ変更できます。</p></div><div class="admin-table">${reservations.map((record) => `<article class="admin-row reservation-row"><strong>${escapeHtml(record.reservation?.name || '名前未取得')}</strong><span>${escapeHtml(record.reservation?.dateTime || '日時未取得')}</span><span>${escapeHtml(record.reservation?.people || '人数未取得')}</span><span>${escapeHtml(record.reservation?.phone || '電話未取得')}</span><span>${escapeHtml(record.reservation?.seatType || '席指定なし')}</span><span>${escapeHtml(record.reservation?.request || '要望なし')}</span><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button><small>${formatDate(record.createdAt)}</small></article>`).join('') || '<p class="empty">予約ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Sales Calls</p><h2>営業電話ログ</h2><p>営業担当へ直接取次がず、必要なものだけ折り返し判断できます。</p></div><div class="news-list">${salesLogs.map((record) => `<article class="news-card"><div class="card-meta"><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><span>${formatDate(record.createdAt)}</span></div><h3>営業電話</h3><p>${escapeHtml(record.summary || record.transcript)}</p><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button></article>`).join('') || '<p class="empty">営業電話ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Human Transfer</p><h2>人への転送ログ</h2><p>3回聞き取れない、本人希望、想定外、怒り、緊急はスタッフ対応に回します。</p></div><div class="news-list">${transfers.map((record) => `<article class="news-card"><div class="card-meta"><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><span>${formatDate(record.createdAt)}</span></div><h3>転送理由</h3><p>${escapeHtml(record.reason || record.transcript || '転送')}</p><p>${escapeHtml(record.reply)}</p><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button></article>`).join('') || '<p class="empty">転送ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Conversation Logs</p><h2>会話ログ</h2><p>${conversations.length}件</p></div><div class="news-list">${conversations.map((record) => `<article class="news-card"><div class="card-meta"><span>${escapeHtml(record.intent)}</span><span>${formatDate(record.createdAt)}</span></div><h3>お客様</h3><p>${escapeHtml(record.transcript)}</p><h3>AI受付</h3><p>${escapeHtml(record.reply)}</p></article>`).join('') || '<p class="empty">会話ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Store Settings</p><h2>店舗設定</h2><p>AI受付の回答に即時反映されます。</p></div><form class="settings-form" data-store-settings>${Object.keys(settingLabels).map((key) => `<label><span>${escapeHtml(settingLabels[key])}</span><textarea name="${key}" rows="${key === 'faq' || key === 'tone' ? 3 : 2}">${escapeHtml(settings[key] ?? defaultStoreSettings[key] ?? '')}</textarea></label>`).join('')}<button type="submit" class="primary-link">店舗設定を保存</button><small class="idea-note" data-settings-note>保存すると受付画面の応答に反映されます。</small></form></section>`;
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
    const { intent, reply, record } = buildVoiceReply(transcript, loadVoiceSession(), loadStoreSettings());
    saveVoiceRecord({ ...record, intent, transcript, reply });
    const session = loadVoiceSession();
    if (replyBox) replyBox.textContent = reply;
    if (status) status.textContent = `保存しました（${intent}） / 現在の状態: ${session.stage} / ${formatReservationSummary(session.reservation)}`;
    if (input) input.value = '';
  };
  app.querySelector('[data-send-voice]')?.addEventListener('click', send);
  app.querySelector('[data-incoming-call]')?.addEventListener('click', () => {
    const { intent, reply, record } = startIncomingCall();
    saveVoiceRecord({ ...record, intent, reply });
    if (replyBox) replyBox.textContent = reply;
    if (status) status.textContent = `電話着信を開始しました / 現在の状態: ${loadVoiceSession().stage}`;
  });
  app.querySelector('[data-reset-voice]')?.addEventListener('click', () => {
    resetVoiceSession();
    renderVoiceReception();
    bindVoiceEvents();
  });
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

function bindAdminEvents() {
  app.querySelectorAll('[data-confirm-record]').forEach((button) => {
    button.addEventListener('click', () => {
      updateVoiceRecord(button.dataset.confirmRecord, { status: 'confirmed' });
      renderVoiceAdmin();
      bindAdminEvents();
    });
  });

  const settingsForm = app.querySelector('[data-store-settings]');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(settingsForm);
      saveStoreSettings(Object.fromEntries(formData.entries()));
      const note = app.querySelector('[data-settings-note]');
      if (note) note.textContent = `保存しました（${formatDate(new Date().toISOString())}）`;
    });
  }
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
    bindAdminEvents();
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

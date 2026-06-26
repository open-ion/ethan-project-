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

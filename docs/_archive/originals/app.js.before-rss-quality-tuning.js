import { categories, newsItems as sampleNewsItems, getCategory } from './data.js';

const app = document.querySelector('#app');
const CATEGORY_STORAGE_KEY = 'agathon-news-selected-categories';
let activeNewsItems = sampleNewsItems;

function formatDate(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
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

function renderCategoryPills(activeCategoryId = 'all') {
  const allClass = activeCategoryId === 'all' ? 'pill active' : 'pill';
  const categoryLinks = categories.map((category) => {
    const activeClass = activeCategoryId === category.id ? 'pill active' : 'pill';
    return `<a class="${activeClass}" href="?category=${category.id}">${category.emoji} ${category.label}</a>`;
  }).join('');

  return `<nav class="pill-list" aria-label="ニュースカテゴリ"><a class="${allClass}" href="./">すべて</a>${categoryLinks}</nav>`;
}


function getNewsHref(newsId) {
  return window.location.pathname.includes('/news/') ? `./${newsId}` : `news/${newsId}`;
}

function renderNewsCard(item) {
  const category = getCategory(item.categoryId);
  return `
    <article class="news-card">
      <div class="card-meta"><span>${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'}</span><span>${formatDate(item.publishedAt)}</span></div>
      <h3><a href="${getNewsHref(item.id)}">${item.title}</a></h3>
      <p class="summary">${item.summary}</p>
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

function renderHome() {
  const selectedCategoryId = getSelectedCategoryId();
  const savedCategoryIds = loadSelectedCategories();
  const categoryFilteredItems = savedCategoryIds.length === 0
    ? activeNewsItems
    : activeNewsItems.filter((item) => savedCategoryIds.includes(item.categoryId));
  const visibleItems = selectedCategoryId === 'all'
    ? categoryFilteredItems
    : categoryFilteredItems.filter((item) => item.categoryId === selectedCategoryId);

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">AGATHON LABS / Ethan Report</p>
      <h1>おはよう、Ion。今日5分で押さえるべきニュースです。</h1>
      <p>EthanがNova、Atlas、Sageと連携して、重要ニュースをカテゴリ別に整理しました。</p>
      <div class="hero-actions">
        <a class="primary-link" href="#digest">今日のニュースを見る</a>
        <a class="secondary-link" href="${activeNewsItems[0] ? getNewsHref(activeNewsItems[0].id) : '#digest'}">最重要ニュースへ</a>
      </div>
    </section>

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
        ${visibleItems.map(renderNewsCard).join('') || '<p class="empty">このカテゴリのニュースはまだありません。</p>'}
      </div>
    </section>
  `;
}

function renderDetail(newsId) {
  const item = activeNewsItems.find((newsItem) => newsItem.id === newsId);

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
      <p class="published">${formatDate(item.publishedAt)}</p>

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
    if (Array.isArray(payload.items) && payload.items.length > 0) {
      activeNewsItems = payload.items;
    }
  } catch (error) {
    console.warn('Generated news data unavailable; using sample data.', error);
  }
}

await loadGeneratedNews();
render();

import { categories, newsItems, getCategory, getNewsItem } from './data.js';

const app = document.querySelector('#app');

function formatDate(value) {
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function renderCategoryPills(activeCategoryId = 'all') {
  const allClass = activeCategoryId === 'all' ? 'pill active' : 'pill';
  const categoryLinks = categories.map((category) => {
    const activeClass = activeCategoryId === category.id ? 'pill active' : 'pill';
    return `<a class="${activeClass}" href="/?category=${category.id}">${category.emoji} ${category.label}</a>`;
  }).join('');

  return `<nav class="pill-list" aria-label="ニュースカテゴリ"><a class="${allClass}" href="/">すべて</a>${categoryLinks}</nav>`;
}

function renderNewsCard(item) {
  const category = getCategory(item.categoryId);
  return `
    <article class="news-card">
      <div class="card-meta"><span>${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'}</span><span>${formatDate(item.publishedAt)}</span></div>
      <h3><a href="/news/${item.id}">${item.title}</a></h3>
      <p class="summary">${item.summary}</p>
      <dl>
        <dt>なぜ重要か</dt>
        <dd>${item.whyImportant}</dd>
        <dt>忙しい人向けの結論</dt>
        <dd>${item.takeaway}</dd>
      </dl>
      <a class="read-more" href="/news/${item.id}">詳細を見る</a>
    </article>
  `;
}

function getSelectedCategoryId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || 'all';
}

function renderHome() {
  const selectedCategoryId = getSelectedCategoryId();
  const visibleItems = selectedCategoryId === 'all'
    ? newsItems
    : newsItems.filter((item) => item.categoryId === selectedCategoryId);

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">AGATHON LABS / Ethan Report</p>
      <h1>おはよう、Ion。今日5分で押さえるべきニュースです。</h1>
      <p>EthanがNova、Atlas、Sageと連携して、重要ニュースをカテゴリ別に整理しました。</p>
      <div class="hero-actions">
        <a class="primary-link" href="#digest">今日のニュースを見る</a>
        <a class="secondary-link" href="/news/${newsItems[0].id}">最重要ニュースへ</a>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">Categories</p>
        <h2>関心カテゴリ</h2>
      </div>
      ${renderCategoryPills(selectedCategoryId)}
      <div class="category-grid">
        ${categories.map((category) => `
          <a class="category-card" href="/?category=${category.id}">
            <span>${category.emoji}</span>
            <strong>${category.label}</strong>
            <small>${category.description}</small>
          </a>
        `).join('')}
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
  const item = getNewsItem(newsId);

  if (!item) {
    app.innerHTML = `
      <section class="section detail-panel">
        <p class="eyebrow">Not Found</p>
        <h1>ニュースが見つかりません</h1>
        <p>指定されたニュースはダミーデータ内に存在しません。</p>
        <a class="primary-link" href="/">ホームへ戻る</a>
      </section>
    `;
    return;
  }

  const category = getCategory(item.categoryId);
  app.innerHTML = `
    <article class="section detail-panel">
      <a class="back-link" href="/">← ホームへ戻る</a>
      <p class="eyebrow">${category?.emoji ?? '📰'} ${category?.label ?? 'ニュース'} / ${item.source}</p>
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

function render() {
  const detailMatch = window.location.pathname.match(/^\/news\/([^/]+)$/);
  if (detailMatch) {
    renderDetail(detailMatch[1]);
    return;
  }
  renderHome();
}

render();

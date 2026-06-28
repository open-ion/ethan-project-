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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function formatDate(value) {
  if (!value) return '時刻不明';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '時刻不明';
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

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
      <p class="eyebrow">Restaurant AI Phone Reception MVP</p>
      <h1>${escapeHtml(settings.name)} のAI電話受付</h1>
      <p class="hero-lead">電話着信 → AI挨拶 → 用件判定 → 予約/FAQ/営業電話/人への転送 → 終了までを、この公開URLだけでデモできます。</p>
      <div class="hero-actions"><button type="button" class="primary-link" data-incoming-call>☎️ 通話開始</button><a class="secondary-link" href="./admin">管理画面を見る</a><button type="button" class="secondary-link" data-reset-voice>会話をリセット</button></div>
    </section>
    <section class="section voice-console">
      <div class="section-heading"><p class="eyebrow">Call Console</p><h2>AI受付と会話する</h2><p>予約例:「明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。席は窓側希望です。」→ AIが復唱 →「はい」で予約受付完了。</p></div>
      <div class="voice-grid">
        <div class="voice-panel">
          <label for="voice-input"><strong>お客様の発話</strong></label>
          <textarea id="voice-input" class="idea-input" rows="5" placeholder="予約、FAQ、営業電話、スタッフ転送の内容を話す/入力してください"></textarea>
          <div class="idea-actions"><button type="button" class="primary-link" data-start-voice>🎙️ マイク入力</button><button type="button" class="secondary-link" data-send-voice>AI受付に送信</button></div>
          <small class="idea-note" data-voice-status>現在の状態: ${escapeHtml(session.stage)} / ${escapeHtml(formatReservationSummary(session.reservation))}</small>
        </div>
        <div class="voice-panel"><strong>AIスタッフ応答</strong><p class="voice-reply" data-voice-reply>通話開始を押すとAI受付が挨拶します。</p>${renderStoreFacts(settings)}</div>
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
    <section class="hero"><p class="eyebrow">Restaurant Reception Admin</p><h1>AI電話受付 管理画面</h1><p class="hero-lead">予約、会話ログ、営業電話ログ、人への転送、店舗設定を確認できます。</p><div class="hero-actions"><a class="primary-link" href="./voice-reception">受付デモへ戻る</a></div></section>
    <section class="section admin-stats"><div class="stat-card"><strong>${reservations.length}</strong><span>予約</span></div><div class="stat-card"><strong>${salesLogs.length}</strong><span>営業電話</span></div><div class="stat-card"><strong>${transfers.length}</strong><span>転送</span></div><div class="stat-card"><strong>${conversations.length}</strong><span>会話ログ</span></div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Reservations</p><h2>予約一覧</h2><p>AI受付済み予約はスタッフ確認後に「確認済み」へ変更できます。</p></div><div class="admin-table">${reservations.map((record) => `<article class="admin-row reservation-row"><strong>${escapeHtml(record.reservation?.name || '名前未取得')}</strong><span>${escapeHtml(record.reservation?.dateTime || '日時未取得')}</span><span>${escapeHtml(record.reservation?.people || '人数未取得')}</span><span>${escapeHtml(record.reservation?.phone || '電話未取得')}</span><span>${escapeHtml(record.reservation?.seatType || '席指定なし')}</span><span>${escapeHtml(record.reservation?.request || '要望なし')}</span><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button><small>${formatDate(record.createdAt)}</small></article>`).join('') || '<p class="empty">予約ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Sales Calls</p><h2>営業電話ログ</h2><p>営業担当へ直接取次がず、必要なものだけ折り返し判断できます。</p></div><div class="news-list">${salesLogs.map((record) => `<article class="news-card"><div class="card-meta"><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><span>${formatDate(record.createdAt)}</span></div><h3>営業電話</h3><p>${escapeHtml(record.summary || record.transcript)}</p><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button></article>`).join('') || '<p class="empty">営業電話ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Human Transfer</p><h2>人への転送ログ</h2><p>3回聞き取れない、本人希望、想定外、怒り、緊急はスタッフ対応に回します。</p></div><div class="news-list">${transfers.map((record) => `<article class="news-card"><div class="card-meta"><span class="status-badge status-${escapeHtml(record.status || 'unconfirmed')}">${getStatusLabel(record.status)}</span><span>${formatDate(record.createdAt)}</span></div><h3>転送理由</h3><p>${escapeHtml(record.reason || record.transcript || '転送')}</p><p>${escapeHtml(record.reply)}</p><button type="button" class="secondary-link compact-action" data-confirm-record="${record.id}">確認済み</button></article>`).join('') || '<p class="empty">転送ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Conversation Logs</p><h2>会話ログ</h2><p>${conversations.length}件</p></div><div class="news-list">${conversations.map((record) => `<article class="news-card"><div class="card-meta"><span>${escapeHtml(record.intent)}</span><span>${formatDate(record.createdAt)}</span></div><h3>お客様</h3><p>${escapeHtml(record.transcript)}</p><h3>AI受付</h3><p>${escapeHtml(record.reply)}</p></article>`).join('') || '<p class="empty">会話ログはまだありません。</p>'}</div></section>
    <section class="section"><div class="section-heading"><p class="eyebrow">Store Settings</p><h2>店舗設定</h2><p>AI受付の回答に即時反映されます。</p></div><form class="settings-form" data-store-settings>${Object.keys(settingLabels).map((key) => `<label><span>${escapeHtml(settingLabels[key])}</span><textarea name="${key}" rows="${key === 'faq' || key === 'tone' ? 3 : 2}">${escapeHtml(settings[key] ?? defaultStoreSettings[key] ?? '')}</textarea></label>`).join('')}<button type="submit" class="primary-link">店舗設定を保存</button><small class="idea-note" data-settings-note>保存すると受付画面の応答に反映されます。</small></form></section>`;
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
    if (status) status.textContent = `通話開始 / 現在の状態: ${loadVoiceSession().stage}`;
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

function render() {
  if (window.location.pathname.includes('/admin')) {
    renderVoiceAdmin();
    bindAdminEvents();
    return;
  }
  renderVoiceReception();
  bindVoiceEvents();
}

render();

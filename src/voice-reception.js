export const VOICE_RECEPTION_STORAGE_KEY = 'agathon-voice-reception-records';
export const VOICE_RECEPTION_SESSION_KEY = 'agathon-voice-reception-active-session';
export const VOICE_STORE_SETTINGS_KEY = 'agathon-voice-store-settings';

export const defaultStoreSettings = {
  name: 'AGATHON Bistro Demo',
  businessType: '飲食店',
  hours: '平日11:00〜22:00、土日祝10:00〜21:00',
  closed: '毎週火曜日（祝日の場合は翌営業日）',
  address: '東京都サンプル区イオン通り1-2-3 AGATHONビル1F',
  parking: '店舗裏に3台分あります。満車の場合は近隣コインパーキングをご利用ください。',
  seats: '全32席（テーブル24席、カウンター8席）',
  payment: '現金、クレジットカード、交通系IC、QR決済に対応しています。',
  privateRoom: '完全個室はありませんが、半個室風の4名テーブルが2卓あります。',
  smoking: '全席禁煙です。店外に喫煙スペースがあります。',
  takeout: '一部メニューはテイクアウト可能です。受け取り希望時間をお伝えください。',
  tone: '柔らかく丁寧な飲食店スタッフ。短く確認し、不足項目は一つずつ聞き返す。',
  faq: 'キャンセルは前日までにご連絡ください。ベビーカー入店可。アレルギーや記念日プレートは予約時にご相談ください。'
};

export const reservationFieldLabels = {
  dateTime: 'ご希望日時',
  people: '人数',
  name: 'お名前',
  phone: '電話番号',
  seatType: '席種のご希望',
  request: 'ご要望'
};

export function createMemoryStorage() {
  const memory = new Map();
  return {
    getItem: (key) => memory.has(key) ? memory.get(key) : null,
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key)
  };
}

function getStorage(storage) {
  return storage || globalThis.localStorage || createMemoryStorage();
}

function readJson(storage, key, fallback) {
  try {
    const raw = getStorage(storage).getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key}`, error);
    return fallback;
  }
}

function writeJson(storage, key, value) {
  getStorage(storage).setItem(key, JSON.stringify(value));
  return value;
}

export function loadStoreSettings(storage) {
  return { ...defaultStoreSettings, ...readJson(storage, VOICE_STORE_SETTINGS_KEY, {}) };
}

export function saveStoreSettings(settings, storage) {
  return writeJson(storage, VOICE_STORE_SETTINGS_KEY, { ...loadStoreSettings(storage), ...settings });
}

export function createEmptyReservation() {
  return { dateTime: '', people: '', name: '', phone: '', seatType: '', request: '', status: 'draft' };
}

export function loadVoiceSession(storage) {
  return {
    stage: 'incoming',
    reservation: createEmptyReservation(),
    lastPrompt: null,
    retryCount: 0,
    ...readJson(storage, VOICE_RECEPTION_SESSION_KEY, {})
  };
}

export function saveVoiceSession(session, storage) {
  return writeJson(storage, VOICE_RECEPTION_SESSION_KEY, {
    ...session,
    reservation: { ...createEmptyReservation(), ...(session.reservation || {}) }
  });
}

export function resetVoiceSession(storage) {
  return saveVoiceSession({ stage: 'incoming', reservation: createEmptyReservation(), lastPrompt: null, retryCount: 0 }, storage);
}

export function loadVoiceRecords(storage) {
  const records = readJson(storage, VOICE_RECEPTION_STORAGE_KEY, []);
  return Array.isArray(records) ? records : [];
}

export function saveVoiceRecord(record, storage) {
  const records = [{ id: `voice-${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString(), ...record }, ...loadVoiceRecords(storage)].slice(0, 300);
  return writeJson(storage, VOICE_RECEPTION_STORAGE_KEY, records);
}

export function updateVoiceRecord(recordId, patch, storage) {
  return writeJson(storage, VOICE_RECEPTION_STORAGE_KEY, loadVoiceRecords(storage).map((record) => record.id === recordId ? { ...record, ...patch, updatedAt: new Date().toISOString() } : record));
}

export function normalizePhone(value = '') {
  return value.replace(/[ー−―]/g, '-').replace(/\s+/g, '-');
}

export function classifyIntent(text = '') {
  const value = text.trim();
  if (!value) return 'silence';
  if (/ザー|雑音|聞こえない|ノイズ|無音/.test(value)) return 'noise';
  if (/人|スタッフ|店員|担当|責任者|オーナー|つないで|代わって|転送/.test(value)) return 'transfer';
  if (/怒|クレーム|最悪|急病|救急|事故|緊急|警察|消防/.test(value)) return 'transfer';
  if (/営業|提案|広告|集客|媒体|取材|代理店|サービス紹介|セールス|売り込み|SEO|求人|決済|電気|通信/.test(value)) return 'sales';
  if (/予約|席|名|人数|伺|行き|空いて|空席|来店|お願い|取りたい|個室|カウンター|テーブル/.test(value)) return 'reservation';
  if (/営業時間|何時|定休日|休み|アクセス|場所|住所|駅|駐車場|駐車|パーキング|席数|支払|カード|電子マネー|個室|禁煙|喫煙|テイクアウト|持ち帰り|キャンセル|ベビーカー|アレルギー|記念日/.test(value)) return 'faq';
  if (/はい|大丈夫|それで|お願いします|確定|OK|オーケー/.test(value)) return 'confirm';
  if (/違う|キャンセル|やめ|戻/.test(value)) return 'correction';
  return 'unknown';
}

export function extractReservation(text = '') {
  const people = text.match(/(\d+|[一二三四五六七八九十]+)\s*(名|人)/)?.[0] || '';
  const phone = normalizePhone(text.match(/0\d{1,4}[-ー−―\s]?\d{1,4}[-ー−―\s]?\d{3,4}/)?.[0] || '');
  const dateTime = text.match(/(今日|明日|明後日|今週|来週|\d{1,2}[月\/\-]\d{1,2}日?|\d{1,2}日|月曜|火曜|水曜|木曜|金曜|土曜|日曜).{0,24}?(午前|午後|\d{1,2}時半?|\d{1,2}:\d{2})?/)?.[0] || '';
  const name = text.match(/(?:名前|氏名|名義|私は|わたしは|僕は|ぼくは)\s*([^、。\s]+)|([^、。\s]+)\s*(?:です|と申します)/)?.[1]
    || text.match(/(?:名前|氏名|名義|私は|わたしは|僕は|ぼくは)\s*([^、。\s]+)|([^、。\s]+)\s*(?:です|と申します)/)?.[2]
    || '';
  const seatType = text.match(/(個室|半個室|テーブル|カウンター|窓側|座敷)/)?.[0] || '';
  const request = text.match(/(?:要望|希望|お願い|できれば|可能なら|備考)[:：はを\s]*([^。]+)/)?.[1] || '';
  return { dateTime, people, name, phone, seatType, request };
}

export function mergeReservation(current, extracted) {
  return Object.fromEntries(Object.entries({ ...createEmptyReservation(), ...current }).map(([key, value]) => [key, extracted[key] || value]));
}

export function missingReservationFields(reservation) {
  return ['dateTime', 'people', 'name', 'phone'].filter((key) => !reservation[key]);
}

export function formatReservationSummary(reservation) {
  return [
    `日時: ${reservation.dateTime || '未取得'}`,
    `人数: ${reservation.people || '未取得'}`,
    `お名前: ${reservation.name || '未取得'}`,
    `電話番号: ${reservation.phone || '未取得'}`,
    `席種: ${reservation.seatType || '指定なし'}`,
    `ご要望: ${reservation.request || '特になし'}`
  ].join(' / ');
}

export function getFaqReply(text, settings) {
  if (/営業時間|何時/.test(text)) return `${settings.name}の営業時間は${settings.hours}です。`;
  if (/定休日|休み/.test(text)) return `定休日は${settings.closed}です。`;
  if (/アクセス|場所|住所|駅/.test(text)) return `住所は${settings.address}です。`;
  if (/駐車場|駐車|パーキング/.test(text)) return `駐車場については、${settings.parking}`;
  if (/席数/.test(text)) return `席数は${settings.seats}です。`;
  if (/支払|カード|電子マネー|QR/.test(text)) return `お支払いは、${settings.payment}`;
  if (/個室/.test(text)) return settings.privateRoom;
  if (/禁煙|喫煙|タバコ/.test(text)) return settings.smoking;
  if (/テイクアウト|持ち帰り/.test(text)) return settings.takeout;
  if (/キャンセル|ベビーカー|アレルギー|記念日/.test(text)) return settings.faq;
  return null;
}

function transferReply(settings, reason) {
  return `${settings.name} AI受付です。${reason}ため、店舗スタッフへ引き継ぎます。すぐに出られない場合は折り返しますので、お名前とお電話番号をお残しください。`;
}

function retryOrTransfer(session, settings, reason, storage) {
  const retryCount = Number(session.retryCount || 0) + 1;
  if (retryCount >= 3) {
    const nextSession = resetVoiceSession(storage);
    return {
      intent: 'transfer',
      session: nextSession,
      record: { kind: 'transfer', intent: 'transfer', status: 'unconfirmed', reason, transcript: '', reply: transferReply(settings, '3回聞き取れなかった') },
      reply: transferReply(settings, '3回聞き取れなかった')
    };
  }
  const nextSession = saveVoiceSession({ ...session, retryCount }, storage);
  return {
    intent: reason,
    session: nextSession,
    record: { kind: 'conversation', intent: reason, status: 'retrying', transcript: '', reply: `恐れ入ります。お電話が少し聞き取りづらいようです。もう一度ゆっくりお話しいただけますか？（${retryCount}/3）` },
    reply: `恐れ入ります。お電話が少し聞き取りづらいようです。もう一度ゆっくりお話しいただけますか？（${retryCount}/3）`
  };
}

export function startIncomingCall(storage) {
  const settings = loadStoreSettings(storage);
  const session = saveVoiceSession({ stage: 'greeting', reservation: createEmptyReservation(), lastPrompt: 'intent', retryCount: 0 }, storage);
  return {
    intent: 'incoming',
    session,
    record: { kind: 'conversation', intent: 'incoming', transcript: 'incoming-call', reply: `お電話ありがとうございます。${settings.name} AI受付です。ご用件をお伺いします。` },
    reply: `お電話ありがとうございます。${settings.name} AI受付です。ご予約、営業時間などのお問い合わせ、その他ご用件をお話しください。`
  };
}

export function buildVoiceReply(text, session = loadVoiceSession(), settings = loadStoreSettings(), storage) {
  const intent = classifyIntent(text);

  if (intent === 'silence' || intent === 'noise') return retryOrTransfer(session, settings, intent, storage);

  if (intent === 'transfer') {
    const reply = transferReply(settings, 'スタッフ対応が必要な内容と判断した');
    resetVoiceSession(storage);
    return { intent: 'transfer', session: loadVoiceSession(storage), record: { kind: 'transfer', intent, status: 'unconfirmed', reason: text, transcript: text, reply }, reply };
  }

  if (intent === 'sales') {
    resetVoiceSession(storage);
    const reply = `お電話ありがとうございます。${settings.name} AI受付です。営業・ご提案のお電話ですね。営業担当へ直接のお取次ぎはしておりません。必要な場合のみ折り返しますので、会社名・ご担当者名・ご連絡先・ご用件を記録いたします。`;
    return { intent, session: loadVoiceSession(storage), record: { kind: 'sales', intent, transcript: text, status: 'unconfirmed', company: text.match(/([^、。\s]+)(?:です|と申します|の)/)?.[1] || '', summary: text, reply }, reply };
  }

  const faqReply = getFaqReply(text, settings);
  if (intent === 'faq' && faqReply) {
    const nextSession = saveVoiceSession({ ...session, stage: 'greeting', retryCount: 0 }, storage);
    return { intent, session: nextSession, record: { kind: 'conversation', intent, transcript: text, reply: faqReply }, reply: faqReply };
  }

  if (intent === 'correction') {
    const nextSession = saveVoiceSession({ ...session, stage: 'collecting', lastPrompt: null, retryCount: 0 }, storage);
    return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'correction', transcript: text, reply: '承知しました。変更後の予約内容を教えてください。' }, reply: '承知しました。変更後の予約内容を教えてください。' };
  }

  const extracted = extractReservation(text);
  const reservation = mergeReservation(session.reservation, extracted);
  const missing = missingReservationFields(reservation);

  if (session.stage === 'confirming' && intent === 'confirm' && missing.length === 0) {
    const completedReservation = { ...reservation, status: 'ai_confirmed' };
    const reply = `ありがとうございます。${reservation.name}様、${reservation.dateTime}に${reservation.people}で予約を受付しました。${reservation.phone}を控えました。席種は「${reservation.seatType || '指定なし'}」、ご要望は「${reservation.request || '特になし'}」で承ります。ご来店をお待ちしております。`;
    resetVoiceSession(storage);
    return { intent: 'reservation', session: loadVoiceSession(storage), record: { kind: 'reservation', intent: 'reservation', transcript: text, reply, status: 'ai_confirmed', reservation: completedReservation }, reply };
  }

  if (intent === 'reservation' || session.stage === 'collecting' || session.stage === 'confirming' || Object.values(extracted).some(Boolean)) {
    if (missing.length > 0) {
      const nextField = missing[0];
      const nextSession = saveVoiceSession({ stage: 'collecting', reservation, lastPrompt: nextField, retryCount: 0 }, storage);
      const reply = `${settings.name}です。ご予約を承ります。${reservationFieldLabels[nextField]}を教えてください。現在の受付内容は「${formatReservationSummary(reservation)}」です。`;
      return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'reservation', transcript: text, reply, reservation, status: 'draft' }, reply };
    }
    const nextSession = saveVoiceSession({ stage: 'confirming', reservation, lastPrompt: 'confirm', retryCount: 0 }, storage);
    const reply = `確認します。${formatReservationSummary(reservation)}。この内容で予約を確定してよろしいですか？ よろしければ「はい」とお答えください。`;
    return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'reservation', transcript: text, reply, reservation, status: 'needs_confirmation' }, reply };
  }

  const retryCount = Number(session.retryCount || 0) + 1;
  if (retryCount >= 3) {
    const reply = transferReply(settings, '想定外の内容が続いた');
    resetVoiceSession(storage);
    return { intent: 'transfer', session: loadVoiceSession(storage), record: { kind: 'transfer', intent: 'unknown', status: 'unconfirmed', reason: text, transcript: text, reply }, reply };
  }

  const nextSession = saveVoiceSession({ ...session, retryCount }, storage);
  const reply = `恐れ入ります。ご予約、営業時間・定休日・駐車場などのご質問、営業のお電話、スタッフへのお取次ぎのいずれでしょうか？（${retryCount}/3）`;
  return { intent: 'unknown', session: nextSession, record: { kind: 'conversation', intent: 'unknown', transcript: text, reply }, reply };
}

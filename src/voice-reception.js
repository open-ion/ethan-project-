export const VOICE_RECEPTION_STORAGE_KEY = 'agathon-voice-reception-records';
export const VOICE_RECEPTION_SESSION_KEY = 'agathon-voice-reception-active-session';
export const VOICE_STORE_SETTINGS_KEY = 'agathon-voice-store-settings';

export const defaultStoreSettings = {
  name: 'AGATHON Bistro Demo',
  businessType: 'restaurant',
  receptionStyle: 'izakaya',
  hours: '平日11:00〜22:00、土日祝10:00〜21:00',
  closed: '毎週火曜日（祝日の場合は翌営業日）',
  address: '東京都サンプル区イオン通り1-2-3 AGATHONビル1F',
  parking: '店舗裏に3台分あります。満車の場合は近隣コインパーキングをご利用ください。',
  seats: '全32席（テーブル24席、カウンター8席）',
  payment: '現金、クレジットカード、交通系IC、QR決済に対応しています。',
  privateRoom: '完全個室はありませんが、半個室風の4名テーブルが2卓あります。',
  smoking: '全席禁煙です。店外に喫煙スペースがあります。',
  takeout: '一部メニューはテイクアウト可能です。受け取り希望時間をお伝えください。',
  children: 'お子様連れも大丈夫です。ベビーカーの場合は入口近くのお席をご案内しやすいです。',
  allergy: 'アレルギーは事前に内容を伺い、厨房に確認いたします。重度の場合は安全のため折り返し確認になります。',
  course: 'コースは前日までのご予約をおすすめしています。当日も内容によりご相談できます。',
  cancelPolicy: 'キャンセルや人数変更は、できるだけ前日までにご連絡ください。当日はお電話で確認いたします。',
  latePolicy: '遅れそうな場合は分かり次第ご連絡ください。15分以上の場合はお席状況を確認いたします。',
  privateBooking: '貸切は人数、ご希望日、ご予算を伺って担当者が確認いたします。',
  tone: '感じのいい受付スタッフ。相づち、自然な間、復唱で安心感を作り、お客様の話を遮らない。',
  faq: 'キャンセルは前日までにご連絡ください。ベビーカー入店可。アレルギーや記念日プレートは予約時にご相談ください。'
};


export const receptionStyleProfiles = {
  restaurant: {
    label: 'レストラン',
    opening: (name) => `お電話ありがとうございます。${name}でございます。ご予約やお問い合わせをお伺いいたします。`,
    reservationStart: 'ご予約ですね。ありがとうございます。',
    filler: 'はい、かしこまりました。',
    dateTime: 'ご希望のお日にちとお時間をお伺いできますでしょうか。',
    people: '何名様でご用意いたしましょうか。',
    name: 'ご予約のお名前をお伺いできますでしょうか。',
    phone: '念のため、ご連絡先のお電話番号をお伺いできますでしょうか。',
    confirmLead: '念のため復唱いたします。',
    confirmAsk: 'こちらの内容でお席をご用意してよろしいでしょうか。',
    completeClose: 'ご来店をお待ちしております。',
    retry: '恐れ入ります、お電話が少し遠いようです。もう一度ゆっくりお伺いできますでしょうか。',
    unknown: 'ご予約、空席確認、営業時間、駐車場など、どちらのご用件でしょうか。',
    transfer: '担当の者に確認いたしますので、このまま少々お待ちください。',
    sales: 'ご案内ありがとうございます。恐れ入りますが、営業のご提案はお電話ではお受けしておりません。必要がございましたら、こちらからご連絡いたします。'
  },
  izakaya: {
    label: '居酒屋',
    opening: (name) => `お電話ありがとうございます。${name}です。ご予約や空席の確認など、お伺いします。`,
    reservationStart: 'ご予約ですね、ありがとうございます。',
    filler: 'はい、ありがとうございます。',
    dateTime: 'ご希望のお日にちとお時間はお決まりでしょうか。',
    people: '何名様でご来店予定でしょうか。',
    name: 'お名前をお伺いできますでしょうか。',
    phone: '念のため、お電話番号もお伺いできますでしょうか。',
    confirmLead: '念のため確認します。',
    confirmAsk: 'こちらでお席をご用意してよろしいでしょうか。',
    completeClose: 'お気をつけてお越しくださいませ。',
    retry: 'すみません、お電話が少し遠いようです。もう一度だけゆっくりお願いできますでしょうか。',
    unknown: 'ご予約、空席、営業時間、駐車場など、どちらのお問い合わせでしょうか。',
    transfer: '担当に確認しますので、このまま少々お待ちください。',
    sales: 'ご案内ありがとうございます。恐れ入りますが、営業のご提案はお電話ではお受けしておりません。必要があればこちらからご連絡いたします。'
  }
};

export function getReceptionStyle(settings = {}) {
  return receptionStyleProfiles[settings.receptionStyle] || receptionStyleProfiles.izakaya;
}

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
  return { dateTime: '', people: '', name: '', phone: '', seatType: '', children: '', allergy: '', course: '', parking: '', birthday: '', anniversary: '', lateArrival: '', privateRoom: '', customerType: '', pace: '', notes: '', request: '', status: 'draft' };
}


export function createEmptyMemory() {
  return {
    reservationDate: '',
    reservationTime: '',
    partySize: '',
    customerName: '',
    phoneNumber: '',
    children: '',
    allergy: '',
    course: '',
    parking: '',
    birthday: '',
    anniversary: '',
    lateArrival: '',
    privateRoom: '',
    notes: '',
    customerType: '',
    pace: ''
  };
}

function splitReservationDateTime(dateTime = '') {
  const value = String(dateTime || '');
  const time = value.match(/(午前|午後)?\s*\d{1,2}時半?|\d{1,2}:\d{2}|夜|夕方|昼|ランチ|ディナー/)?.[0] || '';
  const date = time ? value.replace(time, '').trim() || value : value;
  return { reservationDate: date, reservationTime: time };
}

export function reservationToMemory(reservation = {}) {
  const { reservationDate, reservationTime } = splitReservationDateTime(reservation.dateTime);
  return {
    ...createEmptyMemory(),
    reservationDate,
    reservationTime,
    partySize: reservation.people || '',
    customerName: reservation.name || '',
    phoneNumber: reservation.phone || '',
    children: reservation.children || '',
    allergy: reservation.allergy || '',
    course: reservation.course || '',
    parking: reservation.parking || '',
    birthday: reservation.birthday || '',
    anniversary: reservation.anniversary || '',
    lateArrival: reservation.lateArrival || '',
    privateRoom: reservation.privateRoom || reservation.seatType || '',
    notes: [reservation.notes, reservation.request].filter(Boolean).join(' / '),
    customerType: reservation.customerType || '',
    pace: reservation.pace || ''
  };
}

function saveReceptionSessionWithMemory(session, storage) {
  const reservation = { ...createEmptyReservation(), ...(session.reservation || {}) };
  return saveVoiceSession({ ...session, reservation, memory: reservationToMemory(reservation) }, storage);
}

export function loadVoiceSession(storage) {
  return {
    stage: 'incoming',
    reservation: createEmptyReservation(),
    memory: createEmptyMemory(),
    lastPrompt: null,
    lastAcknowledgement: '',
    retryCount: 0,
    ...readJson(storage, VOICE_RECEPTION_SESSION_KEY, {})
  };
}

export function saveVoiceSession(session, storage) {
  return writeJson(storage, VOICE_RECEPTION_SESSION_KEY, {
    ...session,
    reservation: { ...createEmptyReservation(), ...(session.reservation || {}) },
    memory: { ...createEmptyMemory(), ...(session.memory || reservationToMemory(session.reservation || {})) }
  });
}

export function resetVoiceSession(storage) {
  return saveVoiceSession({ stage: 'incoming', reservation: createEmptyReservation(), memory: createEmptyMemory(), lastPrompt: null, lastAcknowledgement: '', retryCount: 0 }, storage);
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
  if (/スタッフ|店員|担当|責任者|オーナー|つないで|代わって|転送/.test(value)) return 'transfer';
  if (/怒|クレーム|最悪|急病|救急|事故|緊急|警察|消防/.test(value)) return 'transfer';
  if (/営業時間/.test(value)) return 'faq';
  if (/営業(?!時間)|提案|広告|集客|媒体|取材|代理店|サービス紹介|セールス|売り込み|SEO|求人|決済|電気|通信/.test(value)) return 'sales';
  if (/遅れ|遅刻|遅れそう|遅れます|遅くなり/.test(value)) return 'late';
  if (/キャンセル|取り消し|取消|人数変更|変更したい/.test(value)) return 'cancel';
  if (/貸切|宴会|団体|二次会|歓送迎会|パーティ/.test(value)) return 'private_booking';
  if (/予約|席|名|人数|伺|行き|空いて|空席|来店|お願い|取りたい|個室|カウンター|テーブル|今日の夜|今夜|4人で行きたい/.test(value)) return 'reservation';
  if (/営業時間|何時|定休日|休み|アクセス|場所|住所|駅|駐車場|駐車|パーキング|席数|支払|カード|電子マネー|個室|禁煙|喫煙|テイクアウト|持ち帰り|ベビーカー|子ども|子供|こども|お子|アレルギー|苦手|コース|飲み放題|記念日/.test(value)) return 'faq';
  if (/はい|大丈夫|それで|お願いします|確定|OK|オーケー/.test(value)) return 'confirm';
  if (/違う|キャンセル|やめ|戻/.test(value)) return 'correction';
  return 'unknown';
}


export function detectCustomerMood(text = '') {
  const value = String(text);
  if (/急い|急ぎ|すぐ|今から|あとで|時間ない|急用/.test(value)) return 'rushed';
  if (/怒|クレーム|最悪|ふざけ|責任者/.test(value)) return 'angry';
  if (/初めて|はじめて|初来店/.test(value)) return 'first_time';
  if (/ご年配|年配|高齢|年寄り|耳が遠い|ゆっくり話|ゆっくりで/.test(value)) return 'elderly';
  if (/困|迷|わから|不安|大丈夫|ゆっくり|ゆっくりで/.test(value)) return 'concerned';
  if (/いつも|前にも|常連|この前|また|先週も/.test(value)) return 'regular';
  return 'neutral';
}

function moodPrefix(mood, style) {
  const prefixes = {
    rushed: 'お急ぎですね。すぐ確認いたします。',
    concerned: 'はい、大丈夫です。ゆっくりでかまいません。',
    angry: 'ご不便をおかけして申し訳ございません。すぐ担当に確認いたします。',
    first_time: '初めてのご利用ですね。ありがとうございます。安心してご来店ください。',
    elderly: 'はい、ゆっくりで大丈夫です。ひとつずつ伺いますね。',
    regular: 'いつもありがとうございます。'
  };
  return prefixes[mood] || style.filler;
}


export function detectReceptionPersonality(text = '', reservation = {}, intent = '') {
  const value = String(text || '');
  return {
    firstVisit: reservation.customerType === 'firstVisit' || /初めて|はじめて|初来店/.test(value),
    regular: reservation.customerType === 'regular' || /いつも|前にも|常連|この前|また伺|また行/.test(value),
    rushed: /急い|急ぎ|すぐ|時間ない/.test(value),
    concerned: /困|迷|わから|不安|大丈夫/.test(value),
    elderly: reservation.pace === 'slow' || /ご年配|年配|高齢|年寄り|耳が遠い|ゆっくり話|ゆっくりで/.test(value),
    angry: /怒|クレーム|最悪|責任者/.test(value),
    withChildren: Boolean(reservation.children) || /子ども|子供|こども|お子|ベビーカー/.test(value),
    celebration: Boolean(reservation.birthday || reservation.anniversary) || /誕生日|記念日|お祝い|バースデー/.test(value),
    lateArrival: intent === 'late' || Boolean(reservation.lateArrival),
    cancellation: intent === 'cancel',
    salesCall: intent === 'sales'
  };
}

function stylePhrase(style, restaurantPhrase, izakayaPhrase) {
  return style.label === '居酒屋' ? izakayaPhrase : restaurantPhrase;
}

function completionClosing(style, personality) {
  if (personality.celebration) return 'ありがとうございます。素敵なお時間になるよう、店舗にも共有しておきます。';
  if (personality.withChildren) return 'ありがとうございます。お子様連れの旨も共有しておきますね。';
  if (personality.firstVisit) return stylePhrase(style, 'ありがとうございます。ご来店をお待ちしております。', 'ありがとうございます。お気を付けてお越しください。');
  if (personality.regular) return stylePhrase(style, 'いつもありがとうございます。お待ちしております。', 'いつもありがとうございます。お待ちしております。');
  return stylePhrase(style, 'ありがとうございます。お待ちしております。', 'ありがとうございます。お気を付けてお越しください。');
}

function lateClosing() {
  return 'ご連絡ありがとうございます。お気を付けてお越しください。';
}

function cancelClosing() {
  return 'かしこまりました。またのご利用をお待ちしております。';
}

function salesClosing(style) {
  return `${style.sales} ご連絡ありがとうございました。`;
}

const acknowledgementOptions = {
  rushed: ['お急ぎですね。すぐ確認いたします。', '承知しました。急ぎで伺います。', 'はい、すぐ確認いたします。'],
  elderly: ['はい、ゆっくりで大丈夫です。', 'ありがとうございます。ひとつずつ伺いますね。', '承知いたしました。'],
  concerned: ['はい、大丈夫ですよ。', 'ありがとうございます。ご安心ください。', 'なるほど、確認いたしますね。'],
  angry: ['ご不便をおかけして申し訳ございません。', '恐れ入ります。すぐ確認いたします。', '申し訳ございません。'],
  regular: ['いつもありがとうございます。', '承りました。', 'はい、いつもありがとうございます。'],
  first_time: ['初めてのご利用ですね。ありがとうございます。', '安心してご来店ください。', 'はい、大丈夫ですよ。'],
  neutral: ['ありがとうございます。', '承知しました。', 'かしこまりました。', '承りました。', 'はい、大丈夫です。']
};

export function chooseAcknowledgement({ mood = 'neutral', reservation = {}, session = {}, text = '' } = {}) {
  const personality = detectReceptionPersonality(text, reservation, 'reservation');
  const key = mood !== 'neutral' ? mood : (personality.regular ? 'regular' : personality.firstVisit ? 'first_time' : personality.elderly ? 'elderly' : 'neutral');
  const options = acknowledgementOptions[key] || acknowledgementOptions.neutral;
  const previous = session.lastAcknowledgement || '';
  return options.find((phrase) => phrase !== previous) || options[0];
}

function humanTempoBridge(personality, missing) {
  if (personality.rushed) return '';
  if (personality.elderly) return '少しずつ確認いたしますね。';
  if (personality.concerned || personality.firstVisit) return '安心してご来店いただけるよう、確認いたしますね。';
  if (personality.withChildren) return 'お子様連れですね。店舗にも共有しておきます。';
  if (personality.celebration) return '素敵なお時間になるよう、店舗にも共有いたします。';
  if (missing.includes('name') || missing.includes('phone')) return 'それでは';
  return '';
}

export function normalizeAmbiguousDateTime(text = '') {
  const value = String(text);
  const date = value.match(/今日|明日|明後日|今週|来週|\d{1,2}[月\/\-]\d{1,2}日?|\d{1,2}日|月曜|火曜|水曜|木曜|金曜|土曜|日曜/)?.[0] || '';
  const time = value.match(/午前\s*\d{1,2}時半?|午後\s*\d{1,2}時半?|\d{1,2}時半?|\d{1,2}:\d{2}/)?.[0] || '';
  if (date && time) return `${date}${time}`;
  if (date && /今日の夜|夜|晩|ディナー/.test(value)) return `${date}の夜（18時以降）`;
  if (date && /夕方/.test(value)) return `${date}の夕方（17時頃）`;
  if (date && /昼|ランチ/.test(value)) return `${date}のお昼（12時頃）`;
  if (/今日の夜|今夜/.test(value)) return '今日の夜（18時以降）';
  if (/明日の夜|明日夜/.test(value)) return '明日の夜（18時以降）';
  if (/夕方/.test(value)) return `${date || 'ご希望日'}の夕方（17時頃）`;
  if (/来週/.test(value)) return '来週（曜日とお時間は確認）';
  return '';
}


function isShortUtterance(text = '') {
  return String(text || '').replace(/[、。！？?\s]/g, '').length <= 8;
}

function formatPeopleForSpeech(people = '') {
  return String(people || '').replace(/人$/, '名様').replace(/名$/, '名様');
}

function compactDateForSpeech(dateTime = '') {
  return String(dateTime || '').replace('（18時以降）', '').replace('（17時頃）', '');
}


function extractTimeOnly(text = '') {
  return String(text || '').match(/(?:いや|やっぱり|変更|では)?\s*((?:午前|午後)?\s*\d{1,2}時半?|\d{1,2}:\d{2})/)?.[1]?.replace(/\s+/g, '') || '';
}

function replaceTimeInDateTime(current = '', nextTime = '') {
  if (!nextTime) return current;
  const base = String(current || '').replace(/（.*?）/g, '').replace(/(午前|午後)?\s*\d{1,2}時半?|\d{1,2}:\d{2}|夜|夕方|昼|ランチ|ディナー/g, '').replace(/の$/, '').trim();
  return `${base || 'ご希望日'}${nextTime}`;
}

function buildRecoveryReturnReply(prefixReply, reservation, missing, style, mood, text) {
  const prompt = buildRhythmPrompt(reservation, missing, style, text);
  return `${prefixReply} では、${prompt}`;
}

function rhythmLead(text, reservation, style, mood) {
  if (mood !== 'neutral') return moodPrefix(mood, style);
  const filled = ['dateTime', 'people', 'name', 'phone', 'children', 'allergy', 'course', 'parking', 'birthday', 'anniversary']
    .filter((key) => Boolean(reservation[key])).length;
  if (isShortUtterance(text)) return 'はい。';
  if (filled === 0) return style.reservationStart;
  if (filled % 3 === 0) return 'かしこまりました。';
  if (filled % 2 === 0) return '承知しました。';
  return style.filler;
}

function buildRhythmPrompt(reservation, missing, style, text) {
  const has = (key) => missing.includes(key);
  if (has('dateTime') && reservation.people && isShortUtterance(text)) {
    return `${formatPeopleForSpeech(reservation.people)}ですね。お日にちは本日でよろしいですか？`;
  }
  if (has('people') && reservation.dateTime && isShortUtterance(text)) {
    return `${compactDateForSpeech(reservation.dateTime)}ですね。何名様でいらっしゃいますか？`;
  }
  if (has('dateTime') && has('people')) return 'ご希望のお日にちと人数を伺ってもよろしいでしょうか。';
  if (has('dateTime')) return 'お日にちとお時間を伺ってもよろしいでしょうか。';
  if (has('people')) return '何名様でいらっしゃいますか？';
  if (has('name')) return 'お名前だけお伺いしてもよろしいでしょうか。';
  if (has('phone')) return '最後に、お電話番号だけお願いいたします。';
  return buildMissingPrompt(missing, style, 'neutral');
}

function compactReservationProgress(reservation) {
  const collected = [];
  if (reservation.dateTime) collected.push(compactDateForSpeech(reservation.dateTime));
  if (reservation.people) collected.push(formatPeopleForSpeech(reservation.people));
  if (reservation.name) collected.push(`${reservation.name}様`);
  return collected.length >= 2 ? `${collected.join('、')}で伺っています。` : '';
}

function buildMissingPrompt(missing, style, mood) {
  const has = (key) => missing.includes(key);
  if (has('dateTime') && has('people')) return 'ご希望のお日にち・お時間と、人数をあわせて伺ってもよろしいでしょうか。';
  if (has('dateTime')) return style.dateTime;
  if (has('people')) return style.people;
  if (has('name')) return style.name;
  if (has('phone')) return style.phone;
  const key = missing[0];
  if (key === 'name') return style.name;
  if (key === 'phone') return style.phone;
  return `${reservationFieldLabels[key]}をお伺いできますでしょうか。`;
}

function extractContextualName(text = '', session = {}) {
  if (session.lastPrompt !== 'name') return '';
  const value = String(text).trim();
  if (/予約|お願い|したい|行きたい|やっぱり|いや|\d+人|\d+名|\d+時|\d+:\d+|誕生日|記念日|アレルギー|コース|車/.test(value)) return '';
  return value.match(/^([^、。\s]+?)(?:です|と申します)?$/)?.[1] || '';
}

export function extractReservation(text = '') {
  const people = text.match(/(\d+|[一二三四五六七八九十]+)\s*(名|人)/)?.[0] || '';
  const phone = normalizePhone(text.match(/0\d{1,4}[-ー−―\s]?\d{1,4}[-ー−―\s]?\d{3,4}/)?.[0] || '');
  const dateTime = normalizeAmbiguousDateTime(text)
    || text.match(/(今日|明日|明後日|今週|来週|\d{1,2}月\d{1,2}日?|\d{1,2}日|月曜|火曜|水曜|木曜|金曜|土曜|日曜).{0,24}?(午前|午後|\d{1,2}時半?|\d{1,2}:\d{2})?/)?.[0]
    || '';
  const nameCandidates = [...String(text).matchAll(/(?:名前|氏名|名義|予約名|私は|わたしは|僕は|ぼくは)\s*([^、。\s]+)|([^、。\s]+)\s*(?:です|と申します|に変更)/g)]
    .map((match) => match[1] || match[2] || '')
    .filter((candidate) => candidate && !/予約|お願い|したい|行きたい|電話番号|要望|希望|窓側|個室|今日|明日|明後日|来週|やっぱり|いや|誕生日|記念日|アレルギー|コース|車|\d+人|\d+名|\d+時|\d+:\d+/.test(candidate));
  const inlineName = String(text).match(/\d+\s*(?:人|名)で([^、。\s]+)です/)?.[1] || '';
  const name = nameCandidates.at(-1) || inlineName;
  const seatType = text.match(/(個室|半個室|テーブル|カウンター|窓側|座敷)/)?.[0] || '';
  const privateRoom = text.match(/(個室|半個室)/)?.[0] || '';
  const parking = text.match(/(車\s*\d+台|車で|駐車場|駐車|パーキング)/)?.[0] || '';
  const birthday = text.match(/(誕生日|バースデー|Birthday)/i)?.[0] || '';
  const anniversary = text.match(/(記念日|結婚記念日|お祝い)/)?.[0] || '';
  const lateArrival = text.match(/(遅れそう|遅れます|遅刻|遅れ)/)?.[0] || '';
  const customerType = /いつも|前にも|常連|この前|また伺|また行/.test(text) ? 'regular' : (/初めて|はじめて|初来店/.test(text) ? 'firstVisit' : '');
  const pace = /ご年配|年配|高齢|年寄り|耳が遠い|ゆっくり話|ゆっくりで/.test(text) ? 'slow' : '';
  const children = text.match(/(子ども連れ|子供連れ|こども連れ|お子様|子ども|子供|ベビーカー)/)?.[0] || '';
  const allergy = text.match(/(?:アレルギー|苦手)[:：はを\s]*([^。、]+)?/)?.[0] || '';
  const course = text.match(/(コース|飲み放題|席だけ|アラカルト)/)?.[0] || '';
  const rawRequest = text.match(/(?:要望|お願い|できれば|可能なら|備考)[:：はを\s]*([^。]+)/)?.[1] || '';
  const request = /^(です|します)$/.test(rawRequest) ? '' : rawRequest;
  const notes = [parking, birthday, anniversary, lateArrival].filter(Boolean).join(' / ');
  return { dateTime, people, name, phone, seatType, children, allergy, course, parking, birthday, anniversary, lateArrival, privateRoom, customerType, pace, notes, request };
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
    `お子様連れ: ${reservation.children || '未確認'}`,
    `アレルギー: ${reservation.allergy || '未確認'}`,
    `コース: ${reservation.course || '未確認'}`,
    `駐車場: ${reservation.parking || '未確認'}`,
    `誕生日: ${reservation.birthday || '未確認'}`,
    `記念日: ${reservation.anniversary || '未確認'}`,
    `ご要望: ${reservation.request || reservation.notes || '特になし'}`
  ].join(' / ');
}



function formatShortReservationConfirmation(reservation) {
  const details = [
    reservation.dateTime,
    reservation.people,
    reservation.name ? `${reservation.name}様` : '',
    reservation.seatType,
    reservation.children,
    reservation.allergy,
    reservation.course,
    reservation.parking,
    reservation.birthday,
    reservation.anniversary
  ].filter(Boolean).join('、');
  return details || formatReservationSummary(reservation);
}

function buildReservationFollowUp(reservation, missing, style, mood, text, session = {}) {
  const progress = compactReservationProgress(reservation);
  const personality = detectReceptionPersonality(text, reservation, 'reservation');
  const lead = chooseAcknowledgement({ mood, reservation, session, text });
  const bridge = humanTempoBridge(personality, missing);
  const prompt = buildRhythmPrompt(reservation, missing, style, text);
  return [lead, progress, bridge, prompt].filter(Boolean).join(' ');
}

export function getFaqReply(text, settings) {
  if (/営業時間|何時/.test(text)) return `はい、営業時間は${settings.hours}でございます。ご来店のご予定でしたら、お時間に余裕を持ってお越しくださいませ。`;
  if (/定休日|休み/.test(text)) return `定休日は${settings.closed}です。`;
  if (/アクセス|場所|住所|駅/.test(text)) return `住所は${settings.address}です。`;
  if (/駐車場|駐車|パーキング/.test(text)) return `はい、駐車場は${settings.parking} お車でお越しの際はお気をつけていらしてください。`;
  if (/子ども|子供|こども|お子|ベビーカー/.test(text)) return `はい、${settings.children}`;
  if (/アレルギー|苦手/.test(text)) return `アレルギーについては、${settings.allergy}`;
  if (/コース|飲み放題/.test(text)) return `コースについては、${settings.course}`;
  if (/キャンセル|人数変更/.test(text)) return settings.cancelPolicy;
  if (/遅れ|遅刻|遅れそう|遅れます/.test(text)) return settings.latePolicy;
  if (/貸切|宴会|団体|二次会|歓送迎会|パーティ/.test(text)) return settings.privateBooking;
  if (/席数/.test(text)) return `席数は${settings.seats}です。`;
  if (/支払|カード|電子マネー|QR/.test(text)) return `お支払いは${settings.payment} ご利用いただけます。`;
  if (/個室/.test(text)) return settings.privateRoom;
  if (/禁煙|喫煙|タバコ/.test(text)) return settings.smoking;
  if (/テイクアウト|持ち帰り/.test(text)) return settings.takeout;
  if (/キャンセル|ベビーカー|アレルギー|記念日/.test(text)) return settings.faq;
  return null;
}

function transferReply(settings, reason) {
  const style = getReceptionStyle(settings);
  const prefix = reason ? `${reason}ため、` : '';
  return `恐れ入ります。${prefix}${style.transfer} すぐに代われない場合は折り返しいたしますので、お名前とお電話番号をお伺いできますでしょうか。`;
}

function retryOrTransfer(session, settings, reason, storage) {
  const retryCount = Number(session.retryCount || 0) + 1;
  if (retryCount >= 3) {
    const nextSession = resetVoiceSession(storage);
    return {
      intent: 'transfer',
      session: nextSession,
      record: { kind: 'transfer', intent: 'transfer', status: 'unconfirmed', reason, transcript: '', reply: transferReply(settings, 'お電話の内容を十分に確認できなかった') },
      reply: transferReply(settings, 'お電話の内容を十分に確認できなかった')
    };
  }
  const nextSession = saveVoiceSession({ ...session, retryCount }, storage);
  return {
    intent: reason,
    session: nextSession,
    record: { kind: 'conversation', intent: reason, status: 'retrying', transcript: '', reply: getReceptionStyle(settings).retry },
    reply: getReceptionStyle(settings).retry
  };
}

export function startIncomingCall(storage) {
  const settings = loadStoreSettings(storage);
  const session = saveVoiceSession({ stage: 'greeting', reservation: createEmptyReservation(), memory: createEmptyMemory(), lastPrompt: 'intent', lastAcknowledgement: '', retryCount: 0 }, storage);
  return {
    intent: 'incoming',
    session,
    record: { kind: 'conversation', intent: 'incoming', transcript: 'incoming-call', reply: getReceptionStyle(settings).opening(settings.name) },
    reply: getReceptionStyle(settings).opening(settings.name)
  };
}

export function buildVoiceReply(text, session = null, settings = null, storage) {
  session = session || loadVoiceSession(storage);
  settings = settings || loadStoreSettings(storage);
  const intent = classifyIntent(text);
  const mood = detectCustomerMood(text);
  const extracted = extractReservation(text);
  const contextualName = extractContextualName(text, session);
  if (contextualName && !extracted.name) extracted.name = contextualName;
  const correctedTime = extractTimeOnly(text);
  if (!extracted.dateTime && correctedTime && session.reservation?.dateTime) {
    extracted.dateTime = replaceTimeInDateTime(session.reservation.dateTime, correctedTime);
  }
  const previewReservation = mergeReservation(session.reservation, extracted);
  const personality = detectReceptionPersonality(text, previewReservation, intent);

  if (intent === 'silence' || intent === 'noise') return retryOrTransfer(session, settings, intent, storage);

  if (intent === 'transfer') {
    const reason = mood === 'angry' ? 'ご事情を確認したい' : 'スタッフ対応が必要な内容と判断した';
    const reply = transferReply(settings, reason);
    resetVoiceSession(storage);
    return { intent: 'transfer', session: loadVoiceSession(storage), record: { kind: 'transfer', intent, status: 'unconfirmed', reason: text, transcript: text, reply }, reply };
  }

  if (intent === 'sales') {
    resetVoiceSession(storage);
    const reply = salesClosing(getReceptionStyle(settings));
    return { intent, session: loadVoiceSession(storage), record: { kind: 'sales', intent, transcript: text, status: 'unconfirmed', company: text.match(/([^、。\s]+)(?:です|と申します|の)/)?.[1] || '', summary: text, reply }, reply };
  }

  if (intent === 'late') {
    const reply = `${lateClosing()} ${settings.latePolicy} ご予約名と、どのくらい遅れそうかを伺ってもよろしいでしょうか。`;
    const nextSession = saveVoiceSession({ ...session, stage: 'greeting', retryCount: 0 }, storage);
    return { intent, session: nextSession, record: { kind: 'conversation', intent, transcript: text, reply }, reply };
  }

  if (intent === 'cancel') {
    const reply = `${cancelClosing()} ${settings.cancelPolicy} 確認いたしますので、ご予約名とご予約日時をお伺いできますでしょうか。`;
    const nextSession = saveVoiceSession({ ...session, stage: 'greeting', retryCount: 0 }, storage);
    return { intent, session: nextSession, record: { kind: 'conversation', intent, transcript: text, reply }, reply };
  }

  if (intent === 'private_booking') {
    const reply = `${settings.privateBooking} 差し支えなければ、ご希望日・人数・ご予算感を伺ってもよろしいでしょうか。`;
    const nextSession = saveVoiceSession({ ...session, stage: 'greeting', retryCount: 0 }, storage);
    return { intent, session: nextSession, record: { kind: 'conversation', intent, transcript: text, reply }, reply };
  }

  const faqReply = getFaqReply(text, settings);
  if (intent === 'faq' && faqReply) {
    if (session.stage === 'collecting' || session.stage === 'confirming') {
      const reservation = mergeReservation(session.reservation, extracted);
      const missing = missingReservationFields(reservation);
      const nextField = missing[0] || 'confirm';
      const nextSession = saveReceptionSessionWithMemory({ stage: missing.length ? 'collecting' : 'confirming', reservation, lastPrompt: nextField, lastAcknowledgement: chooseAcknowledgement({ mood, reservation, session, text }), retryCount: 0 }, storage);
      const reply = missing.length
        ? buildRecoveryReturnReply(faqReply, reservation, missing, getReceptionStyle(settings), mood, text)
        : `${faqReply} では、${getReceptionStyle(settings).confirmLead}${formatShortReservationConfirmation(reservation)}ですね。${getReceptionStyle(settings).confirmAsk}`;
      return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'faq_recovery', transcript: text, reply, reservation, status: missing.length ? 'draft' : 'needs_confirmation' }, reply };
    }
    const nextSession = saveVoiceSession({ ...session, stage: 'greeting', retryCount: 0 }, storage);
    return { intent, session: nextSession, record: { kind: 'conversation', intent, transcript: text, reply: faqReply }, reply: faqReply };
  }

  if (intent === 'correction') {
    const nextSession = saveVoiceSession({ ...session, stage: 'collecting', lastPrompt: null, retryCount: 0 }, storage);
    return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'correction', transcript: text, reply: 'かしこまりました。恐れ入りますが、変更後のご希望をもう一度お伺いできますでしょうか。' }, reply: 'かしこまりました。恐れ入りますが、変更後のご希望をもう一度お伺いできますでしょうか。' };
  }

  const reservation = previewReservation;
  const missing = missingReservationFields(reservation);

  if (session.stage === 'confirming' && intent === 'confirm' && missing.length === 0) {
    const completedReservation = { ...reservation, status: 'ai_confirmed' };
    const style = getReceptionStyle(settings);
    const details = [reservation.seatType, reservation.children, reservation.allergy, reservation.course, reservation.parking, reservation.birthday, reservation.anniversary].filter(Boolean).join('、');
    const closing = completionClosing(style, detectReceptionPersonality(text, reservation, intent));
    const reply = `${reservation.dateTime}、${reservation.people}、${reservation.name}様ですね。ご連絡先は${reservation.phone}で控えております。${details ? `${details}も申し伝えます。` : ''}${closing}`;
    resetVoiceSession(storage);
    return { intent: 'reservation', session: loadVoiceSession(storage), record: { kind: 'reservation', intent: 'reservation', transcript: text, reply, status: 'ai_confirmed', reservation: completedReservation }, reply };
  }

  if (intent === 'reservation' || session.stage === 'collecting' || session.stage === 'confirming' || Object.values(extracted).some(Boolean)) {
    if (missing.length > 0) {
      const nextField = missing[0];
      const acknowledgement = chooseAcknowledgement({ mood, reservation, session, text });
      const nextSession = saveReceptionSessionWithMemory({ stage: 'collecting', reservation, lastPrompt: nextField, lastAcknowledgement: acknowledgement, retryCount: 0 }, storage);
      const reply = buildReservationFollowUp(reservation, missing, getReceptionStyle(settings), mood, text, session);
      return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'reservation', transcript: text, reply, reservation, status: 'draft' }, reply };
    }
    const nextSession = saveReceptionSessionWithMemory({ stage: 'confirming', reservation, lastPrompt: 'confirm', lastAcknowledgement: chooseAcknowledgement({ mood, reservation, session, text }), retryCount: 0 }, storage);
    const style = getReceptionStyle(settings);
    const ambiguityNote = /確認|頃|以降|未定/.test(reservation.dateTime) ? 'お時間は目安で伺っていますので、近いお時間で空きを確認いたします。' : '';
    const summaryLead = chooseAcknowledgement({ mood, reservation, session, text });
    const reply = `${summaryLead} ${style.confirmLead}${formatShortReservationConfirmation(reservation)}ですね。${ambiguityNote}${style.confirmAsk}`; 
    return { intent: 'reservation', session: nextSession, record: { kind: 'conversation', intent: 'reservation', transcript: text, reply, reservation, status: 'needs_confirmation' }, reply };
  }

  const retryCount = Number(session.retryCount || 0) + 1;
  if (retryCount >= 3) {
    const reply = transferReply(settings, '想定外の内容が続いた');
    resetVoiceSession(storage);
    return { intent: 'transfer', session: loadVoiceSession(storage), record: { kind: 'transfer', intent: 'unknown', status: 'unconfirmed', reason: text, transcript: text, reply }, reply };
  }

  const nextSession = saveVoiceSession({ ...session, retryCount }, storage);
  const style = getReceptionStyle(settings);
  const reply = `${moodPrefix(mood, style)} ${style.unknown}`;
  return { intent: 'unknown', session: nextSession, record: { kind: 'conversation', intent: 'unknown', transcript: text, reply }, reply };
}

import {
  buildVoiceReply,
  createMemoryStorage,
  loadVoiceRecords,
  loadVoiceSession,
  saveStoreSettings,
  saveVoiceRecord,
  startIncomingCall
} from '../src/voice-reception.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function send(storage, text) {
  const result = buildVoiceReply(text, loadVoiceSession(storage), undefined, storage);
  saveVoiceRecord({ ...result.record, intent: result.intent, transcript: text, reply: result.reply }, storage);
  return result;
}

function runReservationSuccess() {
  const storage = createMemoryStorage();
  const incoming = startIncomingCall(storage);
  assert(incoming.reply.includes('ご予約'), 'incoming call greeting should explain reservations');
  let result = send(storage, '明日の19時に4名で予約したいです。田中です。電話番号は090-1234-5678です。要望は窓側です。');
  assert(result.reply.includes('念のため確認'), 'complete reservation should ask for confirmation naturally');
  result = send(storage, 'はい');
  assert(result.reply.includes('ありがとうございます。') && result.reply.includes('田中様ですね'), 'confirmation should complete reservation naturally');
  assert(loadVoiceRecords(storage).some((record) => record.kind === 'reservation' && record.status === 'ai_confirmed'), 'reservation record should be saved as ai_confirmed');
}

function runFaqSuccess() {
  const storage = createMemoryStorage();
  const result = send(storage, '駐車場はありますか');
  assert(result.intent === 'faq', 'parking question should be FAQ');
  assert(result.reply.includes('駐車場'), 'FAQ reply should answer parking');
}

function runSalesSuccess() {
  const storage = createMemoryStorage();
  const result = send(storage, 'SEO集客サービスの営業です');
  assert(result.intent === 'sales', 'sales text should be classified as sales');
  assert(result.reply.includes('営業のご提案はお電話ではお受けしておりません'), 'sales reply should protect owner time');
  assert(loadVoiceRecords(storage).some((record) => record.kind === 'sales'), 'sales log should be stored separately');
}

function runTransferSuccess() {
  const storage = createMemoryStorage();
  let result = send(storage, 'スタッフにつないでください');
  assert(result.intent === 'transfer', 'human request should transfer');
  assert(result.reply.includes('担当に確認'), 'transfer reply should mention staff handoff');

  const retryStorage = createMemoryStorage();
  send(retryStorage, '');
  send(retryStorage, '');
  result = send(retryStorage, '');
  assert(result.intent === 'transfer', 'three silent turns should transfer');
}

function runReceptionStyleSwitch() {
  const restaurantStorage = createMemoryStorage();
  saveStoreSettings({ receptionStyle: 'restaurant' }, restaurantStorage);
  let result = startIncomingCall(restaurantStorage);
  assert(result.reply.includes('でございます'), 'restaurant style should use polished restaurant wording');

  const izakayaStorage = createMemoryStorage();
  saveStoreSettings({ receptionStyle: 'izakaya' }, izakayaStorage);
  result = startIncomingCall(izakayaStorage);
  assert(result.reply.includes('空席の確認'), 'izakaya style should use casual dining wording');
}

function runContextAndEmotionPolish() {
  const rushedStorage = createMemoryStorage();
  let result = buildVoiceReply('急いでます、今日の夜に2名で予約できますか', loadVoiceSession(rushedStorage), undefined, rushedStorage);
  assert(result.reply.includes('お急ぎですね'), 'rushed customer should get a quick cushion phrase');
  assert(result.session.memory.reservationDate.includes('今日'), 'ambiguous night wording should be stored naturally');
  assert(!result.reply.includes('ご希望のお日にち・お時間'), 'known date/time should not be asked again');

  result = buildVoiceReply('田中です', loadVoiceSession(rushedStorage), undefined, rushedStorage);
  assert(result.session.reservation.name === '田中', 'contextual name should be captured from prior prompt');

  const firstTimeStorage = createMemoryStorage();
  result = buildVoiceReply('初めてなんですが、来週の夕方に3名で予約したいです', loadVoiceSession(firstTimeStorage), undefined, firstTimeStorage);
  assert(result.reply.includes('初めてのご利用ですね'), 'first-time customer should get a reassuring phrase');
  assert(result.session.reservation.dateTime.includes('来週'), 'relative week wording should be retained for confirmation');
}


function runRestaurantRequiredScenarios() {
  const cases = [
    ['予約したい', 'reservation', 'ご希望のお日にちと人数'],
    ['今日の夜空いてる？', 'reservation', '今日の夜'],
    ['4人で行きたい', 'reservation', '4名様'],
    ['駐車場ありますか？', 'faq', '駐車場'],
    ['営業時間は？', 'faq', '営業時間'],
    ['子ども連れでも大丈夫？', 'faq', 'お子様連れ'],
    ['アレルギー対応できますか？', 'faq', 'アレルギー'],
    ['SEO集客サービスの営業です', 'sales', '営業のご提案'],
    ['予約の時間に遅れます', 'late', '遅れそう'],
    ['キャンセルしたい', 'cancel', 'ご予約名']
  ];

  for (const [text, expectedIntent, expectedReply] of cases) {
    const storage = createMemoryStorage();
    const result = send(storage, text);
    assert(result.intent === expectedIntent, `${text} should be ${expectedIntent}`);
    assert(result.reply.includes(expectedReply), `${text} should include ${expectedReply}`);
  }
}


function runReceptionMemoryEngine() {
  const storage = createMemoryStorage();
  let result = send(storage, '今日の夜4人です');
  assert(result.session.memory.reservationDate.includes('今日'), 'memory should keep reservation date');
  assert(result.session.memory.partySize === '4人', 'memory should keep party size');
  assert(!result.reply.includes('何名様'), 'known party size must not be asked again');
  assert(result.reply.includes('お名前'), 'next missing slot should be customer name');

  result = send(storage, 'やっぱり5人です');
  assert(result.session.memory.partySize === '5人', 'party size correction should overwrite prior value');

  result = send(storage, '佐藤です');
  assert(result.session.memory.customerName === '佐藤', 'name should be stored from short answer');

  result = send(storage, '田中に変更で');
  assert(result.session.memory.customerName === '田中', 'name correction should overwrite prior name');

  result = send(storage, '子どもいます。車2台です。誕生日なんです。アレルギーあります。コース希望です。');
  assert(result.session.memory.children, 'children should be stored in memory');
  assert(result.session.memory.parking.includes('車'), 'parking note should be stored in memory');
  assert(result.session.memory.birthday, 'birthday should be stored in memory');
  assert(result.session.memory.allergy, 'allergy should be stored in memory');
  assert(result.session.memory.course, 'course should be stored in memory');

  result = send(storage, '明日の19時に変更で');
  assert(result.session.memory.reservationDate.includes('明日'), 'reservation date correction should update memory');
}

function runCancellationChangeMemory() {
  const storage = createMemoryStorage();
  const result = send(storage, 'キャンセルしたいけど、やっぱり明日の19時に変更したい');
  assert(result.intent === 'cancel', 'cancel/change wording should route to cancellation confirmation first');
  assert(result.reply.includes('ご予約名'), 'cancellation change should ask for booking identity');
}


function runPhase7ConversationRhythm() {
  let storage = createMemoryStorage();
  let result = send(storage, '急いで予約したいです');
  assert(result.reply.includes('お急ぎですね'), 'rushed booking should get a brief urgency cushion');

  storage = createMemoryStorage();
  result = send(storage, 'ゆっくりでいいですか、予約したいです');
  assert(result.reply.includes('ゆっくり'), 'elderly/slow caller should get a calm reply');

  storage = createMemoryStorage();
  result = send(storage, '今日空いてる？');
  assert(result.reply.includes('何名様でいらっしゃいますか'), 'today-only availability should ask party size briefly');

  storage = createMemoryStorage();
  result = send(storage, '4人で');
  assert(result.reply.includes('4名様ですね'), 'short party-size reply should be acknowledged briefly');
  assert(!result.reply.includes('何名様'), 'known party size should not be asked again');

  storage = createMemoryStorage();
  result = send(storage, '田中です');
  assert(result.reply.length < 60, 'short name-first caller should get a short reply');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人で田中です');
  result = send(storage, 'お願いします');
  assert(result.reply.includes('お電話番号だけ'), 'missing phone should be requested briefly');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人で田中です');
  result = send(storage, 'やっぱり5人で');
  assert(result.session.memory.partySize === '5人', 'party-size correction should update rhythm memory');

  storage = createMemoryStorage();
  result = send(storage, '駐車場だけ聞きたいです');
  assert(result.intent === 'faq' && result.reply.includes('駐車場'), 'parking-only caller should get direct FAQ reply');

  storage = createMemoryStorage();
  result = send(storage, '広告掲載の営業です');
  assert(result.intent === 'sales' && result.reply.includes('営業のご提案'), 'sales call should stay polite and brief');

  storage = createMemoryStorage();
  result = send(storage, 'キャンセルの連絡です');
  assert(result.intent === 'cancel' && result.reply.includes('ご予約名'), 'cancellation call should ask booking identity');
}


function runPhase8ConversationRecovery() {
  let storage = createMemoryStorage();
  send(storage, '今日の夜お願いします');
  let result = send(storage, '駐車場あります？');
  assert(result.reply.includes('駐車場') && result.reply.includes('では、'), 'mid-reservation FAQ should answer and recover');
  result = send(storage, '4人です');
  assert(result.session.memory.partySize === '4人', 'interrupted party size should be saved');

  storage = createMemoryStorage();
  send(storage, '4人です');
  result = send(storage, 'やっぱり5人です');
  assert(result.session.memory.partySize === '5人', 'rephrased party size should overwrite old value');

  storage = createMemoryStorage();
  send(storage, '今日の夜で');
  result = send(storage, 'いや6時半');
  assert(result.session.memory.reservationTime === '6時半', 'self-corrected time should keep latest time only');

  storage = createMemoryStorage();
  result = send(storage, '山田です');
  assert(result.session.memory.customerName === '山田', 'name-first jump should be stored');
  result = send(storage, '今日の夜');
  assert(result.session.memory.reservationDate.includes('今日'), 'date after name should be stored');
  result = send(storage, '電話番号は後で');
  assert(result.reply.includes('何名様') || result.reply.includes('お電話番号'), 'deferred phone should keep asking only missing slots');
  result = send(storage, '4人');
  assert(result.session.memory.partySize === '4人', 'party after topic jump should be stored');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人で田中です');
  result = send(storage, '営業時間何時まで？');
  assert(result.reply.includes('営業時間') && result.reply.includes('では、'), 'hours FAQ should recover to reservation');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人で田中です');
  result = send(storage, 'やっぱキャンセルで');
  assert(result.intent === 'cancel', 'mid-reservation cancellation should switch to cancel flow');

  storage = createMemoryStorage();
  send(storage, '明日19時4人で田中です。電話番号は090-1234-5678です');
  result = send(storage, '6人になります');
  assert(result.session.memory.partySize === '6人', 'late party size change should update confirmation memory');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人で田中です');
  result = send(storage, '佐藤です');
  assert(result.session.memory.customerName === '佐藤', 'name correction should update memory');

  storage = createMemoryStorage();
  send(storage, '今日の夜');
  result = send(storage, 'アレルギーあります');
  assert(result.session.memory.allergy, 'allergy interruption should be stored in reservation memory');

  storage = createMemoryStorage();
  send(storage, '今日の夜');
  result = send(storage, '個室がいいです');
  assert(result.session.memory.privateRoom, 'private room interruption should be stored');

  storage = createMemoryStorage();
  send(storage, '今日の夜');
  result = send(storage, '子どもいます');
  assert(result.session.memory.children, 'children interruption should be stored');

  storage = createMemoryStorage();
  send(storage, '今日の夜');
  result = send(storage, '誕生日です');
  assert(result.session.memory.birthday, 'birthday interruption should be stored');

  storage = createMemoryStorage();
  send(storage, '今日の夜');
  result = send(storage, 'コースで');
  assert(result.session.memory.course, 'course interruption should be stored');
}


function completeReservation(storage, initialText) {
  send(storage, initialText);
  return send(storage, 'はい');
}

function runPhase9ReceptionPersonality() {
  let storage = createMemoryStorage();
  let result = send(storage, '初めてなんですが、今日の夜2人で予約したいです。田中です。電話番号は090-1111-2222です');
  assert(result.reply.includes('念のため確認'), 'first-visit booking should reach confirmation');
  result = send(storage, 'はい');
  assert(result.reply.includes('ご来店をお待ちしております') || result.reply.includes('お気を付けて'), 'first-visit completion should close naturally');

  storage = createMemoryStorage();
  result = completeReservation(storage, 'いつも行ってます。今日の夜2人で予約したいです。佐藤です。電話番号は090-1111-2222です');
  assert(result.reply.includes('いつもありがとうございます'), 'regular-style booking should acknowledge regular caller');

  storage = createMemoryStorage();
  result = send(storage, '急いでます、今日の夜2人で予約したいです');
  assert(result.reply.includes('お急ぎですね'), 'rushed caller should get personality-aware urgency wording');

  storage = createMemoryStorage();
  result = send(storage, '初めてで不安なんですが予約できますか');
  assert(result.reply.includes('初めてのご利用ですね') || result.reply.includes('大丈夫'), 'concerned or first-time caller should be reassured');

  storage = createMemoryStorage();
  result = send(storage, '子ども連れで今日の夜3人です。田中です。電話番号は090-1111-2222です');
  result = send(storage, 'はい');
  assert(result.reply.includes('お子様連れの旨'), 'children completion should mention sharing with the store');

  storage = createMemoryStorage();
  result = completeReservation(storage, '誕生日で今日の夜2人です。田中です。電話番号は090-1111-2222です');
  assert(result.reply.includes('素敵なお時間'), 'birthday completion should use celebration closing');

  storage = createMemoryStorage();
  result = send(storage, '遅れます');
  assert(result.reply.includes('ご連絡ありがとうございます') && result.reply.includes('お気を付けて'), 'late arrival should close politely');

  storage = createMemoryStorage();
  result = send(storage, 'キャンセルです');
  assert(result.reply.includes('またのご利用'), 'cancellation should close naturally');

  storage = createMemoryStorage();
  result = send(storage, '広告掲載の営業です');
  assert(result.reply.includes('営業のご提案はお電話ではお受けしておりません'), 'sales call should be declined politely');

  const izakayaStorage = createMemoryStorage();
  saveStoreSettings({ receptionStyle: 'izakaya' }, izakayaStorage);
  result = startIncomingCall(izakayaStorage);
  assert(result.reply.includes('空席の確認'), 'izakaya personality should be brighter and tempo-friendly');

  const restaurantStorage = createMemoryStorage();
  saveStoreSettings({ receptionStyle: 'restaurant' }, restaurantStorage);
  result = startIncomingCall(restaurantStorage);
  assert(result.reply.includes('でございます'), 'restaurant personality should be calmer and polite');
}


function runPhase10HumanConversationEngine() {
  let storage = createMemoryStorage();
  let result = send(storage, '今日の夜');
  const firstAck = result.session.lastAcknowledgement;
  result = send(storage, '4人');
  assert(result.session.lastAcknowledgement !== firstAck, 'acknowledgement should not repeat on consecutive turns');
  assert(result.reply.includes('4名様') && result.reply.includes('ありがとうございます') === false, 'second turn should organize information without repeating the first acknowledgement');

  storage = createMemoryStorage();
  result = send(storage, '4人');
  assert(result.reply.includes('4名様ですね') && result.reply.length < 80, 'short party-size caller should get a short human-paced reply');

  storage = createMemoryStorage();
  result = send(storage, 'ご年配なのでゆっくり話してください。予約です');
  assert((result.reply.includes('ゆっくり') && result.reply.includes('ひとつずつ')) || result.reply.includes('少しずつ'), 'elderly caller should get slower reassurance');

  storage = createMemoryStorage();
  result = send(storage, '困っていて、初めてなんですが今日の夜2人で行けますか');
  assert(result.reply.includes('安心') || result.reply.includes('大丈夫'), 'concerned first-time caller should be reassured');

  storage = createMemoryStorage();
  result = send(storage, '子ども連れで今日の夜4人です');
  assert(result.reply.includes('お子様連れですね') && result.reply.includes('共有'), 'children context should receive an immediate warm reaction');

  storage = createMemoryStorage();
  result = send(storage, '誕生日で今日の夜2人です');
  assert(result.reply.includes('素敵なお時間') && result.reply.includes('共有'), 'celebration context should receive a warm reaction');

  storage = createMemoryStorage();
  result = completeReservation(storage, '記念日で今日の夜2人です。山田です。電話番号は090-1111-2222です');
  assert(result.reply.includes('素敵なお時間'), 'anniversary completion should close warmly');

  storage = createMemoryStorage();
  result = send(storage, 'クレームです、責任者いますか');
  assert(result.reply.includes('申し訳ございません') || result.reply.includes('ご事情'), 'angry caller should start with apology or careful handoff');

  storage = createMemoryStorage();
  result = send(storage, '遅刻します');
  assert(result.reply.includes('お気を付けてお越しください'), 'late arrival should close with safe-arrival wording');

  storage = createMemoryStorage();
  result = send(storage, 'キャンセルしたいです');
  assert(result.reply.includes('またのご利用をお待ちしております'), 'cancellation should close with a natural ending');

  storage = createMemoryStorage();
  result = send(storage, '広告掲載の営業です');
  assert(result.reply.includes('ご連絡ありがとうございました'), 'sales call should end politely');

  storage = createMemoryStorage();
  send(storage, '今日の夜4人です');
  result = send(storage, '田中です');
  assert(result.reply.includes('今日の夜') && result.reply.includes('4名様') && result.reply.includes('田中様'), 'longer reservation should keep organizing known information');
}

function runExceptionSuccess() {
  const storage = createMemoryStorage();
  const result = send(storage, undefined);
  assert(result.reply.includes('もう一度'), 'undefined/empty input should be handled safely');
}

runReservationSuccess();
runFaqSuccess();
runSalesSuccess();
runTransferSuccess();
runReceptionStyleSwitch();
runContextAndEmotionPolish();
runRestaurantRequiredScenarios();
runReceptionMemoryEngine();
runCancellationChangeMemory();
runPhase7ConversationRhythm();
runPhase8ConversationRecovery();
runPhase9ReceptionPersonality();
runPhase10HumanConversationEngine();
runExceptionSuccess();
console.log('Voice reception flow tests passed');

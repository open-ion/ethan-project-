import {
  buildVoiceReply,
  createMemoryStorage,
  loadVoiceRecords,
  loadVoiceSession,
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
  assert(result.reply.includes('確認します'), 'complete reservation should ask for confirmation');
  result = send(storage, 'はい');
  assert(result.reply.includes('予約を受付しました'), 'confirmation should complete reservation');
  const reservationRecord = loadVoiceRecords(storage).find((record) => record.kind === 'reservation' && record.status === 'ai_confirmed');
  assert(reservationRecord, 'reservation record should be saved as ai_confirmed');
  assert(reservationRecord.notification?.body.includes('090-1234-5678'), 'reservation notification should include customer phone');
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
  assert(result.reply.includes('直接のお取次ぎはしておりません'), 'sales reply should protect owner time');
  const salesRecord = loadVoiceRecords(storage).find((record) => record.kind === 'sales');
  assert(salesRecord, 'sales log should be stored separately');
  assert(salesRecord.notification?.title.includes('営業電話'), 'sales log should create a staff notification');
}

function runTransferSuccess() {
  const storage = createMemoryStorage();
  let result = send(storage, 'スタッフにつないでください');
  assert(result.intent === 'transfer', 'human request should transfer');
  assert(result.reply.includes('店舗スタッフへ引き継ぎます'), 'transfer reply should mention staff handoff');
  assert(loadVoiceRecords(storage).some((record) => record.kind === 'transfer' && record.notification?.type === 'transfer'), 'transfer should create a staff notification');

  const retryStorage = createMemoryStorage();
  send(retryStorage, '');
  send(retryStorage, '');
  result = send(retryStorage, '');
  assert(result.intent === 'transfer', 'three silent turns should transfer');
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
runExceptionSuccess();
console.log('Voice reception flow tests passed');

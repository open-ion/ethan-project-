import {
  buildVoiceReply,
  createMemoryStorage,
  loadStoreSettings,
  loadVoiceSession,
  saveVoiceRecord,
  startIncomingCall
} from './voice-reception.js';

const callStores = new Map();
const MAX_CALL_STORES = 100;

function getCallStorage(callSid = 'local-call') {
  if (!callStores.has(callSid)) {
    if (callStores.size >= MAX_CALL_STORES) callStores.delete(callStores.keys().next().value);
    callStores.set(callSid, createMemoryStorage());
  }
  return callStores.get(callSid);
}

function escapeXml(value = '') {
  return String(value).replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  }[char]));
}

function voiceResponse(inner) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${inner}</Response>`;
}

function say(text) {
  return `<Say language="ja-JP" voice="alice">${escapeXml(text)}</Say>`;
}

function gather(prompt, action = '/api/twilio/respond') {
  return `<Gather input="speech" language="ja-JP" speechTimeout="auto" action="${action}" method="POST">${say(prompt)}</Gather>`;
}

function buildContinueTwiml(reply, action) {
  return voiceResponse(`${gather(reply, action)}${say('お電話ありがとうございました。失礼いたします。')}`);
}

export function parseTwilioBody(rawBody = '') {
  return Object.fromEntries(new URLSearchParams(rawBody));
}

export function createIncomingCallTwiml({ callSid = 'local-call', action = '/api/twilio/respond' } = {}) {
  const storage = getCallStorage(callSid);
  const result = startIncomingCall(storage);
  saveVoiceRecord({ ...result.record, intent: result.intent, reply: result.reply }, storage);
  return buildContinueTwiml(result.reply, action);
}

export function createSpeechResponseTwiml({ callSid = 'local-call', speechResult = '', action = '/api/twilio/respond' } = {}) {
  const storage = getCallStorage(callSid);
  const settings = loadStoreSettings(storage);
  const session = loadVoiceSession(storage);
  const result = buildVoiceReply(speechResult, session, settings, storage);
  saveVoiceRecord({ ...result.record, intent: result.intent, transcript: speechResult, reply: result.reply }, storage);
  return buildContinueTwiml(result.reply, action);
}

export async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

export async function handleTwilioVoiceRequest(request, response, { mode = 'incoming' } = {}) {
  const rawBody = request.method === 'POST' ? await readRequestBody(request) : '';
  const params = parseTwilioBody(rawBody);
  const callSid = params.CallSid || 'local-call';
  const action = '/api/twilio/respond';
  const twiml = mode === 'respond'
    ? createSpeechResponseTwiml({ callSid, speechResult: params.SpeechResult || '', action })
    : createIncomingCallTwiml({ callSid, action });

  response.writeHead(200, { 'Content-Type': 'text/xml; charset=utf-8' });
  response.end(twiml);
}

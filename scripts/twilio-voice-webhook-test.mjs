import {
  createIncomingCallTwiml,
  createSpeechResponseTwiml,
  parseTwilioBody
} from '../src/twilio-voice-webhook.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const parsed = parseTwilioBody('CallSid=CA123&SpeechResult=%E4%BA%88%E7%B4%84%E3%81%97%E3%81%9F%E3%81%84');
assert(parsed.CallSid === 'CA123', 'CallSid should be parsed from Twilio form body');
assert(parsed.SpeechResult === '予約したい', 'SpeechResult should be decoded from Twilio form body');

const incoming = createIncomingCallTwiml({ callSid: 'CA-test', action: '/api/twilio/respond' });
assert(incoming.includes('<Response>'), 'incoming webhook should return TwiML Response');
assert(incoming.includes('<Gather'), 'incoming webhook should gather speech');
assert(incoming.includes('ja-JP'), 'incoming webhook should use Japanese speech settings');
assert(incoming.includes('ご予約'), 'incoming webhook should greet and explain reservations');

const response = createSpeechResponseTwiml({ callSid: 'CA-test', speechResult: '明日の19時に2名で予約したいです。佐藤です。電話番号は090-1111-2222です。', action: '/api/twilio/respond' });
assert(response.includes('<Response>'), 'speech webhook should return TwiML Response');
assert(response.includes('<Gather'), 'speech webhook should continue gathering');
assert(response.includes('確認'), 'speech webhook should reply with reservation confirmation flow');

const transfer = createSpeechResponseTwiml({ callSid: 'CA-transfer', speechResult: 'スタッフにつないでください', action: '/api/twilio/respond' });
assert(transfer.includes('店舗スタッフ'), 'transfer speech should route to staff handoff');

console.log('Twilio voice webhook tests passed');

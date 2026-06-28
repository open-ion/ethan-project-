import { handleTwilioVoiceRequest } from '../../src/twilio-voice-webhook.js';

export default async function handler(request, response) {
  return handleTwilioVoiceRequest(request, response, { mode: 'respond' });
}

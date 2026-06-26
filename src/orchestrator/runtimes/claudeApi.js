// AGATHON LABS — Anthropic Messages API client
//
// Minimal, dependency-free client for POST /v1/messages, matching the repo's
// existing raw-fetch style (see scripts/summarize-news.mjs). Used by the
// claude-code runtime to actually run an agent on a Claude model.
//
// Env:
//   ANTHROPIC_API_KEY   required — the API key (x-api-key header)
//   ANTHROPIC_BASE_URL  optional — defaults to https://api.anthropic.com
//                       (override for gateways/proxies or local testing)
//   AGATHON_CLAUDE_MODEL optional — defaults to claude-opus-4-8
//
// Notes anchored to the current API:
//   - header is `x-api-key` + `anthropic-version: 2023-06-01`
//   - on Opus 4.8, sampling params (temperature/top_p/top_k) are rejected; we
//     send none. Thinking is optional and omitted by default.
//   - a 200 response can carry stop_reason "refusal" with empty/partial
//     content — we check stop_reason BEFORE reading content.

export const DEFAULT_MODEL = 'claude-opus-4-8';
export const ANTHROPIC_VERSION = '2023-06-01';

/**
 * Call the Anthropic Messages API once and return the assistant text.
 * @param {Object} opts
 * @param {string} opts.prompt              User message content (the task).
 * @param {string} [opts.system]            System prompt (the agent persona).
 * @param {string} [opts.model]             Model id.
 * @param {number} [opts.maxTokens]         max_tokens (default 1024).
 * @param {string} [opts.apiKey]            Override ANTHROPIC_API_KEY.
 * @param {string} [opts.baseUrl]           Override ANTHROPIC_BASE_URL.
 * @param {number} [opts.timeoutMs]         Abort after N ms (default 60000).
 * @param {typeof fetch} [opts.fetchImpl]   Inject a fetch (for tests).
 * @returns {Promise<{ text: string, usage: object, model: string, stopReason: string }>}
 */
export async function callClaude({
  prompt,
  system,
  model = process.env.AGATHON_CLAUDE_MODEL || DEFAULT_MODEL,
  maxTokens = Number(process.env.AGATHON_MAX_TOKENS || 1024),
  apiKey = process.env.ANTHROPIC_API_KEY,
  baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
  timeoutMs = Number(process.env.AGATHON_TIMEOUT_MS || 60000),
  fetchImpl = fetch,
} = {}) {
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');
  if (!prompt) throw new Error('callClaude requires a prompt');

  const url = `${baseUrl.replace(/\/+$/, '')}/v1/messages`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Anthropic API HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    // Guard refusals before touching content (content may be empty/partial).
    if (data.stop_reason === 'refusal') {
      throw new Error(
        `Anthropic API refused the request (category: ${data.stop_details?.category ?? 'unknown'})`,
      );
    }

    const text = extractText(data);
    return { text, usage: data.usage || {}, model: data.model || model, stopReason: data.stop_reason };
  } finally {
    clearTimeout(timer);
  }
}

/** Concatenate the text blocks of a Messages API response. */
export function extractText(data) {
  return (data?.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

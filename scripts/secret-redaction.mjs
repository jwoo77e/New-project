const marker = "[REDACTED]";

// Redact before shortening errors. A provider may echo all or part of a key,
// including in a URL, a JSON error, or a JSON parser's exception message.
export function redactSecrets(value, secrets = []) {
  let text = String(value ?? "알 수 없는 오류");
  const variants = new Set();
  for (const secret of secrets) {
    if (typeof secret !== "string" || !secret) continue;
    variants.add(secret);
    variants.add(encodeURIComponent(secret));
    variants.add(JSON.stringify(secret).slice(1, -1));
  }
  for (const secret of [...variants].sort((a, b) => b.length - a.length)) {
    text = text.split(secret).join(marker);
  }
  return text
    .replace(/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z]+ )?PRIVATE KEY-----/g, marker)
    .replace(/\bsk-[A-Za-z0-9*._-]{6,}/g, marker)
    .replace(/\bAIza[A-Za-z0-9*._-]{10,}/g, marker)
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, marker)
    .replace(/\b(Bearer|Basic)\s+[^\s"',;<>]+/gi, `$1 ${marker}`)
    .replace(/([?&](?:key|api[_-]?key|access_token|refresh_token|token|client_secret)=)[^&#\s"'<>]+/gi, `$1${marker}`)
    .replace(/(["']?(?:x-api-key|x-goog-api-key|api_key|access_token|refresh_token|client_secret)["']?\s*[:=]\s*["']?)[^\s"',;}<>]+/gi, `$1${marker}`);
}

export function redactSecretData(value, secrets = []) {
  if (typeof value === "string") return redactSecrets(value, secrets);
  if (Array.isArray(value)) return value.map((item) => redactSecretData(item, secrets));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactSecretData(item, secrets)]));
  }
  return value;
}

export function redactRequestError(error, url, options = {}) {
  const secrets = [];
  const headers = new Headers(options.headers);
  for (const name of ["authorization", "x-api-key", "x-goog-api-key"]) {
    const credential = headers.get(name);
    if (credential) secrets.push(credential.replace(/^(?:Bearer|Basic)\s+/i, ""));
  }
  const params = new URL(url).searchParams;
  for (const [name, value] of params) {
    if (/^(?:key|api[_-]?key|access_token|refresh_token|token|client_secret)$/i.test(name)) secrets.push(value);
  }
  if (options.body instanceof URLSearchParams || typeof options.body === "string") {
    for (const [name, value] of new URLSearchParams(options.body)) {
      if (/^(?:assertion|access_token|refresh_token|client_secret)$/i.test(name)) secrets.push(value);
    }
  }
  return redactSecrets(error instanceof Error ? error.message : error, secrets);
}

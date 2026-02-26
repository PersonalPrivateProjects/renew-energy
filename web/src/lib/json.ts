// src/lib/json.ts
export function tryParseJson<T = unknown>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    const value = JSON.parse(text);
    return { ok: true, value };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "JSON inválido" };
  }
}

export function prettifyJson(text: string): string {
  const res = tryParseJson(text);
  if (res.ok) return JSON.stringify(res.value, null, 2);
  return text; // si no es JSON válido, deja tal cual
}
// lib/admin/client-api.ts
// POST JSON a los route handlers de admin desde el dashboard (cliente).
// Same-origin: el navegador manda Origin y las cookies de sesión.

export interface AdminApiResult {
  status: number;
  ok: boolean;
  data: Record<string, unknown>;
}

export async function adminPost(url: string, body: unknown): Promise<AdminApiResult> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, ok: res.ok, data };
  } catch {
    return { status: 0, ok: false, data: {} };
  }
}

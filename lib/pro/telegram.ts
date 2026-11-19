// lib/pro/telegram.ts
// Aviso interno por Telegram (Bot API, sendMessage). Texto plano, sin
// parse_mode, para que ningún dato del lead se interprete como formato.
// Nunca loguea el token ni el cuerpo del mensaje.
import 'server-only';

export type ChannelStatus = 'sent' | 'error' | 'skipped';

export interface ChannelResult {
  status: ChannelStatus;
  /** Motivo corto, sin datos personales. */
  error?: string;
}

const TIMEOUT_MS = 5_000;
const MAX_TEXT = 4_000; // límite de Telegram: 4096

export async function sendTelegramMessage(text: string): Promise<ChannelResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { status: 'skipped', error: 'not_configured' };

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage respondió', res.status);
      return { status: 'error', error: `http_${res.status}` };
    }
    return { status: 'sent' };
  } catch (err) {
    const name = err instanceof Error ? err.name : 'unknown';
    const reason = name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network';
    console.error('[telegram] sendMessage falló:', reason);
    return { status: 'error', error: reason };
  }
}

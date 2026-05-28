
export const BASE_URL = 'https://talia-lemon.vercel.app';

export async function sendTelegramNotification(message: string, target: 'Grinch' | 'Cindy' | 'Both' = 'Both') {
  const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const grinchChatId = process.env.NEXT_PUBLIC_TELEGRAM_GRINCH_CHAT_ID;
  const cindyChatId = process.env.NEXT_PUBLIC_TELEGRAM_CINDY_CHAT_ID;

  if (!token) {
    console.warn('Telegram token is not set');
    return;
  }

  const chatIds: string[] = [];
  if (target === 'Grinch' || target === 'Both') {
    if (grinchChatId) chatIds.push(grinchChatId);
  }
  if (target === 'Cindy' || target === 'Both') {
    if (cindyChatId) chatIds.push(cindyChatId);
  }

  if (chatIds.length === 0) {
    console.warn('No Chat IDs provided for Telegram notification');
    return;
  }

  for (const chatId of chatIds) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Error sending Telegram message:', error);
    }
  }
}

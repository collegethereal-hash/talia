'use server';

import { parrotModel } from '@/lib/gemini';

export async function chatWithKoko(message: string) {
  try {
    const result = await parrotModel.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Koko AI Error:', error);
    return "Каррр! Что-то в море неспокойно, не могу сейчас говорить. Попробуй позже, когда шторм утихнет! 🦜🌊";
  }
}

import { GoogleGenAI } from '@google/genai';
import { ENV } from '@config/env';

// Khởi tạo AudioContext (một instance cho toàn bộ ứng dụng)
let audioCtx: AudioContext | null = null;

const initAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

// Gemini TTS trả về RAW PCM 16-bit, sample rate 24kHz
// Cần decode từ base64 rồi phát qua Web Audio API
const playPCMBase64 = async (base64str: string): Promise<void> => {
  const ctx = initAudioContext();

  // Giải mã base64 → Uint8Array
  const binaryString = window.atob(base64str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Đọc dưới dạng PCM Int16
  const buffer = new Int16Array(bytes.buffer);

  // Tạo AudioBuffer: 1 kênh mono, 24kHz
  const audioBuffer = ctx.createBuffer(1, buffer.length, 24000);
  const channelData = audioBuffer.getChannelData(0);

  // Convert Int16 (-32768 → 32767) sang Float32 (-1.0 → 1.0)
  for (let i = 0; i < buffer.length; i++) {
    channelData[i] = buffer[i] / 32768.0;
  }

  // Phát
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  await new Promise<void>((resolve) => {
    source.onended = () => resolve();
    source.start();
  });
};

export const playGeminiTTS = async (text: string): Promise<void> => {
  try {
    const apiKey = ENV.tts.geminiApiKey;
    if (!apiKey) {
      console.warn('Thiếu cấu hình VITE_GEMINI_API_KEY trong file .env');
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Callirrhoe' },
          },
        },
      } as Parameters<typeof ai.models.generateContent>[0]['config'],
    });

    const data = (
      response as unknown as {
        candidates: Array<{
          content: { parts: Array<{ inlineData: { data: string } }> };
        }>;
      }
    ).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (data) {
      await playPCMBase64(data);
    } else {
      console.warn('Không nhận được dữ liệu audio từ Gemini TTS');
    }
  } catch (error) {
    console.error('Lỗi khi gọi Gemini TTS:', error);
  }
};

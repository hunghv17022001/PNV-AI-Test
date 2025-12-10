import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ Thiếu GEMINI_API_KEY trong file .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey, { apiVersion: 'v1' });

async function main() {
  try {
    console.log('SDK hiện tại không hỗ trợ genAI.listModels().');
    console.log('Tuy nhiên bạn vẫn có thể dùng trực tiếp các tên model phổ biến như:');
    console.log('- gemini-1.5-flash');
    console.log('- gemini-1.5-pro');
  } catch (err) {
    console.error('❌ Lỗi khi gọi listModels:');
    console.error(err?.message || err);
  }
}

main();



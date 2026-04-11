import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing with Key:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NONE');

async function main() {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Di hola',
    });
    console.log('-- SUCCESS -- Response:', text);
  } catch(e) {
    console.error('-- ERROR --', e);
  }
}
main();

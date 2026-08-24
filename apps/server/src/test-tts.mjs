import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OpenRouter } from "@openrouter/sdk";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../.env"), override: true, quiet: true });

const apiKey = process.env.OPENROUTER_API_KEY?.trim();

if (!apiKey) {
  console.error(
    "Missing OPENROUTER_API_KEY. Add it to the repo root .env file or run: OPENROUTER_API_KEY=sk-or-v1-... node test-tts.mjs",
  );
  process.exit(1);
}

const openrouter = new OpenRouter({ apiKey });

const stream = await openrouter.tts.createSpeech({
  speechRequest: {
    model: "fish-audio/s2.1-pro-free:free",
    input: "как дела слушатель? это проверка. раз, раз...",
    voice: "5079730b66514c3b8b6d8c5ad69f778f",
    responseFormat: "mp3",
    language: "ru",
  },
});

const reader = stream.getReader();
const chunks = [];

while (true) {
  const { done, value } = await reader.read();

  if (done) {
    break;
  }

  chunks.push(value);
}

const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
const buffer = new Uint8Array(totalLength);
let offset = 0;

for (const chunk of chunks) {
  buffer.set(chunk, offset);
  offset += chunk.length;
}

await fs.writeFile("output.mp3", buffer);
console.log("Audio saved to output.mp3");

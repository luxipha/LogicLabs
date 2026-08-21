#!/usr/bin/env node
/**
 * Transcribes the new voiceover with Whisper.cpp to get word-level timestamps.
 * Outputs a JSON file with the transcript so scenes can be timed to narration.
 */
import path from 'node:path';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from '@remotion/install-whisper-cpp';

const ROOT = process.cwd();
const WHISPER_DIR = path.join(ROOT, 'whisper.cpp');
const INPUT = path.join(ROOT, 'src/assets/ElevenLabs_2026-08-16T20_34_24_Jon - Catalyst_eleven_v3.mp3');
const WAV = path.join(ROOT, '.scratch/narration-16k.wav');
const OUT = path.join(ROOT, 'public/narration-transcript.json');

const to = WHISPER_DIR;
await installWhisperCpp({
  to,
  version: '1.5.5',
});

await downloadWhisperModel({
  model: 'base.en',
  folder: to,
});

// Convert to 16kHz mono wav with the bundled ffmpeg
fs.mkdirSync(path.dirname(WAV), {recursive: true});
execSync(`npx remotion ffmpeg -y -i "${INPUT}" -ar 16000 -ac 1 "${WAV}"`, {
  stdio: 'inherit',
});

const whisperCppOutput = await transcribe({
  model: 'base.en',
  whisperPath: to,
  whisperCppVersion: '1.5.5',
  inputPath: WAV,
  tokenLevelTimestamps: true,
});

const {captions} = toCaptions({
  whisperCppOutput,
});

fs.writeFileSync(OUT, JSON.stringify(captions, null, 2));
console.log('Wrote', OUT, 'with', captions.length, 'word captions');
console.log('\n--- Transcript (grouped into sentences) ---');
let sentence = '';
let lastEnd = 0;
for (const cap of captions) {
  sentence += cap.text + ' ';
  if (cap.endMs - lastEnd > 600 || sentence.length > 80) {
    console.log(`[${(cap.startMs / 1000).toFixed(1)}s] ${sentence.trim()}`);
    sentence = '';
  }
  lastEnd = cap.endMs;
}
if (sentence.trim()) {
  console.log(`[end] ${sentence.trim()}`);
}

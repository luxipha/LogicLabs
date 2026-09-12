#!/usr/bin/env node
/**
 * Transcribes the garage-door voiceover with Whisper.cpp to get word-level
 * timestamps so the mission scenes can be cut to the narration.
 */
import path from 'node:path';
import {execSync} from 'node:child_process';
import fs from 'node:fs';
import {transcribe, toCaptions} from '@remotion/install-whisper-cpp';

const ROOT = process.cwd();
const WHISPER_DIR = path.join(ROOT, 'whisper.cpp');
const INPUT = path.join(
  ROOT,
  'src/assets/garage/ElevenLabs_2026-09-11T16_00_55_Jane - Professional Audiobook Reader_pvc_sp100_s40_sb40_v3.mp3',
);
const WAV = path.join(ROOT, '.scratch/garage-narration-16k.wav');
const OUT = path.join(ROOT, '.scratch/garage-transcript.json');

fs.mkdirSync(path.dirname(WAV), {recursive: true});
execSync(`npx remotion ffmpeg -y -i "${INPUT}" -ar 16000 -ac 1 "${WAV}"`, {
  stdio: 'inherit',
});

const whisperCppOutput = await transcribe({
  model: 'base.en',
  whisperPath: WHISPER_DIR,
  whisperCppVersion: '1.5.5',
  inputPath: WAV,
  tokenLevelTimestamps: true,
});

const {captions} = toCaptions({whisperCppOutput});

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

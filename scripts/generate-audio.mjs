#!/usr/bin/env node
/**
 * Generates soft cinematic background music and sound effects as WAV files.
 * Pure Node synthesis — no ffmpeg required.
 *
 * Music design (per lessonConfig moods):
 *  - calm:      gentle C-major pad (C3, G3, E4), very quiet, slow LFO
 *  - concern:   slightly darker, adds A3, quieter
 *  - hope:      brighter (adds D4, F4), moderate
 *  - challenge: low C, adds G2, soft tension pulse
 *  - urgency:   adds A2, steady pulse (mission alert feel)
 *  - mission:   big open C-major (C3 G3 E4 C4), warm
 *  - inspire:   full C-major with F4/D4, brightest, gentle swell
 */
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const FPS = 30;
const TOTAL = 69.0; // seconds of video (composition = 2070 frames @ 30fps)
const N = Math.floor(TOTAL * SR);

const OUT = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'public');

// ---------------------------------------------------------------- helpers
function writeWav(file, samples, sampleRate = SR, ch = 1) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(ch, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * ch * 2, 28);
  buf.writeUInt16LE(ch * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(file, buf);
}

// deterministic RNG
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- music
function pad(freq, time, dur, attack, release) {
  const env = Math.min(1, time / attack) * Math.min(1, (dur - time) / release);
  if (env <= 0) return 0;
  const wob = 1 + 0.006 * Math.sin(2 * Math.PI * 0.5 * time);
  return env * Math.sin(2 * Math.PI * freq * wob * time);
}

const NOTE = (semi) => 440 * Math.pow(2, (semi - 9) / 12); // A4=69
// C-major voicing: C3=48, G3=55, E4=64, C4=60, D4=62, F4=65, G2=43, A2=45, A3=57, B3=59, D5=74
const C3 = NOTE(48), G3 = NOTE(55), E4 = NOTE(64), C4 = NOTE(60),
  D4 = NOTE(62), F4 = NOTE(65), G2 = NOTE(43), A2 = NOTE(45), A3 = NOTE(57);

const segments = [
  { start: 0.0,  end: 9.0,  vol: 0.16, notes: [C3, G3, E4],               attack: 0.4, release: 1.6 }, // calm (audible from the start)
  { start: 9.0,  end: 17.5, vol: 0.12, notes: [C3, G3, A3],               attack: 1.0, release: 1.8 }, // concern
  { start: 17.5, end: 25.0, vol: 0.13, notes: [C3, G3, E4, D4],           attack: 1.0, release: 1.8 }, // hope
  { start: 25.0, end: 33.5, vol: 0.12, notes: [C3, G2, E4],               attack: 1.0, release: 1.8 }, // challenge
  { start: 33.5, end: 41.5, vol: 0.12, notes: [A2, C3, E4, A3],           attack: 0.8, release: 1.4 }, // urgency
  { start: 41.5, end: 53.0, vol: 0.15, notes: [C3, G3, E4, C4],           attack: 1.0, release: 1.8 }, // mission
  { start: 53.0, end: 69.0, vol: 0.18, notes: [C3, G3, E4, C4, D4, F4],   attack: 0.6, release: 1.2 }, // inspire (audible to the end)
];

function musicSample(t) {
  let sum = 0;
  for (const seg of segments) {
    if (t < seg.start || t >= seg.end) continue;
    const local = t - seg.start;
    const dur = seg.end - seg.start;
    for (const f of seg.notes) {
      // gentle phase-drift per note so chords shimmer instead of standing still
      const drift = 0.03 * Math.sin(2 * Math.PI * 0.11 * t + f);
      sum += seg.vol * pad(f * (1 + drift * 0.001), local, dur, seg.attack, seg.release);
    }
  }
  return sum;
}

const music = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  const raw = musicSample(t);
  // very gentle tape-style detune shimmer layer (adds motion without volume spike)
  const shimmer = 0.5 * musicSample(t + 0.02);
  music[i] = 0.55 * raw + 0.45 * shimmer;
}

// short global fade in/out + gentle stereo-ize via phase offset
const stereo = new Float32Array(N * 2);
for (let i = 0; i < N; i++) {
  const t = i / SR;
  // music should be clearly audible in the first and last ~6 seconds
  const fadeIn = Math.min(1, t / 0.3); // present within 0.3s
  const fadeOut = Math.min(1, (TOTAL - t) / 0.5); // holds to the very end
  // presence boost at the very start and end so the music reads clearly
  const presence =
    1 + 0.25 * Math.exp(-t / 6) + 0.25 * Math.exp(-(TOTAL - t) / 6);
  const env = fadeIn * fadeOut * presence;
  const l = music[i] * env;
  const r = (i > 1 ? music[i - 1] : 0) * env; // tiny detune for width
  stereo[i * 2] = l;
  stereo[i * 2 + 1] = r;
}
writeWav(path.join(OUT, 'music.wav'), stereo, SR, 2);

// ---------------------------------------------------------------- sfx
// notification chime (scene 6): two soft sine bells
function chime(t, total) {
  const env = Math.min(1, t / 0.01) * Math.min(1, (total - t) / 0.35);
  if (env <= 0) return 0;
  return env * (0.28 * Math.sin(2 * Math.PI * 880 * t) + 0.16 * Math.sin(2 * Math.PI * 1320 * t));
}
const chimeS = new Float32Array(Math.floor(1.2 * SR));
for (let i = 0; i < chimeS.length; i++) {
  const t = i / SR;
  chimeS[i] = chime(t, 1.2);
}
writeWav(path.join(OUT, 'sfx_chime.wav'), chimeS, SR, 1);

// soft whoosh (scene transitions): filtered noise swell
const rand = mulberry32(42);
const WHOOSH = 0.9;
const whooshS = new Float32Array(Math.floor(WHOOSH * SR));
let lp = 0;
for (let i = 0; i < whooshS.length; i++) {
  const t = i / SR;
  const env = Math.sin(Math.PI * Math.min(1, t / WHOOSH)); // smooth swell
  lp = lp * 0.98 + (rand() * 2 - 1) * 0.02; // lowpass-ish
  whooshS[i] = lp * env * 0.35;
}
writeWav(path.join(OUT, 'sfx_whoosh.wav'), whooshS, SR, 1);

// airplane flyover (final scene): rising + falling hum
const FLY = 2.2;
const flyS = new Float32Array(Math.floor(FLY * SR));
for (let i = 0; i < flyS.length; i++) {
  const t = i / SR;
  const env = Math.sin(Math.PI * Math.min(1, t / FLY)); // in-out
  const f = 180 + 160 * Math.sin(Math.PI * Math.min(1, t / FLY));
  flyS[i] = env * (0.5 * Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(2 * Math.PI * f * 0.5 * t));
}
writeWav(path.join(OUT, 'sfx_flyover.wav'), flyS, SR, 1);

console.log('Generated: music.wav, sfx_chime.wav, sfx_whoosh.wav, sfx_flyover.wav');
console.log('Music duration:', TOTAL.toFixed(1) + 's');

/** A sweeping siren whose pitch, sweep rate and volume follow shake strength. */
export function createShakeSiren(context: AudioContext, strength: number) {
  const tone = context.createOscillator();
  const sweep = context.createOscillator();
  const depth = context.createGain();
  const volume = context.createGain();
  tone.type = 'triangle';
  sweep.type = 'sine';
  sweep.connect(depth);
  depth.connect(tone.frequency);
  tone.connect(volume);
  volume.connect(context.destination);
  volume.gain.value = 0;
  const update = (strength: number) => {
    const amount = Math.max(0, Math.min(10, strength)) / 10;
    const now = context.currentTime;
    tone.frequency.setTargetAtTime(400 + amount * 400, now, 0.08);
    sweep.frequency.setTargetAtTime(0.7 + amount * 2.3, now, 0.08);
    depth.gain.setTargetAtTime(100 + amount * 160, now, 0.08);
    volume.gain.setTargetAtTime(0.015 + amount * 0.065, now, 0.08);
  };
  update(strength);
  tone.start();
  sweep.start();
  return {
    update,
    stop: () => {
      tone.stop();
      sweep.stop();
      tone.disconnect();
      sweep.disconnect();
      depth.disconnect();
      volume.disconnect();
    },
  };
}

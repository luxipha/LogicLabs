export const LIGHT_THRESHOLD = 128;
export const lightShouldBeOn = (level: number, threshold = LIGHT_THRESHOLD) => level < threshold;
export type LightChoice = '' | 'on' | 'off';
export type LightSetup = {pin: string; count: string; dark: LightChoice; bright: LightChoice};
export const setupIsCorrect = (setup: LightSetup) => setup.pin === 'P16' && setup.count === '8';
export const chosenLightOutput = (setup: LightSetup, level: number) => setupIsCorrect(setup) && (level < LIGHT_THRESHOLD ? setup.dark : setup.bright) === 'on';
export function checkLightTest(setup: LightSetup, level: number) {
  if (!setupIsCorrect(setup)) return {passed: false, message: 'Use pin P16 and 8 LEDs, just like our classroom model.'};
  const dark = level < LIGHT_THRESHOLD;
  if (chosenLightOutput(setup, level) !== lightShouldBeOn(level)) return {passed: false, message: dark ? 'It is dark, but your light is off. Change the below-128 action to On.' : 'It is bright, but your light is on. Change the at-or-above-128 action to Off.'};
  return {passed: true, message: dark ? 'Dark test passed: the NeoPixels are on.' : 'Bright test passed: the NeoPixels are off.'};
}

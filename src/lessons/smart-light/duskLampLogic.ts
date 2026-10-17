import {LIGHT_THRESHOLD, type LightChoice, lightShouldBeOn} from './smartLightLogic';
export const LAMP_SCENARIOS = [
  {id: 'dusk', label: 'Dusk', level: 40, clue: 'The sun is going down.'},
  {id: 'night', label: 'Night', level: 10, clue: 'The garden is dark.'},
  {id: 'dawn', label: 'Dawn', level: 210, clue: 'Daylight has returned.'},
] as const;
export type LampScenarioId = typeof LAMP_SCENARIOS[number]['id'];
export type LampRule = {dark: LightChoice; bright: LightChoice};
export const lampRuleReady = (rule: LampRule) => Boolean(rule.dark && rule.bright);
export const lampRuleOutput = (rule: LampRule, level: number) => (level < LIGHT_THRESHOLD ? rule.dark : rule.bright) === 'on';
export const allLampTestsPassed = (tests: LampScenarioId[]) => LAMP_SCENARIOS.every(test => tests.includes(test.id));
export function checkLampScenario(rule: LampRule, scenario: typeof LAMP_SCENARIOS[number]) {
  if (!lampRuleReady(rule)) return {passed: false, message: 'Choose both actions before running a test.'};
  const expected = lightShouldBeOn(scenario.level);
  if (lampRuleOutput(rule, scenario.level) !== expected) return {passed: false, message: expected ? `${scenario.label} is dark. Choose On for readings below 128.` : 'Daylight has returned. Choose Off for readings of 128 or above.'};
  return {passed: true, message: `${scenario.label} passed: the lamp is ${expected ? 'on to light the garden' : 'off in daylight'}.`};
}

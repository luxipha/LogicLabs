import React, {useCallback, useEffect, useState} from 'react';
import {DuskLampCanvas} from './DuskDawnLamp';
import {allLampTestsPassed, checkLampScenario, LAMP_SCENARIOS, lampRuleOutput, lampRuleReady, type LampRule, type LampScenarioId} from './duskLampLogic';
const INITIAL: LampRule = {dark: '', bright: ''};
export const useSmartLightLab = () => {
  const [rule, setRule] = useState<LampRule>(INITIAL);
  const [scenarioId, setScenarioId] = useState<LampScenarioId>('dusk');
  const [tested, setTested] = useState<LampScenarioId[]>([]);
  const [tone, setTone] = useState<'hint' | 'success' | 'error'>('hint');
  const [message, setMessage] = useState('Choose what the lamp should do in darkness and daylight.');
  return {rule, setRule, scenarioId, setScenarioId, tested, setTested, message, setMessage, tone, setTone};
};
export const SmartLightActivity: React.FC<{
  lab: ReturnType<typeof useSmartLightLab>; viewToken: number; activityDone: boolean;
  completeActivity: () => void; resetActivity: () => void;
}> = ({lab, viewToken, activityDone, completeActivity, resetActivity}) => {
  const {rule, setRule, scenarioId, setScenarioId, tested, setTested, message, setMessage, tone, setTone} = lab;
  const [ready, setReady] = useState(false);
  const modelReady = useCallback(() => setReady(true), []), modelFailed = useCallback(() => setReady(false), []);
  const scenario = LAMP_SCENARIOS.find(test => test.id === scenarioId)!;
  const finished = allLampTestsPassed(tested), programmed = lampRuleReady(rule), lit = lampRuleOutput(rule, scenario.level);
  useEffect(() => { if (finished && !activityDone) completeActivity(); }, [finished, activityDone, completeActivity]);
  const changeRule = (key: keyof LampRule, value: string) => {
    setRule(current => ({...current, [key]: value}));
    setTested([]);
    setTone('hint');
    setMessage('Your rule changed. Test dusk, night and dawn again.');
    if (activityDone) resetActivity();
  };
  const runTest = () => {
    if (!ready) return;
    const result = checkLampScenario(rule, scenario);
    setTone(result.passed ? 'success' : 'error');
    setMessage(result.message);
    if (result.passed) setTested(current => current.includes(scenarioId) ? current : [...current, scenarioId]);
  };
  const retry = () => {
    setRule(INITIAL); setScenarioId('dusk'); setTested([]); setTone('hint');
    setMessage('Choose what the lamp should do in darkness and daylight.'); resetActivity();
  };
  return <div className="sl-lamp-workspace sl-lamp-mission">
    <div className={`sl-live-world ${scenario.level < 128 ? 'is-dark' : 'is-bright'}`}>
      <div className="sl-live-canvas"><DuskLampCanvas night={scenario.level < 128} lit={lit} reset={viewToken} onReady={modelReady} onFailure={modelFailed}/></div>
      <div className="sl-world-heading"><strong>{scenario.label} in the garden</strong><span>{scenario.clue}</span></div>
      <div className="sl-world-reading" role="status">Sensor: {scenario.level} · {programmed ? `Your lamp: ${lit ? 'ON' : 'OFF'}` : 'Choose your rule'}</div>
      <span className="sl-orbit-hint">Drag to turn · Scroll or pinch to zoom</span>
    </div>
    <div className="sl-mission-controls">
      <div className="sl-mission-title"><h3>Keep the garden lit overnight</h3><button type="button" onClick={retry}>↻ Try again</button></div>
      <p>Choose a rule. Test every scene.</p>
      <div className="sl-mission-rules">{(['dark', 'bright'] as const).map(key => <label key={key}><span>{key === 'dark' ? 'When it is dark' : 'When daylight returns'}<small>{key === 'dark' ? 'Reading below 128' : 'Reading 128 or above'}</small></span><select aria-label={key === 'dark' ? 'Dark action' : 'Bright action'} value={rule[key]} onChange={event => changeRule(key, event.target.value)}><option value="">Choose…</option><option value="on">Lamp On</option><option value="off">Lamp Off</option></select></label>)}</div>
      <div className="sl-scenario-tabs" aria-label="Test conditions">{LAMP_SCENARIOS.map(test => <button key={test.id} type="button" aria-pressed={scenarioId === test.id} onClick={() => {setScenarioId(test.id); setTone('hint'); setMessage(`${test.clue} Run the test for ${test.label.toLowerCase()}.`);}}>{test.label}<span>{tested.includes(test.id) ? '✓ Passed' : '○ Pending'}</span></button>)}</div>
      <div className="sl-test-summary"><span>{tested.length} / 3 tests passed</span><button type="button" disabled={!ready || !programmed} onClick={runTest}>Test this scene</button></div>
      <p className={`sl-mission-feedback sl-feedback--${finished ? 'success' : tone}`} role="status" aria-live="polite">{!ready ? 'Loading the 3D lamp…' : finished ? 'All three tests passed! Your lamp stays on through the night and switches off at dawn.' : message}</p>
      <p className="sl-microbit-bridge">Classroom connection: the micro:bit reads the light; the NeoPixels act as the lamp. See Coding to build it.</p>
    </div>
  </div>;
};

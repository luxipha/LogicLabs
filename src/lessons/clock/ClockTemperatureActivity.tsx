import React, {useMemo, useState} from 'react';

const labelForTemperature = (temperature: number) => temperature <= 5 ? 'Snowy' : temperature <= 25 ? 'Windy' : temperature < 70 ? 'Warm' : 'Hot';

export const ClockTemperatureActivity: React.FC = () => {
  const [temperature, setTemperature] = useState(18);
  const feeling = labelForTemperature(temperature);
  const snowflakes = useMemo(() => Array.from({length: 18}, (_, index) => ({id: index, left: `${(index * 37) % 96}%`, delay: `${(index % 6) * -0.42}s`, duration: `${2.7 + (index % 4) * 0.45}s`})), []);
  return <div className={`clock-temperature-activity clock-temperature-${feeling.toLowerCase()}`}>
    <div className="clock-temperature-sky" aria-hidden="true">
      {feeling === 'Snowy' ? snowflakes.map((flake) => <i key={flake.id} className="clock-snowflake" style={{left: flake.left, animationDelay: flake.delay, animationDuration: flake.duration}}>❄</i>) : null}
      {feeling === 'Windy' ? <div className="clock-wind" aria-label="Wind blowing"><i /><i /><i /></div> : null}
      <span className="clock-weather-icon">{feeling === 'Snowy' ? '☃️' : feeling === 'Windy' ? '🍃' : feeling === 'Warm' ? '🌤️' : '☀️'}</span>
    </div>
    <div className="clock-temperature-copy"><span>ACTIVITY 2</span><strong>{feeling} at {temperature}°C</strong><p>{feeling === 'Snowy' ? 'Brrr! Snow falls near freezing.' : feeling === 'Windy' ? 'A cool, windy day. Watch the gusts blow!' : feeling === 'Warm' ? 'A comfortable, warm day.' : 'It is hot! Find shade and drink water.'}</p></div>
    <div className="clock-thermometer" aria-label={`${temperature} degrees Celsius`}><div className="clock-thermometer-bulb" /><div className="clock-thermometer-tube"><div className="clock-thermometer-mercury" style={{width: `${temperature}%`}} /></div></div>
    <div className="clock-temperature-slider"><div className="clock-temperature-scale"><span>0°C</span><span>Cold</span><span>Warm</span><span>Hot</span><span>100°C</span></div><input type="range" min="0" max="100" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} aria-label="Temperature from 0 to 100 degrees Celsius" /></div>
  </div>;
};

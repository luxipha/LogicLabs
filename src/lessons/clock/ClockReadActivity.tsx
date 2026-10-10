import React, {useState} from 'react';

const TARGET = {hour: 10, minute: 10};

const padded = (value: number) => String(value).padStart(2, '0');

export const ClockReadActivity: React.FC<{onComplete: () => void; completed: boolean; onReset: () => void}> = ({onComplete, completed, onReset}) => {
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [message, setMessage] = useState('Move both controls to set the clock.');
  const hourRotation = (hour % 12) * 30 + minute * 0.5;
  const minuteRotation = minute * 6;

  const check = () => {
    if (hour === TARGET.hour && minute === TARGET.minute) {
      setMessage('Great work! You set the clock to 10:10.');
      onComplete();
    } else setMessage('Not yet. Look carefully at the target time and try again.');
  };

  const reset = () => {
    setHour(7);
    setMinute(0);
    setMessage('Move both controls to set the clock.');
    onReset();
  };

  return <div className="clock-read-activity">
    <div className="clock-read-heading"><span>ACTIVITY 1</span><strong>Set the clock to 10:10</strong><p>{message}</p></div>
    <div className="clock-read-board">
      <div className="clock-face" aria-label={`Analogue clock showing ${hour}:${padded(minute)}`}>
        {[12, 3, 6, 9].map((number) => <b key={number} className={`clock-number clock-number-${number}`}>{number}</b>)}
        <i className="clock-hand clock-hand-hour" style={{transform: `rotate(${hourRotation}deg)`}} />
        <i className="clock-hand clock-hand-minute" style={{transform: `rotate(${minuteRotation}deg)`}} />
        <i className="clock-hand-pin" />
      </div>
      <div className="clock-digital-readout" aria-live="polite">{hour}:{padded(minute)}<em>AM</em></div>
    </div>
    <div className="clock-time-controls">
      <label>Hour <input type="range" min="1" max="12" value={hour} onChange={(event) => setHour(Number(event.target.value))} /><output>{hour}</output></label>
      <label>Minute <input type="range" min="0" max="59" value={minute} onChange={(event) => setMinute(Number(event.target.value))} /><output>{padded(minute)}</output></label>
      {completed ? <button type="button" className="primary-action" onClick={reset}>↻ Try again</button> : <button type="button" className="primary-action" onClick={check}>Check my clock</button>}
    </div>
  </div>;
};

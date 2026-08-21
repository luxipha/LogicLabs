import React, {useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import lessonContent from './content.json';

export const GolfStage: React.FC<{
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, identified, onSelect, mode, activityDone, completeActivity}) => {
  const [swinging, setSwinging] = useState(false);
  const [ballX, setBallX] = useState(0);

  if (mode === 'warmup') {
    return (
      <div className="generic-stage">
        <WarmupScreen videoUrl={lessonContent.warmupVideoUrl} />
      </div>
    );
  }

  if (mode === 'story') {
    return (
      <div className="generic-stage">
        <StoryVideoCard title={lessonContent.title} youtubeEmbedUrl={lessonContent.storyVideoUrl} />
      </div>
    );
  }

  const swing = () => {
    if (activityDone) {
      return;
    }
    setSwinging(true);
    setBallX(1);
    window.setTimeout(() => {
      setSwinging(false);
      setBallX(2);
      completeActivity();
    }, 900);
  };

  if (mode === 'activity') {
    return (
      <div className="generic-stage">
        <div className="golf-activity">
          <div className="golf-green" />
          <div className={`golf-golfer ${swinging ? 'swinging' : ''}`}>⛳</div>
          <div className={`golf-ball ${ballX === 1 ? 'hit' : ''} ${ballX === 2 ? 'rolled' : ''}`}>⚪</div>
          <div className="golf-hole">⛳</div>
          {activityDone ? (
            <div className="bee-activity-done">Nice shot! The ball rolled to the hole.</div>
          ) : (
            <button className="primary-action" onClick={swing}>
              {swinging ? 'Swinging...' : 'Press the button'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="generic-stage">
      <svg viewBox="0 0 680 460" className="generic-art" aria-label="Button golfer">
        {/* background */}
        <circle cx="340" cy="230" r="200" fill="rgba(255,255,255,0.1)" />
        {/* body */}
        <rect
          className={`generic-part ${activePart === 'body' ? 'active' : ''} ${identified.has('body') ? 'done' : ''}`}
          x="292"
          y="220"
          width="96"
          height="120"
          rx="20"
          fill="#e84a5f"
          stroke="#b22a3d"
          strokeWidth="4"
          onClick={() => onSelect('body')}
        />
        {/* head */}
        <circle
          className={`generic-part ${activePart === 'head' ? 'active' : ''} ${identified.has('head') ? 'done' : ''}`}
          cx="340"
          cy="170"
          r="44"
          fill="#ffd0a1"
          stroke="#d9a06a"
          strokeWidth="4"
          onClick={() => onSelect('head')}
        />
        <circle cx="324" cy="162" r="7" fill="#1c1c1c" />
        <circle cx="356" cy="162" r="7" fill="#1c1c1c" />
        <path d="M330 182 q10 8 20 0" stroke="#8a4a20" strokeWidth="4" fill="none" />
        {/* hat */}
        <g
          className={`generic-part ${activePart === 'hat' ? 'active' : ''} ${identified.has('hat') ? 'done' : ''}`}
          onClick={() => onSelect('hat')}
        >
          <ellipse cx="340" cy="128" rx="60" ry="14" fill="#1c8a5a" stroke="#10633e" strokeWidth="3" />
          <path d="M300 128 q0 -34 40 -36 q40 2 40 36" fill="#1c8a5a" stroke="#10633e" strokeWidth="3" />
        </g>
        {/* arms */}
        <g
          className={`generic-part ${activePart === 'arms' ? 'active' : ''} ${identified.has('arms') ? 'done' : ''}`}
          onClick={() => onSelect('arms')}
        >
          <rect x="244" y="240" width="50" height="22" rx="11" fill="#e84a5f" stroke="#b22a3d" strokeWidth="3" />
          <rect x="386" y="240" width="50" height="22" rx="11" fill="#e84a5f" stroke="#b22a3d" strokeWidth="3" />
        </g>
        {/* club */}
        <g
          className={`generic-part ${activePart === 'club' ? 'active' : ''} ${identified.has('club') ? 'done' : ''}`}
          onClick={() => onSelect('club')}
        >
          <rect x="412" y="170" width="10" height="170" rx="5" fill="#8a5a20" transform="rotate(18 417 255)" />
          <rect x="438" y="312" width="60" height="16" rx="8" fill="#c0c8d0" transform="rotate(18 468 320)" />
        </g>
        {/* legs */}
        <rect x="306" y="330" width="22" height="60" rx="8" fill="#35506b" />
        <rect x="352" y="330" width="22" height="60" rx="8" fill="#35506b" />
        {/* button on body */}
        <circle cx="340" cy="270" r="16" fill="#ffcf4a" stroke="#e8a800" strokeWidth="4" />
        <text x="340" y="276" textAnchor="middle" fontSize="16" fontWeight="900" fill="#114a9a">
          GO
        </text>
      </svg>
    </div>
  );
};

export const GolfPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'hat' ? '🧢' : null}
    {part === 'head' ? '😀' : null}
    {part === 'body' ? '👕' : null}
    {part === 'arms' ? '💪' : null}
    {part === 'club' ? '🏌️' : null}
  </span>
);

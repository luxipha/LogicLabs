import React, {useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import lessonContent from './content.json';

export const ElevatorStage: React.FC<{
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  warmupVideoUrl: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, identified, onSelect, mode, warmupVideoUrl, activityDone, completeActivity}) => {
  const [floor, setFloor] = useState(0);

  if (mode === 'warmup') {
    return (
      <div className="generic-stage">
        <WarmupScreen videoUrl={warmupVideoUrl} />
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

  if (mode === 'activity') {
    return (
      <div className="generic-stage">
        <div className="elevator-activity">
          <div className="elevator-shaft">
            <div className="elevator-floors">
              <span>Floor 2</span>
              <span>Floor 1</span>
              <span>Ground</span>
            </div>
            <div className={`elevator-cab-move floor-${floor}`}>🛗</div>
          </div>
          {activityDone ? (
            <div className="bee-activity-done">Nice ride! The elevator reached the top floor.</div>
          ) : (
            <button
              className="primary-action"
              onClick={() => {
                if (floor < 2) {
                  setFloor(floor + 1);
                } else {
                  setFloor(0);
                  completeActivity();
                }
              }}
            >
              {floor === 0 ? 'Go up' : floor === 1 ? 'Go up again' : 'Back to ground'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="generic-stage">
      <svg viewBox="0 0 680 460" className="generic-art" aria-label="Elevator">
        {/* background */}
        <circle cx="340" cy="230" r="200" fill="rgba(255,255,255,0.1)" />
        {/* building shaft */}
        <rect x="180" y="40" width="320" height="380" rx="12" fill="#dbe7f2" stroke="#7fa8c9" strokeWidth="4" />
        {/* pulley */}
        <g
          className={`generic-part ${activePart === 'pulley' ? 'active' : ''} ${identified.has('pulley') ? 'done' : ''}`}
          onClick={() => onSelect('pulley')}
        >
          <circle cx="340" cy="70" r="26" fill="#8a93a0" stroke="#5c6570" strokeWidth="4" />
          <circle cx="340" cy="70" r="8" fill="#5c6570" />
          <rect x="326" y="44" width="28" height="10" rx="4" fill="#5c6570" />
        </g>
        {/* cable */}
        <g
          className={`generic-part ${activePart === 'cable' ? 'active' : ''} ${identified.has('cable') ? 'done' : ''}`}
          onClick={() => onSelect('cable')}
        >
          <path d="M340 96 v180" stroke="#3a4a5c" strokeWidth="6" />
          <path d="M340 96 v180" stroke="#ffffff" strokeWidth="2" />
        </g>
        {/* counterweight */}
        <rect x="120" y="120" width="44" height="90" rx="8" fill="#9aa7b3" stroke="#6b7885" strokeWidth="3" />
        {/* cab */}
        <g
          className={`generic-part ${activePart === 'cab' ? 'active' : ''} ${identified.has('cab') ? 'done' : ''}`}
          onClick={() => onSelect('cab')}
        >
          <rect x="260" y="210" width="160" height="170" rx="10" fill="#e84a5f" stroke="#b22a3d" strokeWidth="4" />
          <rect x="260" y="210" width="160" height="36" rx="10" fill="#c23a4e" />
        </g>
        {/* doors */}
        <g
          className={`generic-part ${activePart === 'doors' ? 'active' : ''} ${identified.has('doors') ? 'done' : ''}`}
          onClick={() => onSelect('doors')}
        >
          <rect x="280" y="246" width="56" height="134" rx="6" fill="#ffd9a0" stroke="#d9a06a" strokeWidth="3" />
          <rect x="344" y="246" width="56" height="134" rx="6" fill="#ffd9a0" stroke="#d9a06a" strokeWidth="3" />
          <rect x="336" y="246" width="8" height="134" fill="#c23a4e" />
        </g>
        {/* button */}
        <g
          className={`generic-part ${activePart === 'button' ? 'active' : ''} ${identified.has('button') ? 'done' : ''}`}
          onClick={() => onSelect('button')}
        >
          <circle cx="368" cy="232" r="14" fill="#ffcf4a" stroke="#e8a800" strokeWidth="4" />
          <path d="M364 232 l8 0 M368 228 v8" stroke="#114a9a" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* floor lines */}
        <line x1="180" y1="260" x2="500" y2="260" stroke="#7fa8c9" strokeWidth="2" strokeDasharray="8 6" />
        <line x1="180" y1="370" x2="500" y2="370" stroke="#7fa8c9" strokeWidth="2" strokeDasharray="8 6" />
      </svg>
    </div>
  );
};

export const ElevatorPartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'cab' ? '🛗' : null}
    {part === 'doors' ? '🚪' : null}
    {part === 'cable' ? '〰️' : null}
    {part === 'pulley' ? '⚙️' : null}
    {part === 'button' ? '🔘' : null}
  </span>
);

import React, {useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import lessonContent from './content.json';

const BEE_PARTS = ['antennae', 'wings', 'body', 'proboscis', 'pollen-basket'];

export const HoneyBeeStage: React.FC<{
  activePart: string;
  identified: Set<string>;
  onSelect: (part: string) => void;
  mode: string;
  activityDone: boolean;
  completeActivity: () => void;
}> = ({activePart, identified, onSelect, mode, activityDone, completeActivity}) => {
  const [step, setStep] = useState(0);

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

  if (mode === 'activity') {
    return (
      <div className="generic-stage">
        <div className="bee-activity">
          <div className="bee-activity-flower">🌸</div>
          <div className="bee-activity-hive">🏠</div>
          <div className={`bee-activity-bee ${step === 1 ? 'collecting' : ''} ${step === 2 ? 'returning' : ''}`}>
            🐝
          </div>
          {activityDone ? (
            <div className="bee-activity-done">Pollen delivered! The hive is stocked.</div>
          ) : (
            <button
              className="primary-action"
              onClick={() => {
                setStep((s) => s + 1);
                if (step >= 1) {
                  completeActivity();
                }
              }}
            >
              {step === 0 ? 'Fly to the flower' : step === 1 ? 'Collect pollen' : 'Fly home'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="generic-stage">
      <svg viewBox="0 0 680 460" className="generic-art" aria-label="Honey bee">
        {/* background */}
        <circle cx="340" cy="230" r="200" fill="rgba(255,255,255,0.1)" />
        {/* wings */}
        <ellipse
          className={`generic-part ${activePart === 'wings' ? 'active' : ''} ${identified.has('wings') ? 'done' : ''}`}
          cx="330"
          cy="150"
          rx="95"
          ry="60"
          fill="rgba(200,230,255,0.55)"
          stroke="#bcd9f2"
          strokeWidth="3"
          onClick={() => onSelect('wings')}
        />
        <ellipse
          className={`generic-part ${activePart === 'wings' ? 'active' : ''} ${identified.has('wings') ? 'done' : ''}`}
          cx="350"
          cy="140"
          rx="60"
          ry="38"
          fill="rgba(255,255,255,0.6)"
          stroke="#cfe4f5"
          strokeWidth="2"
          onClick={() => onSelect('wings')}
        />
        {/* body */}
        <ellipse
          className={`generic-part ${activePart === 'body' ? 'active' : ''} ${identified.has('body') ? 'done' : ''}`}
          cx="340"
          cy="270"
          rx="90"
          ry="120"
          fill="#ffd75e"
          stroke="#e8a800"
          strokeWidth="4"
          onClick={() => onSelect('body')}
        />
        <path d="M300 210 q40 12 80 0 M300 250 q40 12 80 0 M300 290 q40 12 80 0 M300 330 q40 12 80 0" stroke="#3a2a10" strokeWidth="10" fill="none" />
        {/* head */}
        <circle cx="340" cy="140" r="52" fill="#ffcf4a" stroke="#e8a800" strokeWidth="4" />
        <circle cx="322" cy="128" r="10" fill="#1c1c1c" />
        <circle cx="358" cy="128" r="10" fill="#1c1c1c" />
        <path d="M330 150 q10 8 20 0" stroke="#3a2a10" strokeWidth="4" fill="none" />
        {/* antennae */}
        <g
          className={`generic-part ${activePart === 'antennae' ? 'active' : ''} ${identified.has('antennae') ? 'done' : ''}`}
          onClick={() => onSelect('antennae')}
        >
          <path d="M318 96 q-14 -34 -4 -58" stroke="#3a2a10" strokeWidth="5" fill="none" />
          <path d="M362 96 q14 -34 4 -58" stroke="#3a2a10" strokeWidth="5" fill="none" />
          <circle cx="314" cy="36" r="7" fill="#3a2a10" />
          <circle cx="366" cy="36" r="7" fill="#3a2a10" />
        </g>
        {/* proboscis */}
        <g
          className={`generic-part ${activePart === 'proboscis' ? 'active' : ''} ${identified.has('proboscis') ? 'done' : ''}`}
          onClick={() => onSelect('proboscis')}
        >
          <path d="M340 188 q6 34 -6 52" stroke="#8a5a20" strokeWidth="8" fill="none" strokeLinecap="round" />
        </g>
        {/* pollen basket */}
        <g
          className={`generic-part ${activePart === 'pollen-basket' ? 'active' : ''} ${identified.has('pollen-basket') ? 'done' : ''}`}
          onClick={() => onSelect('pollen-basket')}
        >
          <circle cx="272" cy="372" r="26" fill="#ffcf4a" stroke="#e8a800" strokeWidth="4" />
          <circle cx="408" cy="372" r="26" fill="#ffcf4a" stroke="#e8a800" strokeWidth="4" />
          <circle cx="272" cy="372" r="13" fill="#ffe765" />
          <circle cx="408" cy="372" r="13" fill="#ffe765" />
        </g>
        {/* stinger */}
        <path d="M340 388 l0 18" stroke="#3a2a10" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export const HoneyBeePartPreview: React.FC<{part: string}> = ({part}) => (
  <span className="generic-part-preview" aria-hidden="true">
    {part === 'antennae' ? '^^' : null}
    {part === 'wings' ? '🪽' : null}
    {part === 'body' ? '🐝' : null}
    {part === 'proboscis' ? 'ↆ' : null}
    {part === 'pollen-basket' ? '●' : null}
  </span>
);

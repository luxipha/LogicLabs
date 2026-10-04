import React, {useEffect, useRef, useState} from 'react';
import {ReviewLetterChallenge} from './ReviewLetterChallenge';
import {ReviewPictureMatch} from './ReviewPictureMatch';
import {ReviewCircleLetter} from './ReviewCircleLetter';
import {WarmupScreen} from '../shared/WarmupScreen';

export const ReviewStage: React.FC<{
  mode: string;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
  activityStep: string;
  warmupVideoUrl: string;
}> = ({mode, activityDone, completeActivity, resetActivity, activityStep, warmupVideoUrl}) => {
  const activityRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === activityRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;

  if (mode === 'activity') {
    return (
      <div className="review-activity-host" ref={activityRef}>
        <button type="button" className="review-activity-host__fullscreen" onClick={() => {
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          else activityRef.current?.requestFullscreen?.().catch(() => {});
        }}>
          {isFullscreen ? '⛶ Exit fullscreen' : '⛶ Fullscreen'}
        </button>
        {activityStep === 'picture-match' ? <ReviewPictureMatch completeActivity={completeActivity} /> : null}
        {activityStep === 'circle-letter' ? <ReviewCircleLetter completeActivity={completeActivity} /> : null}
        {activityStep !== 'picture-match' && activityStep !== 'circle-letter' ? (
          <ReviewLetterChallenge activityDone={activityDone} completeActivity={completeActivity} resetActivity={resetActivity} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="review-stage" aria-label="Review lesson">
      <span>REVIEW</span>
      <strong>Let’s practise together!</strong>
      <p>Open the Activity tab to play the Letter Challenge.</p>
    </div>
  );
};

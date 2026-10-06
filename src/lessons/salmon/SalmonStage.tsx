import React, {Suspense, useState} from 'react';
import {SalmonCanvas} from './SalmonModel';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import content from './content.json';
import './salmon.css';

export const SalmonStage: React.FC<{
  mode: string;
  warmupVideoUrl: string;
  lastSelectedPart: string | null;
  onSelect: (part: string) => void;
  activityDone: boolean;
  completeActivity: () => void;
  resetActivity: () => void;
}> = ({mode, warmupVideoUrl, lastSelectedPart, onSelect, activityDone, completeActivity, resetActivity}) => {
  if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl} />;
  if (mode === 'story') {
    if (!content.storyVideoUrl) {
      return <div className="generic-stage salmon-stage salmon-stage--story"><div className="salmon-stage__story-card"><strong>Salmon mission</strong><p>Watch the salmon move, then explore its body and discover how each part helps it swim.</p></div></div>;
    }
    return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl} />;
  }
  if (mode === 'activity') {
    return (
      <div className="generic-stage salmon-stage salmon-stage--activity">
        <div className="salmon-stage__model"><Suspense fallback={<div className="salmon-stage__loading">Loading salmon…</div>}><SalmonCanvas /></Suspense></div>
      </div>
    );
  }
  return (
    <div className="generic-stage salmon-stage">
      <div className="salmon-stage__model"><Suspense fallback={<div className="salmon-stage__loading">Loading salmon…</div>}><SalmonCanvas animated /></Suspense></div>
    </div>
  );
};

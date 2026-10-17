import React, {useEffect, useRef, useState} from 'react';
import {WarmupScreen} from '../shared/WarmupScreen';
import {StoryVideoCard} from '../shared/lesson-ui';
import {DuskDawnLamp} from './DuskDawnLamp';
import {SmartLightActivity, useSmartLightLab} from './SmartLightActivity';
import {SmartLightCoding} from './SmartLightCoding';
import {SmartLightExplore} from './SmartLightExplore';
import content from './content.json';
export const SmartLightStage: React.FC<{
 mode: string; lastSelectedPart: string | null; onSelect: (part: string) => void;
 warmupVideoUrl: string; activityDone: boolean; completeActivity: () => void; resetActivity: () => void;
}> = ({mode, lastSelectedPart, onSelect, warmupVideoUrl, ...activity}) => {
 const lab = useSmartLightLab();
 const ref = useRef<HTMLDivElement>(null);
 const [level, setLevel] = useState(220), [threshold, setThreshold] = useState(128);
 const [fullscreen, setFullscreen] = useState(false), [viewToken, setViewToken] = useState(0);
 useEffect(() => {
  const changed = () => setFullscreen(Boolean(ref.current && document.fullscreenElement === ref.current));
  document.addEventListener('fullscreenchange', changed);
  return () => document.removeEventListener('fullscreenchange', changed);
 }, []);
 const toggleFullscreen = () => {
  if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  else void ref.current?.requestFullscreen?.().catch(() => {});
 };
 if (mode === 'warmup') return <WarmupScreen videoUrl={warmupVideoUrl}/>;
 if (mode === 'identify') return <DuskDawnLamp selected={lastSelectedPart} onSelect={onSelect}/>;
 if (mode === 'story' && content.storyVideoUrl) return <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl}/>;
 return <div ref={ref} className={`generic-stage sl-stage sl-stage--${mode}`}>
  <div className="sl-stage-toolbar">
   <strong>{mode === 'activity' ? 'Dusk-to-dawn challenge' : mode === 'coding' ? 'Smart Light · MakeCode' : mode === 'story' ? 'How automatic lighting works' : 'Explore the dusk-to-dawn lamp'}</strong>
   <div className="sl-stage-actions">{mode === 'explore' || mode === 'activity' ? <button type="button" onClick={() => setViewToken(value => value + 1)}>Reset view</button> : null}<button type="button" onClick={toggleFullscreen}>{fullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button></div>
  </div>
  {mode === 'activity' ? <SmartLightActivity viewToken={viewToken} lab={lab} {...activity}/>
   : mode === 'coding' ? <SmartLightCoding/>
   : mode === 'story' ? (content.storyVideoUrl ? <StoryVideoCard title={content.title} youtubeEmbedUrl={content.storyVideoUrl}/> : <div className="sl-story">
    <h2>The story is not ready yet.</h2><p>Add a storyVideoUrl to this lesson&apos;s content.json.</p>
   </div>)
   : <SmartLightExplore level={level} threshold={threshold} setLevel={setLevel} setThreshold={setThreshold} viewToken={viewToken}/>}
 </div>;
};

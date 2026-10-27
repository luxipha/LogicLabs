import React, {useRef, useState} from 'react';
import {EarthquakeScene} from './EarthquakeScene';
import './earthquake.css';

/** Free model viewing only. Guided tasks belong to EarthquakeExperience. */
export function EarthquakeExplore() {
  const root = useRef<HTMLDivElement>(null);
  const [cameraKey, setCameraKey] = useState(0);
  return <div className="eq-experience eq-explore" ref={root}>
    <div className="eq-toolbar">
      <strong>Explore the shaking platform</strong>
      <button onClick={() => setCameraKey(key => key + 1)}>Reset view</button>
      <button onClick={() => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void root.current?.requestFullscreen();
      }}>Fullscreen</button>
    </div>
    <div className="eq-visual">
      <EarthquakeScene key={cameraKey} view={3} cutaway={false} stress="tension" amount={0} released={false} tick={0} shaking={0} layer="" onLayer={() => {}} />
      <span className="eq-caption">Drag to rotate · Scroll or pinch to zoom · PDF-based machine · Dimensions approximate</span>
    </div>
  </div>;
}

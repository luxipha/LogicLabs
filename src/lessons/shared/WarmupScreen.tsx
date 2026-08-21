import React from 'react';

export const WarmupScreen: React.FC<{videoUrl: string}> = ({videoUrl}) => (
  <section className="story-video-card video-only warmup-screen">
    <div className="story-video-frame">
      <iframe
        title="Warmup video"
        src={videoUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  </section>
);

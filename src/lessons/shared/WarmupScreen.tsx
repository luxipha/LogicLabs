import React from 'react';

export const WarmupScreen: React.FC<{videoUrl: string}> = ({videoUrl}) => {
  const videoId = new URL(videoUrl).pathname.split('/').pop() ?? '';
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <section className="story-video-card video-only warmup-screen">
      <div className="story-video-frame">
        <iframe
          title="Warmup video"
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <a className="warmup-screen__youtube-link" href={watchUrl} target="_blank" rel="noreferrer">
        Open the music on YouTube ↗
      </a>
    </section>
  );
};

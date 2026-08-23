import React, {useEffect, useRef, useState} from 'react';

export type DrawingTool = 'pen' | 'eraser';

const COLORS = ['#ff5252', '#ffb020', '#4caf50', '#2196f3', '#9c27b0', '#000000'];

const storageKey = (scope: string) => `classroom.drawing.${scope}`;

export const DrawingCanvas: React.FC<{
  scope: string;
  overlay?: boolean;
  className?: string;
}> = ({scope, overlay = false, className}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState(COLORS[0]);
  const drawing = useRef(false);
  const last = useRef<{x: number; y: number} | null>(null);

  // Load saved drawing on mount / scope change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = overlay ? 'transparent' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    try {
      const saved = window.localStorage.getItem(storageKey(scope));
      if (saved) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0);
        img.src = saved;
      }
    } catch {
      // storage unavailable
    }
  }, [overlay, scope]);

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    // Keep the pixel buffer at the CSS size so strokes don't blur or warp.
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width * window.devicePixelRatio);
      canvas.height = Math.round(rect.height * window.devicePixelRatio);
    }
  };

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const pos = getPos(e);
    if (!pos) {
      return;
    }
    drawing.current = true;
    last.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) {
      return;
    }
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!pos || !ctx || !last.current) {
      return;
    }
    ctx.strokeStyle = tool === 'eraser' ? (overlay ? 'rgba(255,255,255,0.9)' : '#ffffff') : color;
    ctx.lineWidth = tool === 'eraser' ? 32 : 5;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    last.current = pos;
  };

  const end = () => {
    if (!drawing.current) {
      return;
    }
    drawing.current = false;
    last.current = null;
    save();
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    try {
      window.localStorage.setItem(storageKey(scope), canvas.toDataURL());
    } catch {
      // storage unavailable
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!overlay) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    save();
  };

  const toolbar = (
    <div className={overlay ? 'draw-toolbar draw-toolbar-overlay' : 'draw-toolbar'}>
      <div className="draw-colors">
        {COLORS.map((c) => (
          <button
            key={c}
            className={color === c ? 'draw-color active' : 'draw-color'}
            style={{background: c}}
            aria-label={`Color ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="draw-tools">
        <button
          className={tool === 'pen' ? 'draw-tool active' : 'draw-tool'}
          onClick={() => setTool('pen')}
        >
          ✏️ Pen
        </button>
        <button
          className={tool === 'eraser' ? 'draw-tool active' : 'draw-tool'}
          onClick={() => setTool('eraser')}
        >
          🧽 Eraser
        </button>
        <button className="draw-tool" onClick={clear}>
          🗑️ Clear
        </button>
      </div>
    </div>
  );

  return (
    <div className={overlay ? 'draw-overlay-wrap' : 'draw-board-wrap'}>
      {toolbar}
      <canvas
        ref={canvasRef}
        className={className ?? (overlay ? 'draw-canvas draw-canvas-overlay' : 'draw-canvas')}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
    </div>
  );
};

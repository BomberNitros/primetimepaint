import React, { useState, useEffect } from 'react';

interface DualSliderProps {
  leftImages: { src: string; label: string }[];
  rightImages: { src: string; label: string }[];
  sharedIndex: number;
  onIndexChange: (i: number) => void;
  primingHint?: string;
}

export function DualSlider({
  leftImages,
  rightImages,
  sharedIndex,
  onIndexChange,
  primingHint,
}: DualSliderProps) {
  const [zoomImage, setZoomImage] = useState<{ src: string; label: string } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOffset, setZoomOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0 });

  const glowStyle: React.CSSProperties = {
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid #a855f7',
    boxShadow: '0 0 8px #a855f7, 0 0 16px rgba(168,85,247,0.35)',
    borderRadius: '0.375rem',
    padding: '2px 10px',
    color: '#e9d5ff',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
  };

  const maxCount = Math.max(leftImages.length, rightImages.length);

  // Imperative wheel zoom
  useEffect(() => {
    if (!zoomImage) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoomScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.002)));
    };
    window.addEventListener('wheel', handler, { passive: false });
    return () => window.removeEventListener('wheel', handler);
  }, [zoomImage]);

  // Drag pan
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setZoomOffset({
        x: dragStart.ox + (e.clientX - dragStart.x) / zoomScale,
        y: dragStart.oy + (e.clientY - dragStart.y) / zoomScale,
      });
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragStart, zoomScale]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomImage(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const leftItem = leftImages[sharedIndex];
  const rightItem = rightImages[sharedIndex];

  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '2px 12px',
    fontSize: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--color-border)',
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'transparent',
    color: 'inherit',
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
        {/* Left panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={glowStyle}>{leftItem?.label ?? 'Image'}</span>
            {primingHint && (
              <span style={{ ...glowStyle, fontSize: '0.65rem', opacity: 0.8 }}>{primingHint}</span>
            )}
          </div>
          <div style={{ height: '320px', overflow: 'hidden', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
            {leftItem?.src ? (
              <img
                src={leftItem.src}
                alt={leftItem.label}
                style={{ width: '100%', height: '320px', objectFit: 'contain', cursor: 'zoom-in' }}
                onClick={() => setZoomImage(leftItem)}
              />
            ) : (
              <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                No image
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={glowStyle}>{rightItem?.label ?? 'Repaint'}</span>
          </div>
          <div style={{ height: '320px', overflow: 'hidden', borderRadius: '0.375rem', border: '1px solid var(--color-border)' }}>
            {rightItem?.src ? (
              <img
                src={rightItem.src}
                alt={rightItem.label}
                style={{ width: '100%', height: '320px', objectFit: 'contain', cursor: 'zoom-in' }}
                onClick={() => setZoomImage(rightItem)}
              />
            ) : (
              <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                Repaint pending
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        {maxCount > 1 && (
          <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              disabled={sharedIndex === 0}
              onClick={() => onIndexChange(sharedIndex - 1)}
              style={navBtnStyle(sharedIndex === 0)}
            >
              ← Prev
            </button>
            <span style={glowStyle}>
              {sharedIndex + 1} / {maxCount}
            </span>
            <button
              type="button"
              disabled={sharedIndex >= maxCount - 1}
              onClick={() => onIndexChange(sharedIndex + 1)}
              style={navBtnStyle(sharedIndex >= maxCount - 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {zoomImage && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setZoomImage(null)}
        >
          <button
            type="button"
            style={{ ...glowStyle, position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, cursor: 'pointer', fontSize: '1rem', padding: '4px 14px' }}
            onClick={() => setZoomImage(null)}
          >
            ✕
          </button>

          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={glowStyle}>{zoomImage.label}</span>
            <span style={glowStyle}>{Math.round(zoomScale * 100)}%</span>
            <button
              type="button"
              style={{ ...glowStyle, cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation();
                setZoomScale(1);
                setZoomOffset({ x: 0, y: 0 });
              }}
            >
              Reset
            </button>
          </div>

          <div style={{
            position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10,
            ...glowStyle, fontSize: '0.8rem', padding: '6px 18px',
          }}>
            Scroll to zoom · Drag to pan · Esc to close
          </div>

          <img
            src={zoomImage.src}
            alt="Zoomed"
            draggable={false}
            style={{
              transform: `scale(${zoomScale}) translate(${zoomOffset.x}px,${zoomOffset.y}px)`,
              transformOrigin: 'center center',
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
              userSelect: 'none',
              transition: isDragging ? 'none' : 'transform 0.1s ease',
            }}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => {
              if (zoomScale <= 1) return;
              e.preventDefault();
              setIsDragging(true);
              setDragStart({ x: e.clientX, y: e.clientY, ox: zoomOffset.x, oy: zoomOffset.y });
            }}
          />
        </div>
      )}
    </>
  );
}

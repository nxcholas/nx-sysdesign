import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'NX-Design — Design your system. Then watch it come to life.';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0f1117',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle grid dots background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.35,
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 5,
                width: 28,
                height: 28,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    border: '2px solid white',
                    background: 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: '#f9fafb',
              letterSpacing: '-0.02em',
            }}
          >
            NX-Design
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#f9fafb',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Visualize System Architecture in Your Browser
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: '#9ca3af',
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          Drag-and-drop canvas with 100+ components, ERD tables, and live animated data-flow connections.
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            left: 96,
            fontSize: 18,
            color: '#60a5fa',
            letterSpacing: '0.01em',
          }}
        >
          nxdesign.app
        </div>
      </div>
    ),
    { ...size }
  );
}

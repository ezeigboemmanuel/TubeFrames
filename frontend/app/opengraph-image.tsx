import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'TubeFrames.dev - The Open Source Video Frame Extractor'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  // zinc-950
  const bgDark = '#09090b'
  // zinc-800
  const borderColor = '#27272a'
  // zinc-50
  const textLight = '#fafafa'
  // zinc-400
  const textMuted = '#a1a1aa'

  return new ImageResponse(
    (
      // Outer Container (Background)
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgDark,
          // Subtle radial gradient to focus attention in center
          backgroundImage: `radial-gradient(circle at center, #18181b 0%, ${bgDark} 100%)`,
          fontFamily: 'monospace',
        }}
      >
        {/* Decorative Technical Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${borderColor} 1px, transparent 1px), linear-gradient(to right, ${borderColor} 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            opacity: 0.15,
            maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          }}
        />

        {/* Main Content Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            padding: '60px 100px',
            borderRadius: '32px',
            border: `2px solid ${borderColor}`,
            backgroundColor: 'rgba(24, 24, 27, 0.6)', // zinc-900 transparent
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Icon representing film/frames */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke={textLight}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: 30, opacity: 0.9 }}
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 3v18" />
            <path d="M17 3v18" />
            <path d="M3 7h18" />
            <path d="M3 17h18" />
          </svg>

          {/* Title */}
          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              color: textLight,
              letterSpacing: '-0.06em',
              lineHeight: 1,
              marginBottom: 20,
            }}
          >
            tubeframes.dev
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: textMuted,
              textAlign: 'center',
              fontWeight: 500,
              marginBottom: 40,
            }}
          >
            Extract exact frames from YouTube. In seconds.
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 22,
              fontWeight: 600,
              // Green-500 text
              color: '#22c55e',
              // Green-950/900 bg
              backgroundColor: 'rgba(5, 46, 22, 0.8)',
              padding: '12px 24px',
              borderRadius: '99px',
              // Green-800 border
              border: '2px solid #166534',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: 10 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Free & Open Source
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
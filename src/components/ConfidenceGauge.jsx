import React from 'react';

/**
 * Animated SVG circular confidence gauge
 */
export default function ConfidenceGauge({ confidence = 0, isSpam = false, size = 180, strokeWidth = 14 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Convert 0-100 to stroke dashoffset
  const normalizedConfidence = Math.max(0, Math.min(100, confidence));
  const strokeDashoffset = circumference - (normalizedConfidence / 100) * circumference;

  const color = isSpam ? '#f43f5e' : '#10b981';
  const glowColor = isSpam ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)';

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 10px ${glowColor})`
          }}
        />
      </svg>

      {/* Center Label */}
      <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '2.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {normalizedConfidence.toFixed(1)}%
        </span>
        <span style={{ fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 600 }}>
          Confidence
        </span>
      </div>
    </div>
  );
}

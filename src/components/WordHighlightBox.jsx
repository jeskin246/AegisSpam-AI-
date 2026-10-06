import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Info, Tag, ExternalLink } from 'lucide-react';

/**
 * Word Highlight Box with interactive Popover/Tooltip
 */
export default function WordHighlightBox({ tokens = [], fullText = '', isSpam = false }) {
  const [activeToken, setActiveToken] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'suspicious-only' | 'high-only'

  const suspiciousCount = tokens.filter(t => t.isSuspicious).length;
  const hamCount = tokens.filter(t => t.isHamIndicator).length;

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} color={isSpam ? '#f43f5e' : '#10b981'} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Explainable AI: Pattern & Keyword Attribution</h4>
        </div>

        {/* Highlight Filter Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              background: filterMode === 'all' ? 'var(--accent-blue)' : 'transparent',
              color: filterMode === 'all' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            All Tokens
          </button>
          <button
            onClick={() => setFilterMode('suspicious-only')}
            style={{
              background: filterMode === 'suspicious-only' ? 'var(--status-spam)' : 'transparent',
              color: filterMode === 'suspicious-only' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Flagged Only ({suspiciousCount})
          </button>
          <button
            onClick={() => setFilterMode('high-only')}
            style={{
              background: filterMode === 'high-only' ? '#e11d48' : 'transparent',
              color: filterMode === 'high-only' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.25rem 0.65rem',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            High Risk ({tokens.filter(t => t.severity === 'high').length})
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(244, 63, 94, 0.4)', border: '1px solid #f43f5e' }}></span>
          High Risk Spam Signal
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(245, 158, 11, 0.4)', border: '1px solid #f59e0b' }}></span>
          Moderate Risk
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(16, 185, 129, 0.3)', border: '1px solid #10b981' }}></span>
          Legitimate (Ham) Signal
        </span>
        <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
          Tip: Hover or click any highlighted word to inspect log-odds weight
        </span>
      </div>

      {/* Rendered Text with Highlight Badges */}
      <div
        style={{
          background: 'rgba(10, 15, 29, 0.9)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          fontSize: '0.95rem',
          lineHeight: '1.8',
          fontFamily: 'var(--font-sans)',
          minHeight: '110px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          position: 'relative'
        }}
      >
        {tokens.length === 0 ? (
          <span style={{ color: 'var(--text-muted)' }}>No text available for token analysis.</span>
        ) : (
          tokens.map((token, index) => {
            if (token.isWhitespace) {
              return <span key={index}>{token.text}</span>;
            }

            const shouldHighlight =
              filterMode === 'all'
                ? token.isSuspicious || token.isHamIndicator
                : filterMode === 'suspicious-only'
                ? token.isSuspicious
                : token.severity === 'high';

            if (!shouldHighlight) {
              return (
                <span
                  key={index}
                  style={{
                    color: token.isSuspicious ? 'var(--text-primary)' : 'inherit',
                    opacity: filterMode !== 'all' ? 0.45 : 1
                  }}
                >
                  {token.text}
                </span>
              );
            }

            return (
              <span
                key={index}
                className={`highlight-token severity-${token.severity || 'neutral'}`}
                onClick={() => setActiveToken(token)}
                onMouseEnter={() => setActiveToken(token)}
                style={{
                  outline: activeToken === token ? '2px solid #38bdf8' : 'none'
                }}
              >
                {token.text}
              </span>
            );
          })
        )}
      </div>

      {/* Active Token Explanation Drawer / Card */}
      {activeToken && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: activeToken.weight > 0 ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
            border: `1px solid ${activeToken.weight > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: activeToken.weight > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {activeToken.weight > 0 ? (
                <AlertTriangle size={18} color="#f43f5e" />
              ) : (
                <ShieldCheck size={18} color="#10b981" />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                  "{activeToken.text}"
                </span>
                <span className={`badge ${activeToken.weight > 0 ? 'badge-spam' : 'badge-ham'}`}>
                  {activeToken.category || 'General'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  Log-Odds Contribution: {activeToken.weight > 0 ? `+${activeToken.weight}` : activeToken.weight}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {activeToken.reason || 'Trigger token calibrated from standard spam training corpus.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveToken(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem',
              padding: '0.25rem'
            }}
            title="Dismiss details"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

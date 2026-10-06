import React from 'react';
import { Shield, ShieldAlert, BookOpen, Sliders, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

export default function Header({ sensitivity, setSensitivity, onOpenDocs, totalScans = 0 }) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 15, 29, 0.85)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div className="container" style={{ padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Logo & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)'
              }}
            >
              <Shield size={24} color="#ffffff" />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                  AegisSpam <span className="text-gradient-cyan">AI</span>
                </h1>
                <span className="badge badge-ham" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                  v2.4 Online
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Intelligent NLP & Heuristic Threat Defense Engine for SMS and Emails
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* Model Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}
              title="Multinomial Naive Bayes + Heuristic Feature Extractor"
            >
              <Cpu size={14} color="#38bdf8" />
              <span>Model: <strong style={{ color: '#fff' }}>Naive Bayes + NLP</strong></span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            </div>

            {/* Sensitivity Threshold Selector */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.35rem 0.65rem'
              }}
            >
              <Sliders size={14} color="#f59e0b" />
              <label htmlFor="sensitivity-select" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Sensitivity:
              </label>
              <select
                id="sensitivity-select"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.1rem 0.3rem',
                  width: 'auto'
                }}
              >
                <option value={0.35} style={{ background: '#0f172a' }}>Aggressive (35% threshold)</option>
                <option value={0.50} style={{ background: '#0f172a' }}>Balanced (50% default)</option>
                <option value={0.70} style={{ background: '#0f172a' }}>Conservative (70% threshold)</option>
              </select>
            </div>

            {/* Documentation & Training Guide Button */}
            <button
              onClick={onOpenDocs}
              className="btn btn-secondary btn-sm"
              title="View Model Documentation, Bayes Math, and Python Training Script"
            >
              <BookOpen size={15} />
              <span>Model & Training Guide</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

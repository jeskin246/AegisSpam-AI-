import React from 'react';
import { Search, Layers, BarChart3, History, BookOpen, Sparkles } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, historyCount = 0 }) {
  const tabs = [
    { id: 'inspector', label: 'Message Inspector', icon: Search, badge: null },
    { id: 'batch', label: 'Batch Analyzer', icon: Layers, badge: 'Multi' },
    { id: 'dashboard', label: 'Spam Dashboard', icon: BarChart3, badge: null },
    { id: 'history', label: 'Scan History', icon: History, badge: historyCount > 0 ? historyCount : null },
    { id: 'docs', label: 'Model & Training Hub', icon: BookOpen, badge: 'Docs' }
  ];

  return (
    <nav style={{ margin: '1.5rem 0 1.25rem 0' }}>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.35rem',
          scrollbarWidth: 'none'
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'rgba(56, 189, 248, 0.35)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={17} color={isActive ? '#38bdf8' : 'currentColor'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  style={{
                    background: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#e0f2fe' : 'var(--text-muted)',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

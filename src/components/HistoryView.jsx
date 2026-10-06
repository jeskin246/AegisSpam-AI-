import React, { useState } from 'react';
import { 
  History, Trash2, Search, ArrowRight, Download, 
  ShieldAlert, ShieldCheck, Clock, ExternalLink 
} from 'lucide-react';

export default function HistoryView({ history = [], onReanalyze, onDeleteItem, onClearAll }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'spam' | 'ham'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter(item => {
    if (filterType === 'spam' && !item.isSpam) return false;
    if (filterType === 'ham' && item.isSpam) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inText = item.text && item.text.toLowerCase().includes(q);
      const inSubject = item.subject && item.subject.toLowerCase().includes(q);
      const inSender = item.sender && item.sender.toLowerCase().includes(q);
      if (!inText && !inSubject && !inSender) return false;
    }
    return true;
  });

  const exportHistoryJSON = () => {
    if (history.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis_spam_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header & Controls */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Analysis History</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Persistent audit trail of all messages evaluated by AegisSpam AI ({history.length} records)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={exportHistoryJSON}
              className="btn btn-secondary btn-sm"
              disabled={history.length === 0}
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onClearAll}
              className="btn btn-danger btn-sm"
              disabled={history.length === 0}
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                background: filterType === 'all' ? 'var(--accent-blue)' : 'transparent',
                color: filterType === 'all' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setFilterType('spam')}
              style={{
                background: filterType === 'spam' ? 'var(--status-spam)' : 'transparent',
                color: filterType === 'spam' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Spam ({history.filter(h => h.isSpam).length})
            </button>
            <button
              onClick={() => setFilterType('ham')}
              style={{
                background: filterType === 'ham' ? 'var(--status-ham)' : 'transparent',
                color: filterType === 'ham' ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Ham ({history.filter(h => !h.isSpam).length})
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.4rem 0.65rem 0.4rem 2.2rem', fontSize: '0.825rem' }}
            />
          </div>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <History size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
          <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            No History Records Found
          </h4>
          <p style={{ fontSize: '0.825rem', margin: 0 }}>
            {history.length === 0
              ? "Messages analyzed in the Inspector or Batch Analyzer will be safely logged here."
              : "No records match your search or filter criteria."}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredHistory.map((item, idx) => {
            const formattedDate = item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Recent';

            return (
              <div
                key={item.id || idx}
                className="glass-panel"
                style={{
                  padding: '1.15rem 1.25rem',
                  borderLeft: `3px solid ${item.isSpam ? 'var(--status-spam)' : 'var(--status-ham)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                {/* Item Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={`badge ${item.isSpam ? 'badge-spam' : 'badge-ham'}`}>
                      {item.isSpam ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                      {item.label || (item.isSpam ? 'Spam' : 'Not Spam')}
                    </span>
                    <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: item.isSpam ? '#fda4af' : '#6ee7b7' }}>
                      {item.confidence?.toFixed(1)}% Confidence
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      • {item.messageType === 'email' ? 'Email' : 'SMS'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      {formattedDate}
                    </span>

                    <button
                      onClick={() => onReanalyze(item)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Load into Single Analyzer for re-inspection"
                    >
                      <span>Re-Analyze</span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      onClick={() => onDeleteItem(item.id || idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subject & Sender info if email */}
                {(item.subject || item.sender) && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.subject && <div><strong>Subject:</strong> {item.subject}</div>}
                    {item.sender && <div><strong>From:</strong> {item.sender}</div>}
                  </div>
                )}

                {/* Message Snippet */}
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {item.text}
                </p>

                {/* Trigger Tokens Chips */}
                {item.suspiciousTokens && item.suspiciousTokens.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Triggers:
                    </span>
                    {item.suspiciousTokens.slice(0, 5).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        style={{
                          fontSize: '0.7rem',
                          background: 'rgba(244, 63, 94, 0.12)',
                          color: '#fda4af',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {t.token}
                      </span>
                    ))}
                    {item.suspiciousTokens.length > 5 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        +{item.suspiciousTokens.length - 5} more
                      </span>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

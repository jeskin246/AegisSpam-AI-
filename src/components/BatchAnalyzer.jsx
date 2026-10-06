import React, { useState } from 'react';
import { 
  Upload, Layers, Play, Download, Search, CheckCircle, 
  ShieldAlert, ShieldCheck, Filter, FileText, Sparkles, RefreshCw, Eye
} from 'lucide-react';
import { classifyMessage } from '../ml/spamClassifier';
import { BATCH_SAMPLE_DATASET } from '../data/sampleMessages';

export default function BatchAnalyzer({ sensitivity = 0.50, onInspectMessage, onSaveBatchToHistory }) {
  const [rawInput, setRawInput] = useState('');
  const [delimiterMode, setDelimiterMode] = useState('newline'); // 'newline' | 'separator'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'spam' | 'ham'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedItem, setInspectedItem] = useState(null);

  const handleLoadSamples = () => {
    setRawInput(BATCH_SAMPLE_DATASET.join('\n'));
    setResults([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawInput(content);
      setResults([]);
    };
    reader.readAsText(file);
  };

  const runBatchAnalysis = () => {
    let items = [];
    if (delimiterMode === 'newline') {
      items = rawInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } else {
      items = rawInput
        .split('---')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    if (items.length === 0) {
      alert('Please enter or upload at least one message.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);

    const batchResults = [];
    const total = items.length;

    // Process iteratively with animation
    items.forEach((msg, idx) => {
      setTimeout(() => {
        const classified = classifyMessage(msg, { sensitivityThreshold: sensitivity });
        batchResults.push({
          id: `batch-${Date.now()}-${idx}`,
          index: idx + 1,
          text: msg,
          ...classified
        });

        setProgress(Math.round(((idx + 1) / total) * 100));

        if (idx === total - 1) {
          setResults(batchResults);
          setIsProcessing(false);
          if (onSaveBatchToHistory) {
            onSaveBatchToHistory(batchResults);
          }
        }
      }, idx * 40);
    });
  };

  // Summary Metrics
  const totalCount = results.length;
  const spamCount = results.filter(r => r.isSpam).length;
  const hamCount = results.filter(r => !r.isSpam).length;
  const spamPercentage = totalCount > 0 ? Math.round((spamCount / totalCount) * 100) : 0;
  const avgConfidence = totalCount > 0
    ? (results.reduce((acc, r) => acc + r.confidence, 0) / totalCount).toFixed(1)
    : 0;

  // Filtered Results
  const filteredResults = results.filter(r => {
    if (filterType === 'spam' && !r.isSpam) return false;
    if (filterType === 'ham' && r.isSpam) return false;
    if (searchQuery && !r.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (results.length === 0) return;
    const headers = ['ID', 'Classification', 'Confidence (%)', 'Risk Level', 'Spam Probability', 'Detected Triggers', 'Message'];
    const rows = results.map(r => [
      r.index,
      r.isSpam ? 'SPAM' : 'HAM',
      r.confidence,
      `"${r.riskLevel}"`,
      r.spamProbability,
      `"${r.suspiciousTokens.map(t => t.token).join(', ')}"`,
      `"${r.text.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aegis_spam_batch_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Batch Input Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Batch Message Threat Analyzer</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Classify large batches of SMS, text messages, or email snippets simultaneously
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleLoadSamples}
              className="btn btn-secondary btn-sm"
              title="Load 10 realistic test messages"
            >
              <Sparkles size={14} color="#38bdf8" />
              <span>Load 10 Sample Batch</span>
            </button>

            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <Upload size={14} />
              <span>Upload CSV / TXT</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Delimiter Mode & Format Notes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.785rem', color: 'var(--text-secondary)' }}>
          <span>Input Format:</span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input
                type="radio"
                name="delimiter"
                checked={delimiterMode === 'newline'}
                onChange={() => setDelimiterMode('newline')}
                style={{ width: 'auto' }}
              />
              One message per line
            </label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input
                type="radio"
                name="delimiter"
                checked={delimiterMode === 'separator'}
                onChange={() => setDelimiterMode('separator')}
                style={{ width: 'auto' }}
              />
              Separated by "---"
            </label>
          </div>
        </div>

        <textarea
          rows={6}
          placeholder="Paste multiple messages here... (one per line, or separated by '---')"
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
        />

        {/* Run Button & Progress Bar */}
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Detected approx. {rawInput ? (delimiterMode === 'newline' ? rawInput.split('\n').filter(Boolean).length : rawInput.split('---').filter(Boolean).length) : 0} items
          </span>

          <button
            onClick={runBatchAnalysis}
            className="btn btn-primary"
            disabled={isProcessing || !rawInput.trim()}
            style={{ minWidth: '160px' }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} className="scanner-radar" />
                <span>Processing ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Run Batch Classification</span>
              </>
            )}
          </button>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
                  transition: 'width 0.1s ease'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Batch Summary & Table */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Summary Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            
            <div className="glass-panel" style={{ padding: '1.15rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Total Analyzed
              </span>
              <h3 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-mono)', margin: '0.2rem 0' }}>
                {totalCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Messages in batch</span>
            </div>

            <div className="glass-panel" style={{ padding: '1.15rem', borderLeft: '3px solid var(--status-spam)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fda4af', fontWeight: 600 }}>
                Spam Detected
              </span>
              <h3 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-mono)', color: '#f43f5e', margin: '0.2rem 0' }}>
                {spamCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {spamPercentage}% of total batch
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.15rem', borderLeft: '3px solid var(--status-ham)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 600 }}>
                Legitimate (Ham)
              </span>
              <h3 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-mono)', color: '#10b981', margin: '0.2rem 0' }}>
                {hamCount}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {100 - spamPercentage}% verified clean
              </span>
            </div>

            <div className="glass-panel" style={{ padding: '1.15rem', borderLeft: '3px solid var(--accent-cyan)' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 600 }}>
                Avg Confidence
              </span>
              <h3 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', margin: '0.2rem 0' }}>
                {avgConfidence}%
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Model certainty score</span>
            </div>

          </div>

          {/* Interactive Filter & Results Table */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              
              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
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
                  All ({totalCount})
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
                  Spam ({spamCount})
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
                  Ham ({hamCount})
                </button>
              </div>

              {/* Search & Export Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search in batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '0.4rem 0.65rem 0.4rem 2.2rem', fontSize: '0.825rem' }}
                  />
                </div>

                <button
                  onClick={exportToCSV}
                  className="btn btn-secondary btn-sm"
                  title="Export results table to CSV"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 0.5rem', width: '40px' }}>#</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Message Snippet</th>
                    <th style={{ padding: '0.75rem 1rem', width: '130px' }}>Verdict</th>
                    <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Confidence</th>
                    <th style={{ padding: '0.75rem 1rem', width: '160px' }}>Key Triggers</th>
                    <th style={{ padding: '0.75rem 0.75rem', width: '90px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No matching messages found for current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.85rem 0.5rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {item.index}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '380px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                            {item.text}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`badge ${item.isSpam ? 'badge-spam' : 'badge-ham'}`}>
                            {item.isSpam ? 'Spam' : 'Not Spam'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          <span style={{ color: item.isSpam ? '#fda4af' : '#6ee7b7' }}>
                            {item.confidence.toFixed(1)}%
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {item.suspiciousTokens.length > 0 ? (
                              item.suspiciousTokens.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '0.7rem',
                                    background: 'rgba(244, 63, 94, 0.15)',
                                    color: '#fda4af',
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '3px',
                                    fontFamily: 'var(--font-mono)'
                                  }}
                                >
                                  {t.token}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>None (Clean)</span>
                            )}
                            {item.suspiciousTokens.length > 2 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                +{item.suspiciousTokens.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 0.75rem' }}>
                          <button
                            onClick={() => {
                              if (onInspectMessage) {
                                onInspectMessage(item);
                              } else {
                                setInspectedItem(item);
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                            title="Inspect in Single Analyzer"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* Quick Modal if inspected in-place */}
      {inspectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}
          onClick={() => setInspectedItem(null)}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '650px',
              width: '100%',
              padding: '1.75rem',
              border: `1px solid ${inspectedItem.isSpam ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className={`badge ${inspectedItem.isSpam ? 'badge-spam' : 'badge-ham'}`}>
                {inspectedItem.label} ({inspectedItem.confidence}%)
              </span>
              <button
                onClick={() => setInspectedItem(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <p style={{ background: '#0a0f1d', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {inspectedItem.text}
            </p>

            <div style={{ marginTop: '1rem' }}>
              <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Detected Suspicious Elements ({inspectedItem.suspiciousTokens.length}):
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {inspectedItem.suspiciousTokens.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fda4af',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}
                  >
                    <strong>{t.token}</strong> ({t.category})
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.5rem' }}>
              <button onClick={() => setInspectedItem(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              {onInspectMessage && (
                <button
                  onClick={() => {
                    const itm = inspectedItem;
                    setInspectedItem(null);
                    onInspectMessage(itm);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  Open in Single Inspector
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

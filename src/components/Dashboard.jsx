import React from 'react';
import { 
  BarChart3, ShieldAlert, ShieldCheck, Activity, Target, 
  TrendingUp, Award, Zap, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function Dashboard({ history = [], onResetStats }) {
  // Aggregate stats from history
  const totalScans = history.length;
  const spamScans = history.filter(item => item.isSpam).length;
  const hamScans = history.filter(item => !item.isSpam).length;
  const spamRate = totalScans > 0 ? Math.round((spamScans / totalScans) * 100) : 0;
  
  const avgConfidence = totalScans > 0
    ? (history.reduce((acc, item) => acc + (item.confidence || 0), 0) / totalScans).toFixed(1)
    : 0;

  // Aggregate word frequency from all scans
  const wordFrequencyMap = {};
  const categoryCounter = {
    Phishing: 0,
    'Financial/Prize': 0,
    Urgency: 0,
    Marketing: 0,
    Links: 0
  };

  history.forEach(item => {
    if (item.suspiciousTokens && Array.isArray(item.suspiciousTokens)) {
      item.suspiciousTokens.forEach(t => {
        const key = t.token.toLowerCase();
        wordFrequencyMap[key] = (wordFrequencyMap[key] || 0) + 1;
        if (categoryCounter[t.category] !== undefined) {
          categoryCounter[t.category] += 1;
        } else {
          categoryCounter['Phishing'] += 1;
        }
      });
    }

    if (item.matchedPatterns && Array.isArray(item.matchedPatterns)) {
      item.matchedPatterns.forEach(p => {
        if (p.id.includes('url') || p.id.includes('ip') || p.id.includes('tld')) {
          categoryCounter.Links += 1;
        }
      });
    }
  });

  // Sort top 10 keywords
  const topWords = Object.entries(wordFrequencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxWordFreq = topWords.length > 0 ? topWords[0][1] : 1;

  // Confidence distribution buckets
  const confidenceBuckets = {
    '90% - 100%': 0,
    '75% - 89%': 0,
    '50% - 74%': 0,
    'Below 50%': 0
  };

  history.forEach(item => {
    const c = item.confidence || 0;
    if (c >= 90) confidenceBuckets['90% - 100%'] += 1;
    else if (c >= 75) confidenceBuckets['75% - 89%'] += 1;
    else if (c >= 50) confidenceBuckets['50% - 74%'] += 1;
    else confidenceBuckets['Below 50%'] += 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Total Scanned */}
        <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total Scans
            </span>
            <Activity size={18} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', margin: '0.4rem 0 0.2rem 0' }}>
            {totalScans}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Messages analyzed</span>
        </div>

        {/* Spam Detected */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--status-spam)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#fda4af', fontWeight: 600 }}>
              Spam Filtered
            </span>
            <ShieldAlert size={18} color="#f43f5e" />
          </div>
          <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', color: '#f43f5e', margin: '0.4rem 0 0.2rem 0' }}>
            {spamScans}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {spamRate}% global detection rate
          </span>
        </div>

        {/* Legitimate Clean */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--status-ham)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 600 }}>
              Legitimate (Ham)
            </span>
            <ShieldCheck size={18} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', color: '#10b981', margin: '0.4rem 0 0.2rem 0' }}>
            {hamScans}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {100 - spamRate}% legitimate traffic
          </span>
        </div>

        {/* Average Model Certainty */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '3px solid var(--accent-indigo)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#818cf8', fontWeight: 600 }}>
              Avg Certainty
            </span>
            <Target size={18} color="#818cf8" />
          </div>
          <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-mono)', color: '#818cf8', margin: '0.4rem 0 0.2rem 0' }}>
            {avgConfidence}%
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence score mean</span>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Top Trigger Keywords Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#f43f5e" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Top Detected Spam Trigger Keywords</h4>
            </div>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Frequency</span>
          </div>

          {topWords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No keywords detected yet. Run or test messages to populate telemetry.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topWords.map(([word, freq]) => {
                const percentage = Math.round((freq / maxWordFreq) * 100);
                return (
                  <div key={word}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#fff' }}>"{word}"</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{freq} hits</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
                          borderRadius: '3px',
                          transition: 'width 0.6s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Threat Vector Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Threat Vector Classification</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(categoryCounter).map(([cat, count]) => {
              const totalCategoryHits = Object.values(categoryCounter).reduce((a, b) => a + b, 0) || 1;
              const catPercent = Math.round((count / totalCategoryHits) * 100);
              
              let barColor = '#38bdf8';
              if (cat === 'Phishing') barColor = '#f43f5e';
              if (cat === 'Financial/Prize') barColor = '#f59e0b';
              if (cat === 'Urgency') barColor = '#e11d48';
              if (cat === 'Links') barColor = '#8b5cf6';

              return (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{count} ({catPercent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${catPercent}%`,
                        height: '100%',
                        background: barColor,
                        borderRadius: '3px',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Confidence Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={18} color="#10b981" />
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Confidence Distribution</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(confidenceBuckets).map(([range, count]) => {
              const bucketPercent = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
              return (
                <div key={range}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{range}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{count} scans ({bucketPercent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${bucketPercent}%`,
                        height: '100%',
                        background: range.includes('90') ? '#10b981' : range.includes('75') ? '#38bdf8' : range.includes('50') ? '#f59e0b' : '#f43f5e',
                        borderRadius: '3px',
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

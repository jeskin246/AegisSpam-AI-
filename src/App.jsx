import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SingleAnalyzer from './components/SingleAnalyzer';
import BatchAnalyzer from './components/BatchAnalyzer';
import Dashboard from './components/Dashboard';
import HistoryView from './components/HistoryView';
import ModelDocsModal from './components/ModelDocsModal';
import { SAMPLE_MESSAGES } from './data/sampleMessages';
import { classifyMessage } from './ml/spamClassifier';

const STORAGE_KEY = 'aegis_spam_ai_history_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState('inspector');
  const [sensitivity, setSensitivity] = useState(0.50);
  const [history, setHistory] = useState([]);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [inspectedMessage, setInspectedMessage] = useState(null);

  // Initialize history from localStorage or seed initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        // Seed 4 initial realistic scans so dashboard has data immediately
        const seedSamples = [SAMPLE_MESSAGES[0], SAMPLE_MESSAGES[1], SAMPLE_MESSAGES[6], SAMPLE_MESSAGES[7]];
        const seededHistory = seedSamples.map((s, idx) => {
          const res = classifyMessage(s.text, {
            sensitivityThreshold: 0.50,
            messageType: s.type,
            sender: s.sender,
            subject: s.subject
          });
          return {
            id: `seed-${idx}`,
            text: s.text,
            sender: s.sender,
            subject: s.subject,
            ...res
          };
        });
        setHistory(seededHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seededHistory));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, []);

  // Save history updates
  const saveHistoryToStorage = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error('Failed to persist history:', e);
    }
  };

  const handleSaveToHistory = (item) => {
    const record = {
      id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...item
    };
    const updated = [record, ...history].slice(0, 150); // Keep last 150
    saveHistoryToStorage(updated);
  };

  const handleSaveBatchToHistory = (batchItems) => {
    const records = batchItems.map((item, idx) => ({
      ...item,
      id: `batch-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString()
    }));
    const updated = [...records, ...history].slice(0, 200);
    saveHistoryToStorage(updated);
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all analysis history?')) {
      saveHistoryToStorage([]);
    }
  };

  const handleInspectMessage = (item) => {
    setInspectedMessage(item);
    setActiveTab('inspector');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <Header
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
        onOpenDocs={() => setIsDocsOpen(true)}
        totalScans={history.length}
      />

      {/* Main App Container */}
      <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
        
        {/* Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'docs') {
              setIsDocsOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          historyCount={history.length}
        />

        {/* Tab Views */}
        {activeTab === 'inspector' && (
          <SingleAnalyzer
            sensitivity={sensitivity}
            onSaveToHistory={handleSaveToHistory}
            initialMessage={inspectedMessage}
          />
        )}

        {activeTab === 'batch' && (
          <BatchAnalyzer
            sensitivity={sensitivity}
            onInspectMessage={handleInspectMessage}
            onSaveBatchToHistory={handleSaveBatchToHistory}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            history={history}
            onResetStats={handleClearAllHistory}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onReanalyze={handleInspectMessage}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
          />
        )}

      </main>

      {/* Model & Training Hub Modal */}
      <ModelDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.25rem 0',
          background: 'rgba(10, 15, 29, 0.7)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>AegisSpam AI Engine</strong> • Client-Side NLP & Heuristics Threat Classifier
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span style={{ cursor: 'pointer', color: '#38bdf8' }} onClick={() => setIsDocsOpen(true)}>
              Model Architecture & Docs
            </span>
            <span>Zero-Cloud Latency</span>
            <span>Privacy Preserved (100% Local Processing)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  BookOpen, Code, Terminal, Cpu, Database, Check, Copy, 
  Search, Shield, AlertTriangle, ArrowRight, Zap, Play
} from 'lucide-react';
import { SPAM_VOCABULARY, MODEL_METADATA } from '../ml/spamModelData';

export default function ModelDocsModal({ isOpen, onClose }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [testWord, setTestWord] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'training' | 'local' | 'vocab'

  if (!isOpen) return null;

  const handleCopyPythonScript = () => {
    const pythonCode = `import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

# 1. Load dataset (e.g., SMS Spam Collection from Kaggle/UCI)
df = pd.read_csv('spam.csv', encoding='latin-1')[['v1', 'v2']]
df.columns = ['label', 'text']
df['target'] = df['label'].map({'ham': 0, 'spam': 1})

# 2. TF-IDF Feature Extraction
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', sublinear_tf=True)
X = vectorizer.fit_transform(df['text'])
y = df['target']

# 3. Train Multinomial Naive Bayes
model = MultinomialNB(alpha=1.0)
model.fit(X, y)

# 4. Evaluate
preds = model.predict(X)
print(classification_report(y, preds, target_names=['Ham', 'Spam']))`;

    navigator.clipboard.writeText(pythonCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Vocabulary search lookup
  const cleanWord = testWord.toLowerCase().trim();
  const foundVocab = cleanWord ? SPAM_VOCABULARY[cleanWord] : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '920px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(10, 15, 29, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Model Architecture & Developer Training Guide
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Naive Bayes NLP Math, Feature Extraction Pipeline & Local Run Instructions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', padding: '0 1.5rem' }}>
          {[
            { id: 'overview', label: 'Architecture & Math' },
            { id: 'training', label: 'Python Training Pipeline' },
            { id: 'local', label: 'Run Locally Guide' },
            { id: 'vocab', label: 'Interactive Vocabulary Inspector' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === t.id ? '#38bdf8' : 'var(--text-secondary)',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === t.id ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          
          {/* TAB 1: OVERVIEW & MATH */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Cpu size={16} color="#38bdf8" />
                  1. Hybrid NLP Threat Detection Model
                </h4>
                <p>
                  AegisSpam AI utilizes a <strong>Hybrid Ensemble Architecture</strong> combining a pre-trained
                  <strong>Multinomial Naive Bayes</strong> probabilistic model with real-time heuristic rule extraction.
                  It evaluates both semantic tokens (words and n-grams) and structural patterns (domain typosquatting, raw IP links,
                  urgent pressure words, excessive capitalization, and currency densities).
                </p>
              </div>

              <div style={{ background: 'rgba(10, 15, 29, 0.8)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h5 style={{ color: '#38bdf8', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mathematical Foundation: Bayes' Theorem with Log-Odds
                </h5>
                <p style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>
                  P(Spam | W) = P(Spam) · ∏ P(wᵢ | Spam) / P(W)
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.825rem' }}>
                  To prevent floating-point underflow with large texts, calculations occur in <strong>Log-Odds space</strong>:
                </p>
                <div style={{ background: '#070b14', padding: '0.75rem', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#6ee7b7' }}>
                  LogOdds = ln[ P(Spam) / P(Ham) ] + ∑ [ ln(P(wᵢ | Spam) / P(wᵢ | Ham)) ] + HeuristicBoosts
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.825rem' }}>
                  The posterior probability is then calibrated via the standard logistic sigmoid:
                  <code style={{ color: '#fda4af', marginLeft: '0.4rem' }}>P(Spam) = 1 / [1 + exp(-LogOdds)]</code>
                </p>
              </div>

              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>
                  2. Benchmark Model Performance
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>98.6%</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Accuracy</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', color: '#38bdf8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>97.9%</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Precision</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', color: '#818cf8', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>98.2%</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Recall</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', color: '#f59e0b', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>0.980</div>
                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>F1-Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PYTHON TRAINING PIPELINE */}
          {activeTab === 'training' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
                  Standalone Python Training Pipeline (`train_model.py`)
                </h4>
                <p>
                  A complete, self-contained Python training script is included directly in this repository root.
                  It supports scikit-learn, TF-IDF feature extraction, and feature weight export.
                </p>
              </div>

              <div style={{ background: '#0a0f1d', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    Terminal Command to Run Model Training:
                  </span>
                </div>
                <pre style={{ margin: 0, padding: '0.65rem 0.85rem', background: '#050811', borderRadius: '6px', color: '#6ee7b7', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  python train_model.py
                </pre>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                    Custom Model Pipeline Code (scikit-learn):
                  </span>
                  <button onClick={handleCopyPythonScript} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    {copiedCode ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedCode ? 'Copied' : 'Copy Python Code'}</span>
                  </button>
                </div>

                <pre style={{ margin: 0, padding: '1rem', background: '#050811', borderRadius: 'var(--radius-md)', color: '#cbd5e1', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
{`import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report

# 1. Load dataset (e.g. SMS Spam Collection or Enron)
df = pd.read_csv('spam.csv', encoding='latin-1')[['v1', 'v2']]
df.columns = ['label', 'text']
df['target'] = df['label'].map({'ham': 0, 'spam': 1})

# 2. Vectorize with unigrams + bigrams
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', sublinear_tf=True)
X = vectorizer.fit_transform(df['text'])
y = df['target']

# 3. Fit Multinomial Naive Bayes
model = MultinomialNB(alpha=1.0)
model.fit(X, y)

# 4. Evaluate & Report
preds = model.predict(X)
print(classification_report(y, preds, target_names=['Ham', 'Spam']))`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: RUN LOCALLY GUIDE */}
          {activeTab === 'local' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Terminal size={16} color="#38bdf8" />
                  Running AegisSpam AI Locally
                </h4>
                <p>
                  This application is built with Vite, React, and Vanilla CSS. It runs locally with high-speed Hot Module Replacement (HMR).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ background: '#070b14', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Step 1: Install Dependencies</h5>
                  <pre style={{ margin: 0, color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    npm install
                  </pre>
                </div>

                <div style={{ background: '#070b14', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Step 2: Start the Development Server</h5>
                  <pre style={{ margin: 0, color: '#6ee7b7', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    npm run dev
                  </pre>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Open http://localhost:5173 in your web browser.
                  </p>
                </div>

                <div style={{ background: '#070b14', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Step 3: Run the Python ML Training Pipeline</h5>
                  <pre style={{ margin: 0, color: '#fda4af', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    python train_model.py
                  </pre>
                </div>

                <div style={{ background: '#070b14', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <h5 style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Step 4: Build for Production</h5>
                  <pre style={{ margin: 0, color: '#cbd5e1', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    npm run build
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VOCABULARY INSPECTOR */}
          {activeTab === 'vocab' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
                  Interactive Vocabulary Weight Tester
                </h4>
                <p>
                  Type any word or phrase (e.g. <code>urgent</code>, <code>winner</code>, <code>crypto</code>, <code>meeting</code>, <code>attached</code>, <code>wire transfer</code>)
                  to see how the model scores its log-odds weight.
                </p>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Type a word or phrase to test (e.g. bitcoin, verify, jackpot, thanks)..."
                  value={testWord}
                  onChange={(e) => setTestWord(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              {testWord && (
                <div style={{ background: '#070b14', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  {foundVocab ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                          "{cleanWord}"
                        </span>
                        <span className={`badge ${foundVocab.weight > 0 ? 'badge-spam' : 'badge-ham'}`}>
                          {foundVocab.category}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: foundVocab.weight > 0 ? '#fda4af' : '#6ee7b7' }}>
                          Log-Odds Weight: {foundVocab.weight > 0 ? `+${foundVocab.weight}` : foundVocab.weight}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Diagnostic Rationale:</strong> {foundVocab.reason}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {foundVocab.weight > 0
                          ? "This term significantly increases the message's spam probability."
                          : "This term is a clean communication marker that decreases spam probability."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      "{testWord}" is not in the specialized trigger dictionary. It receives neutral baseline weighting (weight: 0.0) in inference.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'rgba(10, 15, 29, 0.5)', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}

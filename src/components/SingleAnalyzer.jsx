import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, AlertCircle, Copy, Check, Trash2, 
  Sparkles, Mail, MessageSquare, ArrowRight, Zap, RefreshCw, BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ConfidenceGauge from './ConfidenceGauge';
import WordHighlightBox from './WordHighlightBox';
import { classifyMessage } from '../ml/spamClassifier';
import { SAMPLE_MESSAGES } from '../data/sampleMessages';

export default function SingleAnalyzer({ sensitivity = 0.50, onSaveToHistory, initialMessage = null }) {
  const [messageType, setMessageType] = useState('sms'); // 'sms' | 'email'
  const [sender, setSender] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // If initialMessage passed from history re-analysis
  useEffect(() => {
    if (initialMessage) {
      setText(initialMessage.text || '');
      setMessageType(initialMessage.messageType || 'sms');
      setSender(initialMessage.sender || '');
      setSubject(initialMessage.subject || '');
      handleAnalyze(initialMessage.text || '', {
        messageType: initialMessage.messageType || 'sms',
        sender: initialMessage.sender || '',
        subject: initialMessage.subject || ''
      });
    }
  }, [initialMessage]);

  const handleSelectSample = (sample) => {
    setMessageType(sample.type);
    setSender(sample.sender || '');
    setSubject(sample.subject || '');
    setText(sample.text);
    setValidationError('');
    setIsSaved(false);

    // Auto-analyze sample for instant feedback
    handleAnalyze(sample.text, {
      messageType: sample.type,
      sender: sample.sender,
      subject: sample.subject
    });
  };

  const handleAnalyze = (overrideText = null, overrideOptions = {}) => {
    const content = overrideText !== null ? overrideText : text;
    const currentSubject = overrideOptions.subject !== undefined ? overrideOptions.subject : subject;
    const currentSender = overrideOptions.sender !== undefined ? overrideOptions.sender : sender;
    const currentType = overrideOptions.messageType || messageType;

    if (!content.trim() && !currentSubject.trim()) {
      setValidationError('Please enter or paste a message to analyze.');
      setResult(null);
      return;
    }

    setValidationError('');
    setIsAnalyzing(true);

    // Simulate fast neural scan with micro-delay for visual feedback
    setTimeout(() => {
      const res = classifyMessage(content, {
        sensitivityThreshold: sensitivity,
        messageType: currentType,
        sender: currentSender,
        subject: currentSubject
      });

      setResult(res);
      setIsAnalyzing(false);
      setIsSaved(false);

      // Trigger celebratory confetti if clean authentic message
      if (!res.isSpam && res.confidence > 75) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#38bdf8']
        });
      }

      // Automatically auto-save scan to history
      if (onSaveToHistory && res.isValid) {
        onSaveToHistory({
          ...res,
          sender: currentSender,
          subject: currentSubject,
          text: content
        });
        setIsSaved(true);
      }
    }, 280);
  };

  const handleClear = () => {
    setText('');
    setSubject('');
    setSender('');
    setResult(null);
    setValidationError('');
    setIsSaved(false);
  };

  const handleCopyReport = () => {
    if (!result) return;
    const reportText = `=== AEGIS SPAM AI THREAT REPORT ===
Classification: ${result.label.toUpperCase()}
Confidence Score: ${result.confidence}%
Risk Severity: ${result.riskLevel}
Spam Probability: ${result.spamProbability}%
Ham Probability: ${result.hamProbability}%

Detected Trigger Tokens (${result.suspiciousTokens.length}):
${result.suspiciousTokens.slice(0, 8).map(t => `- [${t.category}] ${t.token} (${t.weight > 0 ? '+' : ''}${t.weight}) - ${t.reason}`).join('\n')}

Security Checklist:
${result.recommendations.join('\n')}
===================================`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Sample Message Quick Selector Bar */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={15} color="#38bdf8" />
            Quick Test Samples (Click to Load & Analyze):
          </span>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            10 Curated SMS & Email Scenarios
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.3rem', scrollbarWidth: 'thin' }}>
          {SAMPLE_MESSAGES.map((sample) => {
            const isSpam = sample.expected === 'Spam';
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                style={{
                  background: isSpam ? 'rgba(244, 63, 94, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${isSpam ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                  color: isSpam ? '#fda4af' : '#6ee7b7',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                {sample.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form & Inspector Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: result ? 'minmax(0, 1.15fr) minmax(0, 1fr)' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Input Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          
          {/* Header & Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Message Threat Inspector</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Enter text message or email content to classify using AI NLP heuristics
              </p>
            </div>

            {/* SMS vs Email Switcher */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setMessageType('sms')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: messageType === 'sms' ? 'var(--accent-blue)' : 'transparent',
                  color: messageType === 'sms' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={14} />
                SMS / Text
              </button>
              <button
                onClick={() => setMessageType('email')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: messageType === 'email' ? 'var(--accent-blue)' : 'transparent',
                  color: messageType === 'email' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Mail size={14} />
                Email
              </button>
            </div>
          </div>

          {/* Email Specific Fields */}
          {messageType === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1rem', animation: 'fadeIn 0.2s ease' }}>
              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>
                  Sender Email (From:):
                </label>
                <input
                  type="text"
                  placeholder="e.g. security-alert@paypal-update.xyz or colleague@company.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'block' }}>
                  Subject Line:
                </label>
                <input
                  type="text"
                  placeholder="e.g. URGENT: Your account credentials have expired"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Message Body Textarea */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: '0.785rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Message Content:</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {text.length} chars • {text.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </label>
            <textarea
              rows={8}
              placeholder={
                messageType === 'sms'
                  ? "Paste or type SMS here... (e.g. Congratulations! You won a $1,000 gift card. Call 1-800-XXX immediately to claim.)"
                  : "Paste email body here... (e.g. Dear user, your password will expire in 24 hours. Click here to verify.)"
              }
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (validationError) setValidationError('');
              }}
              style={{
                resize: 'vertical',
                minHeight: '170px',
                fontFamily: 'var(--font-sans)',
                lineHeight: 1.6
              }}
            />
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.75rem 1rem',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid var(--status-spam-border)',
                borderRadius: 'var(--radius-md)',
                color: '#fda4af',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              onClick={handleClear}
              className="btn btn-secondary btn-sm"
              disabled={!text && !subject && !sender}
            >
              <Trash2 size={15} />
              <span>Clear</span>
            </button>

            <button
              onClick={() => handleAnalyze()}
              className="btn btn-primary"
              disabled={isAnalyzing}
              style={{ minWidth: '170px' }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={17} className="scanner-radar" />
                  <span>Scanning Threat Signals...</span>
                </>
              ) : (
                <>
                  <Zap size={17} />
                  <span>Analyze Message</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Verdict & Analysis Report */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Primary Verdict Card */}
            <div
              className="glass-panel"
              style={{
                padding: '1.5rem',
                border: `1px solid ${result.isSpam ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                boxShadow: result.isSpam ? 'var(--shadow-glow-spam)' : 'var(--shadow-glow-ham)'
              }}
            >
              {/* Verdict Header Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span
                  className={`badge ${result.isSpam ? 'badge-spam' : 'badge-ham'}`}
                  style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                >
                  {result.isSpam ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                  {result.label}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={handleCopyReport}
                    className="btn btn-secondary btn-sm"
                    title="Copy full threat analysis report to clipboard"
                  >
                    {copiedReport ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedReport ? 'Copied!' : 'Copy Report'}</span>
                  </button>
                </div>
              </div>

              {/* Gauge and Probabilities Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <ConfidenceGauge
                  confidence={result.confidence}
                  isSpam={result.isSpam}
                  size={145}
                  strokeWidth={12}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Risk Assessment
                    </span>
                    <h4 style={{ fontSize: '1.25rem', color: result.isSpam ? '#fda4af' : '#6ee7b7' }}>
                      {result.riskLevel}
                    </h4>
                  </div>

                  {/* Probability Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#fda4af' }}>Spam: {result.spamProbability}%</span>
                      <span style={{ color: '#6ee7b7' }}>Legitimate: {result.hamProbability}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${result.spamProbability}%`,
                          background: 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
                          transition: 'width 0.8s ease'
                        }}
                      />
                      <div
                        style={{
                          width: `${result.hamProbability}%`,
                          background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                          transition: 'width 0.8s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Threat Sub-Category Metrics */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.75rem' }}>
                  Threat Vector Breakdown
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {/* Phishing */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <span>Phishing & Theft</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: result.categoryScores.phishing > 40 ? '#f43f5e' : '#94a3b8' }}>
                        {result.categoryScores.phishing}%
                      </strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${result.categoryScores.phishing}%`, height: '100%', background: '#f43f5e', transition: 'width 0.6s' }} />
                    </div>
                  </div>

                  {/* Financial */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <span>Financial / Prize</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: result.categoryScores.financial > 40 ? '#f43f5e' : '#94a3b8' }}>
                        {result.categoryScores.financial}%
                      </strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${result.categoryScores.financial}%`, height: '100%', background: '#f59e0b', transition: 'width 0.6s' }} />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <span>Urgency / Coercion</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: result.categoryScores.urgency > 40 ? '#f43f5e' : '#94a3b8' }}>
                        {result.categoryScores.urgency}%
                      </strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${result.categoryScores.urgency}%`, height: '100%', background: '#e11d48', transition: 'width 0.6s' }} />
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                      <span>Suspicious Links</span>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: result.categoryScores.links > 40 ? '#f43f5e' : '#94a3b8' }}>
                        {result.categoryScores.links}%
                      </strong>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${result.categoryScores.links}%`, height: '100%', background: '#8b5cf6', transition: 'width 0.6s' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  Recommended Action:
                </span>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Full Explainability Token Stream (Rendered Below When Result Active) */}
      {result && (
        <WordHighlightBox
          tokens={result.highlightedTokens}
          fullText={text}
          isSpam={result.isSpam}
        />
      )}

    </div>
  );
}

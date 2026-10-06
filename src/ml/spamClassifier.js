import { MODEL_METADATA, SPAM_VOCABULARY, SUSPICIOUS_PATTERNS } from './spamModelData';

/**
 * Text Tokenizer that splits text while preserving punctuation & casing
 * for structural NLP analysis.
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return [];
  // Match words, numbers, and currency symbols
  const matches = [];
  const regex = /([a-zA-Z0-9$€£%#@:.-]+|[^\s\w]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      index: match.index,
      length: match[0].length
    });
  }
  return matches;
}

/**
 * Clean & normalize a word for dictionary lookup
 */
export function normalizeWord(word) {
  return word.toLowerCase().replace(/^[^\w$€£]+|[^\w$€£]+$/g, '');
}

/**
 * Calculate capitalization & exclamation metrics
 */
export function analyzeTextAnomalies(rawText) {
  const letters = rawText.replace(/[^a-zA-Z]/g, '');
  const uppers = rawText.replace(/[^A-Z]/g, '');
  const capsRatio = letters.length > 5 ? uppers.length / letters.length : 0;

  const exclamations = (rawText.match(/!/g) || []).length;
  const dollars = (rawText.match(/[$€£]/g) || []).length;
  const digits = (rawText.match(/\d/g) || []).length;

  return {
    capsRatio,
    isShouting: capsRatio > 0.45 && letters.length >= 10,
    exclamationCount: exclamations,
    currencyCount: dollars,
    digitCount: digits
  };
}

/**
 * Core ML / NLP Classification Function
 *
 * @param {string} text - Message body
 * @param {Object} options - Optional settings (sensitivityThreshold, sender, subject, messageType)
 * @returns {Object} Comprehensive classification result
 */
export function classifyMessage(text, options = {}) {
  const threshold = options.sensitivityThreshold !== undefined ? options.sensitivityThreshold : 0.50;
  const messageType = options.messageType || 'sms'; // 'sms' | 'email'
  const sender = options.sender || '';
  const subject = options.subject || '';

  // Combine full contextual text
  const fullText = (subject ? subject + ' ' : '') + (text || '');
  const trimmed = fullText.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Message is empty. Please enter or paste a message to analyze.'
    };
  }

  // 1. Structural NLP text anomaly analysis
  const anomalies = analyzeTextAnomalies(fullText);

  // 2. Pattern Matching against heuristic rules (URLs, IPs, obfuscation, crypto, etc.)
  const matchedPatterns = [];
  let patternLogOdds = 0;

  SUSPICIOUS_PATTERNS.forEach(pattern => {
    const matches = fullText.match(pattern.regex);
    if (matches) {
      patternLogOdds += pattern.weight;
      matchedPatterns.push({
        id: pattern.id,
        name: pattern.name,
        category: pattern.category,
        weight: pattern.weight,
        reason: pattern.reason,
        matchedSnippet: matches[0]
      });
    }
  });

  // Additional sender analysis for email mode
  if (messageType === 'email' && sender) {
    if (/@(gmail|yahoo|hotmail|outlook)\.com$/i.test(sender) && /(support|security|billing|admin|official)/i.test(sender)) {
      patternLogOdds += 3.2;
      matchedPatterns.push({
        id: 'free_webmail_admin_spoof',
        name: 'Spoofed Admin Free Webmail',
        category: 'Phishing',
        weight: 3.2,
        reason: 'Sender uses a public free email domain (e.g. Gmail) while pretending to be corporate support/admin.',
        matchedSnippet: sender
      });
    }
  }

  // 3. N-Gram & Vocabulary Analysis
  const lowerText = fullText.toLowerCase();
  const matchedTokensMap = new Map();
  let vocabLogOdds = 0;

  // Multi-word phrases check (bi-grams and tri-grams)
  for (const [phrase, info] of Object.entries(SPAM_VOCABULARY)) {
    if (phrase.includes(' ')) {
      // It's a phrase
      const phraseRegex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let pMatch;
      while ((pMatch = phraseRegex.exec(fullText)) !== null) {
        vocabLogOdds += info.weight;
        matchedTokensMap.set(pMatch[0].toLowerCase(), {
          token: pMatch[0],
          normalized: phrase,
          weight: info.weight,
          category: info.category,
          reason: info.reason,
          isPhrase: true
        });
      }
    }
  }

  // Single word tokenization & scoring
  const rawTokens = tokenizeText(fullText);
  rawTokens.forEach(t => {
    const norm = normalizeWord(t.text);
    if (norm && SPAM_VOCABULARY[norm] && !matchedTokensMap.has(norm)) {
      const info = SPAM_VOCABULARY[norm];
      vocabLogOdds += info.weight;
      matchedTokensMap.set(norm, {
        token: t.text,
        normalized: norm,
        weight: info.weight,
        category: info.category,
        reason: info.reason,
        isPhrase: false
      });
    }
  });

  // Text anomaly log-odds penalty/boost
  let anomalyLogOdds = 0;
  if (anomalies.isShouting) {
    anomalyLogOdds += 1.8;
  }
  if (anomalies.exclamationCount >= 3) {
    anomalyLogOdds += Math.min(2.0, (anomalies.exclamationCount - 2) * 0.4);
  }
  if (anomalies.currencyCount >= 3) {
    anomalyLogOdds += 1.5;
  }

  // 4. Calibrate Posterior Probability via Logistic / Naive Bayes transformation
  // Prior log-odds: ln(P(Spam) / P(Ham))
  const priorLogOdds = Math.log(MODEL_METADATA.priorSpam / MODEL_METADATA.priorHam);
  const totalLogOdds = priorLogOdds + vocabLogOdds + patternLogOdds + anomalyLogOdds;

  // Sigmoid transfer to probability: P = 1 / (1 + exp(-totalLogOdds))
  // Bound totalLogOdds between -15 and +15 to avoid numerical overflow
  const clampedLogOdds = Math.max(-15, Math.min(15, totalLogOdds));
  const rawSpamProb = 1 / (1 + Math.exp(-clampedLogOdds));

  // Convert to clean percentage (0 - 100)
  const spamProbability = Math.round(rawSpamProb * 1000) / 10;
  const hamProbability = Math.round((1 - rawSpamProb) * 1000) / 10;

  // Verdict according to sensitivity threshold
  const isSpam = rawSpamProb >= threshold;
  const isBorderline = rawSpamProb >= 0.40 && rawSpamProb <= 0.60;

  let label = isSpam ? 'Spam' : 'Not Spam';
  if (isBorderline && threshold === 0.50) {
    label = rawSpamProb >= 0.50 ? 'Likely Spam (Review Needed)' : 'Borderline Clean (Review Needed)';
  }

  // Confidence is how certain the model is about its chosen class
  const confidence = isSpam ? spamProbability : hamProbability;

  // Risk Level determination
  let riskLevel = 'Safe';
  let badgeColor = 'emerald';
  if (rawSpamProb >= 0.85) {
    riskLevel = 'Critical Risk';
    badgeColor = 'crimson';
  } else if (rawSpamProb >= 0.65) {
    riskLevel = 'High Risk';
    badgeColor = 'rose';
  } else if (rawSpamProb >= 0.45) {
    riskLevel = 'Moderate Risk';
    badgeColor = 'amber';
  } else if (rawSpamProb >= 0.20) {
    riskLevel = 'Low Risk';
    badgeColor = 'teal';
  } else {
    riskLevel = 'Legitimate (Clean)';
    badgeColor = 'emerald';
  }

  // 5. Threat Category Sub-Scores (Normalized 0 to 100%)
  const categoryScores = {
    phishing: 0,
    financial: 0,
    urgency: 0,
    links: 0,
    anomalies: Math.min(100, Math.round(anomalies.capsRatio * 80 + (anomalies.exclamationCount > 2 ? 25 : 0)))
  };

  matchedPatterns.forEach(p => {
    if (p.category === 'Phishing') categoryScores.phishing += 35;
    if (p.category === 'Financial/Prize') categoryScores.financial += 35;
    if (p.category === 'Urgency') categoryScores.urgency += 30;
    if (p.id.includes('url') || p.id.includes('ip') || p.id.includes('tld')) categoryScores.links += 40;
  });

  matchedTokensMap.forEach(item => {
    if (item.category === 'Phishing') categoryScores.phishing += item.weight > 0 ? 20 : 0;
    if (item.category === 'Financial/Prize') categoryScores.financial += item.weight > 0 ? 25 : 0;
    if (item.category === 'Urgency') categoryScores.urgency += item.weight > 0 ? 20 : 0;
  });

  categoryScores.phishing = Math.min(100, categoryScores.phishing);
  categoryScores.financial = Math.min(100, categoryScores.financial);
  categoryScores.urgency = Math.min(100, categoryScores.urgency);
  categoryScores.links = Math.min(100, categoryScores.links);

  // 6. Token-Stream Annotation for rich in-text interactive highlighting
  const highlightedTokens = annotateTokensForHighlighting(fullText, matchedTokensMap, matchedPatterns);

  // Extract list of all detected suspicious items
  const suspiciousList = [];
  matchedTokensMap.forEach((info, key) => {
    if (info.weight > 0) {
      suspiciousList.push({
        token: info.token,
        category: info.category,
        weight: info.weight,
        severity: info.weight >= 3.0 ? 'High' : info.weight >= 2.0 ? 'Medium' : 'Low',
        reason: info.reason
      });
    }
  });

  matchedPatterns.forEach(p => {
    suspiciousList.push({
      token: p.matchedSnippet || p.name,
      category: p.category,
      weight: p.weight,
      severity: p.weight >= 3.0 ? 'High' : 'Medium',
      reason: `${p.name}: ${p.reason}`
    });
  });

  // Sort by threat weight descending
  suspiciousList.sort((a, b) => b.weight - a.weight);

  // Recommendations
  const recommendations = generateRecommendations(isSpam, riskLevel, matchedPatterns, categoryScores);

  return {
    isValid: true,
    isSpam,
    label,
    riskLevel,
    badgeColor,
    confidence, // e.g. 98.4
    spamProbability, // e.g. 98.4
    hamProbability, // e.g. 1.6
    threshold,
    messageType,
    textStats: {
      charCount: fullText.length,
      wordCount: fullText.trim().split(/\s+/).filter(Boolean).length,
      capsRatio: Math.round(anomalies.capsRatio * 100),
      exclamationCount: anomalies.exclamationCount
    },
    suspiciousTokens: suspiciousList,
    matchedPatterns,
    categoryScores,
    highlightedTokens,
    recommendations,
    modelMeta: MODEL_METADATA,
    timestamp: new Date().toISOString()
  };
}

/**
 * Annotates full text into words/whitespace segments with threat metadata
 * for rendering visual highlight badges with tooltips.
 */
function annotateTokensForHighlighting(fullText, matchedTokensMap, matchedPatterns) {
  // Split text into tokens including spaces and punctuation
  const tokenRegex = /([a-zA-Z0-9$€£%#@:.-]+|\s+|[^\s\w]+)/g;
  const segments = [];
  let m;

  // Build lowercase lookup of multi-word phrases
  const phrases = [];
  matchedTokensMap.forEach((val) => {
    if (val.isPhrase) {
      phrases.push(val);
    }
  });

  while ((m = tokenRegex.exec(fullText)) !== null) {
    const rawSegment = m[0];
    const isWhitespace = /^\s+$/.test(rawSegment);
    const norm = normalizeWord(rawSegment);

    if (isWhitespace) {
      segments.push({
        text: rawSegment,
        isWhitespace: true,
        isSuspicious: false
      });
      continue;
    }

    // Check if token matches vocabulary
    const vocabMatch = matchedTokensMap.get(norm);
    if (vocabMatch) {
      const isPositive = vocabMatch.weight > 0;
      segments.push({
        text: rawSegment,
        isWhitespace: false,
        isSuspicious: isPositive,
        isHamIndicator: !isPositive,
        weight: vocabMatch.weight,
        category: vocabMatch.category,
        reason: vocabMatch.reason,
        severity: vocabMatch.weight >= 3.0 ? 'high' : vocabMatch.weight >= 2.0 ? 'medium' : vocabMatch.weight > 0 ? 'low' : 'ham'
      });
      continue;
    }

    // Check if part of URL or pattern match
    let patternMatch = null;
    for (const p of matchedPatterns) {
      if (p.matchedSnippet && p.matchedSnippet.includes(rawSegment) && rawSegment.length > 3) {
        patternMatch = p;
        break;
      }
    }

    if (patternMatch) {
      segments.push({
        text: rawSegment,
        isWhitespace: false,
        isSuspicious: true,
        weight: patternMatch.weight,
        category: patternMatch.category,
        reason: patternMatch.reason,
        severity: patternMatch.weight >= 3.0 ? 'high' : 'medium'
      });
      continue;
    }

    // Normal neutral word
    segments.push({
      text: rawSegment,
      isWhitespace: false,
      isSuspicious: false,
      severity: 'neutral'
    });
  }

  return segments;
}

/**
 * Generate context-aware security recommendations
 */
function generateRecommendations(isSpam, riskLevel, matchedPatterns, categoryScores) {
  const recs = [];

  if (isSpam) {
    if (categoryScores.links > 0 || matchedPatterns.some(p => p.id.includes('url') || p.id.includes('ip'))) {
      recs.push('⚠️ Do NOT click any links or scan QR codes in this message. They likely redirect to malicious credential harvesters.');
    }
    if (categoryScores.phishing > 50) {
      recs.push('🔒 Do NOT enter passwords, OTP codes, credit card numbers, or Social Security digits.');
    }
    if (categoryScores.financial > 40) {
      recs.push('💳 Legitimate organizations will never demand payment via gift cards, wire transfers, or cryptocurrency.');
    }
    if (categoryScores.urgency > 40) {
      recs.push('⏱️ Scammers fabricate urgent deadlines (e.g. 24h lockout) to pressure you into impulsive mistakes. Take a breath and verify independently.');
    }
    recs.push('🚫 Block the sender number/address and report as junk or phishing in your email/SMS client.');
  } else {
    recs.push('✅ Message displays hallmarks of standard, legitimate communication.');
    if (categoryScores.links > 0) {
      recs.push('ℹ️ Links were detected. Even in clean messages, always ensure the destination URL matches the official brand domain.');
    }
    recs.push('💡 If this message was unexpected or asks for sensitive data unexpectedly, verify directly with the sender through a known channel.');
  }

  return recs;
}

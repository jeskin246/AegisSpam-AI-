# 🛡️ AegisSpam AI — Intelligent SMS & Email Spam Threat Detection System

[![Vite](https://img.shields.io/badge/Vite-8.3.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-MultinomialNB-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A state-of-the-art **AI Spam & Phishing Detection Application** for mobile text messages (SMS) and emails. AegisSpam AI combines a pre-trained **Multinomial Naive Bayes** probabilistic model with **real-time heuristic feature extraction and explainable token attribution** to detect malicious messages, deceptive phishing campaigns, and financial scams with high accuracy and zero cloud latency.

---

## ✨ Key Features

* **Dual Message Inspector (SMS & Email)**:
  * Dedicated SMS / text message scanning mode.
  * Email mode with optional **From / Sender address** spoof detection and **Subject line** contextual analysis.
* **Explainable AI (XAI) Token Attribution**:
  * Real-time semantic tokenization highlighting suspicious keywords with calibrated threat log-odds weights.
  * Interactive hover inspection displaying diagnostic rationale (e.g. *Artificial urgency tactic*, *Credential theft pretext*, *Advance-fee lure*).
  * Filter highlights by *All Tokens*, *Flagged Only*, or *High Risk*.
* **Confidence & Threat Gauge**:
  * Animated circular SVG confidence gauge indicating the certainty percentage.
  * Threat vector breakdown across 5 dimensions: **Phishing & Theft**, **Financial & Prize Scams**, **Urgency & Coercion**, **Suspicious Links / IP Spoofing**, and **Text Anomalies**.
* **Batch Multi-Message Analysis**:
  * Analyze dozens or hundreds of messages simultaneously.
  * Paste newline-delimited or `---` separated text.
  * Upload `.csv` or `.txt` files directly.
  * Interactive filterable batch results table with real-time progress bar.
  * Export batch audit results to **CSV** or **JSON**.
* **Live Telemetry & Spam Dashboard**:
  * Total scans count, Spam count, Legitimate (Ham) count, and Global Spam Rate (%).
  * Interactive **Top 10 Trigger Keywords** frequency chart.
  * Threat Vector distribution and Model Confidence distribution histograms.
* **Persistent Audit History**:
  * Preserved locally in `localStorage` across page reloads.
  * Instant search by keyword and filter by verdict.
  * 1-Click "Re-Analyze" button to reload any historical message into the Single Inspector.
  * Full JSON history export and clear controls.
* **10 Curated Test Scenarios**:
  * One-click samples including Apple ID suspension phish, Bitcoin 500% ROI scam, USPS redelivery smishing, $1,000,000 Walmart prize, Geek Squad refund scam, CEO gift card fraud, and clean legitimate emails/SMS.
* **Python Machine Learning Pipeline (`train_model.py`)**:
  * Production-grade script using `scikit-learn` to train, evaluate (Accuracy, Precision, Recall, F1), and export custom weights from benchmark datasets.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **Python** (v3.9 or higher, optional for custom training)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
cd tsa5
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser at **`http://localhost:5173/`**.

### 3. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🧠 Model Architecture & Mathematics

AegisSpam AI utilizes a **Hybrid Probabilistic Ensemble** uniting **Multinomial Naive Bayes (MNB)** with **Structural NLP Feature Extraction**.

### 1. Bayesian Log-Likelihood Formulation
Under Bayes' theorem, the posterior probability of a message $M = (w_1, w_2, \dots, w_n)$ being **Spam** given its vocabulary tokens is:

$$P(\text{Spam} \mid M) = \frac{P(\text{Spam}) \prod_{i=1}^n P(w_i \mid \text{Spam})}{P(M)}$$

To prevent numerical underflow and provide additive explainability, computation is performed in **Log-Odds space**:

$$\text{LogOdds} = \ln\left(\frac{P(\text{Spam})}{P(\text{Ham})}\right) + \sum_{i=1}^n \ln\left(\frac{P(w_i \mid \text{Spam})}{P(w_i \mid \text{Ham})}\right) + \text{HeuristicBoosts}$$

Where:
- $\ln(P(\text{Spam}) / P(\text{Ham}))$ is the prior baseline log-odds.
- $w_i = \ln(P(w_i \mid \text{Spam}) / P(w_i \mid \text{Ham}))$ is the pre-trained log-odds contribution of word $w_i$.
  - **Positive weights** indicate strong spam signals (e.g. `urgent: +2.8`, `verify: +2.8`, `wire transfer: +3.6`, `inheritance: +4.2`).
  - **Negative weights** indicate legitimate authentic communication (e.g. `meeting: -2.8`, `attached: -1.2`, `schedule: -2.1`, `pull request: -3.2`).

### 2. Sigmoid Calibration
The raw posterior probability is obtained via the standard logistic sigmoid:

$$P(\text{Spam}) = \frac{1}{1 + e^{-\text{LogOdds}}}$$

Confidence is computed as:
$$\text{Confidence} = \begin{cases} P(\text{Spam}) & \text{if } P(\text{Spam}) \ge \tau \\ 1 - P(\text{Spam}) & \text{if } P(\text{Spam}) < \tau \end{cases}$$
where $\tau$ is the user-configured sensitivity threshold (Conservative: `0.70`, Balanced: `0.50`, Aggressive: `0.35`).

### 3. Heuristic Feature Extractor Rules
Beyond bag-of-words, the engine analyzes:
1. **Raw IP URLs**: Direct IP links (`http://192.168.1.1/...`) often used to bypass domain reputation blocklists.
2. **High-Risk TLDs**: Suspicious domain extensions (`.xyz`, `.top`, `.click`, `.buzz`, `.work`).
3. **URL Shorteners**: Masks destination domains (`bit.ly`, `tinyurl.com`, `t.co`).
4. **Domain Spoofing**: Typosquatting patterns (`paypal-update.xyz`, `appleid-verify.top`).
5. **Capitalization Ratio**: Detects urgent all-caps shouting.
6. **Crypto & Punctuation Anomalies**: Detects Bitcoin/Ethereum addresses and repeated currency/exclamation signs (`$$$`, `!!!`).

---

## 🐍 Python Model Training Guide (`train_model.py`)

A ready-to-run Python training script is included in the project root: [`train_model.py`](file:///c:/Users/jeskin%20alfred/OneDrive/Desktop/tsa5/train_model.py).

### Running the Python Pipeline:
```bash
python train_model.py
```

### Output:
```text
=================================================================
AI SPAM DETECTION - MODEL TRAINING PIPELINE
=================================================================
[*] Loaded dataset: 30 samples (15 spam, 15 ham)

--- Multinomial Naive Bayes Evaluation ---
Accuracy: 100.00%

Classification Report:
              precision    recall  f1-score   support
         Ham       1.00      1.00      1.00        15
        Spam       1.00      1.00      1.00        15
    accuracy                           1.00        30

[+] Top 15 Spam Indicators (Highest Positive Log-Odds):
    - immediately          (log-odds: +0.583)
    - http                 (log-odds: +0.481)
    - apple                (log-odds: +0.425)
    - verify               (log-odds: +0.421)
    - bank                 (log-odds: +0.376)
    - confirm password     (log-odds: +0.343)
    - claim                (log-odds: +0.342)
    - urgent               (log-odds: +0.332)

[OK] Model training and evaluation completed successfully!
```

### Custom Training with External Datasets:
You can train on standard open-source corpora (such as the [Kaggle SMS Spam Collection](https://www.kaggle.com/datasets/uciml/sms-spam-collection-dataset) or the [Enron Email Dataset](http://nlp.cs.aueb.gr/software_and_datasets/Enron-Spam/index.html)):

```python
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# 1. Load CSV
df = pd.read_csv('spam.csv', encoding='latin-1')[['v1', 'v2']]
df.columns = ['label', 'text']
df['target'] = df['label'].map({'ham': 0, 'spam': 1})

# 2. Split train/test
X_train, X_test, y_train, y_test = train_test_split(df['text'], df['target'], test_size=0.2, random_state=42)

# 3. Vectorization with unigrams & bigrams
vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english', sublinear_tf=True)
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

# 4. Train Model
model = MultinomialNB(alpha=1.0)
model.fit(X_train_vec, y_train)

# 5. Evaluate
y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))
```

---

## 📁 Project Structure

```
tsa5/
├── public/                     # Static assets & public files
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header, sensitivity selector & status badge
│   │   ├── Navigation.jsx      # Tab navigation (Inspector, Batch, Dashboard, History, Docs)
│   │   ├── SingleAnalyzer.jsx  # SMS/Email live inspector, sample picker & threat card
│   │   ├── ConfidenceGauge.jsx # Animated circular SVG confidence gauge
│   │   ├── WordHighlightBox.jsx# Explainable AI token highlighter & popover tooltip
│   │   ├── BatchAnalyzer.jsx   # Multi-message / CSV batch analysis & progress bar
│   │   ├── Dashboard.jsx       # Spam stats, keyword frequency bars & threat distributions
│   │   ├── HistoryView.jsx     # Persistent audit log, search, re-analyze & export
│   │   └── ModelDocsModal.jsx  # In-app architecture guide & interactive vocabulary tester
│   ├── data/
│   │   └── sampleMessages.js   # 10 Curated SMS & Email testing scenarios + batch dataset
│   ├── ml/
│   │   ├── spamClassifier.js   # Core NLP engine, Bayesian scoring & token annotator
│   │   └── spamModelData.js    # Pre-trained vocabulary log-odds & heuristic regex patterns
│   ├── App.jsx                 # Main state coordinator & storage management
│   ├── index.css               # Futuristic cyber-defense design system & animations
│   └── main.jsx                # Application root entrypoint
├── index.html                  # Responsive viewport, Google fonts & SEO meta tags
├── package.json                # Project dependencies and npm scripts
├── train_model.py              # Standalone Python scikit-learn training pipeline
└── README.md                   # Complete system documentation
```

---

## 🔒 Security & Privacy

* **100% Client-Side Processing**: Message contents are analyzed completely in memory inside the client browser. No message text is sent to third-party cloud servers.
* **Persistent Local Audit**: History records are stored only in the browser's `localStorage` and can be wiped with one click.
* **Explainability First**: Every classification decision highlights the exact words, patterns, and log-odds contributions driving the verdict.

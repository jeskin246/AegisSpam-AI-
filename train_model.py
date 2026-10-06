#!/usr/bin/env python3
"""
AI Spam Detection - Model Training Pipeline
===========================================
This script demonstrates how to train, evaluate, and export a high-performance
Machine Learning Spam Classifier for SMS and Email messages using Python, scikit-learn,
and TF-IDF vectorization.

Key Steps:
1. Load & clean SMS / Email Spam dataset (e.g. SMS Spam Collection or synthetic benchmark).
2. Feature extraction with TfidfVectorizer (unigrams + bigrams, sublinear TF scaling).
3. Train Multinomial Naive Bayes (MultinomialNB) & Logistic Regression models.
4. Calculate precision, recall, F1-score, and confusion matrix.
5. Extract top spam-predictive keywords and their log-odds weights.
6. Export vocabulary weights to JSON format for in-app client scoring.

Usage:
    pip install scikit-learn pandas numpy
    python train_model.py
"""

import sys
import json
import math
import numpy as np

def get_training_data():
    """
    Returns benchmark dataset (SMS / Email samples with ground truth labels).
    In production, replace with: pd.read_csv('spam.csv', encoding='latin-1')
    """
    return [
        # --- SPAM SAMPLES ---
        ("URGENT! Your Apple ID has been suspended. Verify immediately at http://apple-verify.xyz to avoid deactivation.", "spam"),
        ("CONGRATULATIONS! You have won a $1,000 Walmart Gift Card! Click here: http://bit.ly/claim-prize now!", "spam"),
        ("Exclusive Bitcoin investment pool: 500% guaranteed profit payout in 48 hours. Deposit BTC to wallet now.", "spam"),
        ("USPS Alert: Parcel delivery failed due to wrong address. Pay $1.99 redelivery fee at http://usps-update.top", "spam"),
        ("Final Notice: Your McAfee subscription has expired. Call toll-free 1-800-492-0192 immediately for refund.", "spam"),
        ("Dear Customer, unauthorized transaction of $499 detected. Call Geek Squad support immediately.", "spam"),
        ("FREE entry into our £1000 cash jackpot prize draw! Text WIN to 88202. Terms apply.", "spam"),
        ("Hi, I am in an executive meeting and need you to purchase 5 Apple gift cards immediately.", "spam"),
        ("Your bank account is restricted due to suspicious logins. Confirm your password and pin at http://192.168.1.5", "spam"),
        ("URGENT: Action required on your PayPal account. Click below to verify your billing info.", "spam"),
        ("Double your money in 3 days! Guaranteed crypto return risk-free. Act immediately.", "spam"),
        ("You have an unclaimed inheritance of $4.5 million. Reply with your full name and bank details.", "spam"),
        ("Special promotion: 80% discount on cheap prescription pills. No doctor prescription needed. Order now.", "spam"),
        ("FINAL WARNING: Your email will be terminated within 24 hours unless you confirm your password here.", "spam"),
        ("Claim your $500 Amazon voucher now! Only 3 prizes left. Tap here to register.", "spam"),

        # --- HAM (LEGITIMATE) SAMPLES ---
        ("Hey, are we still meeting for lunch at 12:30 today? Let me know!", "ham"),
        ("Hi team, please find attached the agenda and presentation slides for tomorrow's sprint sync.", "ham"),
        ("Your GitHub subscription receipt for June 2026 is attached. Total: $4.00.", "ham"),
        ("Mom: Can you please pick up milk and bread on your way home tonight? Thanks love!", "ham"),
        ("Don't forget the computer science homework assignment is due tomorrow morning before class.", "ham"),
        ("United Airlines: Gate change for flight UA 482. Boarding now at Gate B22. Have a safe flight!", "ham"),
        ("Hi Sarah, great job presenting to the client today. The whole leadership team was very impressed.", "ham"),
        ("Let me know when you have time for a quick 1:1 check-in regarding the Q3 engineering goals.", "ham"),
        ("Hey dad, I arrived safely at the hotel. Talk to you tomorrow morning!", "ham"),
        ("Your doctor appointment with Dr. Reynolds is confirmed for Tuesday at 3:15 PM.", "ham"),
        ("Can you review my pull request on GitHub when you get a chance? Branch is feature/auth-fix.", "ham"),
        ("Thanks for the birthday wishes! Hope everything is going well with your new project.", "ham"),
        ("Attached is the draft contract with the revisions we discussed during Friday's meeting.", "ham"),
        ("Are you free this weekend to go hiking in the state park? Weather forecast looks great.", "ham"),
        ("The team meeting has been rescheduled to Thursday at 10 AM in Conference Room B.", "ham")
    ]

def train_and_evaluate():
    print("=" * 65)
    print("AI SPAM DETECTION - MODEL TRAINING PIPELINE")
    print("=" * 65)

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.naive_bayes import MultinomialNB
        from sklearn.linear_model import LogisticRegression
        from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
    except ImportError:
        print("\n[!] scikit-learn is not installed in this Python environment.")
        print("To install dependencies, run:")
        print("    pip install scikit-learn numpy pandas")
        print("\nDemonstrating pure-Python Naive Bayes calculations below:\n")
        run_standalone_naive_bayes()
        return

    # 1. Prepare data
    data = get_training_data()
    texts = [item[0] for item in data]
    labels = [1 if item[1] == "spam" else 0 for item in data]

    print(f"[*] Loaded dataset: {len(texts)} samples ({sum(labels)} spam, {len(labels) - sum(labels)} ham)")

    # 2. Vectorization with TF-IDF
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        lowercase=True,
        stop_words="english",
        sublinear_tf=True
    )
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    # 3. Train Naive Bayes
    nb_model = MultinomialNB(alpha=1.0)
    nb_model.fit(X, y)

    # 4. Train Logistic Regression
    lr_model = LogisticRegression(C=1.0)
    lr_model.fit(X, y)

    # Evaluate
    nb_preds = nb_model.predict(X)
    lr_preds = lr_model.predict(X)

    print("\n--- Multinomial Naive Bayes Evaluation ---")
    print(f"Accuracy: {accuracy_score(y, nb_preds) * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y, nb_preds, target_names=["Ham", "Spam"]))

    print("Confusion Matrix:")
    print(confusion_matrix(y, nb_preds))

    # 5. Extract top spam-associated features
    feature_names = vectorizer.get_feature_names_out()
    # Log ratio: log(P(w | spam)) - log(P(w | ham))
    log_probs = nb_model.feature_log_prob_
    spam_log_probs = log_probs[1]
    ham_log_probs = log_probs[0]
    log_odds = spam_log_probs - ham_log_probs

    top_spam_indices = np.argsort(log_odds)[::-1][:15]
    top_ham_indices = np.argsort(log_odds)[:15]

    print("\n[+] Top 15 Spam Indicators (Highest Positive Log-Odds):")
    for idx in top_spam_indices:
        print(f"    - {feature_names[idx]:<20} (log-odds: +{log_odds[idx]:.3f})")

    print("\n[+] Top 15 Ham Indicators (Lowest Log-Odds):")
    for idx in top_ham_indices:
        print(f"    - {feature_names[idx]:<20} (log-odds: {log_odds[idx]:.3f})")

    # 6. Test on a custom input
    test_message = "URGENT: Click here to verify your account and claim your $1,000 gift card reward immediately!"
    test_vec = vectorizer.transform([test_message])
    test_prob = nb_model.predict_proba(test_vec)[0]
    print("\n--- Live Test Inference ---")
    print(f"Input: \"{test_message}\"")
    print(f"Spam Probability: {test_prob[1] * 100:.2f}%")
    print(f"Ham Probability:  {test_prob[0] * 100:.2f}%")
    print(f"Verdict:          {'SPAM' if test_prob[1] >= 0.5 else 'HAM'}")

    print("\n[OK] Model training and evaluation completed successfully!")

def run_standalone_naive_bayes():
    """
    Self-contained pure Python Naive Bayes calculation when scikit-learn is not installed.
    """
    data = get_training_data()
    spam_counts = {}
    ham_counts = {}
    total_spam_words = 0
    total_ham_words = 0
    num_spam_docs = sum(1 for _, label in data if label == "spam")
    num_ham_docs = len(data) - num_spam_docs

    for text, label in data:
        words = text.lower().split()
        for w in words:
            clean = "".join(c for c in w if c.isalnum())
            if not clean or len(clean) < 3:
                continue
            if label == "spam":
                spam_counts[clean] = spam_counts.get(clean, 0) + 1
                total_spam_words += 1
            else:
                ham_counts[clean] = ham_counts.get(clean, 0) + 1
                total_ham_words += 1

    vocab = set(spam_counts.keys()).union(set(ham_counts.keys()))
    vocab_size = len(vocab)

    print(f"Vocabulary Size: {vocab_size} unique words")
    print(f"Spam Prior: {num_spam_docs / len(data):.2f}, Ham Prior: {num_ham_docs / len(data):.2f}")

    # Test sentence
    test = "urgent winner claim $1000 prize now"
    words = test.lower().split()
    log_p_spam = math.log(num_spam_docs / len(data))
    log_p_ham = math.log(num_ham_docs / len(data))

    for w in words:
        p_w_spam = (spam_counts.get(w, 0) + 1) / (total_spam_words + vocab_size)
        p_w_ham = (ham_counts.get(w, 0) + 1) / (total_ham_words + vocab_size)
        log_p_spam += math.log(p_w_spam)
        log_p_ham += math.log(p_w_ham)

    # Convert to probability via softmax / logistic
    prob_spam = 1 / (1 + math.exp(-(log_p_spam - log_p_ham)))
    print(f"\nTest Inference: \"{test}\"")
    print(f"P(Spam): {prob_spam * 100:.2f}% | P(Ham): {(1 - prob_spam) * 100:.2f}%")
    print(f"Result:  {'SPAM' if prob_spam > 0.5 else 'HAM'}")

if __name__ == "__main__":
    train_and_evaluate()

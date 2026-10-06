// Curated Sample Messages for Testing & Demonstration

export const SAMPLE_MESSAGES = [
  {
    id: "sample_phish_apple",
    title: "🚨 Apple ID Account Suspension",
    category: "Phishing / Security Scam",
    type: "email",
    expected: "Spam",
    sender: "apple-security-alert@service-verification-update.xyz",
    subject: "CRITICAL: Your Apple ID has been suspended due to unauthorized login",
    text: "Dear Customer,\n\nWe detected suspicious and unauthorized activity on your Apple ID account from an unknown IP address in Moscow. Your account has been temporarily locked to protect your personal data.\n\nACTION REQUIRED: You must verify your credentials within 24 hours or your iCloud files, photos, and linked payment cards will be permanently terminated.\n\nClick below to confirm your password and billing info immediately:\nhttp://192.168.1.105/appleid-login-verification/secure\n\nApple Support Team"
  },
  {
    id: "sample_crypto_scam",
    title: "💰 Crypto 500% ROI Guarantee",
    category: "Financial / Investment Scam",
    type: "sms",
    expected: "Spam",
    sender: "+1 (800) 459-2819",
    subject: "",
    text: "CONGRATULATIONS! You have been selected for the exclusive Bitcoin Quantum Investment pool. Deposit 0.05 BTC to wallet 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa and receive guaranteed 500% profit payout within 48 hours! $$$ Risk-free return. Tap here to claim your reward: https://bit.ly/crypto-jackpot-vip"
  },
  {
    id: "sample_usps_smishing",
    title: "📦 USPS Package Delivery Smishing",
    category: "Postal Smishing",
    type: "sms",
    expected: "Spam",
    sender: "+1 (888) 392-0199",
    subject: "",
    text: "USPS Notice: Your shipment parcel #US9405-8291 could not be delivered due to incomplete home address. Final notice: redelivery fee of $1.85 is required within 12 hours. Update details now: http://usps-redelivery-support.top/tracking. Reply STOP to opt out."
  },
  {
    id: "sample_lottery_winner",
    title: "🎁 $1,000,000 Walmart Gift Card Winner",
    category: "Lottery / Prize Scam",
    type: "sms",
    expected: "Spam",
    sender: "WIN-ALERT",
    subject: "",
    text: "URGENT WINNER ALERT! Congratulations, your cell number was chosen in the National Summer Jackpot. You won a $1,000,000 Walmart Gift Card and cash prize! Call toll-free 1-800-555-0199 immediately or follow this link to claim: http://walmart-payout-reward.buzz. Valid for 24 hours only!"
  },
  {
    id: "sample_geek_squad",
    title: "🧾 Geek Squad $499 Refund Scam",
    category: "Tech Support / Refund Scam",
    type: "email",
    expected: "Spam",
    sender: "billing-dept8372@gmail.com",
    subject: "Invoice #GS-98234: Your Auto-Renewal of $499.00 has been debited",
    text: "Dear Member,\n\nThank you for renewing your annual Geek Squad Total Tech Care protection plan. The amount of $499.00 has been successfully debited from your checking account via wire transfer.\n\nIf you did not authorize this charge or wish to claim an immediate refund, please dial our toll-free cancellation department immediately at: 1-888-492-0129.\n\nDo not email back. Call now to speak with a refund specialist.\nGeek Squad Billing Team"
  },
  {
    id: "sample_ceo_fraud",
    title: "👔 CEO Urgent Gift Card Request",
    category: "Business Email Compromise (BEC)",
    type: "email",
    expected: "Spam",
    sender: "ceo.office.direct@gmail.com",
    subject: "Urgent request from CEO - In a meeting",
    text: "Hi,\n\nI am currently in an executive board meeting and cannot take calls. I urgently need you to buy 5 Apple Gift Cards ($100 each) for client bonuses today.\n\nScratch the back, take clear photos of the codes, and reply immediately with the pictures. I will reimburse you by tomorrow morning through payroll. Keep this confidential.\n\nThanks,\nChief Executive Officer"
  },
  {
    id: "sample_legit_work_meeting",
    title: "💼 Legitimate Team Sprint Planning",
    category: "Authentic Business Email",
    type: "email",
    expected: "Not Spam",
    sender: "sarah.chen@techcorp.io",
    subject: "Q3 Sprint Planning Agenda & Architecture Slides Attached",
    text: "Hi Team,\n\nAttached is the agenda for our sprint planning session tomorrow at 2:00 PM. Please review the roadmap slides before the meeting so we can focus on Q3 milestones and dependency reviews.\n\nAlex and Jordan, please make sure your pull requests on the authentication branch are ready for review. Best regards,\n\nSarah Chen\nEngineering Lead"
  },
  {
    id: "sample_legit_personal_sms",
    title: "☕ Casual Coffee & Dinner Catch-up",
    category: "Authentic Personal SMS",
    type: "sms",
    expected: "Not Spam",
    sender: "Mom",
    subject: "",
    text: "Hey sweetie! Are you free for dinner tonight around 7? Dad made your favorite lasagna. Also let me know if you want to grab coffee tomorrow morning before your doctor appointment. Love you!"
  },
  {
    id: "sample_legit_github_receipt",
    title: "🐙 GitHub Payment Confirmation",
    category: "Authentic Transactional Email",
    type: "email",
    expected: "Not Spam",
    sender: "billing@github.com",
    subject: "Your GitHub receipt for June 2026",
    text: "Hello,\n\nThis is a confirmation of your monthly payment of $4.00 for GitHub Copilot Individual subscription. Your invoice #GH-382910 is attached in PDF format for your records.\n\nYou can manage your team and subscription settings anytime at github.com/settings/billing.\n\nThanks for building with GitHub,\nThe GitHub Team"
  },
  {
    id: "sample_legit_flight_update",
    title: "✈️ Flight Gate Change Alert",
    category: "Authentic Flight Notification",
    type: "sms",
    expected: "Not Spam",
    sender: "UnitedAirlines",
    subject: "",
    text: "United Airlines Update: Flight UA 482 to Chicago has a gate change to Gate B22. Boarding begins at 10:15 AM. You can check your digital boarding pass on the United app. Have a safe flight!"
  }
];

// Pre-compiled batch set for multi-message testing
export const BATCH_SAMPLE_DATASET = [
  "URGENT: Your bank account is locked due to 3 failed logins. Verify immediately at http://secure-bank-update.xyz to avoid permanent closure.",
  "Hey Dave, are we still on for the 3pm project sync today? Let me know if you need to reschedule.",
  "CONGRATULATIONS! You won a $1,000 Walmart Gift Card! Click here: http://bit.ly/claim-gift-card-now. Act now!",
  "Hi team, please find attached the meeting notes and presentation slides from yesterday's discussion.",
  "USPS: Package delivery failed. Redelivery fee of $2.50 required. Follow this link: http://192.168.1.1/parcel-update",
  "Mom: Can you pick up milk and bread on your way home tonight? Thanks!",
  "Exclusive Bitcoin opportunity: 400% guaranteed ROI profit within 24 hours. Send BTC to our wallet now $$$",
  "Don't forget the math homework is due tomorrow morning before professor Miller's lecture.",
  "Final Warning: Your McAfee antivirus subscription expired. Call toll-free 1-800-492-1029 immediately for full refund.",
  "Hi Sarah, great job on the demo today! The client was really impressed with the speed and design."
];

import LegalLayout from "@/components/legal/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 12, 2026">
      <section>
        <h2>1. Introduction</h2>
        <p>CardChat ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This policy explains what we collect, why, and how we keep it safe.</p>
      </section>
      <section>
        <h2>2. Information We Collect</h2>
        <ul>
          <li>Account details: email address, alias, and phone number for verification.</li>
          <li>Transaction data: gift card details, trade history, and wallet balances.</li>
          <li>Communication: chat messages with our agents, retained for safety and dispute resolution.</li>
          <li>Device data: IP address, device type, and browser for fraud prevention.</li>
        </ul>
      </section>
      <section>
        <h2>3. How We Use Your Data</h2>
        <p>We use your information to process trades, send payouts, verify identity, prevent fraud, improve our service, and comply with legal obligations under Nigerian law.</p>
      </section>
      <section>
        <h2>4. Data Sharing</h2>
        <p>We never sell your data. We share information only with verified payment partners, identity verification providers, and law enforcement when legally required.</p>
      </section>
      <section>
        <h2>5. Data Security</h2>
        <p>All data is encrypted in transit and at rest. Withdrawals require a 6-digit Transaction PIN. We perform regular security audits and restrict employee access on a need-to-know basis.</p>
      </section>
      <section>
        <h2>6. Your Rights</h2>
        <ul>
          <li>Access — request a copy of your data anytime.</li>
          <li>Correction — update inaccurate information from your profile.</li>
          <li>Deletion — request account deletion via our <a href="/delete-account" className="text-accent underline">Delete Account</a> page.</li>
          <li>Withdrawal of consent — opt out of marketing communications at any time.</li>
        </ul>
      </section>
      <section>
        <h2>7. Cookies</h2>
        <p>We use essential cookies to keep you signed in and analytics cookies to understand how the app is used. You can disable non-essential cookies in your browser settings.</p>
      </section>
      <section>
        <h2>8. Contact</h2>
        <p>For privacy questions, email <span className="text-accent">privacy@cardchat.ng</span>. We respond within 5 business days.</p>
      </section>
    </LegalLayout>
  );
}

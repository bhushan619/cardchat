import LegalLayout from "@/components/legal/LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" updated="June 12, 2026">
      <section>
        <h2>1. Acceptance</h2>
        <p>By creating an account or using CardChat, you agree to these Terms. If you do not agree, please do not use our services.</p>
      </section>
      <section>
        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old and legally able to enter contracts under Nigerian law. One account per person.</p>
      </section>
      <section>
        <h2>3. Trading Rules</h2>
        <ul>
          <li>All gift cards must be legally obtained and owned by you.</li>
          <li>Submitting used, fraudulent, or stolen cards will result in immediate account termination and may be reported to authorities.</li>
          <li>Rates displayed in the app are final at the moment a trade is initiated.</li>
          <li>Once a trade is marked successful, payouts cannot be reversed.</li>
        </ul>
      </section>
      <section>
        <h2>4. Wallet & Withdrawals</h2>
        <p>Your wallet holds two balances: Trading and Rewards. Withdrawals to your bank account require a 6-digit Transaction PIN and are processed during business hours. We may take up to 24 hours for compliance review on large withdrawals.</p>
      </section>
      <section>
        <h2>5. Prohibited Conduct</h2>
        <ul>
          <li>Sharing your account credentials or PIN with others.</li>
          <li>Attempting to circumvent rate limits or security checks.</li>
          <li>Harassing agents or other users.</li>
          <li>Using CardChat for money laundering or any unlawful purpose.</li>
        </ul>
      </section>
      <section>
        <h2>6. Account Suspension</h2>
        <p>We may suspend or terminate accounts that violate these Terms, with or without notice. Funds in suspended accounts remain available for withdrawal pending compliance review.</p>
      </section>
      <section>
        <h2>7. Limitation of Liability</h2>
        <p>CardChat is provided "as is". We are not liable for indirect losses, missed trading opportunities, or third-party bank delays beyond our control.</p>
      </section>
      <section>
        <h2>8. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. Material changes will be communicated via email or in-app notification at least 7 days before taking effect.</p>
      </section>
      <section>
        <h2>9. Governing Law</h2>
        <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes will be resolved in the courts of Lagos State.</p>
      </section>
      <section>
        <h2>10. Contact</h2>
        <p>Questions about these Terms? Email <span className="text-accent">legal@cardchat.ng</span>.</p>
      </section>
    </LegalLayout>
  );
}

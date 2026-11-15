import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-head">
          <div>
            <span className="eyebrow">Legal</span>
            <h1>Privacy policy</h1>
            <p className="page-sub">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="card card-pad prose">
          <h2>1. Introduction</h2>
          <p>
            {SITE.name} ("we", "our" or "us") is a private-sector job marketplace
            for Delhi NCR. This policy explains what information we collect, why
            we collect it and the choices you have. By using {SITE.name}, you
            agree to this policy.
          </p>

          <h2>2. Information we collect</h2>
          <p>We collect only what we need to run the service:</p>
          <ul>
            <li>
              <strong>Employer account details</strong> — company name, contact
              person, email address, phone number and password (stored securely
              by our authentication provider).
            </li>
            <li>
              <strong>Company profile</strong> — description, industry, company
              size, location, website and WhatsApp number.
            </li>
            <li>
              <strong>Job listings</strong> — the role, salary, location,
              experience, description and requirements you publish.
            </li>
            <li>
              <strong>Payment confirmation</strong> — the plan purchased, amount,
              Razorpay order and payment identifiers, and the payment status.
              Card, UPI and bank details are handled by Razorpay and are never
              stored by us.
            </li>
            <li>
              <strong>Technical data</strong> — basic logs such as IP address,
              browser type and pages visited, used for security and to keep the
              site working.
            </li>
          </ul>

          <h2>3. How we use your information</h2>
          <ul>
            <li>To create and manage employer accounts and job listings.</li>
            <li>To process payments and activate plans.</li>
            <li>To show job listings to candidates and route applications.</li>
            <li>To respond to support requests and investigate reports.</li>
            <li>To prevent fraud, abuse and misuse of the platform.</li>
            <li>To meet legal and accounting obligations.</li>
          </ul>

          <h2>4. Payments</h2>
          <p>
            Employer payments are processed by Razorpay. When you pay, Razorpay
            collects and processes your payment details under its own privacy
            policy. We receive a confirmation of the payment and the identifiers
            needed to activate your plan.
          </p>

          <h2>5. Cookies and local storage</h2>
          <p>
            We use cookies and browser storage to keep you signed in and to
            remember basic preferences. You can clear these through your browser
            settings; some parts of the site, such as the employer dashboard,
            may then stop working until you sign in again.
          </p>

          <h2>6. Who we share data with</h2>
          <p>We do not sell your personal information. We share data only with:</p>
          <ul>
            <li>
              <strong>Service providers</strong> — Supabase (database and
              authentication) and Razorpay (payments), who process data on our
              behalf.
            </li>
            <li>
              <strong>Employers</strong> — when a candidate contacts them from a
              job page, the conversation happens directly on WhatsApp.
            </li>
            <li>
              <strong>Authorities</strong> — where required by law or to protect
              the safety of our users.
            </li>
          </ul>

          <h2>7. Data security</h2>
          <p>
            We use encryption in transit, access controls and database row-level
            security to protect your data. No method of transmission or storage
            is completely secure, so please use a strong, unique password and
            keep your login details private.
          </p>

          <h2>8. Your rights</h2>
          <p>You can ask us to:</p>
          <ul>
            <li>Show you the personal data we hold about you.</li>
            <li>Correct inaccurate information.</li>
            <li>Delete your account and associated data.</li>
            <li>Stop processing your data where the law allows it.</li>
          </ul>
          <p>
            To make a request, email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>. We may need to
            verify your identity before acting on it.
          </p>

          <h2>9. Children's privacy</h2>
          <p>
            The service is intended for people aged 18 and above. We do not
            knowingly collect personal information from children. If you believe
            a child has provided us with data, please contact us so we can remove
            it.
          </p>

          <h2>10. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The latest version will
            always be on this page, with the date shown at the top.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about this policy? Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use the{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

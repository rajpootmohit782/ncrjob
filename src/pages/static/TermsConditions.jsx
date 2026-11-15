import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";

export default function TermsConditions() {
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
            <h1>Terms of service</h1>
            <p className="page-sub">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <div className="card card-pad prose">
          <h2>1. Acceptance of terms</h2>
          <p>
            By using {SITE.name}, you agree to these terms. If you do not agree
            with any part of them, please do not use the site.
          </p>

          <h2>2. What we provide</h2>
          <p>
            {SITE.name} is a job listing platform for private-sector roles in
            Delhi NCR. We provide:
          </p>
          <ul>
            <li>Search and browsing of job listings, free for candidates.</li>
            <li>Employer account creation and paid job posting plans.</li>
            <li>Review of listings before they are published.</li>
            <li>
              WhatsApp-based application links that connect candidates directly
              with employers.
            </li>
          </ul>
          <p>
            We are a listing platform only. We do not participate in hiring
            decisions and we do not guarantee employment.
          </p>

          <h2>3. Accounts</h2>
          <ul>
            <li>
              You must provide accurate information when creating an account.
            </li>
            <li>
              You are responsible for keeping your login details confidential and
              for all activity under your account.
            </li>
            <li>You must be at least 18 years old to create an account.</li>
            <li>
              We may suspend or close accounts that break these terms, post
              misleading content or fail to pay for a plan.
            </li>
          </ul>

          <h2>4. Employer plans and payments</h2>
          <ul>
            <li>
              Plans are one-time purchases that include a set number of job posts
              and a validity period, shown before payment.
            </li>
            <li>
              Job credits are deducted when a listing is created, not when it is
              approved.
            </li>
            <li>
              Accounts are activated automatically after Razorpay verifies the
              payment.
            </li>
            <li>
              Payments are non-refundable once a plan is activated, except where
              required by law or where the payment was made in error.
            </li>
            <li>
              We may change plan prices or features in future. Changes do not
              affect a plan you have already purchased.
            </li>
          </ul>

          <h2>5. Job listings</h2>
          <ul>
            <li>
              Employers are responsible for the accuracy, legality and fairness
              of their listings.
            </li>
            <li>
              Listings must not ask candidates for money, use discriminatory
              language or make false promises.
            </li>
            <li>
              We review new listings, but we cannot guarantee that every detail is
              accurate. Candidates should confirm details with the employer.
            </li>
            <li>
              We may edit, reject or remove a listing that breaks these terms.
            </li>
          </ul>

          <h2>6. Prohibited activity</h2>
          <p>You must not use the platform to:</p>
          <ul>
            <li>Post fake, misleading or fraudulent job listings.</li>
            <li>Ask candidates for payment for a job or interview.</li>
            <li>Harass, threaten or discriminate against other users.</li>
            <li>Collect candidate data for unrelated marketing.</li>
            <li>Scrape, copy or resell content without permission.</li>
            <li>Break any applicable law or regulation.</li>
          </ul>

          <h2>7. Intellectual property</h2>
          <p>
            The {SITE.name} name, design, text and software are owned by us and
            protected by applicable laws. You may not copy, distribute or create
            derivative works without our written permission. Employers keep
            ownership of the content they submit, and grant us a licence to
            display it on the platform.
          </p>

          <h2>8. Third-party services</h2>
          <p>
            The site links to third-party services such as WhatsApp and Razorpay.
            We are not responsible for their content, availability or privacy
            practices. Your use of those services is governed by their own terms.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            The service is provided "as is" and "as available". To the extent
            permitted by law, we are not liable for loss or damage arising from
            your use of the site, inaccuracies in employer listings, interactions
            between candidates and employers, or interruptions to the service.
          </p>

          <h2>10. Changes and governing law</h2>
          <p>
            We may update these terms at any time. Continued use of the site
            after changes means you accept the updated terms. These terms are
            governed by the laws of India, and disputes are subject to the
            exclusive jurisdiction of courts in Noida, Uttar Pradesh.
          </p>

          <h2>11. Contact</h2>
          <p>
            For questions about these terms, email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use the{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

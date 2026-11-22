import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SITE } from "../../lib/site";

import useSeo from "../../hooks/useSeo";

export default function TermsConditions() {
  useSeo({ title: "Terms and Conditions | VMWjobs", description: "Review the terms for using VMWjobs, a private-sector job marketplace serving Delhi NCR.", path: "/terms" });
  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Terms &amp; Conditions</h1>

        <p className="mt-2 text-sm text-muted">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="card static-content mt-6 p-6 sm:p-8">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using VMWjobs, you agree to be bound by these Terms and Conditions.
            If you do not agree with any part of these terms, please do not use our website.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            VMWjobs is a job listing platform that connects job seekers with employers.
            We provide:
          </p>
          <ul>
            <li>Job listing and search services</li>
            <li>Employer registration and job posting</li>
            <li>Job seeker registration and profile management</li>
            <li>WhatsApp-based job application redirects</li>
          </ul>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You must be at least 18 years old to use our services</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
          </ul>

          <h2>4. Job Listings</h2>
          <ul>
            <li>Employers are responsible for the accuracy of their job postings</li>
            <li>We verify job listings but cannot guarantee 100% accuracy</li>
            <li>Job seekers should verify details directly with employers before applying</li>
            <li>We are not responsible for the outcome of any job application</li>
          </ul>

          <h2>5. Prohibited Activities</h2>
          <p>You agree NOT to use our platform to:</p>
          <ul>
            <li>Post fake or misleading job listings</li>
            <li>Engage in fraudulent activities</li>
            <li>Harass or abuse other users</li>
            <li>Post discriminatory content</li>
            <li>Violate any applicable laws</li>
            <li>Scrape or copy our content without permission</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and software,
            is the property of VMWjobs and is protected by intellectual property laws.
            You may not reproduce, distribute, or create derivative works without our permission.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            VMWjobs is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul>
            <li>Any loss or damage arising from your use of our services</li>
            <li>Inaccuracies in job listings posted by employers</li>
            <li>Any interaction between job seekers and employers</li>
            <li>Technical issues or website downtime</li>
          </ul>

          <h2>8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (such as WhatsApp, Telegram, etc.).
            We are not responsible for the content or privacy practices of these external sites.
          </p>

          <h2>9. Modifications</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time.
            Continued use of the website after changes constitutes acceptance of the updated terms.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
            Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh, India.
          </p>

          <h2>11. Contact</h2>
          <p>
            For any questions regarding these Terms, please contact us at:
          </p>
          <p>
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

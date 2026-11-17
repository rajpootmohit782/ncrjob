import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SITE } from "../../lib/site";

export default function PrivacyPolicy() {
  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Privacy Policy</h1>

        <p className="mt-2 text-sm text-muted">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="card static-content mt-6 p-6 sm:p-8">
          <h2>1. Introduction</h2>
          <p>
            Welcome to VMWjobs ("we," "our," or "us"). We are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website and use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <h3>Personal Information</h3>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Resume/CV details</li>
            <li>Job preferences and location</li>
          </ul>
          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent</li>
            <li>Device information</li>
            <li>Cookies and tracking technologies data</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our job listing services</li>
            <li>To match you with relevant job opportunities</li>
            <li>To communicate with you about job alerts and updates</li>
            <li>To improve our website and services</li>
            <li>To prevent fraud and ensure security</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2>4. Third-Party Advertising</h2>
          <p>
            We may use third-party advertising services, including Google AdSense, to display ads on our website.
            These third-party vendors use cookies to serve ads based on your prior visits to our website and other
            websites on the internet.
          </p>
          <p>
            You may opt out of personalized advertising by visiting{" "}
            <a href="https://adssettings.google.com/" target="_blank" rel="noreferrer">
              Google Ads Settings
            </a>.
          </p>

          <h2>5. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and store certain
            information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
          </p>
          <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal data
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
            over the internet is 100% secure.
          </p>

          <h2>7. Data Sharing</h2>
          <p>We do not sell your personal information. We may share your data with:</p>
          <ul>
            <li>Employers when you apply for a job</li>
            <li>Service providers who assist in operating our website</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect
            personal information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
            the new Privacy Policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a><br />
            Address: {SITE.address}
          </p>
        </div>
      </div>
    </div>
  );
}

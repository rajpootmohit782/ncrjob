import { Link } from "react-router-dom";

export default function TermsConditions() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: "32px", color: "#0f172a", margin: "20px 0 10px" }}>
          Terms & Conditions
        </h1>

        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div style={{ 
          backgroundColor: "#fff", 
          padding: "30px", 
          borderRadius: "12px", 
          border: "1px solid #e2e8f0",
          lineHeight: "1.8",
          color: "#334155",
          fontSize: "15px"
        }}>
          <h2 style={{ color: "#0f172a", marginTop: 0 }}>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Job Portal, you agree to be bound by these Terms and Conditions. 
            If you do not agree with any part of these terms, please do not use our website.
          </p>

          <h2 style={{ color: "#0f172a" }}>2. Description of Service</h2>
          <p>
            Job Portal is a job listing platform that connects job seekers with employers. 
            We provide:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Job listing and search services</li>
            <li>Employer registration and job posting</li>
            <li>Job seeker registration and profile management</li>
            <li>WhatsApp-based job application redirects</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>3. User Accounts</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>You must provide accurate information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account</li>
            <li>You must be at least 18 years old to use our services</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>4. Job Listings</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Employers are responsible for the accuracy of their job postings</li>
            <li>We verify job listings but cannot guarantee 100% accuracy</li>
            <li>Job seekers should verify details directly with employers before applying</li>
            <li>We are not responsible for the outcome of any job application</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>5. Prohibited Activities</h2>
          <p>You agree NOT to use our platform to:</p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Post fake or misleading job listings</li>
            <li>Engage in fraudulent activities</li>
            <li>Harass or abuse other users</li>
            <li>Post discriminatory content</li>
            <li>Violate any applicable laws</li>
            <li>Scrape or copy our content without permission</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>6. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, and software, 
            is the property of Job Portal and is protected by intellectual property laws. 
            You may not reproduce, distribute, or create derivative works without our permission.
          </p>

          <h2 style={{ color: "#0f172a" }}>7. Limitation of Liability</h2>
          <p>
            Job Portal is provided "as is" without warranties of any kind. We are not liable for:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Any loss or damage arising from your use of our services</li>
            <li>Inaccuracies in job listings posted by employers</li>
            <li>Any interaction between job seekers and employers</li>
            <li>Technical issues or website downtime</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>8. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites (such as WhatsApp, Telegram, etc.). 
            We are not responsible for the content or privacy practices of these external sites.
          </p>

          <h2 style={{ color: "#0f172a" }}>9. Modifications</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. 
            Continued use of the website after changes constitutes acceptance of the updated terms.
          </p>

          <h2 style={{ color: "#0f172a" }}>10. Governing Law</h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. 
            Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh, India.
          </p>

          <h2 style={{ color: "#0f172a" }}>11. Contact</h2>
          <p>
            For any questions regarding these Terms, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:info@yourjobportal.com" style={{ color: "#2563eb" }}>info@yourjobportal.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
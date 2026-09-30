import { Link } from "react-router-dom";

export default function Disclaimer() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: "32px", color: "#0f172a", margin: "20px 0 10px" }}>
          Disclaimer
        </h1>

        <div style={{ 
          backgroundColor: "#fff", 
          padding: "30px", 
          borderRadius: "12px", 
          border: "1px solid #e2e8f0",
          lineHeight: "1.8",
          color: "#334155",
          fontSize: "15px"
        }}>
          <h2 style={{ color: "#0f172a", marginTop: 0 }}>Important Notice</h2>
          <p>
            Job Portal is a job listing platform that aggregates and displays job opportunities 
            from various sources. While we strive to ensure the accuracy and genuineness of all 
            listings, we cannot guarantee that all information is 100% accurate or complete.
          </p>

          <h2 style={{ color: "#0f172a" }}>No Employment Guarantee</h2>
          <p>
            Job Portal does not guarantee employment to any user. We are a listing platform only 
            and do not participate in the hiring process. All employment decisions are made solely 
            by the employers.
          </p>

          <h2 style={{ color: "#0f172a" }}>Verification Responsibility</h2>
          <p>
            Job seekers are advised to:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Verify job details directly with the employer before applying</li>
            <li>Never pay money for job applications or interviews</li>
            <li>Report any suspicious job listings to us immediately</li>
            <li>Do thorough research about the company before joining</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>No Fees for Job Seekers</h2>
          <p>
            <strong>⚠️ WARNING:</strong> Legitimate employers never ask candidates to pay money 
            for job applications, registration, or interviews. If any employer asks you for money, 
            it is likely a scam. Please report such listings to us immediately.
          </p>

          <h2 style={{ color: "#0f172a" }}>External Links</h2>
          <p>
            Our website may redirect you to external platforms (such as WhatsApp) for job applications. 
            We are not responsible for any interactions that occur on these external platforms.
          </p>

          <h2 style={{ color: "#0f172a" }}>Accuracy of Information</h2>
          <p>
            While we make every effort to keep job listings updated, some positions may already be 
            filled or expired. We recommend contacting the employer directly to confirm availability.
          </p>

          <h2 style={{ color: "#0f172a" }}>Limitation of Liability</h2>
          <p>
            Job Portal shall not be held liable for any direct, indirect, incidental, or consequential 
            damages arising from the use of our platform or reliance on any information provided herein.
          </p>
        </div>
      </div>
    </div>
  );
}
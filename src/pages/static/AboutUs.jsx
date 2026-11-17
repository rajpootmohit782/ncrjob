import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: "32px", color: "#0f172a", margin: "20px 0 10px" }}>
          About Us
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
          <h2 style={{ color: "#0f172a", marginTop: 0 }}>Who We Are</h2>
          <p>
            Welcome to <strong>VMWjobs</strong> — a private-sector job marketplace for
            Delhi NCR. We connect candidates with legitimate employers across
            Noida, Greater Noida, Gurugram and Delhi.
          </p>

          <h2 style={{ color: "#0f172a" }}>Our Mission</h2>
          <p>
            Our mission is simple: to provide <strong>free, genuine, and verified job listings</strong> to every job seeker. 
            We understand the frustration of encountering fake job postings, and we work tirelessly to ensure that 
            every listing on our platform is authentic and trustworthy.
          </p>

          <h2 style={{ color: "#0f172a" }}>What We Offer</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li><strong>Private-sector roles</strong> — Opportunities in manufacturing, electronics, and more</li>
            <li><strong>Data Entry & Back Office</strong> — Office and computer-based roles</li>
            <li><strong>Delivery & Logistics</strong> — Warehouse, delivery and supply-chain roles</li>
            <li><strong>Work From Home</strong> — Remote opportunities where available</li>
            <li><strong>Campus & Trainee Jobs</strong> — For freshers and students</li>
            <li><strong>Field & Verification Roles</strong> — Private field and verification work</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>Why Choose Us?</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>✅ 100% Free for job seekers</li>
            <li>✅ Verified and genuine job listings</li>
            <li>✅ Updated daily with new opportunities</li>
            <li>✅ Direct WhatsApp apply — no middlemen</li>
            <li>✅ Jobs across Noida, Greater Noida, Gurgaon, Delhi, and more</li>
            <li>✅ No registration required to browse jobs</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>Our Coverage Area</h2>
          <p>
            We focus on private-sector job opportunities in:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Noida (Sector 62, 63, 65, 80, 81, 90, 151, 156, 159)</li>
            <li>Greater Noida (Kasna, Surajpur, Choganpur, Phase 2)</li>
            <li>Gurgaon / Gurugram</li>
            <li>Delhi NCR</li>
            <li>Remote / Work From Home (where offered)</li>
          </ul>

          <h2 style={{ color: "#0f172a" }}>For Employers</h2>
          <p>
            Are you an employer looking to hire? We make it easy for you to post job listings 
            and reach thousands of active job seekers. Simply register as an employer, 
            post your job, and our admin team will review and publish it.
          </p>

          <h2 style={{ color: "#0f172a" }}>Contact Us</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you. 
            Visit our <Link to="/contact" style={{ color: "#2563eb" }}>Contact Us</Link> page 
            to get in touch with our team.
          </p>
        </div>
      </div>
    </div>
  );
}
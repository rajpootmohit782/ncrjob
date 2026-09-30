import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "#0f172a", color: "#cbd5e1", padding: "40px 20px", marginTop: "60px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px" }}>
        
        <div>
          <h3 style={{ color: "#fff", marginTop: 0, fontSize: "20px" }}>Job<span style={{color: "#2563eb"}}>Portal</span></h3>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#94a3b8" }}>
            Find your dream job. Genuine and reliable job listings updated daily for freshers and experienced professionals.
          </p>
        </div>

        <div>
          <h4 style={{ color: "#fff", marginTop: 0 }}>Quick Links</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}><Link to="/" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Home</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/jobs" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>All Jobs</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/employer-login" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Post a Job</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "#fff", marginTop: 0 }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ marginBottom: "8px" }}><Link to="/about-us" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>About Us</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/contact-us" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Contact Us</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/privacy-policy" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Privacy Policy</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/terms-conditions" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Terms & Conditions</Link></li>
            <li style={{ marginBottom: "8px" }}><Link to="/disclaimer" style={{ color: "#cbd5e1", textDecoration: "none", fontSize: "14px" }}>Disclaimer</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "#fff", marginTop: 0 }}>Connect With Us</h4>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>Get instant job alerts.</p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" style={{ backgroundColor: "#25D366", color: "#fff", padding: "8px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
              WhatsApp
            </a>
            <a href="https://t.me/yourchannel" target="_blank" rel="noreferrer" style={{ backgroundColor: "#0088cc", color: "#fff", padding: "8px 14px", borderRadius: "6px", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}>
              Telegram
            </a>
          </div>
        </div>

      </div>
      
      <div style={{ textAlign: "center", marginTop: "40px", borderTop: "1px solid #334155", paddingTop: "20px", fontSize: "14px", color: "#64748b" }}>
        <p style={{ margin: "0 0 8px" }}>
          &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
        </p>
        <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
          Designed by{" "}
          <a 
            href="https://mohitspace.in" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: "#475569", textDecoration: "none" }}
          >
            subh.ai
          </a>
        </p>
        
        <p style={{ margin: 0, fontSize: "11px", color: "#475569" }}>
          Developed by{" "}
          <a 
            href="https://mohitspace.in" 
            target="_blank" 
            rel="noreferrer" 
            style={{ color: "#475569", textDecoration: "none" }}
          >
            MohitSpace.in
          </a>
        </p>
      </div>
    </footer>
  );
}
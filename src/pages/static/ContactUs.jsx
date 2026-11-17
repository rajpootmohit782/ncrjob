import { useState } from "react";
import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const subject = encodeURIComponent(`[VMWjobs] ${formData.subject}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    );

    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Link to="/" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: "32px", color: "#0f172a", margin: "20px 0 10px" }}>
          Contact Us
        </h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {/* Contact Form */}
          <div style={{ 
            backgroundColor: "#fff", 
            padding: "30px", 
            borderRadius: "12px", 
            border: "1px solid #e2e8f0"
          }}>
            <h2 style={{ color: "#0f172a", marginTop: 0, marginBottom: "20px" }}>
              Send Us a Message
            </h2>

            {submitted ? (
              <div style={{ 
                backgroundColor: "#dcfce7", 
                padding: "20px", 
                borderRadius: "8px",
                textAlign: "center"
              }}>
                <p style={{ color: "#166534", fontWeight: "bold", margin: 0 }}>
                  ✅ Your email app should have opened.
                </p>
                <p style={{ color: "#166534", margin: "8px 0 0" }}>
                  If it did not, email us directly at {SITE.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: "100%", 
                      padding: "12px 15px", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: "100%", 
                      padding: "12px 15px", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: "100%", 
                      padding: "12px 15px", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px",
                      fontSize: "15px",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#0f172a", fontSize: "14px" }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    style={{ 
                      width: "100%", 
                      padding: "12px 15px", 
                      border: "1px solid #e2e8f0", 
                      borderRadius: "8px",
                      fontSize: "15px",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Open Email App
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div>
            <div style={{ 
              backgroundColor: "#fff", 
              padding: "24px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0",
              marginBottom: "16px"
            }}>
              <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: "16px" }}>
                📧 Email Us
              </h3>
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px", lineHeight: "1.6" }}>
                For job inquiries and employer support:<br />
                <a href={`mailto:${SITE.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                  {SITE.email}
                </a>
              </p>
              <p style={{ color: "#64748b", margin: "12px 0 0", fontSize: "14px", lineHeight: "1.6" }}>
                Phone:<br />
                <a href={SITE.phoneHref} style={{ color: "#2563eb", textDecoration: "none" }}>
                  {SITE.phoneDisplay}
                </a>
              </p>
            </div>

            <div style={{ 
              backgroundColor: "#fff", 
              padding: "24px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0",
              marginBottom: "16px"
            }}>
              <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: "16px" }}>
                📱 Connect With Us
              </h3>
              <p style={{ color: "#64748b", margin: "0 0 12px", fontSize: "14px" }}>
                Join our community for instant job alerts:
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a 
                  href={SITE.socials.whatsapp} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#25D366",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  💬 WhatsApp
                </a>
                <a 
                  href={SITE.socials.telegram} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#0088cc",
                    color: "#fff",
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "bold"
                  }}
                >
                  ✈️ Telegram
                </a>
              </div>
            </div>

            <div style={{ 
              backgroundColor: "#fff", 
              padding: "24px", 
              borderRadius: "12px", 
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: "16px" }}>
                📍 Office Address
              </h3>
              <p style={{ color: "#64748b", margin: 0, fontSize: "14px", lineHeight: "1.8" }}>
                VMWjobs<br />
                {SITE.address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
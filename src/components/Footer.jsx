import { Link } from "react-router-dom";
import { SITE } from "../lib/site";

export default function Footer() {
  return (
    <footer style={{ 
      backgroundColor: "#0f172a", 
      color: "#cbd5e1", 
      paddingTop: "50px",
      marginTop: "60px"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Main Content */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "40px", 
          paddingBottom: "40px",
          borderBottom: "1px solid #1e293b"
        }}>
          
          {/* Brand & Description */}
          <div style={{ gridColumn: "span 1" }}>
            <h3 style={{ 
              color: "#fff", 
              margin: "0 0 16px", 
              fontSize: "22px", 
              fontWeight: "700" 
            }}>
              VMW<span style={{ color: "#2563eb" }}>jobs</span>
            </h3>
            <p style={{ 
              fontSize: "14px", 
              lineHeight: "1.7", 
              color: "#94a3b8", 
              margin: "0 0 20px" 
            }}>
              A private-sector job marketplace for Noida, Greater Noida,
              Gurugram and Delhi NCR. Connecting candidates with verified
              employers.
            </p>
            
            {/* Social Links */}
            <div style={{ display: "flex", gap: "12px" }}>
              <a 
                href={SITE.socials.whatsapp} 
                target="_blank" 
                rel="noreferrer"
                aria-label="WhatsApp"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: "#fff",
                  fontSize: "16px",
                  transition: "transform 0.2s"
                }}
              >
                W
              </a>
              <a 
                href={SITE.socials.telegram} 
                target="_blank" 
                rel="noreferrer"
                aria-label="Telegram"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#0088cc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: "#fff",
                  fontSize: "16px",
                  transition: "transform 0.2s"
                }}
              >
                T
              </a>
              <a 
                href={SITE.socials.instagram}
                target="_blank" 
                rel="noreferrer"
                aria-label="Instagram"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  color: "#fff",
                  fontSize: "16px",
                  transition: "transform 0.2s"
                }}
              >
                I
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ 
              color: "#fff", 
              margin: "0 0 16px", 
              fontSize: "16px", 
              fontWeight: "600" 
            }}>
              Quick Links
            </h4>
            <ul style={{ 
              listStyle: "none", 
              padding: 0, 
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <li>
                <Link to="/" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/become-employer" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ 
              color: "#fff", 
              margin: "0 0 16px", 
              fontSize: "16px", 
              fontWeight: "600" 
            }}>
              Legal
            </h4>
            <ul style={{ 
              listStyle: "none", 
              padding: 0, 
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}>
              <li>
                <Link to="/privacy" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" style={{ 
                  color: "#94a3b8", 
                  textDecoration: "none", 
                  fontSize: "14px",
                  transition: "color 0.2s"
                }}>
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ 
              color: "#fff", 
              margin: "0 0 16px", 
              fontSize: "16px", 
              fontWeight: "600" 
            }}>
              Contact
            </h4>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "12px",
              fontSize: "14px",
              color: "#94a3b8"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>📱</span>
                <a 
                  href={SITE.phoneHref} 
                  style={{ 
                    color: "#94a3b8", 
                    textDecoration: "none" 
                  }}
                >
                  {SITE.phoneDisplay}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>✉️</span>
                <a 
                  href={`mailto:${SITE.email}`} 
                  style={{ 
                    color: "#94a3b8", 
                    textDecoration: "none" 
                  }}
                >
                  {SITE.email}
                </a>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ fontSize: "16px" }}>📍</span>
                <span>{SITE.address}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar - Simple Credits */}
        <div style={{ 
          padding: "24px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
          color: "#64748b"
        }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} VMWjobs. All rights reserved.
          </p>
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            flexWrap: "wrap"
          }}>
            <span>
              Design:{" "}
              <a 
                href={SITE.credits.design}
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: "#e1306c", 
                  textDecoration: "none"
                }}
              >
                subh.ai
              </a>
            </span>
            <span style={{ color: "#475569" }}>•</span>
            <span>
              Development:{" "}
              <a 
                href={SITE.credits.builtBy}
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: "#60a5fa", 
                  textDecoration: "none"
                }}
              >
                mohitspace.in
              </a>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
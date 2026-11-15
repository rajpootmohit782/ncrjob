import { Link } from "react-router-dom";
import Logo from "./Logo";
import { MailIcon, PhoneIcon, PinIcon } from "./Icons";
import { SITE } from "../lib/site";

const SEEKER_LINKS = [
  { to: "/jobs", label: "Browse jobs" },
  { to: "/jobs", label: "Featured roles" },
  { to: "/about", label: "About VMWjobs" },
  { to: "/contact", label: "Contact us" },
];

const EMPLOYER_LINKS = [
  { to: "/become-employer", label: "Post a job" },
  { to: "/become-employer", label: "Plans & pricing" },
  { to: "/employer-login", label: "Employer login" },
  { to: "/employer-dashboard", label: "Employer dashboard" },
];

const LEGAL_LINKS = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of service" },
  { to: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />

            <p>
              A private-sector job marketplace for Delhi NCR — connecting
              candidates with reviewed employers in Noida, Greater Noida,
              Gurugram and Delhi.
            </p>

            <div className="socials">
              <a
                className="social"
                href={SITE.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="VMWjobs on WhatsApp"
              >
                WA
              </a>
              <a
                className="social"
                href={SITE.socials.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="VMWjobs on Telegram"
              >
                TG
              </a>
              <a
                className="social"
                href={SITE.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="VMWjobs on Instagram"
              >
                IG
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Job seekers</h4>
            {SEEKER_LINKS.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="footer-col">
            <h4>Employers</h4>
            {EMPLOYER_LINKS.map((link) => (
              <Link key={link.label} to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a className="footer-contact" href={`mailto:${SITE.email}`}>
              <MailIcon />
              <span>{SITE.email}</span>
            </a>
            <a className="footer-contact" href={SITE.phoneHref}>
              <PhoneIcon />
              <span>{SITE.phoneDisplay}</span>
            </a>
            <span className="footer-contact">
              <PinIcon />
              <span>{SITE.address}</span>
            </span>

            <div className="stack-sm mt-1">
              {LEGAL_LINKS.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>
            Design:{" "}
            <a href={SITE.credits.design} target="_blank" rel="noreferrer">
              subh.ai
            </a>{" "}
            · Built by{" "}
            <a href={SITE.credits.builtBy} target="_blank" rel="noreferrer">
              MohitSpace.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

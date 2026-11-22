import { Link } from "react-router-dom";
import { Briefcase, Camera, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { SITE } from "../lib/site";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Browse Jobs" },
  { to: "/become-employer", label: "Post a Job" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const legalLinks = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Service" },
  { to: "/disclaimer", label: "Disclaimer" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#0f172a] text-slate-400">
      <div className="container-page">
        <div className="grid gap-10 border-b border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="VMWjobs home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-950/40">
                <Briefcase className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                VMW<span className="text-amber-400">jobs</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
              A private-sector job marketplace for Noida, Greater Noida,
              Gurugram and Delhi NCR. Connecting candidates with verified
              employers.
            </p>

            <div className="mt-5 flex gap-2.5">
              <a
                href={SITE.socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-emerald-500 hover:text-white"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={SITE.socials.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-sky-500 hover:text-white"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href={SITE.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-300 transition hover:bg-rose-500 hover:text-white"
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h4>
            <div className="space-y-3.5 text-sm">
              {SITE.phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="footer-link flex items-center gap-2.5"
                >
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  {phone.display}
                </a>
              ))}
              <a href={`mailto:${SITE.email}`} className="footer-link flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                {SITE.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span>{SITE.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">© {new Date().getFullYear()} VMWjobs. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Design:{" "}
              <a href={SITE.credits.design} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-white">
                subh.ai
              </a>
            </span>
            <span className="text-slate-700">•</span>
            <span>
              Development:{" "}
              <a href={SITE.credits.builtBy} target="_blank" rel="noreferrer" className="text-slate-400 transition hover:text-white">
                mohitspace.in
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

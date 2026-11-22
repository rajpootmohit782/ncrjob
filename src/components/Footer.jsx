import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "../lib/site";

// Set VITE_SHOW_APK_DOWNLOAD=false after the Play Store release goes live.
const showApkDownload = import.meta.env.VITE_SHOW_APK_DOWNLOAD !== "false";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Browse Jobs" },
  { to: "/become-employer", label: "Post a Job" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
  ...(showApkDownload ? [{ to: "/download", label: "Get the App" }] : []),
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
            <Link to="/" className="inline-flex items-center gap-2.5" aria-label="VMW NCR Jobs home">
              <img
                src="/vmw-ncr-jobs-logo.png"
                alt=""
                width="44"
                height="44"
                className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-white/10"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-xl font-extrabold tracking-tight text-white">
                  <span className="text-amber-400">VMW</span>{" "}
                  <span className="text-indigo-300">NCR Jobs</span>
                </span>
                <span className="mt-1 text-xs font-medium tracking-wide text-slate-500">
                  www.vmwncrjob.in
                </span>
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
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-emerald-400 transition hover:bg-emerald-500 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href={SITE.socials.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-pink-400 transition hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
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
          <p className="m-0">© {new Date().getFullYear()} VMW NCR Jobs. All rights reserved.</p>
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

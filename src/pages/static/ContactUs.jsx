import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
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
    <div className="page-shell">
      <div className="container-page max-w-5xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Contact Us</h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Contact Form */}
          <div className="card p-6 sm:p-8">
            <h2 className="text-xl font-bold text-ink">Send Us a Message</h2>

            {submitted ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
                <p className="mt-3 font-bold text-emerald-800">
                  Your email app should have opened.
                </p>
                <p className="mt-2 text-sm text-emerald-700">
                  If it did not, email us directly at {SITE.email}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="label" htmlFor="contact-name">Your Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="contact-subject">Subject *</label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="input min-h-32 resize-y"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Open Email App
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-brand">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-ink">Email Us</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                For job inquiries and employer support:<br />
                <a href={`mailto:${SITE.email}`} className="font-semibold text-brand hover:underline">
                  {SITE.email}
                </a>
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Phone:<br />
                <a href={SITE.phoneHref} className="font-semibold text-brand hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </p>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-ink">Connect With Us</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                Join our community for instant job alerts:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={SITE.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="btn min-h-10 bg-[#25D366] px-4 py-2 text-xs text-white shadow-md shadow-emerald-600/20 hover:bg-[#1fb85a]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  WhatsApp
                </a>
                <a
                  href={SITE.socials.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="btn min-h-10 bg-[#0088cc] px-4 py-2 text-xs text-white shadow-md shadow-sky-600/20 hover:bg-[#0077b3]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Telegram
                </a>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-ink">Office Address</h3>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
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

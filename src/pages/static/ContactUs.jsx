import { useState } from "react";
import { SITE } from "../../lib/site";
import {
  CheckIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "../../components/Icons";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const subject = encodeURIComponent(`[VMWjobs] ${formData.subject}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    );

    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-head">
          <div>
            <span className="eyebrow">Contact</span>
            <h1>Talk to us</h1>
            <p className="page-sub">
              Questions about a listing, your employer account or a payment? We
              are here to help.
            </p>
          </div>
        </div>

        <div className="contact-grid">
          <div className="card card-pad">
            <h2>Send a message</h2>
            <p className="small muted mt-1">
              This opens your email app with the message ready to send.
            </p>

            {submitted ? (
              <div className="alert alert-success mt-2" role="status">
                <CheckIcon />
                <span>
                  Your email app should have opened. If it did not, email us
                  directly at {SITE.email} and we will reply within one working
                  day.
                </span>
              </div>
            ) : (
              <form className="auth-form mt-2" onSubmit={handleSubmit}>
                <label className="field">
                  <span className="field-label">Your name *</span>
                  <input
                    className="input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                  />
                </label>

                <label className="field">
                  <span className="field-label">Email address *</span>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                  />
                </label>

                <label className="field">
                  <span className="field-label">Subject *</span>
                  <input
                    className="input"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="How can we help?"
                  />
                </label>

                <label className="field">
                  <span className="field-label">Message *</span>
                  <textarea
                    className="textarea"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us a little more."
                  />
                </label>

                <button className="btn btn-primary btn-block" type="submit">
                  <MailIcon size={16} /> Open email app
                </button>
              </form>
            )}
          </div>

          <aside className="stack">
            <div className="card card-pad">
              <div className="stack">
                <div className="contact-item">
                  <MailIcon />
                  <div>
                    <h3>Email</h3>
                    <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                  </div>
                </div>

                <div className="contact-item">
                  <PhoneIcon />
                  <div>
                    <h3>Phone</h3>
                    <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
                  </div>
                </div>

                <div className="contact-item">
                  <PinIcon />
                  <div>
                    <h3>Office</h3>
                    <p>{SITE.address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-pad">
              <h3>Job alerts & updates</h3>
              <p className="small muted mt-1">
                Join our community for new roles and hiring updates.
              </p>

              <div className="stack-sm mt-2">
                <a
                  className="btn btn-secondary btn-block"
                  href={SITE.socials.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon /> WhatsApp
                </a>
                <a
                  className="btn btn-secondary btn-block"
                  href={SITE.socials.telegram}
                  target="_blank"
                  rel="noreferrer"
                >
                  Telegram
                </a>
              </div>
            </div>

            <div className="card card-pad">
              <h3>Report a listing</h3>
              <p className="small muted mt-1">
                If a job asks for money or looks misleading, email us the job
                title and company. We investigate every report.
              </p>
              <a
                className="btn btn-ghost btn-sm mt-2"
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(
                  "Report a job listing",
                )}`}
              >
                <MailIcon size={14} /> Report a job
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

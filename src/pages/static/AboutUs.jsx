import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";
import { CheckCircleIcon, ShieldIcon, WhatsAppIcon } from "../../components/Icons";

const OFFERINGS = [
  "Private-sector roles in Noida, Greater Noida, Gurugram and Delhi",
  "Data entry, back office, logistics and field roles",
  "Work-from-home and hybrid openings",
  "Fresher and trainee positions",
  "Delivery and operations roles",
  "Support, sales and admin positions",
];

const PROMISES = [
  "Free for job seekers — always",
  "Employers are reviewed before listings go live",
  "No middlemen or placement fees",
  "Apply directly with the employer on WhatsApp",
  "No account needed to browse jobs",
  "Clear salary, location and experience details",
];

export default function AboutUs() {
  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-head">
          <div>
            <span className="eyebrow">About VMWjobs</span>
            <h1>Good work, closer to home.</h1>
            <p className="page-sub">
              VMWjobs is a private-sector job marketplace for Delhi NCR — built
              to make local hiring simple, transparent and trustworthy.
            </p>
          </div>
        </div>

        <div className="card card-pad prose">
          <h2>Why we built VMWjobs</h2>
          <p>
            Finding a good local job should not mean scrolling through
            copy-pasted listings, calling unknown numbers or paying a fee before
            you even get an interview. {SITE.name} was built to fix that.
          </p>
          <p>
            We bring genuine openings from reviewed employers into one clean,
            easy-to-browse place. Every listing shows the salary, location and
            experience up front, and every application goes directly to the
            employer on WhatsApp.
          </p>

          <h2>What you will find here</h2>
          <ul>
            {OFFERINGS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Our promise to candidates</h2>
          <ul className="check-list">
            {PROMISES.map((item) => (
              <li key={item}>
                <CheckCircleIcon />
                {item}
              </li>
            ))}
          </ul>

          <div className="prose-note">
            <strong>Never pay for a job.</strong> A genuine employer will never
            ask you for money for an application, interview, registration or
            training. If a listing asks for payment, report it to us right away.
          </div>

          <h2>For employers</h2>
          <p>
            Hiring in NCR? Create a company account, choose a simple one-time
            plan and publish your role. Applications land directly on your
            WhatsApp number — no agency, no long contracts and no commission on
            hires.
          </p>
          <p>
            <Link to="/become-employer">See employer plans</Link> or{" "}
            <Link to="/contact">talk to our team</Link> if you have a question.
          </p>

          <h2>How we keep listings trustworthy</h2>
          <ul>
            <li>
              Every employer account is reviewed before it can publish jobs.
            </li>
            <li>
              New listings are checked by our team before they appear publicly.
            </li>
            <li>
              We remove roles that look misleading, discriminatory or unsafe.
            </li>
            <li>
              Candidates can report a listing and we investigate every report.
            </li>
          </ul>

          <h2>Contact us</h2>
          <p>
            Questions, feedback or a listing to report? Email us at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or use the{" "}
            <Link to="/contact">contact page</Link>. We usually reply within one
            working day.
          </p>
        </div>

        <div className="row wrap mt-2">
          <span className="badge badge-success">
            <ShieldIcon /> Reviewed employers
          </span>
          <span className="badge badge-brand">
            <WhatsAppIcon /> Direct applications
          </span>
          <span className="badge badge-muted">Delhi NCR only</span>
        </div>
      </div>
    </div>
  );
}

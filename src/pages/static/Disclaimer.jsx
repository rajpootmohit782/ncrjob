import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";

export default function Disclaimer() {
  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-head">
          <div>
            <span className="eyebrow">Legal</span>
            <h1>Disclaimer</h1>
            <p className="page-sub">
              Please read this before applying for a job through {SITE.name}.
            </p>
          </div>
        </div>

        <div className="card card-pad prose">
          <h2>Important notice</h2>
          <p>
            {SITE.name} is a job listing platform for private-sector roles in
            Delhi NCR. We work to keep listings accurate and genuine, but we
            cannot guarantee that every detail is complete, current or correct.
          </p>

          <h2>No employment guarantee</h2>
          <p>
            We do not guarantee employment to any candidate. We are a listing
            platform only and do not take part in hiring decisions. All
            employment decisions are made solely by the employer.
          </p>

          <div className="prose-note">
            <strong>Never pay for a job.</strong> Legitimate employers do not ask
            candidates to pay for an application, interview, registration or
            training. If an employer asks you for money, treat it as a red flag
            and report the listing to us.
          </div>

          <h2>Verify before you apply</h2>
          <ul>
            <li>Confirm the role, salary and location with the employer.</li>
            <li>Research the company before sharing documents or joining.</li>
            <li>Never share bank details, OTPs or passwords with anyone.</li>
            <li>Report suspicious listings to us immediately.</li>
          </ul>

          <h2>External links</h2>
          <p>
            Job pages include links to WhatsApp so you can contact the employer
            directly. We are not responsible for conversations or transactions
            that happen on external platforms.
          </p>

          <h2>Accuracy of information</h2>
          <p>
            Some positions may be filled or withdrawn after they are published.
            We recommend confirming availability with the employer before you
            travel to an interview.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the extent permitted by law, {SITE.name} is not liable for any
            direct, indirect, incidental or consequential loss arising from your
            use of the platform or reliance on information published on it.
          </p>

          <h2>Report a listing</h2>
          <p>
            To report a job or employer, email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the job title,
            company name and a short description of the issue. We investigate
            every report. You can also use the{" "}
            <Link to="/contact">contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

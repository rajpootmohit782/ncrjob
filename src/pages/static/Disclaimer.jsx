import { Link } from "react-router-dom";
import { ArrowLeft, TriangleAlert } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Disclaimer</h1>

        <div className="card static-content mt-6 p-6 sm:p-8">
          <h2>Important Notice</h2>
          <p>
            VMWjobs is a job listing platform that aggregates and displays job opportunities
            from various sources. While we strive to ensure the accuracy and genuineness of all
            listings, we cannot guarantee that all information is 100% accurate or complete.
          </p>

          <h2>No Employment Guarantee</h2>
          <p>
            VMWjobs does not guarantee employment to any user. We are a listing platform only
            and do not participate in the hiring process. All employment decisions are made solely
            by the employers.
          </p>

          <h2>Verification Responsibility</h2>
          <p>
            Job seekers are advised to:
          </p>
          <ul>
            <li>Verify job details directly with the employer before applying</li>
            <li>Never pay money for job applications or interviews</li>
            <li>Report any suspicious job listings to us immediately</li>
            <li>Do thorough research about the company before joining</li>
          </ul>

          <h2>No Fees for Job Seekers</h2>
          <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
            <span>
              <strong className="text-rose-900">WARNING:</strong> Legitimate employers never ask candidates to pay money
              for job applications, registration, or interviews. If any employer asks you for money,
              it is likely a scam. Please report such listings to us immediately.
            </span>
          </p>

          <h2>External Links</h2>
          <p>
            Our website may redirect you to external platforms (such as WhatsApp) for job applications.
            We are not responsible for any interactions that occur on these external platforms.
          </p>

          <h2>Accuracy of Information</h2>
          <p>
            While we make every effort to keep job listings updated, some positions may already be
            filled or expired. We recommend contacting the employer directly to confirm availability.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            VMWjobs shall not be held liable for any direct, indirect, incidental, or consequential
            damages arising from the use of our platform or reliance on any information provided herein.
          </p>
        </div>
      </div>
    </div>
  );
}

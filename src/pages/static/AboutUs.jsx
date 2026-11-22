import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import useSeo from "../../hooks/useSeo";

const reasons = [
  "100% Free for job seekers",
  "Verified and genuine job listings",
  "Updated daily with new opportunities",
  "Direct WhatsApp apply — no middlemen",
  "Jobs across Noida, Greater Noida, Gurgaon, Delhi, and more",
  "No registration required to browse jobs",
];

export default function AboutUs() {
  useSeo({ title: "About VMWjobs | Delhi NCR Job Marketplace", description: "Learn how VMWjobs connects job seekers with private-sector employers across Noida, Greater Noida, Gurugram and Delhi NCR.", path: "/about" });
  return (
    <div className="page-shell">
      <div className="container-page max-w-4xl py-10 sm:py-14">
        <Link to="/" className="link-arrow mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">About Us</h1>

        <div className="card static-content mt-6 p-6 sm:p-8">
          <h2>Who We Are</h2>
          <p>
            Welcome to <strong>VMWjobs</strong> — a private-sector job marketplace for
            Delhi NCR. We connect candidates with legitimate employers across
            Noida, Greater Noida, Gurugram and Delhi.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is simple: to provide <strong>free, genuine, and verified job listings</strong> to every job seeker.
            We understand the frustration of encountering fake job postings, and we work tirelessly to ensure that
            every listing on our platform is authentic and trustworthy.
          </p>

          <h2>What We Offer</h2>
          <ul>
            <li><strong>Private-sector roles</strong> — Opportunities in manufacturing, electronics, and more</li>
            <li><strong>Data Entry &amp; Back Office</strong> — Office and computer-based roles</li>
            <li><strong>Delivery &amp; Logistics</strong> — Warehouse, delivery and supply-chain roles</li>
            <li><strong>Work From Home</strong> — Remote opportunities where available</li>
            <li><strong>Campus &amp; Trainee Jobs</strong> — For freshers and students</li>
            <li><strong>Field &amp; Verification Roles</strong> — Private field and verification work</li>
          </ul>

          <h2>Why Choose Us?</h2>
          <ul className="list-none space-y-2.5 pl-0">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>

          <h2>Our Coverage Area</h2>
          <p>
            We focus on private-sector job opportunities in:
          </p>
          <ul>
            <li>Noida (Sector 62, 63, 65, 80, 81, 90, 151, 156, 159)</li>
            <li>Greater Noida (Kasna, Surajpur, Choganpur, Phase 2)</li>
            <li>Gurgaon / Gurugram</li>
            <li>Delhi NCR</li>
            <li>Remote / Work From Home (where offered)</li>
          </ul>

          <h2>For Employers</h2>
          <p>
            Are you an employer looking to hire? We make it easy for you to post job listings
            and reach thousands of active job seekers. Simply register as an employer,
            post your job, and our admin team will review and publish it.
          </p>

          <h2>Contact Us</h2>
          <p>
            Have questions or suggestions? We'd love to hear from you.
            Visit our <Link to="/contact">Contact Us</Link> page
            to get in touch with our team.
          </p>
        </div>
      </div>
    </div>
  );
}

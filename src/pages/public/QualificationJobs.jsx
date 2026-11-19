import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import JobFeed from "../../components/JobFeed";
import QualificationTiles from "../../components/QualificationTiles";
import {
  getQualification,
  qualificationSlug,
} from "../../lib/qualifications";
import useSeo from "../../hooks/useSeo";

const COPY = {
  TENTH: {
    intro:
      "Helper, packing, delivery, housekeeping and factory openings for 10th pass candidates across Noida, Greater Noida, Gurugram and Delhi.",
    description:
      "Find 10th pass jobs in Delhi NCR — helper, packing, delivery, housekeeping and factory openings in Noida, Greater Noida, Gurugram and Delhi. Apply directly, no fees.",
  },
  TWELFTH: {
    intro:
      "Front office, sales, back office, data entry and customer support roles open to 12th pass candidates in Delhi NCR.",
    description:
      "Find 12th pass jobs in Delhi NCR — front office, sales, back office, data entry and customer support openings in Noida, Greater Noida, Gurugram and Delhi.",
  },
  ITI: {
    intro:
      "Electrician, fitter, welder, mechanic and technician openings for ITI certificate holders in Delhi NCR.",
    description:
      "Find ITI jobs in Delhi NCR — electrician, fitter, welder, mechanic and technician openings in Noida, Greater Noida, Gurugram and Delhi.",
  },
  DIPLOMA: {
    intro:
      "Technician, supervisor and junior engineer roles for polytechnic diploma holders across Delhi NCR.",
    description:
      "Find diploma jobs in Delhi NCR — technician, supervisor and junior engineer openings for polytechnic diploma holders in Noida, Greater Noida, Gurugram and Delhi.",
  },
  GRADUATE: {
    intro:
      "Executive, analyst, HR, finance and marketing roles for graduates across Delhi NCR.",
    description:
      "Find graduate jobs in Delhi NCR — executive, analyst, HR, finance and marketing openings for graduates in Noida, Greater Noida, Gurugram and Delhi.",
  },
  BTECH_MTECH: {
    intro:
      "Software, mechanical, civil and electronics engineering roles for B.Tech and M.Tech graduates in Delhi NCR.",
    description:
      "Find B.Tech and M.Tech jobs in Delhi NCR — software, mechanical, civil and electronics engineering openings in Noida, Greater Noida, Gurugram and Delhi.",
  },
};

/**
 * Static landing page for one qualification, e.g. /iti-jobs. Renders the same
 * feed as the homepage with a qualification-specific H1 and meta tags.
 */
export default function QualificationJobs({ qualification }) {
  const navigate = useNavigate();
  const meta = getQualification(qualification);
  const copy = COPY[qualification] || COPY.GRADUATE;

  useSeo({
    title: `${meta?.label || "Jobs"} in Delhi NCR | NCR Jobs`,
    description: copy.description,
    path: `/${meta?.slug || ""}`,
  });

  function handleTileSelect(value) {
    if (!value) {
      navigate("/");
      return;
    }

    const slug = qualificationSlug(value);
    if (slug) navigate(`/${slug}`);
  }

  const heading = meta ? `${meta.label} in Delhi NCR` : "Jobs in Delhi NCR";

  return (
    <div className="page-shell">
      <div className="container-page pb-8 pt-4 sm:pt-6">
        <Link to="/" className="link-arrow mb-3">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All jobs in Delhi NCR
        </Link>

        <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
          {heading}
        </h1>
        <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{copy.intro}</p>

        <section className="mt-4" aria-labelledby="browse-qualification">
          <h2 id="browse-qualification" className="mb-2 text-sm font-bold text-ink">
            Browse by Qualification
          </h2>
          <QualificationTiles
            active={qualification}
            onSelect={handleTileSelect}
          />
        </section>

        <JobFeed qualification={qualification} heading="Latest Jobs" />

        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card px-4 py-2.5 text-sm shadow-soft">
          <span className="text-muted">
            Not sure which qualification fits? Browse every opening.
          </span>
          <Link to="/jobs" className="link-arrow">
            All jobs
          </Link>
        </div>
      </div>
    </div>
  );
}

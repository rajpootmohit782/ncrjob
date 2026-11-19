import { useEffect } from "react";

const DEFAULT_TITLE = "NCR Jobs — Private-sector jobs in Delhi NCR";
const DEFAULT_DESCRIPTION =
  "Find private-sector jobs in Delhi NCR — Noida, Greater Noida, Gurugram and Delhi. Browse 10th pass, 12th pass, ITI, diploma, graduate and B.Tech jobs.";

// Canonical host for the live site. Change this if the domain changes.
const CANONICAL_ORIGIN = "https://vmwncrjob.in";

function upsertMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Client-side SEO for a single-page app: sets the document title, meta
 * description and canonical URL, then restores the defaults on unmount.
 *
 * @param {{ title?: string, description?: string, path?: string }} options
 */
export default function useSeo({ title, description, path } = {}) {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    upsertMeta("name", "description", description || DEFAULT_DESCRIPTION);

    if (path) {
      upsertCanonical(`${CANONICAL_ORIGIN}${path}`);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      upsertMeta("name", "description", DEFAULT_DESCRIPTION);
      const link = document.head.querySelector('link[rel="canonical"]');
      if (link) link.remove();
    };
  }, [title, description, path]);
}

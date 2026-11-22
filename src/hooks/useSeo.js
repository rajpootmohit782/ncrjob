import { useEffect } from "react";

const DEFAULT_TITLE = "NCR Jobs — Private-sector jobs in Delhi NCR";
const DEFAULT_DESCRIPTION =
  "Find private-sector jobs in Delhi NCR — Noida, Greater Noida, Gurugram and Delhi. Browse 10th pass, 12th pass, ITI, diploma, graduate and B.Tech jobs.";
const DEFAULT_IMAGE = "https://vmwncrjob.in/vmw-ncr-jobs-logo.png";

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

function upsertJsonLd(id, value) {
  let script = document.head.querySelector(`script[data-seo-id="${id}"]`);
  if (!value) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.seoId = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(value);
}

/**
 * Client-side SEO for a single-page app. Metadata is updated on route changes;
 * static route metadata is also declared in index.html for non-JS crawlers.
 *
 * @param {{ title?: string, description?: string, path?: string, robots?: string, structuredData?: object }} options
 */
export default function useSeo({ title, description, path, robots = "index,follow", structuredData } = {}) {
  useEffect(() => {
    const pageTitle = title || DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = `${CANONICAL_ORIGIN}${path || window.location.pathname}`;
    document.title = pageTitle;
    upsertMeta("name", "description", pageDescription);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "VMWjobs");
    upsertMeta("property", "og:title", pageTitle);
    upsertMeta("property", "og:description", pageDescription);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", DEFAULT_IMAGE);
    upsertMeta("name", "twitter:card", "summary");
    upsertMeta("name", "twitter:title", pageTitle);
    upsertMeta("name", "twitter:description", pageDescription);
    upsertMeta("name", "twitter:image", DEFAULT_IMAGE);
    upsertCanonical(canonicalUrl);
    upsertJsonLd("page", structuredData);

    return () => {
      upsertJsonLd("page", null);
    };
  }, [title, description, path, robots, structuredData]);
}

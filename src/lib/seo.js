const DOMAIN = "https://starlighthotels.in";
const DEFAULT_IMAGE = "https://starlighthotels.in/og-image.jpg";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";
const NOINDEX_ROBOTS = "noindex, nofollow";

function updateMetaTag(attrName, attrValue, content) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return el;
}

function removeMetaTag(attrName, attrValue) {
  const el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (el) {
    el.remove();
  }
}

export function clearPageJsonLd() {
  try {
    if (typeof document === "undefined") return;
    const el = document.getElementById("page-jsonld");
    if (el) {
      el.remove();
    }
  } catch {
    // Fail-safe
  }
}

export function setSeo({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  noindex = false,
  jsonLd = null,
} = {}) {
  try {
    if (typeof document === "undefined") return;

    // 1. Title
    if (title) {
      document.title = title;
    }

    // 2. Description
    if (description) {
      updateMetaTag("name", "description", description);
      updateMetaTag("property", "og:description", description);
      updateMetaTag("name", "twitter:description", description);
    }

    // 3. Robots
    const robotsContent = noindex ? NOINDEX_ROBOTS : DEFAULT_ROBOTS;
    updateMetaTag("name", "robots", robotsContent);

    // 4. Open Graph & Twitter Titles
    if (title) {
      updateMetaTag("property", "og:title", title);
      updateMetaTag("name", "twitter:title", title);
    }

    // 5. Open Graph Type
    updateMetaTag("property", "og:type", type || "website");

    // 6. Image
    const finalImage = image || DEFAULT_IMAGE;
    updateMetaTag("property", "og:image", finalImage);
    updateMetaTag("name", "twitter:image", finalImage);

    // 7. Canonical & og:url
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalPath && !noindex) {
      const cleanPath = canonicalPath.split("?")[0].split("#")[0];
      const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
      const fullCanonical = `${DOMAIN}${normalizedPath === "/" ? "/" : normalizedPath}`;

      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute("href", fullCanonical);
      updateMetaTag("property", "og:url", fullCanonical);
    } else {
      if (canonicalEl) {
        canonicalEl.remove();
      }
      removeMetaTag("property", "og:url");
    }

    // 8. Page-level JSON-LD
    if (jsonLd) {
      let script = document.getElementById("page-jsonld");
      if (!script) {
        script = document.createElement("script");
        script.id = "page-jsonld";
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent =
        typeof jsonLd === "string" ? jsonLd : JSON.stringify(jsonLd);
    } else {
      clearPageJsonLd();
    }
  } catch {
    // Fail-safe: never throw during render
  }
}

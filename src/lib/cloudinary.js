/**
 * Helper to generate optimized Cloudinary URLs with dynamic width, format auto, and quality auto.
 * Inserts `f_auto,q_auto,c_limit,w_{width}` after `/upload/`.
 * If not a Cloudinary URL or invalid, returns the original URL.
 */
export function cldUrl(url, width) {
  if (!url || typeof url !== "string") return url || "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Prevent double-transforming if already contains w_ or f_auto
  if (url.includes("/upload/f_auto") || url.includes("/upload/w_")) {
    return url;
  }
  const transform = width ? `f_auto,q_auto,c_limit,w_${width}` : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transform}/`);
}

/**
 * Helper to generate responsive `srcset` for Cloudinary images.
 */
export function cldSrcSet(url, widths = [400, 600, 900, 1200]) {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return undefined;
  }
  return widths.map((w) => `${cldUrl(url, w)} ${w}w`).join(", ");
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const sitemapPath = path.join(publicDir, "sitemap.xml");

const DOMAIN = "https://starlighthotels.in";

// 8 static canonical URLs (no trailing slash except root)
const STATIC_PAGES = [
  { loc: `${DOMAIN}/` },
  { loc: `${DOMAIN}/book-hotels` },
  { loc: `${DOMAIN}/about-us` },
  { loc: `${DOMAIN}/faqs` },
  { loc: `${DOMAIN}/contact` },
  { loc: `${DOMAIN}/partner-with-us` },
  { loc: `${DOMAIN}/terms` },
  { loc: `${DOMAIN}/privacy` },
];

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(dateValue) {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

function buildSitemapXml(urlEntries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of urlEntries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>\n");
  return lines.join("\n");
}

function writeSitemapFile(xmlContent) {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(sitemapPath, xmlContent, "utf8");
}

function handleFallback(reason) {
  if (fs.existsSync(sitemapPath)) {
    try {
      const existingContent = fs.readFileSync(sitemapPath, "utf8");
      const hotelMatches = existingContent.match(/\/hotel\//g);
      if (hotelMatches && hotelMatches.length > 0) {
        console.warn(
          `[generate-sitemap] Warning: ${reason} - keeping existing sitemap with ${hotelMatches.length} hotel URLs.`
        );
        return;
      }
    } catch {}
  }

  console.warn(
    `[generate-sitemap] Warning: ${reason}. Generating static-only sitemap.`
  );
  writeSitemapFile(buildSitemapXml(STATIC_PAGES));
}

function loadEnvironmentVariables() {
  // 1. Check existing process.env
  let url = process.env.VITE_SUPABASE_URL;
  let key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    return { url, key };
  }

  // 2. Try Node built-in loadEnvFile (Node >= 20.6)
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(path.join(projectRoot, ".env.local"));
    } catch {}
    try {
      process.loadEnvFile(path.join(projectRoot, ".env"));
    } catch {}
  }

  url = process.env.VITE_SUPABASE_URL;
  key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    return { url, key };
  }

  // 3. Manual fallback parser for .env files
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(projectRoot, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const k = trimmed.slice(0, eqIdx).trim();
            let v = trimmed.slice(eqIdx + 1).trim();
            if (
              (v.startsWith('"') && v.endsWith('"')) ||
              (v.startsWith("'") && v.endsWith("'"))
            ) {
              v = v.slice(1, -1);
            }
            if (!process.env[k]) {
              process.env[k] = v;
            }
          }
        }
      } catch {}
    }
  }

  url = process.env.VITE_SUPABASE_URL;
  key =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  return { url, key };
}

async function generateSitemap() {
  const urlEntries = [...STATIC_PAGES];

  try {
    const { url, key } = loadEnvironmentVariables();

    if (!url || !key) {
      handleFallback("Supabase environment variables not found");
      return;
    }

    let createClient;
    try {
      const supabaseModule = await import("@supabase/supabase-js");
      createClient = supabaseModule.createClient;
    } catch (importErr) {
      handleFallback(`Could not import @supabase/supabase-js (${importErr.message})`);
      return;
    }

    const client = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: hotels, error } = await client
      .from("hotels")
      .select("id, updated_at")
      .eq("is_active", true);

    if (error) {
      handleFallback(`Supabase query returned an error (${error.message})`);
      return;
    }

    if (!hotels || hotels.length === 0) {
      handleFallback("No active hotels returned from Supabase");
      return;
    }

    const seenUrls = new Set(urlEntries.map((e) => e.loc));

    for (const hotel of hotels) {
      if (!hotel?.id) continue;
      const hotelLoc = `${DOMAIN}/hotel/${encodeURIComponent(hotel.id)}`;
      if (seenUrls.has(hotelLoc)) continue;
      seenUrls.add(hotelLoc);

      const entry = { loc: hotelLoc };
      const formattedLastMod = formatDate(hotel.updated_at);
      if (formattedLastMod) {
        entry.lastmod = formattedLastMod;
      }
      urlEntries.push(entry);
    }

    writeSitemapFile(buildSitemapXml(urlEntries));
    console.log(
      `[generate-sitemap] Successfully generated sitemap with ${urlEntries.length} URLs (8 static + ${hotels.length} active hotel pages).`
    );
  } catch (err) {
    handleFallback(`Unexpected exception during sitemap generation (${err.message})`);
  }
}

generateSitemap()
  .then(() => process.exit(0))
  .catch((err) => {
    handleFallback(`Top-level failure (${err.message})`);
    process.exit(0);
  });

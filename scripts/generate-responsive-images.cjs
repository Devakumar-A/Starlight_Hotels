const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImages() {
  const baseDir = path.resolve(__dirname, '..');
  const heroDir = path.join(baseDir, 'src/assets/hero');
  const brandDir = path.join(baseDir, 'src/assets/brand');

  // 1. Process brand logos
  const logoPng = path.join(brandDir, 'starlight-logo.png');
  const faviconPng = path.join(brandDir, 'starlight-favicon.png');

  if (fs.existsSync(logoPng)) {
    await sharp(logoPng)
      .resize(90, 90, { fit: 'inside' })
      .webp({ quality: 85 })
      .toFile(path.join(brandDir, 'starlight-logo-90.webp'));
    console.log('Created starlight-logo-90.webp');
  }

  if (fs.existsSync(faviconPng)) {
    await sharp(faviconPng)
      .resize(90, 90, { fit: 'inside' })
      .webp({ quality: 85 })
      .toFile(path.join(brandDir, 'starlight-favicon-90.webp'));
    console.log('Created starlight-favicon-90.webp');
  }

  // Also make public versions for direct preload if needed
  const publicDir = path.join(baseDir, 'public');
  if (fs.existsSync(logoPng)) {
    await sharp(logoPng)
      .resize(90, 90, { fit: 'inside' })
      .webp({ quality: 85 })
      .toFile(path.join(publicDir, 'starlight-logo-90.webp'));
  }

  // 2. Process hero images and destination images:
  // Chennai_04 (hero first slide), Chennai_01, Pondicherry_01, kodaikanal_01, etc.
  const targets = [
    { dir: 'chennai', file: 'Chennai_04.webp' },
    { dir: 'chennai', file: 'Chennai_01.webp' },
    { dir: 'pondicherry', file: 'Pondicherry_01.webp' },
    { dir: 'pondicherry', file: 'Pondicherry_02.webp' },
    { dir: 'kodaikanal', file: 'kodaikanal_01.webp' },
    { dir: 'kodaikanal', file: 'kodaikanal_02.webp' },
  ];

  const widths = [480, 768, 1200];

  for (const t of targets) {
    const inputPath = path.join(heroDir, t.dir, t.file);
    if (!fs.existsSync(inputPath)) continue;

    const parsed = path.parse(t.file);

    for (const w of widths) {
      const outName = `${parsed.name}-${w}.webp`;
      const outPath = path.join(heroDir, t.dir, outName);
      await sharp(inputPath)
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(outPath);
      console.log(`Created ${t.dir}/${outName}`);
    }
  }

  // Also create public/hero/ for Chennai_04 preload
  const publicHeroDir = path.join(publicDir, 'hero');
  if (!fs.existsSync(publicHeroDir)) {
    fs.mkdirSync(publicHeroDir, { recursive: true });
  }

  const chennai04Path = path.join(heroDir, 'chennai', 'Chennai_04.webp');
  if (fs.existsSync(chennai04Path)) {
    await sharp(chennai04Path).resize(480).webp({ quality: 75 }).toFile(path.join(publicHeroDir, 'chennai_04-480w.webp'));
    await sharp(chennai04Path).resize(768).webp({ quality: 75 }).toFile(path.join(publicHeroDir, 'chennai_04-768w.webp'));
    await sharp(chennai04Path).resize(1200).webp({ quality: 75 }).toFile(path.join(publicHeroDir, 'chennai_04-1200w.webp'));
    await sharp(chennai04Path).resize(1672).webp({ quality: 75 }).toFile(path.join(publicHeroDir, 'chennai_04-1672w.webp'));
    console.log('Created public/hero/chennai_04 variants for HTML preload');
  }

  console.log('All image variants generated successfully!');
}

processImages().catch(err => {
  console.error(err);
  process.exit(1);
});

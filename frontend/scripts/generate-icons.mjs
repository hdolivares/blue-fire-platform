// Regenerates the app's raster icons from the BlueFire LogoMark.
//   node scripts/generate-icons.mjs
// Next 15 app-router auto-serves src/app/icon.png and apple-icon.png.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "app");

const mark = `
  <path fill="url(#g)" fill-rule="evenodd" clip-rule="evenodd"
    d="M24 3.6C24 3.6 9.6 19.7 9.6 30a14.4 14.4 0 1 0 28.8 0C38.4 19.7 24 3.6 24 3.6Zm0 13.6c3.3 3.5 6.4 7.6 6.4 11.6a6.4 6.4 0 1 1-12.8 0c0-2.4 1.2-4.7 2.8-6.7-.3 2 .4 3.6 1.9 4.6-.5-3.2.4-6.5 1.7-9.5Z"/>`;
const grad = `<linearGradient id="g" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#56d9ff"/><stop offset="0.62" stop-color="#19a8e6"/><stop offset="1" stop-color="#1467d2"/>
  </linearGradient>`;

// transparent icon
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs>${grad}</defs>${mark}</svg>`;
// apple icon: mark inset on a rounded navy tile
const apple = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs>${grad}</defs>
  <rect width="48" height="48" rx="11" fill="#071023"/>
  <g transform="translate(7.2 7.2) scale(0.7)">${mark}</g></svg>`;

await sharp(Buffer.from(icon)).resize(512, 512).png().toFile(join(appDir, "icon.png"));
await sharp(Buffer.from(apple)).resize(180, 180).png().toFile(join(appDir, "apple-icon.png"));
console.log("wrote icon.png (512) + apple-icon.png (180)");

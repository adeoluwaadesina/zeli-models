/**
 * Flood-fills from image edges through "light" pixels only, making the outer
 * white frame transparent while keeping white letters inside the brown circle
 * (they are not 4-connected to the edge).
 */
import sharp from "sharp";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public/branding/zm-favicon-source.png");
const iconOut = join(root, "src/app/icon.png");
const appleOut = join(root, "src/app/apple-icon.png");

function isFloodable(r, g, b) {
  const avg = (r + g + b) / 3;
  const mx = Math.max(r, g, b);
  // Outer white + light anti-alias; brown stays blocked (low max channel).
  return avg >= 185 && mx >= 188;
}

async function rgbaFromPng(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { buf: Buffer.from(data), w: info.width, h: info.height };
}

function floodTransparentEdge(buf, w, h) {
  const visited = new Uint8Array(w * h);
  const q = [];

  const idx = (x, y) => (y * w + x) * 4;
  const pushEdge = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = idx(x, y);
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    if (!isFloodable(r, g, b)) return;
    visited[p] = 1;
    q.push([x, y]);
  };

  for (let x = 0; x < w; x++) {
    pushEdge(x, 0);
    pushEdge(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushEdge(0, y);
    pushEdge(w - 1, y);
  }

  while (q.length) {
    const [x, y] = q.shift();
    const i = idx(x, y);
    buf[i + 3] = 0;

    const nbr = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1]
    ];
    for (const [nx, ny] of nbr) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const p = ny * w + nx;
      if (visited[p]) continue;
      const j = idx(nx, ny);
      const r = buf[j];
      const g = buf[j + 1];
      const b = buf[j + 2];
      if (isFloodable(r, g, b)) {
        visited[p] = 1;
        q.push([nx, ny]);
      }
    }
  }
}

const { buf, w, h } = await rgbaFromPng(inputPath);
floodTransparentEdge(buf, w, h);

const cleared = await sharp(buf, {
  raw: { width: w, height: h, channels: 4 }
})
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(cleared).resize(48, 48, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(iconOut);

await sharp(cleared).resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(appleOut);

console.log("Wrote", iconOut, "and", appleOut);

// Regenerates public/og-image.png from public/tlb_altered.svg.
//
// tlb_altered.svg is the canonical logo — every other mark on the site derives
// from it. Social platforms will not render an SVG as an og:image, so this bakes
// a 1200x630 PNG card (the size Facebook, LinkedIn, X and iMessage all render)
// with the logo centred on the brand charcoal.
//
// Run after any change to the logo:  npm run og
//
// sharp ships with Astro, so there is no extra dependency to install.

import sharp from 'sharp';
import { statSync } from 'node:fs';

const SRC = 'public/tlb_altered.svg';
const OUT = 'public/og-image.png';
const CARD = { width: 1200, height: 630 };
const BACKGROUND = '#1e1c1e';
// Leaves roughly a 15% margin on every side so the mark is not cropped by
// platforms that round the card's corners or letterbox it.
const LOGO_BOX = { width: 820, height: 430 };

const logo = await sharp(SRC, { density: 300 })
  .resize({ ...LOGO_BOX, fit: 'inside' })
  .png()
  .toBuffer();

await sharp({ create: { ...CARD, channels: 3, background: BACKGROUND } })
  .composite([{ input: logo, gravity: 'centre' }])
  .png({ compressionLevel: 9, palette: true })
  .toFile(OUT);

const { size } = statSync(OUT);
console.log(`${OUT} <- ${SRC}  (${CARD.width}x${CARD.height}, ${size.toLocaleString()} bytes)`);

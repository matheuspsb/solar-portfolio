// Converts source textures in assets-src/ to WebP in public/textures/ (full and small versions).
import sharp from 'sharp';

const SOURCE = 'assets-src/2k_sun.jpg';
const variants = [
  { file: 'public/textures/sun.webp', width: 2048, quality: 80 },
  { file: 'public/textures/sun-small.webp', width: 1024, quality: 78 },
];

for (const variant of variants) {
  const info = await sharp(SOURCE)
    .resize({ width: variant.width })
    .webp({ quality: variant.quality })
    .toFile(variant.file);
  console.log(variant.file, info.width, 'x', info.height, Math.round(info.size / 1024), 'KB');
}

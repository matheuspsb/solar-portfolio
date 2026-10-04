import sharp from 'sharp';

const textures = [
  {
    source: 'assets-src/2k_sun.jpg',
    variants: [
      { file: 'public/textures/sun.webp', width: 2048, quality: 80 },
      { file: 'public/textures/sun-small.webp', width: 1024, quality: 78 },
    ],
  },
  {
    source: 'assets-src/2k_mercury.jpg',
    variants: [
      { file: 'public/textures/mercury.webp', width: 1024, quality: 78 },
      { file: 'public/textures/mercury-small.webp', width: 512, quality: 76 },
    ],
  },
];

for (const { source, variants } of textures) {
  for (const variant of variants) {
    const info = await sharp(source)
      .resize({ width: variant.width })
      .webp({ quality: variant.quality })
      .toFile(variant.file);
    console.log(variant.file, info.width, 'x', info.height, Math.round(info.size / 1024), 'KB');
  }
}

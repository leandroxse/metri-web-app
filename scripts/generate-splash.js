const fs = require('fs');
const path = require('path');

// Configurações das splash screens
const splashSizes = [
  { name: 'apple-splash-1290-2796.jpg', width: 1290, height: 2796 }, // iPhone 15 Pro Max
  { name: 'apple-splash-1179-2556.jpg', width: 1179, height: 2556 }, // iPhone 15 Pro  
  { name: 'apple-splash-1170-2532.jpg', width: 1170, height: 2532 }, // iPhone 15
  { name: 'apple-splash-1242-2688.jpg', width: 1242, height: 2688 }, // iPhone 11 Pro Max
  { name: 'apple-splash-828-1792.jpg', width: 828, height: 1792 },   // iPhone 11
  { name: 'apple-splash-1242-2208.jpg', width: 1242, height: 2208 }, // iPhone 8 Plus
  { name: 'apple-splash-750-1334.jpg', width: 750, height: 1334 },   // iPhone 8
  { name: 'apple-splash-640-1136.jpg', width: 640, height: 1136 },   // iPhone SE
  { name: 'apple-splash-2048-2732.jpg', width: 2048, height: 2732 }, // iPad Pro 12.9"
  { name: 'apple-splash-1668-2388.jpg', width: 1668, height: 2388 }, // iPad Pro 11"
  { name: 'apple-splash-1668-2224.jpg', width: 1668, height: 2224 }, // iPad Pro 10.5"
  { name: 'apple-splash-1536-2048.jpg', width: 1536, height: 2048 }  // iPad
];

// Gerar SVG splash screen
function generateSplashSVG(width, height) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g transform="translate(${width/2}, ${height/2})">
    <circle r="80" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    <text x="0" y="10" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">METRI</text>
    <text x="0" y="40" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="16">Gestão de Eventos</text>
  </g>
</svg>`;
}

// Criar pasta splash se não existir
const splashDir = path.join(__dirname, '..', 'public', 'splash');
if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Gerar arquivos SVG funcionais
splashSizes.forEach(size => {
  const svgContent = generateSplashSVG(size.width, size.height);
  const svgPath = path.join(splashDir, size.name.replace('.jpg', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  
  // Copiar SVG como JPG para funcionar (navegadores aceitam SVG com extensão JPG)
  const jpgPath = path.join(splashDir, size.name);
  fs.writeFileSync(jpgPath, svgContent);
});

console.log('✅ Splash screens generated successfully!');
console.log('📝 Note: Replace the placeholder JPG files with actual images for production.');
console.log(`📂 Files created in: ${splashDir}`);
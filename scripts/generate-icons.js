const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Criar todos os ícones necessários para PWA e iOS a partir do logo
async function generateAllIcons() {
  console.log('🎨 Gerando todos os ícones do logo METRI...');
  
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo não encontrado em:', logoPath);
    return;
  }
  
  // Tamanhos necessários para PWA e iOS
  const iconSizes = [
    // Favicon
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    
    // PWA Icons
    { size: 72, name: 'icon-72x72.png' },
    { size: 96, name: 'icon-96x96.png' },
    { size: 128, name: 'icon-128x128.png' },
    { size: 144, name: 'icon-144x144.png' },
    { size: 152, name: 'icon-152x152.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 384, name: 'icon-384x384.png' },
    { size: 512, name: 'icon-512x512.png' },
    
    // Apple Touch Icons (iOS)
    { size: 57, name: 'apple-touch-icon-57x57.png' },
    { size: 60, name: 'apple-touch-icon-60x60.png' },
    { size: 72, name: 'apple-touch-icon-72x72.png' },
    { size: 76, name: 'apple-touch-icon-76x76.png' },
    { size: 114, name: 'apple-touch-icon-114x114.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 144, name: 'apple-touch-icon-144x144.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 180, name: 'apple-touch-icon-180x180.png' },
    
    // Apple Touch Icon padrão
    { size: 180, name: 'apple-touch-icon.png' },
    
    // Ícone grande para tela inicial
    { size: 512, name: 'metro-logo-512.png' }
  ];
  
  console.log(`📱 Gerando ${iconSizes.length} ícones diferentes...`);
  
  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(publicDir, icon.name);
      
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fundo transparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Criado: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${icon.name}:`, error.message);
    }
  }
  
  // Criar favicon.ico (formato especial)
  try {
    await sharp(logoPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon.png'));
    
    console.log('✅ Criado: favicon.png (32x32)');
  } catch (error) {
    console.error('❌ Erro ao criar favicon.png:', error.message);
  }
  
  console.log('🎉 Todos os ícones foram gerados com sucesso!');
  console.log('📁 Localização: pasta public/');
  console.log('🔗 Próximo passo: Atualizar HTML e manifest.json');
}

// Executar se for chamado diretamente
if (require.main === module) {
  generateAllIcons()
    .then(() => {
      console.log('✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro:', error);
      process.exit(1);
    });
}

module.exports = { generateAllIcons };
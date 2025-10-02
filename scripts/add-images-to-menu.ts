/**
 * Script para adicionar imagens aos itens do cardápio
 * Executar: npx tsx scripts/add-images-to-menu.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeamento de imagens Unsplash de alta qualidade para cada item
const imageMap: Record<string, string> = {
  // Bebidas: Sucos
  'Cupuaçu': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
  'Maracujá': 'https://images.unsplash.com/photo-1600788907416-456578634209?w=800&q=80',
  'Goiaba': 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=800&q=80',
  'Acerola': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
  'Abacaxi': 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80',
  'Taperebá': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',

  // Refrigerantes
  'Refrigerante Normal e Zero Açúcar': 'https://images.unsplash.com/photo-1622543925917-763c34f6f0ca?w=800&q=80',

  // Salgados Quentes
  'Unha de caranguejo': 'https://images.unsplash.com/photo-1559737558-2f5a2a1f7d7e?w=800&q=80',
  'Coxinha de frango': 'https://images.unsplash.com/photo-1618449840665-9ed506d73a34?w=800&q=80',
  'Risoli de camarão': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  'Empada de frango': 'https://images.unsplash.com/photo-1612392062798-2faee5e40fd9?w=800&q=80',
  'Barquete de camarão': 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&q=80',
  'Barquete de frango': 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&q=80',
  'Barquete de cupuaçu com castanha do Pará': 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=800&q=80',
  'Canudinho': 'https://images.unsplash.com/photo-1612392062798-2faee5e40fd9?w=800&q=80',
  'Pastel de carne': 'https://images.unsplash.com/photo-1612392062798-2faee5e40fd9?w=800&q=80',

  // Finger Food
  'Arroz a margarita': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&q=80',
  'Vatapá gourmet': 'https://images.unsplash.com/photo-1612392061787-2d078b3e573f?w=800&q=80',
  'Arroz de maniçoba': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'Arroz de pato': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'Camarão ao molho do chefe': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'Penne ao molho de bacon': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Arroz Paraense': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'Escondidinho de frango': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
  'Baião de dois com carne de sol': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'Arroz cremoso de calabresa': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'Filé cubo com arroz': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'Filé com arroz cremoso': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  'Fricassê de frango': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  'Arroz de bacalhau': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'Camarão sorteado com farofa': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'Caranguejo com farofa': 'https://images.unsplash.com/photo-1559737558-2f5a2a1f7d7e?w=800&q=80',
  'Escondidinho de carne seca': 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
  'Charque com Arroz cremoso': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',

  // Filé
  'Filé ao molho sugo com bacon': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&q=80',
  'Filé ao molho de vinho': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'Filé ao molho madeira com champignon': 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
  'Filé ao molho quatro queijos': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'Filé ao molho de mostarda': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&q=80',
  'Filé prime com queijo de búfalo e presunto de parma': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
  'Filé ao molho barbecue com mussarela': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&q=80',
  'Filé ao molho de ferrugem Gratinado com queijo Provolone': 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80',
  'Filé ao molho ferrugem com queijo Brie': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',

  // Camarão
  'Camarão Prime com molho gorgonzola': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Camarão ao molho quatro queijos': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'Camarão ao molho de ervas finas': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Camarão marguerita': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Camarão molho de queijo cuia': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'Camarão salteado com legumes': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  'Camarão imperial': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&q=80',
  'Bobó de camarão': 'https://images.unsplash.com/photo-1612392062798-2faee5e40fd9?w=800&q=80',

  // Massas
  'Talharim': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Penne': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Fettuccine': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Fusili': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Spaguet': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',

  // Molhos
  '04 queijos': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Sugo': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Branco': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Marguerita': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  'Gorgonzola': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',

  // Acompanhamentos
  'Arroz Branco': 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800&q=80',
  'Batata Palha': 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&q=80',
  'Farofa': 'https://images.unsplash.com/photo-1612392061787-2d078b3e573f?w=800&q=80',

  // Sobremesas
  'Torta delícia de chocolate': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta de morango com leite ninho': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
  'Torta de limão': 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
  'Torta de cupuaçu com queijo cuia': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta prestígio': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta de Nutella': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta Romeu e Julieta': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80',
  'Torta doce de leite': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta de Orion': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Torta de ferreiro Roche': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  'Delícia de Abacaxi': 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80',
  'Musse de cupuaçu com Castanha': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'Musse de abacaxi': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'Musse de limão': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'Musse de maracujá': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',

  // Saideira
  'Caldo de tucupi com jambu e camarão': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'Caldo de macaxeira com bacon': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  'Caldo de Feijão com bacon': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80'
}

async function addImagesToMenu() {
  console.log('🖼️  Adicionando imagens aos itens do cardápio...\n')

  // Buscar todos os itens do menu Prime
  const { data: items, error: fetchError } = await supabase
    .from('menu_items')
    .select('id, name, category_id')
    .order('id')

  if (fetchError) {
    console.error('❌ Erro ao buscar itens:', fetchError)
    return
  }

  if (!items || items.length === 0) {
    console.log('⚠️  Nenhum item encontrado')
    return
  }

  console.log(`📊 Encontrados ${items.length} itens`)

  let updated = 0
  let notFound = 0

  for (const item of items) {
    const imageUrl = imageMap[item.name]

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ image_url: imageUrl })
        .eq('id', item.id)

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${item.name}:`, updateError)
      } else {
        console.log(`✅ ${item.name}`)
        updated++
      }
    } else {
      console.log(`⚠️  Imagem não encontrada para: ${item.name}`)
      notFound++
    }
  }

  console.log(`\n🎉 Processo concluído!`)
  console.log(`   ✅ Atualizados: ${updated}`)
  console.log(`   ⚠️  Não encontrados: ${notFound}`)
}

addImagesToMenu().catch(console.error)

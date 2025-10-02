/**
 * Script para popular o cardápio PRIME baseado no PDF real
 * Executar: npx tsx scripts/seed-cardapio-prime.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedCardapioPrime() {
  console.log('🍽️ Criando Cardápio PRIME...')

  // 1. Criar Menu
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .insert({
      name: 'Cardápio PRIME',
      description: 'Cardápio sofisticado com pratos autorais',
      status: 'active'
    })
    .select()
    .single()

  if (menuError) {
    console.error('Erro ao criar menu:', menuError)
    return
  }

  console.log('✅ Menu criado:', menu.id)

  // 2. Criar Categorias
  const categories = [
    { name: 'Antepastos', recommended_count: 2, order_index: 0 },
    { name: 'Massas', recommended_count: 1, order_index: 1 },
    { name: 'Risoto', recommended_count: 1, order_index: 2 },
    { name: 'Carnes', recommended_count: 1, order_index: 3 },
    { name: 'Sobremesas', recommended_count: 1, order_index: 4 }
  ]

  const categoryMap: Record<string, string> = {}

  for (const cat of categories) {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        menu_id: menu.id,
        ...cat
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar categoria:', error)
      continue
    }

    categoryMap[cat.name] = data.id
    console.log(`✅ Categoria criada: ${cat.name}`)
  }

  // 3. Criar Itens (baseado no PDF)
  const items = [
    // ANTEPASTOS
    {
      category: 'Antepastos',
      name: 'Burrata com Tomate Confit',
      description: 'Burrata cremosa servida com tomates confitados, rúcula fresca e redução de balsâmico'
    },
    {
      category: 'Antepastos',
      name: 'Carpaccio de Salmão',
      description: 'Fatias finas de salmão fresco com alcaparras, cebola roxa e molho de mostarda Dijon'
    },
    {
      category: 'Antepastos',
      name: 'Tábua de Frios Premium',
      description: 'Seleção de queijos nobres, embutidos artesanais, geleias e torradas'
    },

    // MASSAS
    {
      category: 'Massas',
      name: 'Fettuccine ao Funghi Porcini',
      description: 'Massa fresca com cogumelos porcini, creme de leite, parmesão e trufa negra'
    },
    {
      category: 'Massas',
      name: 'Ravioli de Cordeiro',
      description: 'Ravioli recheado com cordeiro desfiado ao molho de tomate artesanal'
    },
    {
      category: 'Massas',
      name: 'Linguine ao Frutos do Mar',
      description: 'Linguine com camarões, lulas e mariscos ao molho branco'
    },

    // RISOTO
    {
      category: 'Risoto',
      name: 'Risoto de Limão Siciliano',
      description: 'Arroz arbóreo cremoso com raspas de limão siciliano e queijo parmesão'
    },
    {
      category: 'Risoto',
      name: 'Risoto de Cogumelos',
      description: 'Cogumelos variados, tomilho fresco e vinho branco'
    },

    // CARNES
    {
      category: 'Carnes',
      name: 'Filé Mignon ao Molho Madeira',
      description: 'Filé mignon grelhado com molho madeira, batatas rústicas e legumes salteados'
    },
    {
      category: 'Carnes',
      name: 'Cordeiro ao Alecrim',
      description: 'Carré de cordeiro com crosta de ervas, purê de batata trufado'
    },
    {
      category: 'Carnes',
      name: 'Frango Orgânico Recheado',
      description: 'Supremo de frango com recheio de espinafre e queijo brie'
    },

    // SOBREMESAS
    {
      category: 'Sobremesas',
      name: 'Tiramisù Clássico',
      description: 'Camadas de biscoito champanhe embebido em café, creme mascarpone e cacau'
    },
    {
      category: 'Sobremesas',
      name: 'Petit Gâteau',
      description: 'Bolinho quente de chocolate com sorvete de baunilha e calda de frutas vermelhas'
    },
    {
      category: 'Sobremesas',
      name: 'Cheesecake de Frutas Vermelhas',
      description: 'Torta cremosa de cream cheese com compota de frutas vermelhas'
    }
  ]

  for (const item of items) {
    const { error } = await supabase
      .from('menu_items')
      .insert({
        category_id: categoryMap[item.category],
        name: item.name,
        description: item.description,
        order_index: items.indexOf(item)
      })

    if (error) {
      console.error(`Erro ao criar item ${item.name}:`, error)
      continue
    }

    console.log(`✅ Item criado: ${item.name}`)
  }

  console.log('\n🎉 Cardápio PRIME criado com sucesso!')
  console.log(`📋 Menu ID: ${menu.id}`)
}

seedCardapioPrime().catch(console.error)

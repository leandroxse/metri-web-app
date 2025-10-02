/**
 * Script para popular o Cardápio PRIME COMPLETO baseado no PDF oficial
 * Executar: npx tsx scripts/seed-cardapio-prime-completo.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrgaiiuoljgjasyrqjzk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZ2FpaXVvbGpnamFzeXJxanprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY1ODY3OSwiZXhwIjoyMDcxMjM0Njc5fQ.mf5tJtki9Hrn_GdjyB_XC0SVv7Pzr9i2UAOK5R8v95s'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedCardapioPrimeCompleto() {
  console.log('🍽️ Criando Cardápio PRIME Completo...')

  // 1. Criar Menu
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .insert({
      name: 'Cardápio Prime Buffet',
      description: 'Cardápio completo Prime Buffet e Serviços - A partir de 50 pessoas',
      status: 'active'
    })
    .select()
    .single()

  if (menuError) {
    console.error('Erro ao criar menu:', menuError)
    return
  }

  console.log('✅ Menu criado:', menu.id)

  // 2. Definir Categorias com itens
  const categorias = [
    {
      nome: 'Bebidas: Sucos',
      recomendado: 2,
      itens: [
        'Cupuaçu',
        'Maracujá',
        'Goiaba',
        'Acerola',
        'Abacaxi',
        'Taperebá'
      ]
    },
    {
      nome: 'Bebidas: Refrigerantes',
      recomendado: 1,
      itens: [
        'Refrigerante Normal e Zero Açúcar'
      ]
    },
    {
      nome: 'Salgados Quentes',
      recomendado: 5,
      itens: [
        'Unha de caranguejo',
        'Coxinha de frango',
        'Risoli de camarão',
        'Empada de frango',
        'Barquete de camarão',
        'Barquete de frango',
        'Barquete de cupuaçu com castanha do Pará',
        'Canudinho',
        'Pastel de carne'
      ]
    },
    {
      nome: 'Finger Food',
      recomendado: 2,
      itens: [
        'Arroz a margarita',
        'Vatapá gourmet',
        'Arroz de maniçoba',
        'Arroz de pato',
        'Camarão ao molho do chefe',
        'Penne ao molho de bacon',
        'Arroz Paraense',
        'Escondidinho de frango',
        'Baião de dois com carne de sol',
        'Arroz cremoso de calabresa',
        'Filé cubo com arroz',
        'Filé com arroz cremoso',
        'Fricassê de frango',
        'Arroz de bacalhau',
        'Camarão sorteado com farofa',
        'Caranguejo com farofa',
        'Escondidinho de carne seca',
        'Charque com Arroz cremoso'
      ]
    },
    {
      nome: 'Pratos Prime - Filé',
      recomendado: 1,
      itens: [
        'Filé ao molho sugo com bacon',
        'Filé ao molho de vinho',
        'Filé ao molho madeira com champignon',
        'Filé ao molho quatro queijos',
        'Filé ao molho de mostarda',
        'Filé prime com queijo de búfalo e presunto de parma',
        'Filé ao molho barbecue com mussarela',
        'Filé ao molho de ferrugem Gratinado com queijo Provolone',
        'Filé ao molho ferrugem com queijo Brie'
      ]
    },
    {
      nome: 'Pratos Prime - Camarão',
      recomendado: 1,
      itens: [
        'Camarão Prime com molho gorgonzola',
        'Camarão ao molho quatro queijos',
        'Camarão ao molho de ervas finas',
        'Camarão marguerita',
        'Camarão molho de queijo cuia',
        'Camarão salteado com legumes',
        'Camarão imperial',
        'Bobó de camarão'
      ]
    },
    {
      nome: 'Massas',
      recomendado: 1,
      itens: [
        'Talharim',
        'Penne',
        'Fettuccine',
        'Fusili',
        'Spaguet'
      ]
    },
    {
      nome: 'Molhos para Massa',
      recomendado: 1,
      itens: [
        '04 queijos',
        'Sugo',
        'Branco',
        'Marguerita',
        'Gorgonzola'
      ]
    },
    {
      nome: 'Acompanhamentos',
      recomendado: 3,
      itens: [
        'Arroz Branco',
        'Batata Palha',
        'Farofa'
      ]
    },
    {
      nome: 'Sobremesas',
      recomendado: 2,
      itens: [
        'Torta delícia de chocolate',
        'Torta de morango com leite ninho',
        'Torta de limão',
        'Torta de cupuaçu com queijo cuia',
        'Torta prestígio',
        'Torta de Nutella',
        'Torta Romeu e Julieta',
        'Torta doce de leite',
        'Torta de Orion',
        'Torta de ferreiro Roche',
        'Delícia de Abacaxi',
        'Musse de cupuaçu com Castanha',
        'Musse de abacaxi',
        'Musse de limão',
        'Musse de maracujá'
      ]
    },
    {
      nome: 'Saideira Prime (custo adicional)',
      recomendado: 1,
      itens: [
        'Caldo de tucupi com jambu e camarão',
        'Caldo de macaxeira com bacon',
        'Caldo de Feijão com bacon'
      ]
    }
  ]

  // 3. Criar categorias e itens
  for (let catIndex = 0; catIndex < categorias.length; catIndex++) {
    const cat = categorias[catIndex]

    console.log(`📋 Criando categoria: ${cat.nome}`)

    const { data: categoria, error: catError } = await supabase
      .from('menu_categories')
      .insert({
        menu_id: menu.id,
        name: cat.nome,
        recommended_count: cat.recomendado,
        order_index: catIndex
      })
      .select()
      .single()

    if (catError) {
      console.error(`Erro ao criar categoria ${cat.nome}:`, catError)
      continue
    }

    console.log(`  ✅ ${cat.nome} criada`)

    // Criar itens da categoria
    for (let itemIndex = 0; itemIndex < cat.itens.length; itemIndex++) {
      const itemNome = cat.itens[itemIndex]

      const { error: itemError } = await supabase
        .from('menu_items')
        .insert({
          category_id: categoria.id,
          name: itemNome,
          description: null,
          order_index: itemIndex
        })

      if (itemError) {
        console.error(`  ❌ Erro ao criar item ${itemNome}:`, itemError)
      } else {
        console.log(`    • ${itemNome}`)
      }
    }
  }

  console.log('\n🎉 Cardápio PRIME Completo criado com sucesso!')
  console.log(`📋 Menu ID: ${menu.id}`)
  console.log(`📊 Resumo:`)
  console.log(`   - ${categorias.length} categorias`)
  console.log(`   - ${categorias.reduce((sum, cat) => sum + cat.itens.length, 0)} itens no total`)
}

seedCardapioPrimeCompleto().catch(console.error)

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedCardapioPrime002() {
  console.log('🍽️ Iniciando seed do Cardápio Prime 002...')

  // 1. Criar o Menu
  const { data: menu, error: menuError } = await supabase
    .from('menus')
    .insert({
      name: 'Cardápio Prime 002',
      description: 'Cardápio completo para eventos especiais',
      status: 'active'
    })
    .select()
    .single()

  if (menuError) {
    console.error('❌ Erro ao criar menu:', menuError)
    return
  }

  console.log('✅ Menu criado:', menu.name)

  // 2. Criar Categorias e Itens baseado no PDF

  // ENTRADAS FRIAS
  const { data: entradasFrias } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Entradas Frias',
      recommended_count: 5,
      order_index: 0
    })
    .select()
    .single()

  const entradasFriasItems = [
    { name: 'Salada Caesar', description: 'Alface, croutons, parmesão e molho caesar' },
    { name: 'Carpaccio de Salmão', description: 'Salmão fresco em fatias finas com alcaparras' },
    { name: 'Tábua de Frios', description: 'Seleção de queijos e embutidos nobres' },
    { name: 'Camarão ao Alho e Óleo', description: 'Camarões frescos salteados' },
    { name: 'Bruschetta Italiana', description: 'Pão italiano com tomate, manjericão e azeite' },
    { name: 'Ceviche de Peixe', description: 'Peixe branco marinado em limão' },
    { name: 'Caprese', description: 'Tomate, muçarela de búfala e manjericão' }
  ]

  for (const [index, item] of entradasFriasItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: entradasFrias.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Entradas Frias criadas')

  // ENTRADAS QUENTES
  const { data: entradasQuentes } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Entradas Quentes',
      recommended_count: 5,
      order_index: 1
    })
    .select()
    .single()

  const entradasQuentesItems = [
    { name: 'Risoto de Funghi', description: 'Risoto cremoso com cogumelos variados' },
    { name: 'Bolinho de Bacalhau', description: 'Bolinhos crocantes de bacalhau desfiado' },
    { name: 'Pastéis Variados', description: 'Seleção de pastéis gourmet' },
    { name: 'Coxinha de Frango Catupiry', description: 'Coxinhas recheadas com catupiry' },
    { name: 'Mini Quiches', description: 'Quiches variadas em versão mini' },
    { name: 'Risoto de Camarão', description: 'Risoto com camarões frescos' },
    { name: 'Caldinho de Feijão', description: 'Caldinho tradicional com bacon' }
  ]

  for (const [index, item] of entradasQuentesItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: entradasQuentes.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Entradas Quentes criadas')

  // PRATOS PRINCIPAIS - CARNES
  const { data: carnes } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Pratos Principais - Carnes',
      recommended_count: 4,
      order_index: 2
    })
    .select()
    .single()

  const carnesItems = [
    { name: 'Picanha na Brasa', description: 'Picanha grelhada ao ponto' },
    { name: 'Costela BBQ', description: 'Costela bovina defumada com molho barbecue' },
    { name: 'Filé Mignon ao Molho Madeira', description: 'Filé mignon com molho de vinho madeira' },
    { name: 'Frango Grelhado', description: 'Peito de frango temperado e grelhado' },
    { name: 'Lombo Suíno Assado', description: 'Lombo de porco assado com especiarias' },
    { name: 'Medalhão de Filé com Bacon', description: 'Medalhão envolto em bacon' },
    { name: 'Coxa e Sobrecoxa Assada', description: 'Peças assadas e douradas' }
  ]

  for (const [index, item] of carnesItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: carnes.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Carnes criadas')

  // PRATOS PRINCIPAIS - PEIXES
  const { data: peixes } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Pratos Principais - Peixes',
      recommended_count: 2,
      order_index: 3
    })
    .select()
    .single()

  const peixesItems = [
    { name: 'Salmão Grelhado', description: 'Salmão grelhado com ervas finas' },
    { name: 'Tilápia ao Molho de Maracujá', description: 'Tilápia com molho tropical' },
    { name: 'Bacalhau à Portuguesa', description: 'Bacalhau com batatas e azeitonas' },
    { name: 'Pescada Amarela Grelhada', description: 'Pescada temperada e grelhada' },
    { name: 'Robalo ao Forno', description: 'Robalo inteiro assado' }
  ]

  for (const [index, item] of peixesItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: peixes.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Peixes criados')

  // ACOMPANHAMENTOS
  const { data: acompanhamentos } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Acompanhamentos',
      recommended_count: 5,
      order_index: 4
    })
    .select()
    .single()

  const acompanhamentosItems = [
    { name: 'Arroz Branco', description: 'Arroz soltinho tradicional' },
    { name: 'Arroz à Grega', description: 'Arroz com legumes coloridos' },
    { name: 'Farofa Completa', description: 'Farofa com bacon, ovos e linguiça' },
    { name: 'Purê de Batatas', description: 'Purê cremoso de batatas' },
    { name: 'Batata Rústica', description: 'Batatas assadas em cubos' },
    { name: 'Legumes ao Vapor', description: 'Mix de legumes frescos' },
    { name: 'Batata Frita', description: 'Batatas fritas crocantes' },
    { name: 'Mandioca Frita', description: 'Mandioca crocante' },
    { name: 'Polenta Cremosa', description: 'Polenta macia e cremosa' }
  ]

  for (const [index, item] of acompanhamentosItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: acompanhamentos.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Acompanhamentos criados')

  // SALADAS
  const { data: saladas } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Saladas',
      recommended_count: 3,
      order_index: 5
    })
    .select()
    .single()

  const saladasItems = [
    { name: 'Salada Verde', description: 'Mix de folhas frescas' },
    { name: 'Salada de Tomate', description: 'Tomates frescos temperados' },
    { name: 'Salada Caesar', description: 'Alface romana com molho caesar' },
    { name: 'Salada Tropical', description: 'Mix de frutas e folhas' },
    { name: 'Salada de Grão de Bico', description: 'Grão de bico com temperos' },
    { name: 'Coleslaw', description: 'Salada de repolho cremosa' }
  ]

  for (const [index, item] of saladasItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: saladas.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Saladas criadas')

  // SOBREMESAS
  const { data: sobremesas } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Sobremesas',
      recommended_count: 4,
      order_index: 6
    })
    .select()
    .single()

  const sobremesasItems = [
    { name: 'Pudim de Leite', description: 'Pudim cremoso com calda de caramelo' },
    { name: 'Mousse de Chocolate', description: 'Mousse aerado de chocolate belga' },
    { name: 'Torta de Limão', description: 'Torta com creme de limão e merengue' },
    { name: 'Brigadeiro Gourmet', description: 'Brigadeiros premium variados' },
    { name: 'Petit Gateau', description: 'Bolinho de chocolate com sorvete' },
    { name: 'Pavê de Chocolate', description: 'Pavê tradicional de chocolate' },
    { name: 'Frutas da Estação', description: 'Seleção de frutas frescas' },
    { name: 'Cheesecake', description: 'Torta de queijo com calda de frutas vermelhas' }
  ]

  for (const [index, item] of sobremesasItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: sobremesas.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Sobremesas criadas')

  // BEBIDAS
  const { data: bebidas } = await supabase
    .from('menu_categories')
    .insert({
      menu_id: menu.id,
      name: 'Bebidas',
      recommended_count: 3,
      order_index: 7
    })
    .select()
    .single()

  const bebidasItems = [
    { name: 'Refrigerantes Variados', description: 'Coca-Cola, Guaraná, Fanta' },
    { name: 'Suco Natural', description: 'Sucos de frutas frescas' },
    { name: 'Água Mineral', description: 'Água com e sem gás' },
    { name: 'Cerveja', description: 'Cervejas nacionais geladas' },
    { name: 'Vinho Tinto', description: 'Seleção de vinhos tintos' },
    { name: 'Vinho Branco', description: 'Seleção de vinhos brancos' },
    { name: 'Caipirinha', description: 'Caipirinha tradicional ou de frutas' },
    { name: 'Café e Chá', description: 'Café expresso e chás variados' }
  ]

  for (const [index, item] of bebidasItems.entries()) {
    await supabase.from('menu_items').insert({
      category_id: bebidas.id,
      name: item.name,
      description: item.description,
      order_index: index
    })
  }

  console.log('✅ Bebidas criadas')

  console.log('\n🎉 Cardápio Prime 002 inserido com sucesso!')
  console.log('📊 Resumo:')
  console.log('  - 8 categorias')
  console.log('  - 56 itens no total')
}

seedCardapioPrime002()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erro:', error)
    process.exit(1)
  })

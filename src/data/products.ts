import { productImagePath } from '../lib/imagePaths'

export type CutType = {
  id: string
  name: string
  desc: string
}

export type ProductCategory = 'bovino' | 'aves' | 'suino' | 'linguicas' | 'peixe' | 'frios' | 'especial'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bovino: 'Bovino',
  aves: 'Aves',
  suino: 'Suíno',
  linguicas: 'Linguiças',
  peixe: 'Peixe',
  frios: 'Frios',
  especial: 'Especial',
}

export type Product = {
  id: string
  name: string
  category: ProductCategory
  description: string
  pricePerKg: number
  imageUrl: string
  badge?: string
  rating: number
  reviews: number
  cutTypes: CutType[]
  tags: string[]
}

const DEFAULT_CUT_TYPES: CutType[] = [
  { id: 'inteiro', name: 'Peça Inteira', desc: 'Como sai da peça' },
  { id: 'bife_alto', name: 'Bife Alto', desc: '2–3 cm espessura' },
  { id: 'bife_fino', name: 'Bife Fino', desc: '0,5–1 cm espessura' },
  { id: 'iscas', name: 'Iscas / Tiras', desc: 'Para chapa ou wok' },
]

const FRIO_CUT_TYPES: CutType[] = [
  { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' },
  { id: 'granel', name: 'A granel', desc: 'Peso exato' },
  { id: 'pedaco', name: 'Pedaço', desc: 'Peça inteira ou bloco' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'picanha-angus',
    name: 'Picanha Angus',
    category: 'bovino',
    description: 'Peça inteira de Picanha Angus certificada, maturada a seco por 21 dias para máxima maciez e sabor concentrado. Capa de gordura intacta para churrasco perfeito.',
    pricePerKg: 89.9,
    imageUrl: productImagePath('bovinos', 'picanha-angus.jpg'),
    badge: 'Premium',
    rating: 4.9,
    reviews: 142,
    cutTypes: DEFAULT_CUT_TYPES,
    tags: ['🌿 Natural', '⏱ 21 dias seco', '🐄 Angus', '🥇 Certificado'],
  },
  {
    id: 'file-mignon',
    name: 'Filé Mignon',
    category: 'bovino',
    description: 'O corte mais macio. Ideal para medalhões e bifes altos.',
    pricePerKg: 119.9,
    imageUrl: productImagePath('bovinos', 'file-mignon.jpg'),
    badge: 'Nobre',
    rating: 4.9,
    reviews: 98,
    cutTypes: DEFAULT_CUT_TYPES,
    tags: ['🥩 Nobre', '🍽️ Alta gastronomia'],
  },
  {
    id: 'costela-bovina',
    name: 'Costela Bovina',
    category: 'bovino',
    description: 'Ripa ou janela. Peça especial para assados longos na brasa.',
    pricePerKg: 42.9,
    imageUrl: productImagePath('bovinos', 'costela-bovina.jpg'),
    rating: 4.4,
    reviews: 67,
    cutTypes: [
      { id: 'ripa', name: 'Ripa', desc: 'Costela em tira longa' },
      { id: 'janela', name: 'Janela', desc: 'Peça quadrada' },
      { id: 'individual', name: 'Individual', desc: 'Ossos separados' },
    ],
    tags: ['🔥 Brasa', '⏱ Assado longo'],
  },
  {
    id: 'contrafile',
    name: 'Contrafilé',
    category: 'bovino',
    description: 'Versátil. Bife alto, churrasqueira ou frigideira. Ótimo marmoreio.',
    pricePerKg: 54.9,
    imageUrl: productImagePath('bovinos', 'contrafile.jpg'),
    badge: 'Popular',
    rating: 4.3,
    reviews: 201,
    cutTypes: DEFAULT_CUT_TYPES,
    tags: ['🔥 Versátil', '🐄 Bovino'],
  },
  {
    id: 'alcatra',
    name: 'Alcatra',
    category: 'bovino',
    description: 'Corte clássico e equilibrado. Baixa gordura, textura firme.',
    pricePerKg: 48.9,
    imageUrl: productImagePath('bovinos', 'alcatra.jpg'),
    rating: 4.4,
    reviews: 88,
    cutTypes: DEFAULT_CUT_TYPES,
    tags: ['🥩 Clássico', '💪 Proteína'],
  },
  {
    id: 'frango-inteiro',
    name: 'Frango Inteiro',
    category: 'aves',
    description: 'Frango inteiro. Corte na hora no balcão.',
    pricePerKg: 18.9,
    imageUrl: productImagePath('aves', 'frango-inteiro.jpg'),
    badge: 'Granja',
    rating: 4.9,
    reviews: 310,
    cutTypes: [
      { id: 'inteiro', name: 'Inteiro', desc: 'Frango completo' },
      { id: 'metade', name: 'Metade', desc: 'Dividido ao meio' },
      { id: 'ao_molho', name: 'A passarinho', desc: 'Pedaços pequenos' },
    ],
    tags: ['🐔 Granja'],
  },
  {
    id: 'sobrecoxa',
    name: 'Sobrecoxa sem Osso',
    category: 'aves',
    description: 'Sobrecoxa desossada na hora.',
    pricePerKg: 22.9,
    imageUrl: productImagePath('aves', 'sobrecoxa.jpg'),
    rating: 4.4,
    reviews: 74,
    cutTypes: [
      { id: 'sem_osso', name: 'Sem osso', desc: 'Desossada na hora' },
      { id: 'com_osso', name: 'Com osso', desc: 'Peça inteira' },
    ],
    tags: ['🐔 Frango'],
  },
  {
    id: 'peito-frango',
    name: 'Peito de Frango',
    category: 'aves',
    description: 'Peito sem osso e sem pele.',
    pricePerKg: 24.9,
    imageUrl: productImagePath('aves', 'peito-de-frango.jpg'),
    badge: 'Leve',
    rating: 4.9,
    reviews: 186,
    cutTypes: [
      { id: 'inteiro', name: 'Inteiro', desc: 'Peito completo' },
      { id: 'file', name: 'Filé', desc: 'Borboleta aberto' },
      { id: 'cubo', name: 'Cubos', desc: 'Para espetinho' },
    ],
    tags: ['🐔 Leve', '💪 Proteína'],
  },
  {
    id: 'asa-frango',
    name: 'Asa de Frango',
    category: 'aves',
    description: 'Asas — tempero da casa opcional.',
    pricePerKg: 16.9,
    imageUrl: productImagePath('aves', 'azinha.jpg'),
    rating: 4.9,
    reviews: 203,
    cutTypes: [
      { id: 'inteiro', name: 'Inteira', desc: 'Asa completa' },
      { id: 'tulipa', name: 'Tulipa', desc: 'Ponta cortada' },
    ],
    tags: ['🐔 Frango', '🔥 Brasa'],
  },
  {
    id: 'tulipa-frango',
    name: 'Tulipa de Frango',
    category: 'aves',
    description: 'Asa cortada em tulipa — carne exposta, fácil de segurar. Ideal para churrasco e festas.',
    pricePerKg: 19.9,
    imageUrl: productImagePath('aves', 'tulipa.jpg'),
    badge: 'Festa',
    rating: 4.7,
    reviews: 118,
    cutTypes: [
      { id: 'tulipa', name: 'Tulipa', desc: 'Corte padrão' },
    ],
    tags: ['🐔 Frango', '🔥 Churrasco'],
  },
  {
    id: 'coracao-frango',
    name: 'Coração de Frango',
    category: 'aves',
    description: 'Coração limpo e fresco. Clássico de churrasco, espetinho ou frigideira.',
    pricePerKg: 14.9,
    imageUrl: productImagePath('aves', 'coracao.jpg'),
    badge: 'Espetinho',
    rating: 4.6,
    reviews: 91,
    cutTypes: [
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
      { id: 'espeto', name: 'No espeto', desc: 'Montado na hora' },
    ],
    tags: ['🐔 Frango', '🔥 Espetinho'],
  },
  {
    id: 'costelinha-suina',
    name: 'Costelinha Suína',
    category: 'suino',
    description: 'Ribs estilo americano. Corte em rack ou individual.',
    pricePerKg: 34.9,
    imageUrl: productImagePath('suinos', 'costelinha.jpg'),
    badge: 'Defumada',
    rating: 4.9,
    reviews: 156,
    cutTypes: [
      { id: 'rack', name: 'Rack', desc: 'Peça inteira' },
      { id: 'individual', name: 'Individual', desc: 'Ossos separados' },
    ],
    tags: ['🐷 Suíno', '🔥 Defumada'],
  },
  {
    id: 'panceta',
    name: 'Panceta',
    category: 'suino',
    description: 'Panceta suína fresca. Fatias ou peça inteira na hora.',
    pricePerKg: 32.9,
    imageUrl: productImagePath('suinos', 'panceta.jpg'),
    badge: 'Fresca',
    rating: 4.8,
    reviews: 124,
    cutTypes: [
      { id: 'inteiro', name: 'Peça inteira', desc: 'Como sai da peça' },
      { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' },
      { id: 'cubo', name: 'Cubos', desc: 'Para refogado' },
    ],
    tags: ['🐷 Suíno', '🔥 Brasa'],
  },
  {
    id: 'bacon-suino',
    name: 'Bacon',
    category: 'suino',
    description: 'Bacon suíno em fatias. Ideal para café da manhã e churrasco.',
    pricePerKg: 38.9,
    imageUrl: productImagePath('suinos', 'bacon.jpg'),
    rating: 4.7,
    reviews: 98,
    cutTypes: [
      { id: 'fatia', name: 'Fatias', desc: 'Espessura na hora' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🐷 Suíno', '🔥 Churrasco'],
  },
  {
    id: 'torresmo',
    name: 'Torresmo',
    category: 'suino',
    description: 'Torresmo de barriga em cubos. Crocante na hora ou para fritar em casa.',
    pricePerKg: 24.9,
    imageUrl: productImagePath('suinos', 'torresmo.jpg'),
    rating: 4.6,
    reviews: 87,
    cutTypes: [
      { id: 'cubo', name: 'Cubos', desc: 'Pedaços prontos' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🐷 Suíno', '✨ Crocante'],
  },
  {
    id: 'linguica-aurora',
    name: 'Linguiça Aurora',
    category: 'linguicas',
    description: 'Linguiça toscana Aurora. Seleção do açougue para churrasco e grelha.',
    pricePerKg: 27.9,
    imageUrl: productImagePath('linguicas', 'aurora.jpg'),
    badge: 'Toscana',
    rating: 4.8,
    reviews: 214,
    cutTypes: [
      { id: 'gomo', name: 'Gomo', desc: 'Porções individuais' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🌭 Linguiça', '🔥 Churrasco'],
  },
  {
    id: 'linguica-perdigao',
    name: 'Linguiça Perdigão',
    category: 'linguicas',
    description: 'Linguiça calabresa Perdigão. Sabor marcante na brasa.',
    pricePerKg: 26.9,
    imageUrl: productImagePath('linguicas', 'perdigao.jpg'),
    badge: 'Calabresa',
    rating: 4.7,
    reviews: 178,
    cutTypes: [
      { id: 'gomo', name: 'Gomo', desc: 'Porções individuais' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🌭 Linguiça', '🔥 Brasa'],
  },
  {
    id: 'linguica-sadia',
    name: 'Linguiça Sadia',
    category: 'linguicas',
    description: 'Linguiça Sadia, qualidade de mercado com frescor do balcão.',
    pricePerKg: 25.9,
    imageUrl: productImagePath('linguicas', 'sadia.jpg'),
    rating: 4.6,
    reviews: 142,
    cutTypes: [
      { id: 'gomo', name: 'Gomo', desc: 'Porções individuais' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🌭 Linguiça', '🏠 Família'],
  },
  {
    id: 'salmao-posta',
    name: 'Salmão em Posta',
    category: 'peixe',
    description: 'Atlântico fresco. Cortado na espessura que você quiser.',
    pricePerKg: 79.9,
    imageUrl: productImagePath('peixes', 'salmao-posta.jpg'),
    badge: 'Noruega',
    rating: 4.9,
    reviews: 124,
    cutTypes: [
      { id: 'posta', name: 'Posta', desc: '3–4 cm espessura' },
      { id: 'file', name: 'Filé', desc: 'Sem espinha' },
      { id: 'sashimi', name: 'Sashimi', desc: '0,5 cm, fatias finas' },
    ],
    tags: ['🐟 Atlântico', '❄️ Fresco'],
  },
  {
    id: 'camarao-vg',
    name: 'Camarão VG',
    category: 'peixe',
    description: 'Descascado e limpo na hora. Fresco, nunca congelado.',
    pricePerKg: 94.9,
    imageUrl: productImagePath('peixes', 'camarao-vg.jpg'),
    badge: 'VG limpo',
    rating: 4.9,
    reviews: 53,
    cutTypes: [
      { id: 'limpo', name: 'Limpo', desc: 'Descascado e sem veia' },
      { id: 'casca', name: 'Com casca', desc: 'Inteiro com casca' },
    ],
    tags: ['🦐 Frutos do mar', '❄️ Fresco'],
  },
  {
    id: 'presunto-coimbra',
    name: 'Presunto Coimbra',
    category: 'frios',
    description: 'Presunto fatiado na hora. Ideal para tábua, sanduíche e lanches.',
    pricePerKg: 89.9,
    imageUrl: productImagePath('frios', 'presunto.jpg'),
    badge: 'Fatiado',
    rating: 4.8,
    reviews: 167,
    cutTypes: FRIO_CUT_TYPES,
    tags: ['🥓 Presunto', '✨ Fatiado na hora'],
  },
  {
    id: 'mussarela',
    name: 'Muçarela',
    category: 'frios',
    description: 'Queijo muçarela fresco. Fatias ou pedaço na espessura que preferir.',
    pricePerKg: 42.9,
    imageUrl: productImagePath('frios', 'mussarela.jpg'),
    badge: 'Fresco',
    rating: 4.7,
    reviews: 203,
    cutTypes: FRIO_CUT_TYPES,
    tags: ['🧀 Queijo', '🏠 Dia a dia'],
  },
  {
    id: 'peito-de-peru',
    name: 'Peito de Peru',
    category: 'frios',
    description: 'Peito de peru magro, fatiado no balcão. Leve e versátil.',
    pricePerKg: 38.9,
    imageUrl: productImagePath('frios', 'peito-de-peru.jpg'),
    rating: 4.6,
    reviews: 128,
    cutTypes: FRIO_CUT_TYPES,
    tags: ['🦃 Peru', '💪 Leve'],
  },
  {
    id: 'salame-tipo-italiano',
    name: 'Salame Tipo Italiano',
    category: 'frios',
    description: 'Salame selecionado. Fatias finas ou pedaço para tábua de frios.',
    pricePerKg: 54.9,
    imageUrl: productImagePath('frios', 'salame.jpg'),
    badge: 'Italiano',
    rating: 4.7,
    reviews: 94,
    cutTypes: FRIO_CUT_TYPES,
    tags: ['🥓 Salame', '🍷 Tábua'],
  },
  {
    id: 'queijo-prato',
    name: 'Queijo Prato',
    category: 'frios',
    description: 'Queijo prato tradicional. Fatias regulares para o dia a dia.',
    pricePerKg: 36.9,
    imageUrl: productImagePath('frios', 'queijo-prato.jpg'),
    rating: 4.5,
    reviews: 156,
    cutTypes: FRIO_CUT_TYPES,
    tags: ['🧀 Queijo', '🏠 Família'],
  },
  {
    id: 'wagyu-ribeye',
    name: 'Wagyu Ribeye A5',
    category: 'especial',
    description: 'Importado do Japão. Marmoreio intenso. Encomenda especial.',
    pricePerKg: 390,
    imageUrl: productImagePath('bovinos', 'wagyu-ribeye.jpg'),
    badge: 'Wagyu A5',
    rating: 5,
    reviews: 18,
    cutTypes: [
      { id: 'bife', name: 'Bife', desc: '2 cm espessura' },
      { id: 'inteiro', name: 'Peça', desc: 'Peça inteira' },
    ],
    tags: ['🥇 Premium', '🇯🇵 Importado', '⭐ A5'],
  },
]

export type Suggestion = {
  productId: string
  badge: string
  hook: string
  message: string
}

export const SUGGESTIONS: Record<string, Suggestion> = {
  'picanha-angus': {
    productId: 'linguica-aurora',
    badge: '🔥 Churrasco de respeito',
    hook: 'Fecha o churrasco com estilo!',
    message: 'Para acompanhar essa picanha, linguiça na brasa deixa o churrasco em família completo.',
  },
  'contrafile': {
    productId: 'linguica-perdigao',
    badge: '🥩 Combo campeão',
    hook: 'Monte o kit churrasqueiro!',
    message: 'Contrafilé na grelha + linguiça calabresa na brasa — churrasco que ninguém esquece.',
  },
  'alcatra': {
    productId: 'costelinha-suina',
    badge: '💰 Mais sabor na brasa',
    hook: 'Mais carne, mais festa!',
    message: 'Alcatra rende no dia a dia. Uma costelinha suína junto transforma o fim de semana em churrasco completo.',
  },
  'file-mignon': {
    productId: 'camarao-vg',
    badge: '✨ Jantar especial',
    hook: 'Surpreenda na mesa hoje!',
    message: 'Filé nobre merece companhia à altura. Camarão limpo na hora eleva o jantar ao nível chef.',
  },
  'costela-bovina': {
    productId: 'panceta',
    badge: '🪵 Brasa longa',
    hook: 'Domingo na brasa pede parceiro!',
    message: 'Costela pede paciência na brasa — e panceta na grelha mantém a galera animada enquanto a ripa fica no ponto.',
  },
  'frango-inteiro': {
    productId: 'coracao-frango',
    badge: '🍗 Família na mesa',
    hook: 'Complete o espetinho!',
    message: 'Frango inteiro assado combina com coração no espeto — sabor intenso e preço justo para a galera.',
  },
  'sobrecoxa': {
    productId: 'tulipa-frango',
    badge: '👨‍🍳 Dica do açougueiro',
    hook: 'Dupla perfeita no espeto!',
    message: 'Sobrecoxa prática + tulipa de frango: a dupla favorita para o churrasco de fim de semana.',
  },
  'peito-frango': {
    productId: 'torresmo',
    badge: '🥗 Leve e saboroso',
    hook: 'Varie na grelha!',
    message: 'Peito rende no dia a dia — torresmo crocante deixa qualquer encontro mais saboroso.',
  },
  'asa-frango': {
    productId: 'coracao-frango',
    badge: '🔥 Espetinho',
    hook: 'Churrasco de boteco em casa!',
    message: 'Asa na brasa é sucesso — acrescente coração no espeto e surpreenda a galera.',
  },
  'tulipa-frango': {
    productId: 'coracao-frango',
    badge: '🔥 Kit espetinho',
    hook: 'A dupla favorita no espeto!',
    message: 'Tulipa e coração são parceiros clássicos na grelha — leve os dois e capriche no churrasco.',
  },
  'coracao-frango': {
    productId: 'asa-frango',
    badge: '🔥 Espetinho',
    hook: 'Complete o kit!',
    message: 'Coração combina perfeitamente com asa de frango na grelha — sabor de boteco em casa.',
  },
  'costelinha-suina': {
    productId: 'picanha-angus',
    badge: '🐷 Suíno + bovino',
    hook: 'Ribs e picanha = sucesso!',
    message: 'Costelinha estilo americano brilha com picanha Angus — dois sabores, um só churrasco lendário.',
  },
  'bacon-suino': {
    productId: 'linguica-aurora',
    badge: '🔥 Combo raiz',
    hook: 'Complete o churrasco!',
    message: 'Bacon na grelha pede linguiça na brasa — dupla suína que a família adora.',
  },
  'linguica-aurora': {
    productId: 'picanha-angus',
    badge: '🔥 Combo raiz',
    hook: 'Subiu a fumaça? Tem picanha!',
    message: 'Linguiça abre o apetite — a picanha Angus fecha com chave de ouro no fim de semana em família.',
  },
  'linguica-perdigao': {
    productId: 'costelinha-suina',
    badge: '🐷 Dupla na brasa',
    hook: 'Churrasco completo!',
    message: 'Calabresa Perdigão com costelinha suína — sabor de domingo na brasa.',
  },
  'linguica-sadia': {
    productId: 'linguica-aurora',
    badge: '🌭 Varie o sabor',
    hook: 'Monte a bandeja!',
    message: 'Sadia e Aurora juntas — variedade de linguiças para agradar toda a família no churrasco.',
  },
  'panceta': {
    productId: 'costelinha-suina',
    badge: '🐷 Dupla suína',
    hook: 'Churrasco completo!',
    message: 'Panceta na brasa combina com costelinha — dois cortes suínos, um só churrasco.',
  },
  'torresmo': {
    productId: 'panceta',
    badge: '✨ Crocante',
    hook: 'Complete o prato!',
    message: 'Torresmo crocante é o par perfeito da panceta na mesa — sabor e textura de respeito.',
  },
  'salmao-posta': {
    productId: 'camarao-vg',
    badge: '🌊 Noite frutos do mar',
    hook: 'Eleve o jantar ao nível chef!',
    message: 'Salmão nobre merece camarão limpo na hora — grelhado, salteado ou no risoto, restaurante em casa.',
  },
  'camarao-vg': {
    productId: 'salmao-posta',
    badge: '🦐 Dupla do mar',
    hook: 'Frutos do mar em dose dupla!',
    message: 'Camarão fresquinho combina com salmão grelhado — jantar completo de frutos do mar.',
  },
  'wagyu-ribeye': {
    productId: 'camarao-vg',
    badge: '👑 Experiência premium',
    hook: 'Noite inesquecível te espera!',
    message: 'Wagyu A5 com camarão VG — menu degustação de alto nível para quem não aceita menos que extraordinário.',
  },
}

export const CATEGORIES = [
  { id: 'todos', label: '🔪 Todos', filter: null },
  { id: 'bovino', label: '🐄 Bovino', filter: 'bovino' },
  { id: 'aves', label: '🐔 Aves', filter: 'aves' },
  { id: 'suino', label: '🐷 Suíno', filter: 'suino' },
  { id: 'linguicas', label: '🌭 Linguiças', filter: 'linguicas' },
  { id: 'peixe', label: '🐟 Peixes e Frutos do Mar', filter: 'peixe' },
  { id: 'frios', label: '🧀 Frios', filter: 'frios' },
  { id: 'especial', label: '⭐ Especiais', filter: 'especial' },
] as const

export const HERO_SLIDES = [
  {
    productId: 'picanha-angus',
    imageUrl: productImagePath('bovinos', 'picanha-angus.jpg'),
    badge: '✦ Destaque do dia',
    name: 'Picanha Angus\nPremium',
    tag: 'Maturada 21 dias',
    price: 'R$ 89,90/kg',
  },
  {
    productId: 'wagyu-ribeye',
    imageUrl: productImagePath('bovinos', 'wagyu-ribeye.jpg'),
    badge: '⭐ Especial',
    name: 'Wagyu Ribeye\nA5 Japonês',
    tag: 'Importado',
    price: 'R$ 390,00/kg',
  },
  {
    productId: 'salmao-posta',
    imageUrl: productImagePath('peixes', 'salmao-posta.jpg'),
    badge: '❄️ Fresco hoje',
    name: 'Salmão\nAtlântico',
    tag: 'Noruega · Fresco',
    price: 'R$ 79,90/kg',
  },
] as const

export type CategoryCard = {
  id: string
  name: string
  count: string
  imageUrl: string
  filter: string
  /** Card em destaque no topo — largura total e mais alto */
  featured?: boolean
  /** Card em largura total na base do grid */
  wide?: boolean
}

export const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'carnes',
    name: 'Carnes',
    count: 'Bovino · Nobres · Premium',
    imageUrl: productImagePath('bovinos', 'picanha-angus.jpg'),
    filter: 'bovino',
    featured: true,
  },
  {
    id: 'frangos',
    name: 'Frangos',
    count: 'Inteiro · Peito · Asa · Sassami',
    imageUrl: productImagePath('aves', 'azinha.jpg'),
    filter: 'aves',
  },
  {
    id: 'suino',
    name: 'Suíno',
    count: 'Costelinha · Panceta · Bacon · Torresmo',
    imageUrl: productImagePath('suinos', 'panceta.jpg'),
    filter: 'suino',
  },
  {
    id: 'linguicas',
    name: 'Linguiças',
    count: 'Aurora · Perdigão · Sadia',
    imageUrl: productImagePath('linguicas', 'aurora.jpg'),
    filter: 'linguicas',
  },
  {
    id: 'peixes',
    name: 'Peixes e Frutos do Mar',
    count: 'Salmão · Camarão · Postas · Filés',
    imageUrl: productImagePath('peixes', 'salmao-posta.jpg'),
    filter: 'peixe',
    wide: true,
  },
  {
    id: 'frios',
    name: 'Frios',
    count: 'Presunto · Queijos · Fatiados',
    imageUrl: productImagePath('frios', 'presunto.jpg'),
    filter: 'frios',
  },
]

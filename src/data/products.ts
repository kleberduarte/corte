export type CutType = {
  id: string
  name: string
  desc: string
}

export type Product = {
  id: string
  name: string
  category: 'bovino' | 'aves' | 'suino' | 'peixe' | 'mar' | 'especial'
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

export const PRODUCTS: Product[] = [
  {
    id: 'picanha-angus',
    name: 'Picanha Angus',
    category: 'bovino',
    description: 'Peça inteira de Picanha Angus certificada, maturada a seco por 21 dias para máxima maciez e sabor concentrado. Capa de gordura intacta para churrasco perfeito.',
    pricePerKg: 89.9,
    imageUrl: 'https://images.unsplash.com/photo-1590507385303-b25eca128cc6?w=600&h=500&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1613454320437-0c228c8b1723?w=600&h=500&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=500&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1723893905879-0e309c2a8e06?w=600&h=500&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1690983323238-0b91789e1b5a?w=600&h=500&fit=crop&q=80',
    rating: 4.4,
    reviews: 88,
    cutTypes: DEFAULT_CUT_TYPES,
    tags: ['🥩 Clássico', '💪 Proteína'],
  },
  {
    id: 'frango-inteiro',
    name: 'Frango Inteiro',
    category: 'aves',
    description: 'Frango cru, inteiro. Corte na hora no balcão.',
    pricePerKg: 18.9,
    imageUrl: '/assets/produtos/aves/peitoDeFrango.jpg',
    badge: 'Cru · Granja',
    rating: 4.9,
    reviews: 310,
    cutTypes: [
      { id: 'inteiro', name: 'Inteiro', desc: 'Frango completo' },
      { id: 'metade', name: 'Metade', desc: 'Dividido ao meio' },
      { id: 'ao_molho', name: 'A passarinho', desc: 'Pedaços pequenos' },
    ],
    tags: ['🐔 Granja', '🥩 Cru'],
  },
  {
    id: 'sobrecoxa',
    name: 'Sobrecoxa sem Osso',
    category: 'aves',
    description: 'Sobrecoxa crua, desossada na hora.',
    pricePerKg: 22.9,
    imageUrl: '/assets/produtos/aves/sobrecoxa.jpg',
    badge: 'Cru',
    rating: 4.4,
    reviews: 74,
    cutTypes: [
      { id: 'sem_osso', name: 'Sem osso', desc: 'Desossada na hora' },
      { id: 'com_osso', name: 'Com osso', desc: 'Peça inteira' },
    ],
    tags: ['🐔 Frango', '🥩 Cru'],
  },
  {
    id: 'peito-frango',
    name: 'Peito de Frango',
    category: 'aves',
    description: 'Peito cru, sem osso e sem pele.',
    pricePerKg: 24.9,
    imageUrl: '/assets/produtos/aves/peitoDeFrango.jpg',
    badge: 'Cru · Leve',
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
    description: 'Asas cruas — tempero da casa opcional.',
    pricePerKg: 16.9,
    imageUrl: '/assets/produtos/aves/azinha.jpg',
    badge: 'Cru',
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
    imageUrl: '/assets/produtos/aves/tulipa.jpg',
    badge: 'Cru · Festa',
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
    description: 'Coração cru, limpo e fresco. Clássico de churrasco, espetinho ou frigideira.',
    pricePerKg: 14.9,
    imageUrl: '/assets/produtos/aves/coracao.jpg',
    badge: 'Cru · Espetinho',
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
    imageUrl: 'https://images.unsplash.com/photo-1588944651162-57080995b92d?w=600&h=500&fit=crop&q=80',
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
    id: 'linguica-toscana',
    name: 'Linguiça Toscana',
    category: 'suino',
    description: 'Feita na hora no açougue. Tempero artesanal da casa.',
    pricePerKg: 29.9,
    imageUrl: 'https://images.unsplash.com/photo-1771243108040-696d2544adf3?w=600&h=500&fit=crop&q=80',
    rating: 4.9,
    reviews: 289,
    cutTypes: [
      { id: 'link', name: 'Gomo', desc: 'Porções individuais' },
      { id: 'granel', name: 'A granel', desc: 'Peso exato' },
    ],
    tags: ['🌿 Artesanal', '🐷 Suíno'],
  },
  {
    id: 'salmao-posta',
    name: 'Salmão em Posta',
    category: 'peixe',
    description: 'Atlântico fresco. Cortado na espessura que você quiser.',
    pricePerKg: 79.9,
    imageUrl: 'https://images.unsplash.com/photo-1559058789-672da06263d8?w=600&h=500&fit=crop&q=80',
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
    category: 'mar',
    description: 'Descascado e limpo na hora. Fresco, nunca congelado.',
    pricePerKg: 94.9,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=500&fit=crop&q=80',
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
    id: 'wagyu-ribeye',
    name: 'Wagyu Ribeye A5',
    category: 'especial',
    description: 'Importado do Japão. Marmoreio intenso. Encomenda especial.',
    pricePerKg: 390,
    imageUrl: 'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?w=600&h=500&fit=crop&q=80',
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
    productId: 'linguica-toscana',
    badge: '🔥 Churrasco de respeito',
    hook: 'Fecha o churrasco com estilo!',
    message: 'Para acompanhar essa picanha, uma linguiça artesanal na brasa deixa o churrasco em família completo.',
  },
  'contrafile': {
    productId: 'linguica-toscana',
    badge: '🥩 Combo campeão',
    hook: 'Monte o kit churrasqueiro!',
    message: 'Contrafilé na grelha + linguiça toscana na brasa — churrasco que ninguém esquece.',
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
    productId: 'linguica-toscana',
    badge: '🪵 Brasa longa',
    hook: 'Domingo na brasa pede parceiro!',
    message: 'Costela pede paciência na brasa — e uma linguiça saborosa mantém a galera animada enquanto a ripa fica no ponto.',
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
    productId: 'linguica-toscana',
    badge: '🥗 Leve e saboroso',
    hook: 'Varie na grelha!',
    message: 'Peito rende no dia a dia — uma linguiça toscana na grelha deixa qualquer encontro mais saboroso.',
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
  'linguica-toscana': {
    productId: 'picanha-angus',
    badge: '🔥 Combo raiz',
    hook: 'Subiu a fumaça? Tem picanha!',
    message: 'Linguiça abre o apetite — a picanha Angus fecha com chave de ouro no fim de semana em família.',
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
  { id: 'peixe', label: '🐟 Peixe', filter: 'peixe' },
  { id: 'especial', label: '⭐ Especiais', filter: 'especial' },
] as const

export const HERO_SLIDES = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1590507385303-b25eca128cc6?w=900&h=1200&fit=crop&q=85',
    badge: '✦ Destaque do dia',
    name: 'Picanha Angus\nPremium',
    tag: 'Maturada 21 dias',
    price: 'R$ 89,90/kg',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?w=900&h=1200&fit=crop&q=85',
    badge: '⭐ Especial',
    name: 'Wagyu Ribeye\nA5 Japonês',
    tag: 'Importado',
    price: 'R$ 390,00/kg',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1559058789-672da06263d8?w=900&h=1200&fit=crop&q=85',
    badge: '❄️ Fresco hoje',
    name: 'Salmão\nAtlântico',
    tag: 'Noruega · Fresco',
    price: 'R$ 79,90/kg',
  },
]

export const CATEGORY_CARDS = [
  {
    id: 'carnes',
    name: 'Carnes',
    icon: '🥩',
    count: 'Bovino · Nobres · Premium',
    imageUrl: 'https://images.unsplash.com/photo-1590507385303-b25eca128cc6?w=600&h=400&fit=crop&q=85',
    filter: 'bovino',
  },
  {
    id: 'frangos',
    name: 'Frangos',
    icon: '🐔',
    count: 'Inteiro · Peito · Asa · Sassami',
    imageUrl: '/assets/produtos/aves/azinha.jpg',
    filter: 'aves',
  },
  {
    id: 'suino',
    name: 'Suíno',
    icon: '🐷',
    count: 'Costela · Linguiça Artesanal',
    imageUrl: 'https://images.unsplash.com/photo-1771243108040-696d2544adf3?w=600&h=400&fit=crop&q=85',
    filter: 'suino',
  },
  {
    id: 'peixes',
    name: 'Peixes',
    icon: '🐟',
    count: 'Frescos · Postas · Filés',
    imageUrl: 'https://images.unsplash.com/photo-1559058789-672da06263d8?w=600&h=400&fit=crop&q=85',
    filter: 'peixe',
  },
  {
    id: 'mar',
    name: 'Frutos do Mar',
    icon: '🦐',
    count: 'Camarão · Frescos do dia',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=900&h=320&fit=crop&q=85',
    filter: 'mar',
    wide: true,
  },
]

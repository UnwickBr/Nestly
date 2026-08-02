export type Priority = 'Alta' | 'Média' | 'Baixa';
export type Status = 'Desejado' | 'Pesquisando' | 'Comprado' | 'Entregue' | 'Montado';
export type Category =
  | 'Sala'
  | 'Cozinha'
  | 'Quarto'
  | 'Banheiro'
  | 'Lavanderia'
  | 'Escritório'
  | 'Área Externa'
  | 'Decoração'
  | 'Eletrodomésticos'
  | 'Eletrônicos'
  | 'Móveis'
  | 'Outros';

export interface Item {
  id: string;
  name: string;
  category: Category;
  priority: Priority;
  status: Status;
  quantity: number;
  plannedPrice: number;
  paidPrice: number | null;
  store: string;
  link: string;
  addedBy: 'Você' | 'Ana';
  notes: string;
  isFavorite: boolean;
  isWishlist: boolean;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  user: 'Você' | 'Ana';
  action: string;
  item: string;
  time: string;
}

export const CATEGORIES: { name: Category; icon: string; color: string }[] = [
  { name: 'Sala', icon: '🛋️', color: '#8b5cf6' },
  { name: 'Cozinha', icon: '🍳', color: '#f59e0b' },
  { name: 'Quarto', icon: '🛏️', color: '#ec4899' },
  { name: 'Banheiro', icon: '🚿', color: '#06b6d4' },
  { name: 'Lavanderia', icon: '🫧', color: '#3b82f6' },
  { name: 'Escritório', icon: '💻', color: '#10b981' },
  { name: 'Área Externa', icon: '🌿', color: '#84cc16' },
  { name: 'Decoração', icon: '🖼️', color: '#f97316' },
  { name: 'Eletrodomésticos', icon: '⚡', color: '#eab308' },
  { name: 'Eletrônicos', icon: '📱', color: '#6366f1' },
  { name: 'Móveis', icon: '🪑', color: '#a16207' },
  { name: 'Outros', icon: '📦', color: '#6b7280' },
];

export const mockItems: Item[] = [
  {
    id: '1',
    name: 'Sofá 3 Lugares Retrátil',
    category: 'Sala',
    priority: 'Alta',
    status: 'Comprado',
    quantity: 1,
    plannedPrice: 3500,
    paidPrice: 3200,
    store: 'Tok&Stok',
    link: 'https://tokstok.com.br',
    addedBy: 'Você',
    notes: 'Cor cinza antracite. Garantia de 2 anos.',
    isFavorite: true,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&auto=format',
    description: 'Sofá retrátil e reclinável com tecido suede, ideal para a sala de estar.',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-15',
  },
  {
    id: '2',
    name: 'Mesa de Jantar 6 Lugares',
    category: 'Sala',
    priority: 'Alta',
    status: 'Entregue',
    quantity: 1,
    plannedPrice: 2800,
    paidPrice: 2650,
    store: 'Etna',
    link: 'https://etna.com.br',
    addedBy: 'Ana',
    notes: 'Madeira maciça. Acompanha 6 cadeiras.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1617098474202-0d0d7a60d9d9?w=400&h=300&fit=crop&auto=format',
    description: 'Mesa retangular em madeira maciça com acabamento natural.',
    createdAt: '2024-01-12',
    updatedAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Geladeira French Door 540L',
    category: 'Eletrodomésticos',
    priority: 'Alta',
    status: 'Pesquisando',
    quantity: 1,
    plannedPrice: 6500,
    paidPrice: null,
    store: 'Magazine Luiza',
    link: 'https://magazineluiza.com.br',
    addedBy: 'Você',
    notes: 'Preferencialmente Samsung ou LG. Inox.',
    isFavorite: true,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=300&fit=crop&auto=format',
    description: 'Geladeira french door com dispenser de água e gelo.',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-01',
  },
  {
    id: '4',
    name: 'Cama King Size com Baú',
    category: 'Quarto',
    priority: 'Alta',
    status: 'Montado',
    quantity: 1,
    plannedPrice: 4200,
    paidPrice: 3900,
    store: 'Ortobom',
    link: 'https://ortobom.com.br',
    addedBy: 'Ana',
    notes: 'Estofada. Baú com abertura a gás.',
    isFavorite: true,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&auto=format',
    description: 'Cama king size estofada com baú de grande capacidade.',
    createdAt: '2024-01-05',
    updatedAt: '2024-02-28',
  },
  {
    id: '5',
    name: 'TV 65" OLED 4K',
    category: 'Eletrônicos',
    priority: 'Média',
    status: 'Pesquisando',
    quantity: 1,
    plannedPrice: 8000,
    paidPrice: null,
    store: 'Fast Shop',
    link: 'https://fastshop.com.br',
    addedBy: 'Você',
    notes: 'LG C3 ou Samsung S90C. Montar na parede.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=300&fit=crop&auto=format',
    description: 'Smart TV OLED 4K com suporte a Dolby Vision e Atmos.',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-05',
  },
  {
    id: '6',
    name: 'Máquina de Lavar 12kg',
    category: 'Eletrodomésticos',
    priority: 'Alta',
    status: 'Comprado',
    quantity: 1,
    plannedPrice: 3200,
    paidPrice: 2999,
    store: 'Casas Bahia',
    link: 'https://casasbahia.com.br',
    addedBy: 'Ana',
    notes: 'Samsung Eco Bubble. Parcelado em 12x.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=300&fit=crop&auto=format',
    description: 'Máquina de lavar com tecnologia Eco Bubble e motor digital inverter.',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-10',
  },
  {
    id: '7',
    name: 'Tapete Sala 2x3m',
    category: 'Decoração',
    priority: 'Baixa',
    status: 'Desejado',
    quantity: 1,
    plannedPrice: 800,
    paidPrice: null,
    store: 'Westwing',
    link: 'https://westwing.com.br',
    addedBy: 'Ana',
    notes: 'Cor bege ou cinza. Pelo curto.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
    description: 'Tapete de pelo curto para sala de estar.',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
  },
  {
    id: '8',
    name: 'Luminária de Piso Arco',
    category: 'Decoração',
    priority: 'Baixa',
    status: 'Desejado',
    quantity: 2,
    plannedPrice: 450,
    paidPrice: null,
    store: 'Amazon',
    link: 'https://amazon.com.br',
    addedBy: 'Você',
    notes: 'Uma para sala e uma para o quarto.',
    isFavorite: true,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop&auto=format',
    description: 'Luminária de chão com arco em metal preto fosco.',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15',
  },
  {
    id: '9',
    name: 'Mesa Home Office',
    category: 'Escritório',
    priority: 'Média',
    status: 'Pesquisando',
    quantity: 1,
    plannedPrice: 1500,
    paidPrice: null,
    store: 'Madesa',
    link: 'https://madesa.com.br',
    addedBy: 'Você',
    notes: 'L-shape ou reta 160cm. Com gavetas.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop&auto=format',
    description: 'Mesa para escritório em casa com espaço para dois monitores.',
    createdAt: '2024-02-20',
    updatedAt: '2024-03-10',
  },
  {
    id: '10',
    name: 'Churrasqueira Elétrica',
    category: 'Área Externa',
    priority: 'Baixa',
    status: 'Desejado',
    quantity: 1,
    plannedPrice: 1200,
    paidPrice: null,
    store: 'Consul',
    link: 'https://consul.com.br',
    addedBy: 'Você',
    notes: 'Para varanda. Sem fumaça.',
    isFavorite: false,
    isWishlist: true,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format',
    description: 'Churrasqueira elétrica de embutir para varanda.',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01',
  },
  {
    id: '11',
    name: 'Espresso Machine',
    category: 'Cozinha',
    priority: 'Média',
    status: 'Desejado',
    quantity: 1,
    plannedPrice: 3800,
    paidPrice: null,
    store: 'Nespresso',
    link: 'https://nespresso.com',
    addedBy: 'Ana',
    notes: 'Semi-automática. Moedor integrado.',
    isFavorite: true,
    isWishlist: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop&auto=format',
    description: 'Máquina de espresso semi-automática com moedor integrado.',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
  {
    id: '12',
    name: 'Armário Roupeiro 6 Portas',
    category: 'Quarto',
    priority: 'Alta',
    status: 'Entregue',
    quantity: 1,
    plannedPrice: 5500,
    paidPrice: 5200,
    store: 'Henn',
    link: 'https://henn.com.br',
    addedBy: 'Ana',
    notes: 'Planejado. Com espelho nas portas.',
    isFavorite: false,
    isWishlist: false,
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=300&fit=crop&auto=format',
    description: 'Roupeiro 6 portas com espelho, portas deslizantes e puxadores escondidos.',
    createdAt: '2024-01-08',
    updatedAt: '2024-02-25',
  },
];

export const mockActivities: Activity[] = [
  { id: '1', user: 'Ana', action: 'marcou como Comprado', item: 'Sofá 3 Lugares Retrátil', time: '2 horas atrás' },
  { id: '2', user: 'Você', action: 'adicionou', item: 'TV 65" OLED 4K', time: '5 horas atrás' },
  { id: '3', user: 'Ana', action: 'atualizou o preço de', item: 'Mesa de Jantar 6 Lugares', time: 'Ontem, 18:30' },
  { id: '4', user: 'Você', action: 'favoritou', item: 'Geladeira French Door 540L', time: 'Ontem, 14:15' },
  { id: '5', user: 'Ana', action: 'marcou como Montado', item: 'Cama King Size com Baú', time: '2 dias atrás' },
];

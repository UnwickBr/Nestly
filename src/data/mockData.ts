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
  addedBy: string;
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
  user: string;
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

// Fresh install — no items yet. Real households now come from the auth
// system (src/server) instead of hardcoded "Você"/"Ana" mock people.
export const mockItems: Item[] = [];

export const mockActivities: Activity[] = [];

export type Difficulty = 'Fácil' | 'Médio';
export type CategoryId = 'frango' | 'massas' | 'carnes' | 'peixes' | 'vegetarianas' | 'sobremesas';

export interface Qty { amount: number; unit: string }

export interface Ingredient {
  id: string;
  name: string;
  /** Quantidades escaláveis por porção. Ex.: [{amount: 800, unit: 'g'}] */
  qty?: Qty[];
  /** Texto fixo, quando não escala. Ex.: "a gosto" */
  text?: string;
}

export interface Step {
  title: string;
  text: string;
  minutes?: number;
  note?: string;
}

export interface Swap {
  /** Palavras-chave (sem acento, minúsculas) que ativam esta resposta. */
  match: string[];
  answer: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: CategoryId;
  meal: 'almoco-jantar' | 'sobremesa';
  minutes: number;
  difficulty: Difficulty;
  /** Rótulo curto do card (Vapt-vupt, Conforto...) */
  mood: string;
  baseServings: number;
  servingsLabel: string;
  /** Etiquetas dietéticas / de despensa */
  tags: { label: string; tone: 'sage' | 'warm'; icon: string }[];
  badge?: { label: string; icon: string };
  rating: number;
  ratingCount: number;
  ingredients: Ingredient[];
  steps: Step[];
  chefTip: string;
  swaps?: Swap[];
  image: { remote: string; local?: string; alt: string };
}

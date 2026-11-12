import type { Ingredient, Recipe } from '../data/types';

/** Minúsculas e sem acentos, para buscas tolerantes. */
export const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function recipeMatches(r: Recipe, term: string): boolean {
  const t = norm(term);
  if (!t) return true;
  const hay = norm([r.title, r.description, r.mood, ...r.ingredients.map((i) => i.name)].join(' '));
  return t.split(/\s+/).every((w) => hay.includes(w));
}

const fmtNum = (n: number) => {
  const rounded = n >= 10 ? Math.round(n) : Math.round(n * 2) / 2;
  return String(rounded).replace('.', ',');
};

/** Quantidade de um ingrediente para o número de porções escolhido. */
export function formatQty(ing: Ingredient, factor: number): string {
  if (ing.text) return ing.text;
  return (ing.qty ?? []).map((q) => `${fmtNum(q.amount * factor)} ${q.unit}`).join(' + ');
}

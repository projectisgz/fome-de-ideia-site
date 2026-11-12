import type { ChatContext, ChatMessage, ChatService } from './ChatService';
import { formatQty, norm } from '../lib/text';

/**
 * RESPOSTAS DEMONSTRATIVAS: nenhuma IA é chamada aqui.
 * As respostas vêm de regras simples por palavra-chave, usando a receita aberta
 * (ingredientes, porções, `swaps`) como contexto. Serve para experimentar o fluxo.
 */

type Reply = Awaited<ReturnType<ChatService['reply']>>;

interface GenericSwap { match: string[]; ingredient: string; answer: string }

const GENERIC_SWAPS: GenericSwap[] = [
  { match: ['manteiga'], ingredient: 'manteiga', answer: 'Dá, sim. Troque a manteiga por azeite de oliva usando cerca de 3/4 da medida (3 colheres de azeite no lugar de 4 de manteiga). Fica mais leve e perde só um pouco do sabor lácteo. Para refogados e purês funciona muito bem; em massas de bolo, prefira óleo neutro.' },
  { match: ['leite de coco'], ingredient: 'leite de coco', answer: 'Sem leite de coco, use leite comum com 1 colher de creme de leite ou requeijão para dar corpo. Se quiser o toque de coco, finalize com um pouco de coco ralado.' },
  { match: ['dende'], ingredient: 'azeite de dendê', answer: 'Azeite de oliva aquecido com uma pitadinha de páprica doce ou cúrcuma imita a cor dourada do dendê. O sabor fica mais suave.' },
  { match: ['creme de leite'], ingredient: 'creme de leite', answer: 'Troque por requeijão cremoso na mesma medida ou por leite com 1 colher de amido de milho dissolvido. Adicione fora do fogo para não talhar.' },
  { match: ['cebola'], ingredient: 'cebola', answer: 'Sem cebola, use alho-poró ou cebolinha branca no refogado. Uma pitada de cebola em pó também resolve.' },
  { match: ['ovo'], ingredient: 'ovo', answer: 'Em bolos, cada ovo pode virar 1/4 de xícara de purê de banana ou 1 colher de linhaça hidratada. Muda um pouco a textura.' },
  { match: ['acucar'], ingredient: 'açúcar', answer: 'Açúcar mascavo ou demerara entram na mesma medida e dão um sabor de caramelo. Mel exige reduzir o líquido da receita.' },
  { match: ['farinha'], ingredient: 'farinha de trigo', answer: 'Para tirar o glúten, misture farinha de arroz com um pouco de amido de milho. Costuma funcionar bem em molhos e bolos simples.' },
  { match: ['alho'], ingredient: 'alho', answer: 'Sem alho, use uma pitada de alho em pó ou um pouco de cebolinha. O aroma muda, mas o prato se sustenta.' },
  { match: ['tilapia', 'file de tilapia'], ingredient: 'tilápia', answer: 'Pode, sim. Filé de tilápia é mais delicado que posta, então reduza o tempo de cozimento para uns 8 a 10 minutos e evite mexer na panela.' },
];

function includesAny(q: string, words: string[]) {
  return words.some((w) => q.includes(norm(w)));
}

export class DemoChatService implements ChatService {
  readonly isDemo = true;

  async reply(question: string, _history: ChatMessage[], context: ChatContext): Promise<Reply> {
    await new Promise((r) => setTimeout(r, 650)); // simula o tempo de resposta
    return this.answer(question, context);
  }

  private answer(question: string, { recipe }: ChatContext): Reply {
    const q = norm(question);
    const where = recipe ? ` na ${recipe.title.split(' com ')[0]}` : '';

    // 1) Ajuste de porções (usa os ingredientes da receita aberta)
    const m = q.match(/(\d+)\s*(pessoas|porcoes|porcao|pessoa)/) ?? (q.includes('duas pessoas') ? [null, '2'] : null);
    if (m && recipe) {
      const servings = Math.min(12, Math.max(1, Number(m[1])));
      const factor = servings / recipe.baseServings;
      return {
        heading: `Ajustado para ${servings} ${servings === 1 ? 'porção' : 'porções'}`,
        text: `Para ${servings} ${servings === 1 ? 'pessoa' : 'pessoas'} sem sobrar, estas são as medidas principais:`,
        portions: {
          servings,
          items: recipe.ingredients.filter((i) => !i.text).slice(0, 4).map((i) => ({ name: i.name, qty: formatQty(i, factor) })),
        },
      };
    }

    // 2) Substituições específicas da receita aberta
    if (recipe?.swaps && includesAny(q, ['troc', 'substitu', 'sem ', 'nao tenho', 'posso usar', 'no lugar'])) {
      const hits = recipe.swaps.filter((s) => s.match.some((k) => q.includes(norm(k))));
      if (hits.length) {
        return { heading: 'Dica do Fogão', text: hits.map((h) => h.answer).join('\n\n') + '\n\nO sabor fica mais suave, mas continua apetitoso. ✨' };
      }
    }

    // 3) Substituições genéricas (com ou sem receita)
    const generic = GENERIC_SWAPS.find((s) => s.match.some((k) => q.includes(norm(k))));
    if (generic) {
      const inRecipe = recipe?.ingredients.some((i) => norm(i.name).includes(norm(generic.ingredient)));
      const note = recipe && !inRecipe ? `\n\nObs.: ${generic.ingredient} não aparece nos ingredientes desta receita, então a regra vale de forma geral.` : '';
      return { heading: 'Dica do Fogão', text: generic.answer + note };
    }

    // 4) Ponto de cozimento / tempo
    if (includesAny(q, ['ponto', 'cozimento', 'quanto tempo', 'tempo'])) {
      const timed = recipe?.steps.filter((s) => s.minutes) ?? [];
      if (recipe && timed.length) {
        return { heading: 'Ponto de cozimento', text: `${recipe.title.split(' com ')[0]}: ${timed.map((s) => `${s.title.toLowerCase()} (${s.minutes} min)`).join(', ')}. Guie-se também pelo cheiro e pela textura: o prato está no ponto quando os ingredientes estão macios e o molho encorpado.` };
      }
      return { text: 'Abra uma receita para eu falar do ponto certo dela. Em geral: proteínas macias ao garfo, molho que cobre a colher e aroma bem presente.' };
    }

    // 5) Geladeira / despensa
    if (includesAny(q, ['geladeira', 'sobrou', 'despensa', 'tenho em casa'])) {
      return { heading: 'Ideia da despensa', text: 'Me diga 3 ou 4 ingredientes que você tem em casa. Numa versão real, eu cruzaria com as receitas do app. Por enquanto, tente a busca por ingrediente na aba Receitas.' };
    }

    // 6) Saudação / ajuda
    if (q.split(/\W+/).some((w) => ['oi', 'ola', 'ajuda'].includes(w)) || includesAny(q, ['bom dia', 'boa noite'])) {
      return { text: recipe ? `Oi! Estou de olho na ${recipe.title}. Pergunte sobre substituições, medidas ou pontos de cozimento.` : 'Oi! Pergunte sobre substituições de ingredientes, medidas ou abra uma receita para eu usar como contexto.' };
    }

    return {
      text: `Ótima pergunta${where}! Nesta versão demonstrativa eu só sei responder sobre substituição de ingredientes, ajuste de porções e ponto de cozimento. Tente algo como “posso trocar a manteiga por azeite?”.`,
    };
  }
}

export const quickQuestions = (recipe?: ChatContext['recipe']): string[] => {
  const base = ['Posso trocar a manteiga por azeite?', 'Como adapto para 2 pessoas?', 'Qual o ponto certo?'];
  if (!recipe) return [...base, 'O que fazer sem cebola?'];
  const swapHint = recipe.swaps?.[0]?.match[0];
  const extra = swapHint ? [`E se eu não tiver ${swapHint}?`] : ['O que fazer sem cebola?'];
  return [...base, ...extra];
};

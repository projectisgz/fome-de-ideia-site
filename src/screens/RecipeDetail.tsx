import { useEffect, useState } from 'react';
import { getRecipe } from '../data/recipes';
import { formatQty } from '../lib/text';
import { hrefs } from '../lib/useHashRoute';
import { EmptyState, Icon, RecipeImage, SaveButton } from '../components/ui';
import type { Recipe } from '../data/types';

interface Props { id: string; saved: boolean; onToggleSave: () => void; onAskChef: (r: Recipe) => void }

export default function RecipeDetail({ id, saved, onToggleSave, onAskChef }: Props) {
  const recipe = getRecipe(id);
  const [servings, setServings] = useState(recipe?.baseServings ?? 1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [cooking, setCooking] = useState(false);

  useEffect(() => { setServings(recipe?.baseServings ?? 1); setChecked(new Set()); }, [id]);

  if (!recipe) {
    return (
      <EmptyState icon="soup_kitchen" title="Receita não encontrada" text="Esse link não aponta para nenhuma receita do caderno.">
        <a className="btn btn--primary" href={hrefs.receitas}>Ver receitas</a>
      </EmptyState>
    );
  }

  const factor = servings / recipe.baseServings;
  const toggleCheck = (ing: string) => setChecked((prev) => { const n = new Set(prev); n.has(ing) ? n.delete(ing) : n.add(ing); return n; });
  const share = async () => {
    const data = { title: recipe.title, text: `${recipe.title} · Fome de Ideia`, url: window.location.href };
    try { if (navigator.share) await navigator.share(data); else await navigator.clipboard.writeText(data.url); } catch { /* cancelado */ }
  };

  return (
    <>
      <div className="topbar">
        <a className="iconbtn" href={hrefs.receitas} aria-label="Voltar para receitas" style={{ color: 'var(--on-surface)' }}><Icon name="arrow_back" /></a>
        <div className="topbar__title"><div className="h-sm" style={{ fontSize: 17 }}>Detalhes da Receita</div><div className="label-sm muted">Fome de Ideia</div></div>
        <button className="iconbtn" onClick={share} aria-label="Compartilhar receita" style={{ color: 'var(--on-surface)' }}><Icon name="share" /></button>
      </div>

      <div className="detail pad">
        <div className="detail__hero">
          <div className="photo" style={{ aspectRatio: '4/3', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}>
            <RecipeImage recipe={recipe} />
            <div className="grad" />
            <span className="badge badge--glass photo__tl" style={{ color: 'var(--secondary)' }}><Icon name="schedule" />{recipe.minutes} min</span>
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
              {recipe.tags.filter((t) => t.tone === 'sage').map((t) => <span key={t.label} className="badge badge--sage" style={{ background: 'var(--tertiary-fixed)', color: 'var(--on-tertiary-fixed)', height: 30 }}><Icon name={t.icon} />{t.label}</span>)}
              <SaveButton saved={saved} onToggle={onToggleSave} title={recipe.title} />
            </div>
            <div className="photo__bl">
              <span className="badge" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', textTransform: 'uppercase' }}>{recipe.difficulty}</span>
              <span className="badge badge--glass"><Icon name="local_fire_department" />{recipe.mood}</span>
            </div>
          </div>
          <div className="stack" style={{ gap: '.5rem' }}>
            <h1 className="h-lg">{recipe.title}</h1>
            <p className="muted" style={{ margin: 0 }}>{recipe.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} aria-label={`Nota ${recipe.rating} de 5`}>
              <span className="stars">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" fill />)}</span>
              <b className="label-md">{recipe.rating.toString().replace('.', ',')}</b>
              <span className="body-sm muted">({recipe.ratingCount} cozinheiros aprovaram)</span>
            </div>
          </div>
          <button className="askchef" onClick={() => onAskChef(recipe)}>
            <span className="askchef__icon"><Icon name="auto_awesome" /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="label-lg" style={{ display: 'block', color: 'var(--primary)' }}>Quer substituir algum item?</span>
              <span className="body-sm muted clamp1" style={{ display: 'block' }}>Tire dúvidas ao vivo com o Chef no Chat</span>
            </span>
            <Icon name="chevron_right" />
          </button>
        </div>

        <div className="stack" style={{ gap: '1.5rem' }}>
          <div className="yield">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--primary)' }}><Icon name="restaurant" />Rendimento</span>
            <div className="stepper">
              <button aria-label="Diminuir porções" disabled={servings <= 1} onClick={() => setServings((s) => Math.max(1, s - 1))}><Icon name="remove" /></button>
              <span aria-live="polite">{servings} {servings === 1 ? 'porção' : 'porções'}</span>
              <button aria-label="Aumentar porções" disabled={servings >= 12} onClick={() => setServings((s) => Math.min(12, s + 1))}><Icon name="add" /></button>
            </div>
          </div>

          <section className="stack" style={{ gap: '.75rem' }}>
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <h2 className="h-md">Ingredientes</h2>
                <span className="label-sm muted">{checked.size} de {recipe.ingredients.length} marcados</span>
              </div>
              {checked.size > 0 && <button className="label-md primary" style={{ minHeight: 40 }} onClick={() => setChecked(new Set())}>Limpar</button>}
            </div>
            <p className="body-sm muted" style={{ margin: 0 }}>Marque os itens enquanto separa na bancada:</p>
            <ul className="stack" style={{ gap: '.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {recipe.ingredients.map((ing) => (
                <li key={ing.id}>
                  <button className={`ing${checked.has(ing.id) ? ' done' : ''}`} aria-pressed={checked.has(ing.id)} onClick={() => toggleCheck(ing.id)}>
                    <span className="check"><Icon name="check" /></span>
                    <span className="ing__name">{ing.name}</span>
                    <span className="ing__qty">{formatQty(ing, factor)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="stack" style={{ gap: '.75rem' }}>
            <div className="section-head">
              <h2 className="h-md">Modo de Preparo</h2>
              <span className="badge badge--sage"><Icon name="local_dining" />{recipe.steps.length} passos</span>
            </div>
            <ol className="stack" style={{ gap: '1rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {recipe.steps.map((s, i) => (
                <li key={s.title} className="step">
                  <div className="step__head">
                    <span className="step__num">{i + 1}</span>
                    <span className="step__title">{s.title}</span>
                    {s.minutes && <span className="badge badge--warm"><Icon name="timer" />{s.minutes} min</span>}
                    {s.note && <span className="badge badge--sage">{s.note}</span>}
                  </div>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="chef">
            <span className="ico-circle" style={{ background: 'var(--primary-container)', color: '#fff' }}><Icon name="lightbulb" /></span>
            <div><div className="label-sm primary" style={{ textTransform: 'uppercase' }}>Segredo do chef</div><p className="body-sm" style={{ margin: '4px 0 0' }}><em>{recipe.chefTip}</em></p></div>
          </aside>
        </div>
      </div>

      <div className="actionbar">
        <div className="actionbar__in">
          <button className="iconbtn" aria-label="Perguntar ao Chef sobre esta receita" onClick={() => onAskChef(recipe)}><Icon name="forum" /></button>
          <button className="iconbtn" aria-pressed={saved} aria-label={saved ? 'Remover dos salvos' : 'Salvar receita'} onClick={onToggleSave}><Icon name="bookmark" fill={saved} /></button>
          <button className="btn btn--primary" onClick={() => setCooking(true)}><Icon name="skillet" size={20} />Modo Cozinhar</button>
        </div>
      </div>

      {cooking && <CookMode recipe={recipe} onClose={() => setCooking(false)} />}
    </>
  );
}

function CookMode({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const [i, setI] = useState(0);
  const step = recipe.steps[i];
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => { setLeft(null); }, [i]);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft((l) => (l === null ? null : l - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="cook" role="dialog" aria-modal="true" aria-label={`Modo cozinhar: ${recipe.title}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        <span className="label-md muted">Passo {i + 1} de {recipe.steps.length}</span>
        <button className="iconbtn" aria-label="Sair do modo cozinhar" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="cook__body">
        <div className="cook__bar"><i style={{ width: `${((i + 1) / recipe.steps.length) * 100}%` }} /></div>
        <h2 className="display" style={{ margin: 0, fontSize: 30, lineHeight: '36px' }}>{step.title}</h2>
        <p className="cook__text" style={{ margin: 0 }}>{step.text}</p>
        {step.minutes && (
          <button className="timer" onClick={() => setLeft(left === null ? step.minutes! * 60 : null)}>
            <Icon name="timer" />{left === null ? `Iniciar timer de ${step.minutes} min` : left === 0 ? 'Tempo! Pode conferir' : `${mm(left)} · toque para parar`}
          </button>
        )}
      </div>
      <div className="cook__nav">
        <button className="btn btn--ghost" disabled={i === 0} style={{ opacity: i === 0 ? .4 : 1 }} onClick={() => setI(i - 1)}><Icon name="arrow_back" size={18} />Anterior</button>
        {i < recipe.steps.length - 1
          ? <button className="btn btn--primary" onClick={() => setI(i + 1)}>Próximo<Icon name="arrow_forward" size={18} /></button>
          : <button className="btn btn--primary" onClick={onClose}><Icon name="check" size={18} />Prato pronto!</button>}
      </div>
    </div>
  );
}

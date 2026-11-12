import { Fragment } from 'react';
import { CATEGORIES, RECIPES } from '../data/recipes';
import { hrefs } from '../lib/useHashRoute';
import { recipeMatches } from '../lib/text';
import { EmptyState, Icon, RecipeCardGrid } from '../components/ui';
import type { Filters } from '../App';

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
}

export const DEFAULT_FILTERS: Filters = { category: 'todas', maxMinutes: null, difficulty: 'todas', few: false, term: '' };

export default function Recipes({ filters, setFilters, isSaved, toggle }: Props) {
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const list = RECIPES.filter((r) =>
    (filters.category === 'todas' || r.category === filters.category) &&
    (filters.maxMinutes === null || r.minutes <= filters.maxMinutes) &&
    (filters.difficulty === 'todas' || r.difficulty === filters.difficulty) &&
    (!filters.few || r.ingredients.length <= 6) &&
    recipeMatches(r, filters.term),
  );
  const active: { label: string; clear: () => void }[] = [];
  if (filters.category !== 'todas') active.push({ label: CATEGORIES.find((c) => c.id === filters.category)!.label, clear: () => set({ category: 'todas' }) });
  if (filters.maxMinutes !== null) active.push({ label: `Até ${filters.maxMinutes} min`, clear: () => set({ maxMinutes: null }) });
  if (filters.difficulty !== 'todas') active.push({ label: filters.difficulty, clear: () => set({ difficulty: 'todas' }) });
  if (filters.few) active.push({ label: 'Poucos ingredientes', clear: () => set({ few: false }) });
  const hasFilters = active.length > 0 || filters.term !== '';

  return (
    <div className="stack" style={{ gap: '.5rem', paddingBottom: '2rem' }}>
      <section className="pad stack" style={{ paddingTop: '1rem', gap: '.5rem' }}>
        <label className="search search--soft">
          <Icon name="search" />
          <span className="sr-only">Buscar receitas</span>
          <input value={filters.term} onChange={(e) => set({ term: e.target.value })} placeholder="Buscar por nome, ingrediente ou tipo de prato..." type="search" />
          {filters.term && <button type="button" className="search__clear" aria-label="Limpar busca" onClick={() => set({ term: '' })}><Icon name="close" size={18} /></button>}
        </label>
        <div className="results-bar" aria-live="polite">
          <span className="label-md muted"><span className="dot" />{list.length} {list.length === 1 ? 'receita encontrada' : 'receitas encontradas'}</span>
          {hasFilters && <button className="label-sm primary" style={{ minHeight: 40, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setFilters(DEFAULT_FILTERS)}>Limpar filtros <Icon name="refresh" size={14} /></button>}
        </div>
      </section>

      <div className="filters-row no-scrollbar" role="group" aria-label="Categorias">
        <button className={`chip${filters.category === 'todas' ? ' on' : ''}`} onClick={() => set({ category: 'todas' })}>Todas</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={`chip${filters.category === c.id ? ' on' : ''}`} onClick={() => set({ category: filters.category === c.id ? 'todas' : c.id })}>{c.label}</button>
        ))}
        <button className={`chip${filters.maxMinutes === 30 ? ' on' : ''}`} onClick={() => set({ maxMinutes: filters.maxMinutes === 30 ? null : 30 })}>Até 30 min</button>
      </div>

      <div className="filters-row no-scrollbar" role="group" aria-label="Filtros rápidos">
        <label className="pill"><Icon name="schedule" size={16} />
          <select aria-label="Tempo de preparo" value={filters.maxMinutes ?? ''} onChange={(e) => set({ maxMinutes: e.target.value ? Number(e.target.value) : null })}>
            <option value="">Tempo: Todos</option><option value="20">Até 20 min</option><option value="30">Até 30 min</option><option value="45">Até 45 min</option>
          </select><Icon name="expand_more" size={14} />
        </label>
        <label className="pill"><Icon name="tune" size={16} />
          <select aria-label="Dificuldade" value={filters.difficulty} onChange={(e) => set({ difficulty: e.target.value as Filters['difficulty'] })}>
            <option value="todas">Dificuldade</option><option value="Fácil">Fácil</option><option value="Médio">Médio</option>
          </select><Icon name="expand_more" size={14} />
        </label>
        <button className={`pill${filters.few ? ' on' : ''}`} aria-pressed={filters.few} onClick={() => set({ few: !filters.few })}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--tertiary)' }} />Poucos Ingredientes
        </button>
      </div>

      {active.length > 0 && (
        <div className="pad" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="label-sm muted">Filtros ativos:</span>
          {active.map((a) => (
            <span key={a.label} className="badge" style={{ background: 'var(--surface-highest)', color: 'var(--on-surface-variant)' }}>
              {a.label}<button aria-label={`Remover filtro ${a.label}`} onClick={a.clear} style={{ display: 'grid', placeItems: 'center' }}><Icon name="close" size={12} /></button>
            </span>
          ))}
        </div>
      )}

      <section className="pad" style={{ paddingTop: '.5rem' }} aria-live="polite">
        {list.length === 0 ? (
          <EmptyState icon="soup_kitchen" title="Nenhuma receita encontrada" text="Que tal tentar outro ingrediente ou pedir uma sugestão criativa para o Chef?">
            <button className="btn btn--primary" onClick={() => setFilters(DEFAULT_FILTERS)}>Ver todas as receitas</button>
            <a className="btn btn--ghost" href={hrefs.chat}><Icon name="auto_awesome" size={18} />Perguntar ao Chat</a>
          </EmptyState>
        ) : (
          <div className="rgrid">
            {list.map((r, i) => (
              <Fragment key={r.id}>
                <RecipeCardGrid recipe={r} saved={isSaved(r.id)} onToggle={() => toggle(r.id)} />
                {i === 3 && (
                  <div className="promo">
                    <span className="label-md" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Icon name="kitchen" />Sobrou algo na despensa?</span>
                    <p className="body-sm muted" style={{ margin: 0 }}>Diga o que você tem na geladeira e o Chef sugere uma receita sob medida.</p>
                    <a className="btn btn--primary" style={{ minHeight: 48 }} href={hrefs.chat}><Icon name="auto_awesome" size={18} />Perguntar ao Chat</a>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

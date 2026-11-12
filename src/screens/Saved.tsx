import { useState } from 'react';
import { RECIPES } from '../data/recipes';
import { hrefs } from '../lib/useHashRoute';
import { norm, recipeMatches } from '../lib/text';
import { EmptyState, Icon, RecipeImage, SaveButton } from '../components/ui';
import type { Recipe } from '../data/types';

type Tab = 'todas' | 'almoco' | 'rapidas' | 'sobremesas';
type Sort = 'recentes' | 'az' | 'rapidas';
const SORTS: { id: Sort; label: string }[] = [{ id: 'recentes', label: 'Mais recentes' }, { id: 'az', label: 'A a Z' }, { id: 'rapidas', label: 'Mais rápidas' }];

interface Props { ids: string[]; onRemove: (r: Recipe) => void; onToggle: (id: string) => void }

export default function Saved({ ids, onRemove, onToggle }: Props) {
  const [term, setTerm] = useState('');
  const [tab, setTab] = useState<Tab>('todas');
  const [sort, setSort] = useState<Sort>('recentes');

  // ordem de salvamento: mais recente primeiro
  const saved = ids.map((id) => RECIPES.find((r) => r.id === id)).filter((r): r is Recipe => !!r).reverse();
  const inTab = (r: Recipe, t: Tab) => t === 'todas' || (t === 'almoco' && r.meal === 'almoco-jantar') || (t === 'rapidas' && r.minutes <= 25) || (t === 'sobremesas' && r.meal === 'sobremesa');
  const tabs: { id: Tab; label: string }[] = [
    { id: 'todas', label: 'Todas' }, { id: 'almoco', label: 'Almoço & Jantar' }, { id: 'rapidas', label: 'Rápidas' }, { id: 'sobremesas', label: 'Sobremesas' },
  ];
  const shown = saved.filter((r) => inTab(r, tab) && recipeMatches(r, term)).sort((a, b) =>
    sort === 'az' ? norm(a.title).localeCompare(norm(b.title)) : sort === 'rapidas' ? a.minutes - b.minutes : 0);

  return (
    <div className="stack" style={{ gap: '1rem', paddingBottom: '2rem' }}>
      <section className="pad stack" style={{ paddingTop: '1rem', gap: '.25rem' }}>
        <span className="label-sm primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="bookmark_heart" size={16} />Livro de Memórias & Panela</span>
        <h1 className="display" style={{ margin: 0, fontSize: 32 }}>Minhas Receitas Salvas</h1>
        <p className="muted" style={{ margin: 0 }}>Seu caderno digital com as receitas prontas para ir pra panela.</p>
      </section>

      {saved.length === 0 ? (
        <section className="pad">
          <div className="card">
            <EmptyState icon="menu_book" title="Nenhuma receita salva por enquanto?" text="Quando encontrar um prato que der água na boca, toque no ícone de marcador para guardar aqui.">
              <a className="btn btn--primary" href={hrefs.receitas}><Icon name="explore" size={18} />Explorar Receitas</a>
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section className="pad">
            <label className="search search--soft" style={{ maxWidth: 560 }}>
              <Icon name="search" />
              <span className="sr-only">Buscar entre as salvas</span>
              <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar entre as salvas..." type="search" />
              {term && <button type="button" className="search__clear" aria-label="Limpar busca" onClick={() => setTerm('')}><Icon name="close" size={18} /></button>}
            </label>
          </section>
          <div className="filters-row no-scrollbar" role="group" aria-label="Filtrar salvas">
            {tabs.map((t) => (
              <button key={t.id} className={`chip${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}<span className="count">{saved.filter((r) => inTab(r, t.id)).length}</span>
              </button>
            ))}
          </div>
          <section className="pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} aria-live="polite">
            <span className="label-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span className="dot" style={{ background: 'var(--secondary-container)' }} />{shown.length} {shown.length === 1 ? 'receita em exibição' : 'receitas em exibição'}</span>
            <button className="label-md primary" style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setSort(SORTS[(SORTS.findIndex((s) => s.id === sort) + 1) % SORTS.length].id)}>
              <Icon name="tune" size={18} />Ordenar: {SORTS.find((s) => s.id === sort)!.label}
            </button>
          </section>

          {shown.length === 0 ? (
            <section className="pad"><EmptyState icon="search_off" title="Nada por aqui" text="Nenhuma receita salva combina com essa busca ou filtro." /></section>
          ) : (
            <section className="pad sgrid">
              {shown.map((r) => (
                <article key={r.id} className="card scard">
                  <div className="photo">
                    <RecipeImage recipe={r} />
                    {r.badge && <span className="badge badge--glass photo__tl" style={{ color: 'var(--secondary)' }}><Icon name={r.badge.icon} />{r.badge.label}</span>}
                    <SaveButton saved onToggle={() => onToggle(r.id)} title={r.title} />
                    <div className="photo__bl"><span className="badge badge--glass"><Icon name="schedule" />{r.minutes} min</span><span className="badge badge--glass"><Icon name={r.minutes <= 15 ? 'speed' : 'sentiment_satisfied'} />{r.minutes <= 15 ? 'Vapt-vupt' : r.difficulty}</span></div>
                  </div>
                  <div className="scard__body">
                    <h2 className="h-md">{r.title}</h2>
                    <p className="body-sm muted" style={{ margin: 0 }}>{r.shortDescription}</p>
                    <div className="scard__foot">
                      <span className="scard__serves body-sm"><span className="ico-circle"><Icon name="restaurant_menu" /></span>Serve {r.servingsLabel}</span>
                      <button className="iconbtn" aria-label={`Remover ${r.title} dos salvos`} onClick={() => onRemove(r)} style={{ color: 'var(--on-surface-variant)', width: 44, height: 44 }}><Icon name="delete_outline" /></button>
                      <a className="btn btn--primary" style={{ minHeight: 48 }} href={hrefs.receita(r.id)}>Ver receita<Icon name="arrow_forward" size={18} /></a>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}

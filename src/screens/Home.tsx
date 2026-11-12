import { useState } from 'react';
import { CATEGORIES, RECIPES } from '../data/recipes';
import { hrefs } from '../lib/useHashRoute';
import { recipeMatches } from '../lib/text';
import { EmptyState, Icon, RecipeImage, SaveButton } from '../components/ui';
import type { Filters } from '../App';

interface Props {
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  setFilters: (f: Filters) => void;
}

export default function Home({ isSaved, toggle, setFilters }: Props) {
  const [term, setTerm] = useState('');
  const featured = RECIPES[0];
  const dinner = RECIPES.filter((r) => ['frango-quiabo', 'penne-caju', 'picadinho'].includes(r.id));
  const results = term.trim() ? RECIPES.filter((r) => recipeMatches(r, term)) : null;

  const goFilter = (f: Partial<Filters>) => {
    setFilters({ category: 'todas', maxMinutes: null, difficulty: 'todas', few: false, term: '', ...f });
    window.location.hash = hrefs.receitas;
  };

  return (
    <div className="stack" style={{ gap: '1.5rem', paddingBottom: '2rem' }}>
      <section className="pad hello">
        <span className="kicker label-sm"><Icon name="local_fire_department" />Inspiração culinária diária</span>
        <h1 className="display" style={{ margin: '.25rem 0 0' }}>O que deu vontade de comer hoje?</h1>
        <p className="muted" style={{ margin: 0 }}>Receitas caseiras com afeto, praticidade e aquele toque de chef.</p>
      </section>

      <section className="pad">
        <form className="stack" style={{ flexDirection: 'row', gap: '.5rem' }} onSubmit={(e) => e.preventDefault()} role="search">
          <label className="search">
            <Icon name="search" />
            <span className="sr-only">Buscar prato ou ingrediente</span>
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar prato, ingrediente ou desejo..." type="search" />
            {term && <button type="button" className="search__clear" aria-label="Limpar busca" onClick={() => setTerm('')}><Icon name="close" size={18} /></button>}
          </label>
          <button type="button" className="iconbtn" aria-label="Ver todos os filtros" style={{ width: 52, height: 52, background: 'var(--primary-container)', color: '#fff', boxShadow: '0 8px 16px rgba(184,79,47,.25)' }} onClick={() => goFilter({ term })}>
            <Icon name="tune" />
          </button>
        </form>
      </section>

      {results ? (
        <section className="pad stack" style={{ gap: '.75rem' }} aria-live="polite">
          <p className="label-md muted" style={{ margin: 0 }}>{results.length} {results.length === 1 ? 'resultado' : 'resultados'} para “{term}”</p>
          {results.length === 0 ? (
            <EmptyState icon="soup_kitchen" title="Nenhuma receita encontrada" text="Que tal tentar outro ingrediente ou pedir uma sugestão criativa para o Chef no chat?">
              <a className="btn btn--primary" href={hrefs.chat}><Icon name="auto_awesome" size={18} />Perguntar ao Chat</a>
            </EmptyState>
          ) : (
            <div className="home-grid home-grid--cards">
              {results.map((r) => <ListCard key={r.id} id={r.id} isSaved={isSaved} toggle={toggle} />)}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="home-split pad" style={{ padding: 0 }}>
            <div className="stack" style={{ gap: '1.5rem' }}>
              <section className="pad">
                <div className="assistant">
                  <span className="assistant__bg"><Icon name="skillet" /></span>
                  <div className="stack" style={{ gap: '.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="ico-circle" style={{ background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' }}><Icon name="smart_toy" /></span>
                      <span className="label-md" style={{ color: 'var(--tertiary)' }}>Chef Virtual Fome de Ideia</span>
                    </div>
                    <h2 className="h-sm">Geladeira cheia e zero inspiração?</h2>
                    <p className="body-sm muted" style={{ margin: 0 }}>Diga o que você tem na bancada e crie um banquete sem desperdício.</p>
                    <a className="btn btn--primary" style={{ width: 'fit-content', minHeight: 48 }} href={hrefs.chat}><Icon name="auto_awesome" size={18} />Pedir Ideia de Receita</a>
                  </div>
                </div>
              </section>

              <section>
                <div className="pad section-head" style={{ marginBottom: '.5rem' }}>
                  <h2 className="h-sm">Explorar por Vontade</h2>
                  <a className="label-md primary" href={hrefs.receitas}>Ver tudo</a>
                </div>
                <div className="cats no-scrollbar">
                  <button className="cat" onClick={() => goFilter({ maxMinutes: 20 })}>
                    <span className="cat__box warm"><Icon name="timer" /></span><span className="label-sm">Até 20 min</span>
                  </button>
                  {CATEGORIES.map((c) => (
                    <button key={c.id} className="cat" onClick={() => goFilter({ category: c.id })}>
                      <span className={`cat__box${c.id === 'vegetarianas' ? ' sage' : ''}`}><Icon name={c.icon} /></span>
                      <span className="label-sm">{c.homeLabel}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <section className="pad stack" style={{ gap: '.75rem' }}>
              <div className="section-head">
                <h2 className="h-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="stars" fill />Inspiração do Dia</h2>
                <span className="body-sm muted">Curadoria do Chef</span>
              </div>
              <article className="card featured">
                <div className="photo">
                  <RecipeImage recipe={featured} />
                  <div className="grad" />
                  <span className="badge badge--glass photo__tl" style={{ color: 'var(--secondary)' }}><Icon name="local_fire_department" />Destaque</span>
                  <div style={{ position: 'absolute', top: 12, right: 12 }}><SaveButton saved={isSaved(featured.id)} onToggle={() => toggle(featured.id)} title={featured.title} /></div>
                  <div className="photo__bl" style={{ color: '#fff' }}>
                    <span className="badge" style={{ background: 'rgba(39,24,19,.55)', backdropFilter: 'blur(8px)', color: '#fff' }}><Icon name="schedule" />{featured.minutes} min</span>
                    <span className="badge" style={{ background: 'rgba(39,24,19,.55)', backdropFilter: 'blur(8px)', color: '#fff' }}><Icon name="equalizer" />{featured.difficulty}</span>
                    <span className="badge" style={{ background: 'rgba(39,24,19,.55)', backdropFilter: 'blur(8px)', color: '#fff' }}><Icon name="group" />{featured.baseServings} porções</span>
                  </div>
                </div>
                <div className="featured__body">
                  <h3 className="h-md">{featured.title}</h3>
                  <p className="muted" style={{ margin: 0 }}>{featured.shortDescription}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 6 }}>{featured.tags.map((t) => <span key={t.label} className={`badge badge--${t.tone}`}>{t.label.replace(' Baiana', '')}</span>)}</div>
                    <a className="btn" style={{ color: 'var(--primary)', minHeight: 48, padding: 0 }} href={hrefs.receita(featured.id)}>Ver modo de preparo <Icon name="arrow_forward" size={18} /></a>
                  </div>
                </div>
              </article>
            </section>
          </div>

          <section className="pad stack" style={{ gap: '.75rem' }}>
            <div className="section-head">
              <div><h2 className="h-md">Ideias para o Jantar</h2><p className="body-sm muted" style={{ margin: 0 }}>Pratos rápidos para confortar a sua noite</p></div>
              <a className="label-md primary" href={hrefs.receitas}>Ver mais</a>
            </div>
            <div className="home-grid home-grid--cards">
              {dinner.map((r) => <ListCard key={r.id} id={r.id} isSaved={isSaved} toggle={toggle} />)}
            </div>
          </section>

          <section className="pad">
            <div className="tip">
              <span className="tip__icon"><Icon name="lightbulb" /></span>
              <div><h3 className="label-lg" style={{ margin: 0, font: '600 15px/20px var(--font-sans)' }}>Dica da Cozinha Fome de Ideia</h3>
                <p className="body-sm muted" style={{ margin: '4px 0 0' }}>Para que o molho da massa incorpore melhor, adicione sempre meia concha da água fervente do cozimento diretamente na frigideira ao finalizar.</p></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ListCard({ id, isSaved, toggle }: { id: string; isSaved: (id: string) => boolean; toggle: (id: string) => void }) {
  const r = RECIPES.find((x) => x.id === id)!;
  const tag = r.tags[0];
  return (
    <article className="card lcard" style={{ position: 'relative' }}>
      <div className="thumb"><RecipeImage recipe={r} /></div>
      <div className="lcard__body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="badge badge--warm">{r.minutes} min</span><span className="label-sm muted">{r.mood}</span>
        </div>
        <h3 className="lcard__title">{r.title}</h3>
        <p className="body-sm muted clamp1" style={{ margin: 0 }}>{r.shortDescription}</p>
        {tag && <span className="label-sm" style={{ color: 'var(--tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name={tag.icon} size={16} />{tag.label}</span>}
      </div>
      <a href={hrefs.receita(r.id)} aria-label={`Abrir ${r.title}`} style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }} />
      <div style={{ position: 'relative', zIndex: 2 }}><SaveButton saved={isSaved(r.id)} onToggle={() => toggle(r.id)} title={r.title} /></div>
    </article>
  );
}

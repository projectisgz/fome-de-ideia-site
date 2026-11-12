import { useEffect, useState, type ReactNode } from 'react';
import type { Recipe } from '../data/types';
import { hrefs, type Route } from '../lib/useHashRoute';
import { IMAGE_URLS } from '../data/imageUrls';
import { useAuth } from '../auth/AuthContext';

export function Icon({ name, fill, size }: { name: string; fill?: boolean; size?: number }) {
  return (
    <span className={`material-symbols-outlined${fill ? ' fill' : ''}`} style={size ? { fontSize: size } : undefined} aria-hidden="true">
      {name}
    </span>
  );
}

/** Foto da receita: tenta a URL do Stitch, depois a imagem local, depois um espaço reservado com a mesma proporção. */
export function RecipeImage({ recipe, className }: { recipe: Recipe; className?: string }) {
  const sources = [recipe.image.remote, recipe.image.local].filter(Boolean) as string[];
  const [idx, setIdx] = useState(0);
  const src = sources[idx];
  return (
    <div className={`photo ${className ?? ''}`} style={{ width: '100%', height: '100%' }}>
      {src ? (
        <img src={src} alt={recipe.image.alt} loading="lazy" onError={() => setIdx((i) => i + 1)} />
      ) : (
        <div className="photo__ph" role="img" aria-label={recipe.image.alt}><Icon name="soup_kitchen" /></div>
      )}
    </div>
  );
}

export function SaveButton({ saved, onToggle, title }: { saved: boolean; onToggle: () => void; title: string }) {
  return (
    <button
      type="button"
      className={`save${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remover ${title} dos salvos` : `Salvar ${title}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
    >
      <Icon name="bookmark" fill={saved} size={22} />
    </button>
  );
}

const TITLES: Record<string, string> = { home: 'Início', receitas: 'Receitas', receita: 'Receita', chat: 'Chat', salvos: 'Salvos', entrar: 'Sua conta', perfil: 'Meu perfil' };

export function Header({ route }: { route: Route }) {
  const { user, loading } = useAuth();
  const active = route.name === 'receita' ? 'receitas' : route.name;
  return (
    <header className="header">
      <div className="header__in">
        <a className="brand" href={hrefs.home} aria-label="Fome de Ideia, ir para o início">
          <span className="brand__mark"><Icon name="skillet" size={20} /></span>
          <span style={{ minWidth: 0 }}>
            <span className="brand__title">
              <span className="brand__name">Fome de Ideia</span>
              <span className="brand__dot">·</span>
              <span className="brand__section">{TITLES[route.name]}</span>
            </span>
            <span className="brand__tag label-sm">Bateu a fome. Pintou a ideia.</span>
          </span>
        </a>
        <nav className="topnav" aria-label="Principal">
          {NAV.map((n) => (
            <a key={n.id} href={n.href} className={active === n.id ? 'active' : ''} aria-current={active === n.id ? 'page' : undefined}>
              <Icon name={n.icon} fill={active === n.id} />{n.label}
            </a>
          ))}
        </nav>
        {user ? (
          <a className="avatar account-avatar" href={hrefs.perfil} title="Meu perfil" aria-label="Abrir meu perfil">
            {(user.email?.[0] ?? 'U').toUpperCase()}
          </a>
        ) : (
          <a className="avatar account-avatar" href="#/entrar" aria-label={loading ? 'Conta' : 'Entrar na conta'} title="Entrar na conta"><Icon name="person" size={20} /></a>
        )}
      </div>
    </header>
  );
}

export const NAV = [
  { id: 'home', label: 'Início', icon: 'home', href: hrefs.home },
  { id: 'receitas', label: 'Receitas', icon: 'menu_book', href: hrefs.receitas },
  { id: 'chat', label: 'Chat', icon: 'auto_awesome', href: hrefs.chat },
  { id: 'salvos', label: 'Salvos', icon: 'bookmark', href: hrefs.salvos },
] as const;

export function BottomNav({ route }: { route: Route }) {
  const active = route.name === 'receita' ? 'receitas' : route.name;
  return (
    <nav className="bottomnav" aria-label="Principal">
      <div className="bottomnav__in">
        {NAV.map((n) => (
          <a key={n.id} href={n.href} className={`navbtn${active === n.id ? ' active' : ''}`} aria-current={active === n.id ? 'page' : undefined}>
            <Icon name={n.icon} />
            <span className="label-sm">{n.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export interface ToastState { message: string; undo?: () => void; key: number; icon?: string }

export function Toast({ toast }: { toast: ToastState | null }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  return (
    <div className={`toast${visible ? ' show' : ''}`} role="status" aria-live="polite">
      <Icon name={toast?.icon ?? 'bookmark_remove'} size={18} />
      <span>{toast?.message}</span>
      {toast?.undo && <button type="button" onClick={() => { toast.undo?.(); setVisible(false); }}>Desfazer</button>}
    </div>
  );
}

export function EmptyState({ icon, title, text, children }: { icon: string; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__icon"><Icon name={icon} /></div>
      <h3 className="h-sm">{title}</h3>
      <p className="body-sm muted">{text}</p>
      {children}
    </div>
  );
}

export function RecipeCardGrid({ recipe, saved, onToggle }: { recipe: Recipe; saved: boolean; onToggle: () => void }) {
  const tag = recipe.tags[0];
  return (
    <article className="card rcard">
      <div className="photo" style={{ aspectRatio: '1' }}>
        <RecipeImage recipe={recipe} />
        <SaveButton saved={saved} onToggle={onToggle} title={recipe.title} />
        <span className="badge badge--glass photo__bl" style={{ width: 'fit-content', right: 'auto' }}><Icon name="timer" />{recipe.minutes} min</span>
      </div>
      <div className="rcard__body">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="badge badge--warm">{recipe.difficulty}</span>
          {tag && <span className={`badge badge--${tag.tone}`}>{recipe.mood === 'Vapt-vupt' ? recipe.mood : tag.label}</span>}
        </div>
        <h3 className="rcard__title">{recipe.title}</h3>
        <div className="rcard__foot body-sm"><span>{recipe.servingsLabel}</span><Icon name="arrow_forward" size={18} /></div>
      </div>
      <a className="rcard__link" href={hrefs.receita(recipe.id)} aria-label={`Abrir ${recipe.title}`} />
    </article>
  );
}

import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'receitas' }
  | { name: 'receita'; id: string }
  | { name: 'chat' }
  | { name: 'salvos' }
  | { name: 'entrar' }
  | { name: 'perfil' };

function parse(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  switch (parts[0]) {
    case 'receitas': return { name: 'receitas' };
    case 'receita': return parts[1] ? { name: 'receita', id: decodeURIComponent(parts[1]) } : { name: 'receitas' };
    case 'chat': return { name: 'chat' };
    case 'salvos': return { name: 'salvos' };
    case 'entrar': return { name: 'entrar' };
    case 'perfil': return { name: 'perfil' };
    default: return { name: 'home' };
  }
}

export const hrefs = {
  home: '#/',
  receitas: '#/receitas',
  receita: (id: string) => `#/receita/${encodeURIComponent(id)}`,
  chat: '#/chat',
  salvos: '#/salvos',
  entrar: '#/entrar',
  perfil: '#/perfil',
};

/** Roteamento por hash: o botão Voltar e a atualização da página funcionam sem dependências extras. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => { setRoute(parse(window.location.hash)); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

import { useCallback, useEffect, useState } from 'react';
import { getRecipe } from './data/recipes';
import type { Recipe } from './data/types';
import type { ChatMessage } from './chat';
import { hrefs, useHashRoute } from './lib/useHashRoute';
import { useSavedRecipes } from './lib/useSavedRecipes';
import { BottomNav, Header, Toast, type ToastState } from './components/ui';
import Home from './screens/Home';
import Recipes, { DEFAULT_FILTERS } from './screens/Recipes';
import RecipeDetail from './screens/RecipeDetail';
import Chat from './screens/Chat';
import Saved from './screens/Saved';
import Auth from './screens/Auth';
import Profile from './screens/Profile';
import { useAuth } from './auth/AuthContext';

export interface Filters {
  category: string;
  maxMinutes: number | null;
  difficulty: 'todas' | 'Fácil' | 'Médio';
  few: boolean;
  term: string;
}

export default function App() {
  const route = useHashRoute();
  const { user, recovery } = useAuth();
  const { ids, isSaved, toggle } = useSavedRecipes(user?.id ?? null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<ToastState | null>(null);
  // Receita em contexto no chat: vem da última receita aberta e permanece ao navegar entre abas.
  const [chatRecipeId, setChatRecipeId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>({});

  const setThread = useCallback((key: string, msgs: ChatMessage[]) => setThreads((t) => ({ ...t, [key]: msgs })), []);

  const removeWithUndo = (r: Recipe) => {
    toggle(r.id);
    setToast({ key: Date.now(), message: 'Receita removida dos salvos', undo: () => toggle(r.id) });
  };
  const toggleWithToast = (id: string) => {
    const r = getRecipe(id);
    if (isSaved(id) && r) return removeWithUndo(r);
    toggle(id);
    setToast({ key: Date.now(), message: 'Receita salva no caderno', icon: 'bookmark_added' });
  };
  const askChef = (r: Recipe) => { setChatRecipeId(r.id); window.location.hash = hrefs.chat; };

  // Abrir uma receita define o contexto do chat
  const openedId = route.name === 'receita' ? route.id : null;
  useEffect(() => { if (openedId && getRecipe(openedId)) setChatRecipeId(openedId); }, [openedId]);
  useEffect(() => { if (recovery) window.location.hash = hrefs.entrar; }, [recovery]);

  return (
    <>
      <Header route={route} />
      <main className={`page${route.name === 'receita' ? ' page--detail' : ''}${route.name === 'entrar' ? ' page--auth' : ''}${route.name === 'perfil' ? ' page--profile' : ''}`}>
        {route.name === 'home' && <Home isSaved={isSaved} toggle={toggleWithToast} setFilters={setFilters} />}
        {route.name === 'receitas' && <Recipes filters={filters} setFilters={setFilters} isSaved={isSaved} toggle={toggleWithToast} />}
        {route.name === 'receita' && <RecipeDetail id={route.id} saved={isSaved(route.id)} onToggleSave={() => toggleWithToast(route.id)} onAskChef={askChef} />}
        {route.name === 'chat' && <Chat recipe={getRecipe(chatRecipeId)} onClearContext={() => setChatRecipeId(null)} threads={threads} setThread={setThread} />}
        {route.name === 'salvos' && <Saved ids={ids} onRemove={removeWithUndo} onToggle={toggleWithToast} />}
        {route.name === 'entrar' && <Auth />}
        {route.name === 'perfil' && <Profile />}
      </main>
      {route.name !== 'receita' && route.name !== 'entrar' && <BottomNav route={route} />}
      <Toast toast={toast} />
    </>
  );
}

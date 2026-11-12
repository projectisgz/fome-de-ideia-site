import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';

const GUEST_KEY = 'fome-de-ideia:saved:guest:v1';
const accountKey = (userId: string | null) => userId ? `fome-de-ideia:saved:user:${userId}:v1` : GUEST_KEY;

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch { return []; }
}

function write(key: string, ids: string[]) {
  try { localStorage.setItem(key, JSON.stringify(ids)); } catch { /* fallback to in-memory state */ }
}

/** Guests use browser storage; signed-in users sync their own bookmarks through RLS. */
export function useSavedRecipes(userId: string | null) {
  const key = accountKey(userId);
  const [ids, setIds] = useState<string[]>(() => read(key));

  useEffect(() => {
    let active = true;
    const localIds = read(key);
    setIds(localIds);
    if (!userId || !supabase) return () => { active = false; };
    const client = supabase;

    const sync = async () => {
      const { data, error } = await client.from('saved_recipes').select('recipe_id');
      if (error) { console.error('Não foi possível sincronizar as receitas salvas.', error); return; }
      const cloudIds = (data ?? []).map((row) => row.recipe_id);
      const guestIds = read(GUEST_KEY);
      const merged = [...new Set([...cloudIds, ...localIds, ...guestIds])];
      const cloudSet = new Set(cloudIds);
      const missing = merged.filter((id) => !cloudSet.has(id));
      if (missing.length) {
        const { error: insertError } = await client.from('saved_recipes').insert(missing.map((recipe_id) => ({ user_id: userId, recipe_id })));
        if (insertError) console.error('Não foi possível enviar todos os salvos para a conta.', insertError);
      }
      if (!active) return;
      write(key, merged);
      try { localStorage.removeItem(GUEST_KEY); } catch { /* storage can be unavailable */ }
      setIds(merged);
    };
    void sync();
    return () => { active = false; };
  }, [key, userId]);

  const toggle = useCallback((id: string) => {
    const exists = ids.includes(id);
    const next = exists ? ids.filter((x) => x !== id) : [...ids, id];
    setIds(next);
    write(key, next);
    if (!userId || !supabase) return;
    const client = supabase;
    const request = exists
      ? client.from('saved_recipes').delete().eq('recipe_id', id)
      : client.from('saved_recipes').insert({ user_id: userId, recipe_id: id });
    void request.then(({ error }) => { if (error) console.error('Não foi possível sincronizar esta alteração.', error); });
  }, [ids, key, userId]);

  const isSaved = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, isSaved, toggle };
}

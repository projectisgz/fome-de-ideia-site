import { useEffect, useMemo, useRef, useState } from 'react';
import { chatService, quickQuestions, type ChatMessage } from '../chat';
import type { Recipe } from '../data/types';
import { Icon, RecipeImage } from '../components/ui';

interface Props {
  recipe?: Recipe;
  onClearContext: () => void;
  /** Conversas guardadas pelo App, por contexto, para sobreviverem à troca de abas. */
  threads: Record<string, ChatMessage[]>;
  setThread: (key: string, msgs: ChatMessage[]) => void;
}

const time = (t: number) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
let counter = 0;
const uid = () => `m${Date.now()}-${counter++}`;

export default function Chat({ recipe, onClearContext, threads, setThread }: Props) {
  const key = recipe?.id ?? 'livre';
  const greeting: ChatMessage = useMemo(() => ({
    id: `greet-${key}`, role: 'assistant', createdAt: Date.now(),
    text: recipe
      ? `Olá! Estou de olho na ${recipe.title}. Teve alguma dúvida sobre ponto de cozimento, medidas ou quer criar uma versão com o que já tem na despensa? 🍲`
      : 'Olá! Sou o Chef Virtual. Conte o que tem na despensa ou pergunte sobre substituições, medidas e pontos de cozimento. 🍲',
  }), [key]);
  const messages = threads[key] ?? [greeting];
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, busy, key]);

  const send = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    const withUser = [...messages, { id: uid(), role: 'user' as const, text: question, createdAt: Date.now() }];
    setThread(key, withUser);
    setText('');
    setBusy(true);
    try {
      const r = await chatService.reply(question, withUser, { recipe });
      setThread(key, [...withUser, { ...r, id: uid(), role: 'assistant', createdAt: Date.now() }]);
    } catch {
      setThread(key, [...withUser, { id: uid(), role: 'assistant', createdAt: Date.now(), text: 'Não consegui responder agora. Tente de novo em instantes.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat__top">
        <div className="chef-id">
          <span className="chef-av"><Icon name="soup_kitchen" /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Chef Virtual <Icon name="auto_awesome" size={16} /></div>
            <div className="label-sm muted online"><i />Online para salvar seu almoço e jantar</div>
          </div>
          {recipe && <button className="chip" onClick={onClearContext}><Icon name="swap_horiz" size={18} />Modo Livre</button>}
        </div>
        {recipe && (
          <div className="ctx">
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><RecipeImage recipe={recipe} /></div>
            <div className="ctx__txt">
              <div className="label-sm" style={{ color: 'var(--secondary)' }}>Contexto ativo</div>
              <div className="h-sm clamp1" style={{ fontSize: 16 }}>{recipe.title}</div>
              <div className="body-sm muted clamp1">Adaptando substituições em tempo real</div>
            </div>
            <button className="iconbtn" aria-label="Remover contexto da receita" onClick={onClearContext}><Icon name="close" /></button>
          </div>
        )}
        {chatService.isDemo && (
          <div className="demo" role="note">
            <Icon name="science" />
            <span className="body-sm"><b>Modo demonstração:</b> as respostas são simuladas, sem IA real conectada.</span>
          </div>
        )}
      </div>

      <div className="msgs" role="log" aria-live="polite" aria-label="Conversa com o Chef Virtual">
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role === 'user' ? 'msg--user' : 'msg--bot'}`}>
            <div className="bubble">
              {m.heading && <div className="msg__head"><Icon name={m.portions ? 'group' : 'lightbulb'} size={18} />{m.heading}</div>}
              {m.text}
              {m.portions && (
                <div className="portions">
                  {m.portions.items.map((it) => <div key={it.name}><small>{it.name}</small><b>{it.qty}</b></div>)}
                </div>
              )}
            </div>
            <span className="msg__time label-sm">{time(m.createdAt)}</span>
          </div>
        ))}
        {busy && <div className="msg msg--bot"><div className="bubble typing" aria-label="O Chef está digitando"><i /><i /><i /></div></div>}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <div className="label-sm muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="tips_and_updates" size={16} />Perguntas rápidas</div>
        <div className="quick no-scrollbar">
          {quickQuestions(recipe).map((q) => <button key={q} onClick={() => send(q)} disabled={busy}>{q}</button>)}
        </div>
        <form className="composer__row" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <label className="sr-only" htmlFor="chat-input">Pergunte ao Chef</label>
          <input id="chat-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Pergunte sobre ingredientes, troca..." autoComplete="off" />
          <button className="send" type="submit" aria-label="Enviar pergunta" disabled={!text.trim() || busy}><Icon name="arrow_upward" /></button>
        </form>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Icon } from '../components/ui';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const changeEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!supabase || !user) return;
    if (email.trim().toLowerCase() === user.email?.toLowerCase()) {
      setError('Esse já é o e-mail atual da sua conta.');
      return;
    }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ email: email.trim() });
      if (authError) throw authError;
      setMessage('Pedido enviado. Para proteger sua conta, confirme a mudança pelos e-mails enviados para o endereço atual e para o novo.');
      setEmail('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível solicitar a mudança de e-mail. Tente novamente.');
    } finally { setBusy(false); }
  };

  if (!user) return (
    <section className="profile-wrap pad">
      <div className="profile-card">
        <a className="auth-back body-sm" href="#/"><Icon name="arrow_back" size={18} /> Voltar ao início</a>
        <h1 className="h-lg">Meu perfil</h1>
        <p className="body-sm muted">Entre na sua conta para ver as informações do perfil.</p>
        <a className="btn btn--primary" href="#/entrar">Entrar na conta</a>
      </div>
    </section>
  );

  return (
    <section className="profile-wrap pad">
      <div className="profile-card">
        <a className="auth-back body-sm" href="#/"><Icon name="arrow_back" size={18} /> Voltar ao início</a>
        <div className="profile-heading">
          <div className="profile-mark">{(user.email?.[0] ?? 'U').toUpperCase()}</div>
          <div><p className="auth-eyebrow">SUA CONTA</p><h1 className="h-lg">Meu perfil</h1></div>
        </div>
        <div className="profile-current">
          <span className="profile-label">E-mail atual</span>
          <strong>{user.email}</strong>
          <span className="profile-verified"><Icon name={user.email_confirmed_at ? 'verified' : 'schedule'} size={17} />{user.email_confirmed_at ? 'E-mail confirmado' : 'Confirmação pendente'}</span>
        </div>
        <form className="auth-form profile-form" onSubmit={changeEmail}>
          <h2 className="h-sm">Alterar e-mail</h2>
          <p className="body-sm muted">Vamos pedir confirmações para proteger sua conta.</p>
          <label htmlFor="profile-new-email">Novo e-mail</label>
          <input id="profile-new-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="novo@exemplo.com" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="btn btn--primary auth-submit" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Solicitar alteração'}</button>
        </form>
        <div className="profile-divider" />
        <button className="btn btn--ghost profile-signout" type="button" onClick={() => signOut().then(() => { window.location.hash = '#/entrar'; })}>
          <Icon name="logout" size={19} /> Sair da conta
        </button>
      </div>
    </section>
  );
}

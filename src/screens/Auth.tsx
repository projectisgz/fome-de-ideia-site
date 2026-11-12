import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from '../components/ui';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthContext';

type AuthMode = 'login' | 'signup' | 'recovery' | 'reset';

export default function Auth() {
  const { recovery, clearRecovery } = useAuth();
  const [mode, setMode] = useState<AuthMode>(recovery ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (recovery) setMode('reset'); }, [recovery]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage('');
    if (!supabase) { setError('O serviço de conta ainda não foi conectado. Configure as variáveis do Supabase para habilitar o login.'); return; }
    setBusy(true);
    try {
      if (mode === 'recovery') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/?auth=recovery` });
        if (authError) throw authError;
        setMessage('Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.');
      } else if (mode === 'reset') {
        if (password.length < 8) throw new Error('Use uma senha com pelo menos 8 caracteres.');
        if (password !== confirmPassword) throw new Error('As senhas não coincidem.');
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        clearRecovery();
        setPassword(''); setConfirmPassword(''); setMode('login');
        setMessage('Senha alterada. Entre com sua nova senha.');
        window.location.hash = '#/entrar';
      } else if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (authError) throw authError;
        setMessage(data.session ? 'Conta criada. Você já está conectado!' : 'Conta criada! Confira seu e-mail para confirmar o cadastro.');
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        window.location.hash = '#/';
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível concluir. Tente novamente.');
    } finally { setBusy(false); }
  };

  const title = mode === 'login' ? 'Que bom ter você de volta.'
    : mode === 'signup' ? 'Vamos guardar suas receitas.'
      : mode === 'recovery' ? 'Vamos recuperar seu acesso.' : 'Crie uma nova senha.';
  const description = mode === 'login' ? 'Entre para acessar sua conta e suas receitas salvas.'
    : mode === 'signup' ? 'Crie sua conta para guardar suas receitas favoritas.'
      : mode === 'recovery' ? 'Informe seu e-mail e enviaremos um link para redefinir sua senha.'
        : 'Escolha uma senha nova para voltar à sua conta.';

  return (
    <section className="auth-wrap pad">
      <div className="auth-card">
        <a className="auth-back body-sm" href="#/"><Icon name="arrow_back" size={18} /> Voltar ao início</a>
        <div className="auth-mark"><Icon name="skillet" size={26} /></div>
        <p className="auth-eyebrow">FOME DE IDEIA</p>
        <h1 className="h-lg">{title}</h1>
        <p className="body-sm muted">{description}</p>
        {!isSupabaseConfigured && <div className="auth-notice"><Icon name="info" size={18} /> O login será ativado quando a conexão segura do app for configurada.</div>}
        <form className="auth-form" onSubmit={submit}>
          {mode !== 'reset' && <>
            <label htmlFor="auth-email">E-mail</label>
            <input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </>}
          {(mode === 'login' || mode === 'signup' || mode === 'reset') && <>
            <label htmlFor="auth-password">{mode === 'reset' ? 'Nova senha' : 'Senha'}</label>
            <input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Pelo menos 8 caracteres" />
          </>}
          {mode === 'reset' && <>
            <label htmlFor="auth-confirm-password">Confirme a nova senha</label>
            <input id="auth-confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Digite a senha novamente" />
          </>}
          {mode === 'login' && <button className="auth-forgot" type="button" onClick={() => { setMode('recovery'); setMessage(''); setError(''); }}>Esqueci minha senha</button>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="btn btn--primary auth-submit" type="submit" disabled={busy}>{busy ? 'Só um instante…' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : mode === 'recovery' ? 'Enviar link' : 'Salvar nova senha'}</button>
        </form>
        {mode === 'login' || mode === 'signup' ? (
          <p className="auth-switch body-sm">{mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }}>{mode === 'login' ? 'Criar conta' : 'Entrar'}</button>
          </p>
        ) : (
          <p className="auth-switch body-sm"><button type="button" onClick={() => { clearRecovery(); setMode('login'); setPassword(''); setConfirmPassword(''); setError(''); setMessage(''); }}>Voltar para entrar</button></p>
        )}
      </div>
    </section>
  );
}

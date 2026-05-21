import { useState } from 'react';
import { X } from 'lucide-react';
import { signIn, signUp } from '@/lib/auth';

type Modo = 'login' | 'register';

export default function ModalAuth({
  open,
  onClose,
  modoInicial = 'login',
  acento = '#0ea5e9',
  nombreProducto,
}: {
  open: boolean;
  onClose: () => void;
  modoInicial?: Modo;
  acento?: string;
  nombreProducto?: string;
}) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function cambiarModo(nuevoModo: Modo) {
    setModo(nuevoModo);
    setError(null);
    setPassword('');
    setPasswordConfirm('');
  }

  function cerrar() {
    if (loading) return;
    setError(null);
    setPassword('');
    setPasswordConfirm('');
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError('Ingresá tu email.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (modo === 'register' && password !== passwordConfirm) {
      return setError('Las contraseñas no coinciden.');
    }

    setLoading(true);
    setError(null);
    const fn = modo === 'login' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setLoading(false);

    if (err) {
      const msg = err.message ?? String(err);
      if (msg.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos.');
      } else if (msg.includes('User already registered')) {
        setError('Ese email ya está registrado. Probá iniciar sesión.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Tu cuenta requiere confirmación de email. Avisame para desactivarlo.');
      } else {
        setError(msg);
      }
    } else {
      // useUser detecta y la app reacciona sola.
      cerrar();
    }
  }

  if (!open) return null;

  const esLogin = modo === 'login';
  const titulo = esLogin
    ? nombreProducto ? `Entrar a ${nombreProducto}` : 'Iniciar sesión'
    : nombreProducto ? `Crear cuenta en ${nombreProducto}` : 'Crear cuenta';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={cerrar}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3">
          <h2 className="text-sm font-semibold">{titulo}</h2>
          <button
            onClick={cerrar}
            disabled={loading}
            className="text-neutral-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              autoComplete="email"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">
              Contraseña <span className="text-neutral-600">(mínimo 8 caracteres)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
              autoComplete={esLogin ? 'current-password' : 'new-password'}
              required
              minLength={8}
            />
          </div>

          {!esLogin && (
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-2 text-sm"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: acento }}
            className="w-full px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading
              ? esLogin
                ? 'Entrando...'
                : 'Creando cuenta...'
              : esLogin
                ? 'Entrar'
                : 'Crear cuenta'}
          </button>

          <p className="text-center text-xs text-neutral-500 pt-1">
            {esLogin ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
            <button
              type="button"
              onClick={() => cambiarModo(esLogin ? 'register' : 'login')}
              className="hover:text-neutral-300 underline"
            >
              {esLogin ? 'Crear una' : 'Iniciar sesión'}
            </button>
          </p>
        </form>
        </div>
      </div>
    </div>
  );
}

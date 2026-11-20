import { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wordmark } from '@/components/Logo';
import { FormField } from '@/components/FormField';
import { useAuth } from '@/contexts/AuthContext';
import { USE_MOCKS } from '@/config';
import { errorMessage } from '@/lib/api';
import type { LoginResult } from '@/types/auth';

const ERRORS: Record<Exclude<LoginResult, 'ok'>, string> = {
  invalid: 'Matrícula ou senha incorretas. Confira e tente de novo.',
  inactive: 'Este acesso está inativo. Fale com o responsável do condomínio.',
  'condominium-inactive': 'O condomínio está inativo. Fale com a administração do iPackage.',
};

const Login = () => {
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!matricula.trim() || !password) {
      setError('Informe matrícula e senha para entrar.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(matricula, password);
      if (result !== 'ok') setError(ERRORS[result]);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível entrar. Tente de novo.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Wordmark size="lg" />
          <p className="mt-2 text-body text-muted-foreground">Encomendas da portaria até o morador, sem papel.</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="font-display text-h2">Entrar</h1>
          <p className="mt-1 text-small text-muted-foreground">Use a matrícula e a senha que o condomínio entregou para você.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <FormField label="Matrícula" htmlFor="matricula">
              <Input
                id="matricula"
                inputMode="numeric"
                autoComplete="username"
                className="font-mono text-code"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex.: 1002"
                disabled={isLoading}
              />
            </FormField>

            <FormField label="Senha" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  disabled={isLoading}
                  className="pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </FormField>

            {error && (
              <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-small font-medium text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Entrando…
                </>
              ) : (
                <>
                  <LogIn aria-hidden />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </div>

        {USE_MOCKS && (
          <div className="rounded-lg border border-dashed p-4 text-small text-muted-foreground">
            <p className="font-semibold text-foreground">Dados de exemplo · senha 123456</p>
            <ul className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <li className="contents"><span className="font-mono text-foreground">1002</span><span>Porteira · Vista Verde (prédio)</span></li>
              <li className="contents"><span className="font-mono text-foreground">1005</span><span>Responsável · Vista Verde</span></li>
              <li className="contents"><span className="font-mono text-foreground">1001</span><span>Administrador · Vista Verde</span></li>
              <li className="contents"><span className="font-mono text-foreground">2002</span><span>Porteiro · Solar do Bosque (casas)</span></li>
              <li className="contents"><span className="font-mono text-foreground">9001</span><span>Dono do iPackage · administração</span></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

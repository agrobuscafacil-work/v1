'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Leaf, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

const forgotSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      // await api.post('/auth/forgot-password', { email: data.email });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
      toast.success('E-mail de recuperação enviado!');
    } catch {
      toast.error('Erro ao enviar e-mail de recuperação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900 mb-4">
            <Leaf className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recuperar Senha</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {sent ? 'Verifique seu e-mail para redefinir sua senha.' : 'Receba um link de recuperação no seu e-mail.'}
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enviamos um e-mail com instruções para redefinir sua senha.
            </p>
            <Link href="/auth/login" className="btn-primary w-full inline-flex items-center justify-center">
              Voltar para o Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="label-field">E-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="seu@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Lembrou sua senha?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

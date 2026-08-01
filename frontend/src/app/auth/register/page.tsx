'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/use-auth';
import { Leaf, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  document: z.string().min(11, 'Documento inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'A senha deve conter letra maiúscula, minúscula, número e caractere especial',
    ),
  confirmPassword: z.string().min(8, 'Confirme sua senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function maskDocument(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'supplier'>('buyer');
  const [docValue, setDocValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const handleDocChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDocument(e.target.value);
    setDocValue(masked);
    setValue('document', masked, { shouldValidate: true });
  }, [setValue]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setPhoneValue(masked);
    setValue('phone', masked, { shouldValidate: true });
  }, [setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        document: data.document,
        phone: data.phone,
        password: data.password,
        role: userType === 'supplier' ? 'SUPPLIER' : 'CUSTOMER',
      });
      toast.success('Cadastro realizado com sucesso!');
      router.push('/');
    } catch (error: any) {
      const data = error?.response?.data;
      const validationError = data?.error?.errors?.[0];
      const message = validationError
        ? Object.values(validationError.constraints)[0]
        : data?.error?.message || 'Erro ao realizar cadastro.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900 mb-4">
            <Leaf className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Criar Conta</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Junte-se ao AgroBuscaFácil
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            type="button"
            onClick={() => setUserType('buyer')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              userType === 'buyer'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Quero Comprar
          </button>
          <button
            type="button"
            onClick={() => setUserType('supplier')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              userType === 'supplier'
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sou Fornecedor
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="label-field">Nome completo</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="input-field"
              placeholder="Seu nome"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

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
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="document" className="label-field">CPF/CNPJ</label>
              <input
                id="document"
                name="document"
                type="text"
                className="input-field"
                placeholder={userType === 'supplier' ? '00.000.000/0000-00' : '000.000.000-00'}
                value={docValue}
                onChange={handleDocChange}
              />
              {errors.document && <p className="text-sm text-red-500 mt-1">{errors.document.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="label-field">Telefone</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                className="input-field"
                placeholder="(11) 99999-9999"
                value={phoneValue}
                onChange={handlePhoneChange}
              />
              {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}>
              <label htmlFor="password" className="label-field">Senha</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="Mín. 8: maiúscula, minúscula, nº e símbolo"
                {...register('password')}
              />
              {passwordFocused && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Mínimo 8 caracteres, com maiúscula, minúscula, número e um destes símbolos:{' '}
                  <span className="font-mono">@ $ ! % * ? &amp; #</span>
                </p>
              )}
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-field">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="input-field"
                placeholder="Repita a senha"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

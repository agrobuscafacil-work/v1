'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  LifeBuoy,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Upload,
  X,
  User,
  Lock,
  Search,
  ShoppingCart,
  Package,
  Truck,
  CreditCard,
  ShoppingBag,
  MessageCircle,
  AlertTriangle,
  Star,
  HelpCircle,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getBrowserInfo, formatBytes } from '@/lib/support';
import { useAuth } from '@/hooks/use-auth';
import type { SupportCategory, SupportType, SupportTicket } from '@/types';

const titleSchema = z.object({
  title: z
    .string()
    .min(5, 'Descreva o problema em pelo menos 5 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  description: z
    .string()
    .min(20, 'Descreva o problema com pelo menos 20 caracteres')
    .max(5000, 'A descrição deve ter no máximo 5000 caracteres'),
});

type TitleFormData = z.infer<typeof titleSchema>;

const CATEGORY_ICONS: Record<string, typeof HelpCircle> = {
  user: User,
  lock: Lock,
  search: Search,
  cart: ShoppingCart,
  package: Package,
  truck: Truck,
  card: CreditCard,
  bag: ShoppingBag,
  'package-check': Package,
  message: MessageCircle,
  alert: AlertTriangle,
  star: Star,
};

interface UploadFieldConfig {
  key: 'images' | 'documents' | 'videos';
  label: string;
  accept: string;
  mimeTypes: string[];
  maxFiles: number;
  maxSizeMB: number;
  hint: string;
}

const UPLOAD_FIELDS: UploadFieldConfig[] = [
  {
    key: 'images',
    label: 'Imagens',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFiles: 6,
    maxSizeMB: 5,
    hint: 'PNG, JPG, WEBP ou GIF - até 6 arquivos de 5MB',
  },
  {
    key: 'documents',
    label: 'Documentos',
    accept: 'application/pdf,text/plain,text/csv,.doc,.docx,.xls,.xlsx',
    mimeTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxFiles: 3,
    maxSizeMB: 10,
    hint: 'PDF, TXT, DOC, XLS ou CSV - até 3 arquivos de 10MB',
  },
  {
    key: 'videos',
    label: 'Vídeos',
    accept: 'video/mp4,video/webm,video/quicktime',
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    maxFiles: 3,
    maxSizeMB: 20,
    hint: 'MP4, WEBM ou MOV - até 3 arquivos de 20MB',
  },
];

function PackageCheck(props: React.SVGProps<SVGSVGElement>) {
  return <Package {...props} />;
}

export default function SupportNewPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 'done'>(1);
  const [category, setCategory] = useState<SupportCategory | null>(null);
  const [type, setType] = useState<SupportType | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<string, File[]>>({
    images: [],
    documents: [],
    videos: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TitleFormData>({
    resolver: zodResolver(titleSchema),
  });

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data } = await api.get('/support/categories');
      setCategories(data.data || data);
    } catch {
      toast.error('Não foi possível carregar as categorias. Tente novamente.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const startWizard = () => {
    if (categories.length === 0) loadCategories();
    setStep(1);
    setCategory(null);
    setType(null);
  };

  const selectCategory = (cat: SupportCategory) => {
    setCategory(cat);
    setType(null);
    setStep(2);
  };

  const selectType = (t: SupportType) => {
    setType(t);
    setStep(3);
  };

  const addFiles = (key: 'images' | 'documents' | 'videos', incoming: FileList | null) => {
    if (!incoming) return;
    const config = UPLOAD_FIELDS.find((f) => f.key === key)!;
    const next = [...files[key]];
    for (const file of Array.from(incoming)) {
      if (!config.mimeTypes.includes(file.type)) {
        toast.error(`"${file.name}" não é um tipo de arquivo permitido em ${config.label}.`);
        continue;
      }
      if (file.size > config.maxSizeMB * 1024 * 1024) {
        toast.error(`"${file.name}" excede o tamanho máximo de ${config.maxSizeMB}MB.`);
        continue;
      }
      if (next.length >= config.maxFiles) {
        toast.error(`Máximo de ${config.maxFiles} arquivos em ${config.label}.`);
        break;
      }
      next.push(file);
    }
    setFiles((prev) => ({ ...prev, [key]: next }));
  };

  const removeFile = (key: 'images' | 'documents' | 'videos', index: number) => {
    setFiles((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const onSubmit = async (data: TitleFormData) => {
    setSubmitting(true);
    try {
      const meta = getBrowserInfo();
      const formData = new FormData();
      formData.append('categoryId', category!.id);
      formData.append('typeId', type!.id);
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (typeof window !== 'undefined') formData.append('pageUrl', window.location.href);
      if (meta.browser) formData.append('browser', meta.browser);
      if (meta.os) formData.append('os', meta.os);
      if (meta.device) formData.append('device', meta.device);
      if (meta.appVersion) formData.append('appVersion', meta.appVersion);
      for (const key of ['images', 'documents', 'videos'] as const) {
        for (const file of files[key]) {
          formData.append(key, file);
        }
      }

      const { data: response } = await api.post('/support/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCreatedTicket(response.data);
      setStep('done');
      toast.success('Reclamação enviada com sucesso!');
    } catch (error: any) {
      const message =
        typeof error?.response?.data?.message === 'string'
          ? error.response.data.message
          : 'Erro ao enviar reclamação. Tente novamente.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
            <LifeBuoy className="h-7 w-7 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Acesso necessário</h1>
          <p className="mt-2 text-sm text-gray-500">
            Faça login na sua conta para relatar um problema à nossa equipe de suporte.
          </p>
          <Link href="/auth/login" className="btn-primary mt-6">
            Fazer login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900">
            <LifeBuoy className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Relatar Problema</h1>
            <p className="text-sm text-gray-500">Nossa equipe analisará e responderá em breve.</p>
          </div>
        </div>

        {step === 'done' && createdTicket && (
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reclamação enviada!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Registramos sua reclamação como{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                #{createdTicket.id.slice(0, 8).toUpperCase()}
              </span>
              . Você receberá uma notificação quando a equipe responder.
            </p>
            <p className="mt-3 text-sm text-gray-500">
              Categoria: {createdTicket.category.name} - {createdTicket.type.name}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={`/suporte/${createdTicket.id}`} className="btn-primary">
                Acompanhar reclamação
              </Link>
              <button onClick={() => router.push('/')} className="btn-outline">
                Voltar ao início
              </button>
            </div>
          </div>
        )}

        {step !== 'done' && (
          <>
            <div className="mb-8 flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      step === s
                        ? 'bg-primary-600 text-white'
                        : step > s
                          ? 'bg-green-100 dark:bg-green-950 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 w-10 sm:w-16 rounded-full ${
                        step > s ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  Escolha a categoria do problema
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Selecione a opção que mais se aproxima do que aconteceu.
                </p>

                {loadingCategories ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Não foi possível carregar as categorias.</p>
                    <button onClick={loadCategories} className="btn-outline mt-4">
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((cat) => {
                      const Icon = CATEGORY_ICONS[cat.icon || ''] || HelpCircle;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => selectCategory(cat)}
                          className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-left transition-colors hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                        >
                          <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{cat.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 2 && category && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <button
                  onClick={() => setStep(1)}
                  className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar às categorias
                </button>
                <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Selecione o tipo de problema que melhor descreve sua situação.
                </p>

                <div className="space-y-2">
                  {category.types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => selectType(t)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-left transition-colors hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t.name}</p>
                        {t.description && (
                          <p className="mt-0.5 text-xs text-gray-500">{t.description}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && category && type && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
                <button
                  onClick={() => setStep(2)}
                  className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar aos tipos
                </button>

                <div className="mb-6 rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-xs text-gray-500">
                    {category.name} - {type.name}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="label-field">Título do problema</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex.: Pagamento via PIX não confirmado"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-field">Descrição detalhada</label>
                    <textarea
                      rows={5}
                      className="input-field resize-y"
                      placeholder="Descreva o que aconteceu, o que você esperava e o que já tentou..."
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Anexos (opcional)
                    </p>
                    <p className="text-xs text-gray-500">
                      Prints de tela, comprovantes e vídeos ajudam nossa equipe a resolver mais rápido.
                    </p>

                    {UPLOAD_FIELDS.map((field) => (
                      <div
                        key={field.key}
                        className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {field.key === 'images' ? (
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            ) : field.key === 'videos' ? (
                              <Video className="h-4 w-4 text-gray-400" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {field.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{field.hint}</span>
                        </div>

                        <label className="btn-outline inline-flex cursor-pointer items-center gap-2 text-sm">
                          <Upload className="h-4 w-4" />
                          Adicionar arquivos
                          <input
                            type="file"
                            multiple
                            accept={field.accept}
                            className="sr-only"
                            onChange={(e) => {
                              addFiles(field.key, e.target.files);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {files[field.key].length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {files[field.key].map((file, i) => (
                              <li
                                key={`${file.name}-${i}`}
                                className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(field.key, i)}
                                  className="text-gray-400 hover:text-red-500"
                                  aria-label={`Remover ${file.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-outline">
                      Voltar
                    </button>
                    <button type="submit" disabled={submitting} className="btn-primary">
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Reclamação
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

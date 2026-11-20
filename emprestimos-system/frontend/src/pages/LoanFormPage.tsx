import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loansApi, clientsApi } from '../services/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const loanSchema = z.object({
  clientId: z.string().uuid('Selecione um cliente'),
  modality: z.enum(['PERIODIC_INTEREST', 'INSTALLMENT_LOAN']),
  principalAmount: z.number().min(0.01, 'Capital deve ser maior que zero'),
  interestRate: z.number().min(0, 'Taxa deve ser maior ou igual a zero').max(1, 'Taxa máxima é 100%'),
  calculationMethod: z.enum(['SIMPLE_INTEREST_ON_INITIAL', 'SIMPLE_INTEREST_ON_BALANCE', 'PRICE_TABLE']),
  paymentFrequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL']),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type LoanForm = z.infer<typeof loanSchema>;

const modalityOptions = [
  { value: 'PERIODIC_INTEREST', label: 'Juros Periódicos com Capital Preservado' },
  { value: 'INSTALLMENT_LOAN', label: 'Empréstimo Parcelado' },
];

const calculationMethodOptions = {
  PERIODIC_INTEREST: [
    { value: 'PERCENTAGE', label: 'Percentual sobre capital' },
    { value: 'FIXED_VALUE', label: 'Valor fixo por período' },
    { value: 'MANUAL', label: 'Valor manual por período' },
  ],
  INSTALLMENT_LOAN: [
    { value: 'SIMPLE_INTEREST_ON_INITIAL', label: 'Juros Simples sobre Capital Inicial' },
    { value: 'SIMPLE_INTEREST_ON_BALANCE', label: 'Juros Simples sobre Saldo Devedor' },
    { value: 'PRICE_TABLE', label: 'Tabela Price' },
  ],
};

const frequencyOptions = [
  { value: 'DAILY', label: 'Diário' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'BIWEEKLY', label: 'Quinzenal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'QUARTERLY', label: 'Trimestral' },
  { value: 'SEMIANNUAL', label: 'Semestral' },
  { value: 'ANNUAL', label: 'Anual' },
];

export function LoanFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedModality, setSelectedModality] = useState<'PERIODIC_INTEREST' | 'INSTALLMENT_LOAN'>('PERIODIC_INTEREST');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoanForm>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      clientId: searchParams.get('clientId') || '',
      modality: 'PERIODIC_INTEREST',
      principalAmount: 0,
      interestRate: 0,
      calculationMethod: 'PERCENTAGE',
      paymentFrequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const watchedModality = watch('modality');
  const watchedCalculationMethod = watch('calculationMethod');

  useEffect(() => {
    loadClients();
    if (isEditing) {
      loadLoan();
    }
    if (searchParams.get('clientId')) {
      setValue('clientId', searchParams.get('clientId')!);
    }
  }, [id]);

  useEffect(() => {
    // Reset calculation method when modality changes
    const methods = calculationMethodOptions[watchedModality as keyof typeof calculationMethodOptions];
    if (methods && !methods.find(m => m.value === watchedCalculationMethod)) {
      setValue('calculationMethod', methods[0].value);
    }
    setSelectedModality(watchedModality);
  }, [watchedModality, watchedCalculationMethod, setValue]);

  const loadClients = async () => {
    try {
      const res = await clientsApi.list({ status: 'ACTIVE' });
      setClients(res.data);
    } catch (error) {
      console.error('Erro ao carregar clientes');
    }
  };

  const loadLoan = async () => {
    setLoading(true);
    try {
      const res = await loansApi.get(id!);
      const loan = res.data;
      reset({
        clientId: loan.clientId,
        modality: loan.modality,
        principalAmount: Number(loan.principalAmount),
        interestRate: Number(loan.interestRate),
        calculationMethod: loan.calculationMethod,
        paymentFrequency: loan.paymentFrequency,
        startDate: new Date(loan.startDate).toISOString().split('T')[0],
        notes: loan.notes || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar empréstimo');
      navigate('/loans');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoanForm) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        principalAmount: Number(data.principalAmount),
        interestRate: Number(data.interestRate),
      };

      if (isEditing) {
        await loansApi.update(id!, payload);
        toast.success('Empréstimo atualizado com sucesso');
      } else {
        await loansApi.create(payload);
        toast.success('Empréstimo criado com sucesso');
      }
      navigate('/loans');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar empréstimo';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-background text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo'}</h1>
          <p className="text-secondary mt-1">{isEditing ? 'Atualize as informações do empréstimo' : 'Cadastre um novo empréstimo no sistema'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-lg border border-border p-6 shadow space-y-6">
        {/* Client Selection */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-primary mb-1.5">
            Cliente <span className="text-danger">*</span>
          </label>
          <select
            {...register('clientId')}
            id="clientId"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.clientId ? 'border-danger' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
            disabled={submitting}
          >
            <option value="">Selecione um cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.fullName}</option>
            ))}
          </select>
          {errors.clientId && <p className="mt-1 text-sm text-danger">{errors.clientId.message}</p>}
        </div>

        {/* Modality */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Modalidade <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {modalityOptions.map((option) => (
              <label
                key={option.value}
                className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all ${
                  watchedModality === option.value
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-primary'
                }`}
              >
                <input
                  type="radio"
                  {...register('modality')}
                  value={option.value}
                  className="sr-only"
                  disabled={submitting}
                />
                <div className="font-medium text-sm">{option.label}</div>
              </label>
            ))}
          </div>
          {errors.modality && <p className="mt-1 text-sm text-danger">{errors.modality.message}</p>}
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="principalAmount" className="block text-sm font-medium text-primary mb-1.5">
              Capital (R$) <span className="text-danger">*</span>
            </label>
            <input
              {...register('principalAmount', { valueAsNumber: true })}
              id="principalAmount"
              type="number"
              step="0.01"
              min="0.01"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.principalAmount ? 'border-danger' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
              placeholder="5000,00"
              disabled={submitting}
            />
            {errors.principalAmount && <p className="mt-1 text-sm text-danger">{errors.principalAmount.message}</p>}
          </div>

          <div>
            <label htmlFor="interestRate" className="block text-sm font-medium text-primary mb-1.5">
              Taxa de Juros <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                {...register('interestRate', { valueAsNumber: true })}
                id="interestRate"
                type="number"
                step="0.0001"
                min="0"
                max="1"
                className={`w-full px-4 py-2.5 rounded-lg border pr-8 ${
                  errors.interestRate ? 'border-danger' : 'border-border'
                } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
                placeholder="0,05"
                disabled={submitting}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {watchedModality === 'PERIODIC_INTEREST' && watchedCalculationMethod === 'FIXED_VALUE' ? 'R$' : '%'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {watchedModality === 'PERIODIC_INTEREST' && watchedCalculationMethod === 'FIXED_VALUE'
                ? 'Valor fixo por período em R$'
                : 'Ex: 0,05 para 5% ao período'}
            </p>
            {errors.interestRate && <p className="mt-1 text-sm text-danger">{errors.interestRate.message}</p>}
          </div>
        </div>

        {/* Calculation Method */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1.5">
            Método de Cálculo <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {calculationMethodOptions[watchedModality as keyof typeof calculationMethodOptions].map((option) => (
              <label
                key={option.value}
                className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                  watchedCalculationMethod === option.value
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-primary'
                }`}
              >
                <input
                  type="radio"
                  {...register('calculationMethod')}
                  value={option.value}
                  className="sr-only"
                  disabled={submitting}
                />
                <div className="font-medium text-sm">{option.label}</div>
              </label>
            ))}
          </div>
          {errors.calculationMethod && <p className="mt-1 text-sm text-danger">{errors.calculationMethod.message}</p>}
        </div>

        {/* Payment Frequency & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="paymentFrequency" className="block text-sm font-medium text-primary mb-1.5">
              Frequência de Pagamento <span className="text-danger">*</span>
            </label>
            <select
              {...register('paymentFrequency')}
              id="paymentFrequency"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.paymentFrequency ? 'border-danger' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
              disabled={submitting}
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {errors.paymentFrequency && <p className="mt-1 text-sm text-danger">{errors.paymentFrequency.message}</p>}
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-primary mb-1.5">
              Data de Início <span className="text-danger">*</span>
            </label>
            <input
              {...register('startDate')}
              id="startDate"
              type="date"
              className={`w-full px-4 py-2.5 rounded-lg border ${
                errors.startDate ? 'border-danger' : 'border-border'
              } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
              disabled={submitting}
            />
            {errors.startDate && <p className="mt-1 text-sm text-danger">{errors.startDate.message}</p>}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1.5">
            Observações
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={3}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.notes ? 'border-danger' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors resize-none`}
            placeholder="Observações sobre o empréstimo..."
            disabled={submitting}
          />
          {errors.notes && <p className="mt-1 text-sm text-danger">{errors.notes.message}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 border border-border rounded-lg font-medium text-secondary hover:bg-background transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Empréstimo'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
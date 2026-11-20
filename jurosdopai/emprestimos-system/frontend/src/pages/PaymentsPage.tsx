import React, { useEffect, useState } from 'react';
import { paymentsApi, receivablesApi, clientsApi, loansApi } from '../services/api';
import { format } from 'date-fns';
import { Search, Filter, Plus, ArrowLeft, RotateCcw, Eye, Download, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  receivedAt: string;
  status: string;
  client: { id: string; fullName: string };
  loan?: { id: string; modality: string };
  allocations: any[];
  receipts: any[];
}

interface Client { id: string; fullName: string; }
interface Loan { id: string; modality: string; }

const paymentSchema = z.object({
  clientId: z.string().uuid('Selecione um cliente'),
  loanId: z.string().uuid().optional().or(z.literal('')),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  paymentMethod: z.enum(['CASH', 'PIX', 'BANK_TRANSFER', 'CARD', 'CHECK', 'OTHER']),
  receivedAt: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().max(500).optional().or(z.literal('')),
  allocations: z.array(z.object({
    receivableId: z.string(),
    amount: z.number().min(0.01),
  })).optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      clientId: '',
      loanId: '',
      amount: 0,
      paymentMethod: 'PIX',
      receivedAt: new Date().toISOString().slice(0, 16),
      notes: '',
      allocations: [],
    },
  });

  const watchedClientId = watch('clientId');
  const watchedLoanId = watch('loanId');

  useEffect(() => {
    loadPayments();
    loadClients();
    loadSummary();
  }, [statusFilter, clientFilter]);

  useEffect(() => {
    if (watchedClientId) {
      loadLoans(watchedClientId);
      loadReceivables(watchedClientId, watchedLoanId);
    } else {
      setLoans([]);
      setReceivables([]);
      setValue('loanId', '');
    }
  }, [watchedClientId, watchedLoanId]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.list({ status: statusFilter || undefined, clientId: clientFilter || undefined });
      setPayments(res.data);
    } catch (error) {
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const res = await clientsApi.list({ status: 'ACTIVE' });
      setClients(res.data);
    } catch (error) {
      console.error('Erro ao carregar clientes');
    }
  };

  const loadLoans = async (clientId: string) => {
    try {
      const res = await loansApi.list({ clientId, status: 'ACTIVE' });
      setLoans(res.data);
    } catch (error) {
      console.error('Erro ao carregar empréstimos');
    }
  };

  const loadReceivables = async (clientId: string, loanId?: string) => {
    try {
      const res = await receivablesApi.list({
        clientId,
        loanId: loanId || undefined,
        status: 'PENDING',
      });
      setReceivables(res.data.filter((r: any) => r.outstandingAmount > 0));
    } catch (error) {
      console.error('Erro ao carregar recebíveis');
    }
  };

  const loadSummary = async () => {
    try {
      const res = await paymentsApi.getSummary();
      setSummary(res.data);
    } catch (error) {
      console.error('Erro ao carregar resumo');
    }
  };

  const openModal = (payment?: Payment) => {
    reset({
      clientId: payment?.client.id || '',
      loanId: payment?.loan?.id || '',
      amount: Number(payment?.amount) || 0,
      paymentMethod: payment?.paymentMethod || 'PIX',
      receivedAt: payment?.receivedAt ? new Date(payment.receivedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      notes: payment?.notes || '',
    });
    setEditingPayment(payment || null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  const onSubmit = async (data: PaymentForm) => {
    try {
      const allocations = receivables
        .filter(r => r.selected)
        .map(r => ({ receivableId: r.id, amount: r.allocatedAmount || r.outstandingAmount }));

      if (allocations.length === 0 && !editingPayment) {
        toast.error('Selecione ao menos um recebível para alocar');
        return;
      }

      await paymentsApi.confirm({
        ...data,
        allocations,
      });
      toast.success(editingPayment ? 'Pagamento atualizado' : 'Pagamento confirmado');
      closeModal();
      loadPayments();
      loadSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar pagamento');
    }
  };

  const handleReverse = async (id: string) => {
    const reason = prompt('Motivo do estorno:');
    if (!reason) return;
    try {
      await paymentsApi.reverse(id, reason);
      toast.success('Pagamento estornado');
      loadPayments();
      loadSummary();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao estornar');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'bg-success-light text-success',
      PENDING_CONFIRMATION: 'bg-warning-light text-warning',
      REVERSED: 'bg-danger-light text-danger',
      PARTIAL: 'bg-warning-light text-warning',
    };
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      PENDING_CONFIRMATION: 'Pendente',
      REVERSED: 'Estornado',
      PARTIAL: 'Parcial',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.CONFIRMED}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Dinheiro',
      PIX: 'PIX',
      BANK_TRANSFER: 'Transferência',
      CARD: 'Cartão',
      CHECK: 'Cheque',
      OTHER: 'Outro',
    };
    return labels[method] || method;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pagamentos</h1>
          <p className="text-secondary mt-1">Confirmação manual de recebimentos</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Confirmar Pagamento
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Total Recebido</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(summary.totalAmount)}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Quantidade</p>
            <p className="text-2xl font-bold text-primary mt-1">{summary.count}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Por Método</p>
            <div className="mt-2 space-y-1 text-sm">
              {Object.entries(summary.byMethod || {}).map(([method, amount]) => (
                <div key={method} className="flex justify-between">
                  <span className="text-secondary">{getMethodLabel(method)}</span>
                  <span className="font-medium">{formatCurrency(Number(amount))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-40"
        >
          <option value="">Todos</option>
          <option value="CONFIRMED">Confirmado</option>
          <option value="REVERSED">Estornado</option>
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-48"
        >
          <option value="">Todos os clientes</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <RotateCcw className="w-12 h-12 mx-auto text-muted mb-3" />
            <p>Nenhum pagamento registrado</p>
            <button onClick={() => openModal()} className="btn-primary mt-4 inline-flex">
              <Plus className="w-4 h-4 mr-1" /> Confirmar Primeiro Pagamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-left text-sm font-medium text-secondary border-b border-border">
                  <th className="p-4">Data/Hora</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 hidden md:table-cell">Empréstimo</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4 hidden lg:table-cell">Método</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden lg:table-cell">Comprovante</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments
                  .filter((p) => {
                    if (search) {
                      return p.client.fullName.toLowerCase().includes(search.toLowerCase());
                    }
                    return true;
                  })
                  .map((pay) => (
                    <tr key={pay.id} className="hover:bg-background transition-colors">
                      <td className="p-4 text-sm">{format(new Date(pay.receivedAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="p-4 font-medium">{pay.client.fullName}</td>
                      <td className="p-4 hidden md:table-cell text-sm text-secondary">
                        {pay.loan ? (pay.loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado') : '—'}
                      </td>
                      <td className="p-4 font-medium text-primary">{formatCurrency(pay.amount)}</td>
                      <td className="p-4 hidden lg:table-cell text-sm">{getMethodLabel(pay.paymentMethod)}</td>
                      <td className="p-4">{getStatusBadge(pay.status)}</td>
                      <td className="p-4 hidden lg:table-cell text-sm">
                        {pay.receipts[0] ? pay.receipts[0].receiptCode : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {pay.receipts[0] && (
                            <a
                              href={`/api/documents/${pay.receipts[0].id}/download`}
                              className="p-2 rounded-lg hover:bg-background text-secondary"
                              title="Baixar comprovante"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {pay.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleReverse(pay.id)}
                              className="p-2 rounded-lg hover:bg-danger-light text-danger"
                              title="Estornar"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{editingPayment ? 'Editar Pagamento' : 'Confirmar Pagamento'}</h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-background text-secondary">×</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Cliente *</label>
                  <select {...register('clientId')} className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light">
                    <option value="">Selecione</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                  {errors.clientId && <p className="mt-1 text-sm text-danger">{errors.clientId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Empréstimo</label>
                  <select {...register('loanId')} className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light">
                    <option value="">Selecione (opcional)</option>
                    {loans.map((l) => <option key={l.id} value={l.id}>{l.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado'}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Valor (R$) *</label>
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light"
                  />
                  {errors.amount && <p className="mt-1 text-sm text-danger">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Método *</label>
                  <select {...register('paymentMethod')} className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light">
                    <option value="PIX">PIX</option>
                    <option value="CASH">Dinheiro</option>
                    <option value="BANK_TRANSFER">Transferência</option>
                    <option value="CARD">Cartão</option>
                    <option value="CHECK">Cheque</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Data/Hora *</label>
                  <input
                    {...register('receivedAt')}
                    type="datetime-local"
                    className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light"
                  />
                  {errors.receivedAt && <p className="mt-1 text-sm text-danger">{errors.receivedAt.message}</p>}
                </div>
              </div>

              {/* Receivables Allocation */}
              {receivables.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-lg font-semibold mb-3">Alocar em Recebíveis</h3>
                  <p className="text-sm text-muted mb-3">Selecione os recebíveis que este pagamento quita (soma deve igualar o valor do pagamento)</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {receivables.map((rec) => (
                      <label key={rec.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-background cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{rec.sourceType === 'INTEREST_CHARGE' ? 'Juros' : 'Parcela'} - {formatCurrency(rec.outstandingAmount)}</p>
                          <p className="text-xs text-muted">Vence: {format(new Date(rec.dueDate), 'dd/MM/yyyy')} • Cliente: {rec.client.fullName}</p>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={rec.outstandingAmount}
                          defaultValue={rec.outstandingAmount}
                          className="w-24 px-2 py-1.5 rounded-lg border border-border text-right"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-1">Observações</label>
                <textarea {...register('notes')} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light resize-none" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-border rounded-lg font-medium text-secondary hover:bg-background">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingPayment ? 'Atualizar' : 'Confirmar Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
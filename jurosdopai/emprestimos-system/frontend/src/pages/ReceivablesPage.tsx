import React, { useEffect, useState } from 'react';
import { receivablesApi, paymentsApi } from '../services/api';
import { format } from 'date-fns';
import { Search, Filter, AlertTriangle, DollarSign, Clock, Download, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Receivable {
  id: string;
  sourceType: string;
  originalAmount: number;
  amountReceived: number;
  outstandingAmount: number;
  dueDate: string;
  status: string;
  client: { id: string; fullName: string; whatsapp?: string };
  loan: { id: string; modality: string };
  payments: any[];
  daysOverdue: number;
}

export function ReceivablesPage() {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ receivable: Receivable | null }>({ receivable: null });

  useEffect(() => {
    loadReceivables();
    loadDashboard();
  }, [statusFilter, sourceTypeFilter, overdueOnly]);

  const loadReceivables = async () => {
    setLoading(true);
    try {
      const res = await receivablesApi.list({
        status: statusFilter || undefined,
        sourceType: sourceTypeFilter || undefined,
        overdueOnly: overdueOnly || undefined,
      });
      setReceivables(res.data);
    } catch (error) {
      toast.error('Erro ao carregar recebíveis');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await receivablesApi.getDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard');
    }
  };

  const handlePartialPayment = async (receivable: Receivable, amount: number, paymentMethod: string) => {
    try {
      await paymentsApi.partial(receivable.id, { amount, paymentMethod });
      toast.success('Pagamento parcial registrado');
      setShowPaymentModal({ receivable: null });
      loadReceivables();
      loadDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-warning-light text-warning',
      PARTIAL: 'bg-warning-light text-warning',
      PAID: 'bg-success-light text-success',
      OVERDUE: 'bg-danger-light text-danger',
      CANCELLED: 'bg-muted-light text-muted',
    };
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PARTIAL: 'Parcial',
      PAID: 'Pago',
      OVERDUE: 'Em atraso',
      CANCELLED: 'Cancelado',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getSourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      INTEREST_CHARGE: 'Juros',
      INSTALLMENT: 'Parcela',
      LATE_FEE: 'Multa',
      MANUAL_ADJUSTMENT: 'Ajuste',
    };
    return labels[type] || type;
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
          <h1 className="text-2xl font-bold text-primary">Recebíveis</h1>
          <p className="text-secondary mt-1">Gerencie cobranças, juros, parcelas e atrasos</p>
        </div>
      </div>

      {/* Dashboard Summary */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary-light text-primary"><DollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-secondary">Total a Receber</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(dashboard.totalReceivables)}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success-light text-success"><DollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-secondary">Total Recebido</p>
                <p className="text-xl font-bold text-success">{formatCurrency(dashboard.totalReceived)}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning-light text-warning"><DollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-secondary">Saldo Devedor</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(dashboard.totalOutstanding)}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-danger-light text-danger"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-secondary">Em Atraso</p>
                <p className="text-xl font-bold text-danger">{dashboard.overdueCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary-light text-secondary"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-secondary">Pendentes</p>
                <p className="text-xl font-bold text-secondary">{dashboard.pendingCount}</p>
              </div>
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
          <option value="PENDING">Pendente</option>
          <option value="PARTIAL">Parcial</option>
          <option value="PAID">Pago</option>
          <option value="OVERDUE">Em atraso</option>
        </select>
        <select
          value={sourceTypeFilter}
          onChange={(e) => setSourceTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-40"
        >
          <option value="">Todos os tipos</option>
          <option value="INTEREST_CHARGE">Juros</option>
          <option value="INSTALLMENT">Parcelas</option>
          <option value="LATE_FEE">Multas</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
          />
          <span className="text-sm text-secondary">Apenas em atraso</span>
        </label>
      </div>

      {/* Receivables Table */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        {receivables.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted mb-3" />
            <p>Nenhum recebível encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-left text-sm font-medium text-secondary border-b border-border">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Valor Original</th>
                  <th className="p-4">Recebido</th>
                  <th className="p-4">Saldo</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receivables
                  .filter((r) => {
                    if (search) {
                      return r.client.fullName.toLowerCase().includes(search.toLowerCase());
                    }
                    return true;
                  })
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-background transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{rec.client.fullName}</p>
                          <p className="text-xs text-muted">{rec.client.whatsapp || 'Sem WhatsApp'}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          rec.sourceType === 'INTEREST_CHARGE' ? 'bg-primary-light text-primary' :
                          rec.sourceType === 'INSTALLMENT' ? 'bg-success-light text-success' :
                          'bg-warning-light text-warning'
                        }`}>
                          {getSourceTypeLabel(rec.sourceType)}
                        </span>
                      </td>
                      <td className="p-4">{formatCurrency(rec.originalAmount)}</td>
                      <td className="p-4">{formatCurrency(rec.amountReceived)}</td>
                      <td className="p-4 font-medium text-primary">{formatCurrency(rec.outstandingAmount)}</td>
                      <td className="p-4">
                        <p className="text-sm">{format(new Date(rec.dueDate), 'dd/MM/yyyy')}</p>
                        {rec.daysOverdue > 0 && (
                          <p className="text-xs text-danger">{rec.daysOverdue} dias atraso</p>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(rec.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rec.status !== 'PAID' && rec.status !== 'CANCELLED' && (
                            <button
                              onClick={() => setShowPaymentModal({ receivable: rec })}
                              className="px-3 py-1.5 text-sm font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Receber
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
      {showPaymentModal.receivable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Registrar Pagamento</h2>
            <p className="text-sm text-secondary mb-4">
              Cliente: <span className="font-medium">{showPaymentModal.receivable.client.fullName}</span>
            </p>
            <p className="text-sm text-secondary mb-4">
              Saldo: <span className="font-medium text-primary">{formatCurrency(showPaymentModal.receivable.outstandingAmount)}</span>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={showPaymentModal.receivable.outstandingAmount}
                  className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light"
                  defaultValue={showPaymentModal.receivable.outstandingAmount}
                  ref={(el) => { if (el) (el as HTMLInputElement).focus(); }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-1">Método</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light">
                  <option value="PIX">PIX</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="BANK_TRANSFER">Transferência</option>
                  <option value="CARD">Cartão</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal({ receivable: null })}
                className="px-4 py-2 border border-border rounded-lg font-medium text-secondary hover:bg-background"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const amount = parseFloat((document.querySelector('input[type="number"]') as HTMLInputElement)?.value || '0');
                  const method = (document.querySelector('select') as HTMLSelectElement)?.value || 'PIX';
                  if (amount > 0) handlePartialPayment(showPaymentModal.receivable, amount, method);
                }}
                className="btn-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
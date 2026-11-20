import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientsApi, loansApi, reportsApi } from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Archive, Trash2, Plus, Eye, CreditCard, DollarSign, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientDetail {
  id: string;
  fullName: string;
  whatsapp?: string;
  notes?: string;
  administrativeStatus: string;
  createdAt: string;
  loans: any[];
  receivables: any[];
  payments: any[];
  documents: any[];
}

interface FinancialSummary {
  totalLoans: number;
  activeLoans: number;
  paidOffLoans: number;
  totalReceivables: number;
  totalReceived: number;
  totalOutstanding: number;
  overdueReceivables: number;
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'receivables' | 'payments' | 'documents'>('overview');

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const [clientRes, summaryRes] = await Promise.all([
        clientsApi.get(id!),
        clientsApi.getSummary(id!),
      ]);
      setClient(clientRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Arquivar este cliente?')) return;
    try {
      await clientsApi.archive(id!);
      toast.success('Cliente arquivado');
      navigate('/clients');
    } catch (error) {
      toast.error('Erro ao arquivar');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) return;
    try {
      await clientsApi.delete(id!);
      toast.success('Cliente excluído');
      navigate('/clients');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-success-light text-success',
      INACTIVE: 'bg-warning-light text-warning',
      BLOCKED: 'bg-danger-light text-danger',
      ARCHIVED: 'bg-muted-light text-muted',
      PAID_OFF: 'bg-primary-light text-primary',
      OVERDUE: 'bg-danger-light text-danger',
      RESTRUCTURED: 'bg-warning-light text-warning',
      CANCELLED: 'bg-muted-light text-muted',
      PENDING: 'bg-warning-light text-warning',
      PARTIAL: 'bg-warning-light text-warning',
      PAID: 'bg-success-light text-success',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      BLOCKED: 'Bloqueado',
      ARCHIVED: 'Arquivado',
      PAID_OFF: 'Quitado',
      OVERDUE: 'Em atraso',
      RESTRUCTURED: 'Restruturado',
      CANCELLED: 'Cancelado',
      PENDING: 'Pendente',
      PARTIAL: 'Parcial',
      PAID: 'Pago',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.ACTIVE}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div></div>;
  }

  if (!client) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: DollarSign },
    { id: 'loans', label: `Empréstimos (${client.loans.length})`, icon: CreditCard },
    { id: 'receivables', label: `Recebíveis (${client.receivables.length})`, icon: DollarSign },
    { id: 'payments', label: `Pagamentos (${client.payments.length})`, icon: Eye },
    { id: 'documents', label: `Documentos (${client.documents.length})`, icon: Eye },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-background text-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-primary">{client.fullName}</h1>
              {client.administrativeStatus !== 'ARCHIVED' && (
                <button onClick={handleArchive} className="px-3 py-1 text-sm font-medium text-warning bg-warning-light rounded-lg hover:bg-warning/80 transition-colors">
                  Arquivar
                </button>
              )}
              <button onClick={handleDelete} className="px-3 py-1 text-sm font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/80 transition-colors">
                Excluir
              </button>
            </div>
            <p className="text-secondary mt-1">{client.whatsapp || 'Sem WhatsApp'}</p>
          </div>
        </div>
        <Link to={`/clients/${id}/edit`} className="btn-primary flex items-center gap-2">
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Total a Receber</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(summary.totalReceivables)}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Total Recebido</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(summary.totalReceived)}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Saldo Devedor</p>
            <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(summary.totalOutstanding)}</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 shadow">
            <p className="text-sm font-medium text-secondary">Em Atraso</p>
            <p className="text-2xl font-bold text-danger mt-1">{summary.overdueReceivables} recebíveis</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary hover:bg-background'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Notes */}
              {client.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Observações</h3>
                  <p className="text-secondary whitespace-pre-wrap">{client.notes}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Ações Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link to={`/loans/new?clientId=${id}`} className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
                    <Plus className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">Novo Empréstimo</p>
                    <p className="text-sm text-muted mt-1">Criar empréstimo para este cliente</p>
                  </Link>
                  <Link to={`/payments?clientId=${id}`} className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
                    <DollarSign className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">Confirmar Pagamento</p>
                    <p className="text-sm text-muted mt-1">Registrar recebimento</p>
                  </Link>
                  <Link to={`/documents/generate?clientId=${id}`} className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
                    <Eye className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="font-medium">Gerar Documentos</p>
                    <p className="text-sm text-muted mt-1">Contratos, comprovantes</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="overflow-x-auto">
              {client.loans.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  <p className="mb-2">Nenhum empréstimo cadastrado</p>
                  <Link to={`/loans/new?clientId=${id}`} className="text-primary font-medium hover:underline">
                    Criar primeiro empréstimo
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Modalidade</th>
                      <th className="p-3">Capital</th>
                      <th className="p-3">Taxa</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Progresso</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.loans.map((loan: any) => {
                      const progress = loan.receivables && loan.receivables.length > 0
                        ? (loan.receivables.filter((r: any) => r.status === 'PAID').length / loan.receivables.length) * 100
                        : 0;
                      return (
                        <tr key={loan.id} className="hover:bg-background">
                          <td className="p-3">
                            <span className="capitalize">{loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado'}</span>
                          </td>
                          <td className="p-3 font-medium">{formatCurrency(loan.principalAmount)}</td>
                          <td className="p-3 text-sm text-secondary">{(Number(loan.interestRate) * 100).toFixed(2)}%</td>
                          <td className="p-3">{getStatusBadge(loan.status)}</td>
                          <td className="p-3">
                            <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </td>
                          <td className="p-3">
                            <Link to={`/loans/${loan.id}`} className="text-primary hover:underline text-sm">Ver detalhes</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'receivables' && (
            <div className="overflow-x-auto">
              {client.receivables.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhum recebível</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Recebido</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.receivables.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{rec.sourceType === 'INTEREST_CHARGE' ? 'Juros' : rec.sourceType === 'INSTALLMENT' ? 'Parcela' : rec.sourceType}</td>
                        <td className="p-3">{formatCurrency(rec.originalAmount)}</td>
                        <td className="p-3">{formatCurrency(rec.amountReceived)}</td>
                        <td className="p-3 font-medium">{formatCurrency(rec.outstandingAmount)}</td>
                        <td className="p-3 text-sm text-secondary">{format(new Date(rec.dueDate), 'dd/MM/yyyy')}</td>
                        <td className="p-3">{getStatusBadge(rec.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="overflow-x-auto">
              {client.payments.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhum pagamento registrado</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Método</th>
                      <th className="p-3">Empréstimo</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.payments.map((pay: any) => (
                      <tr key={pay.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{format(new Date(pay.receivedAt), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="p-3 font-medium">{formatCurrency(pay.amount)}</td>
                        <td className="p-3 text-sm">{pay.paymentMethod}</td>
                        <td className="p-3 text-sm text-secondary">{pay.loan?.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : pay.loan?.modality === 'INSTALLMENT_LOAN' ? 'Parcelado' : 'N/A'}</td>
                        <td className="p-3">{getStatusBadge(pay.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="overflow-x-auto">
              {client.documents.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhum documento</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Tamanho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.documents.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{doc.documentType}</td>
                        <td className="p-3">{doc.fileName}</td>
                        <td className="p-3 text-sm text-secondary">{format(new Date(doc.generatedAt), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="p-3 text-sm text-secondary">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
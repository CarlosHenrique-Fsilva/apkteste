import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loansApi, interestApi, installmentsApi, paymentsApi, documentsApi } from '../services/api';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, Plus, Eye, Download, Calculator, DollarSign, AlertTriangle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoanDetail {
  id: string;
  modality: string;
  principalAmount: number;
  outstandingPrincipal: number;
  interestRate: number;
  calculationMethod: string;
  paymentFrequency: string;
  startDate: string;
  firstDueDate: string;
  status: string;
  notes?: string;
  client: { id: string; fullName: string; whatsapp?: string };
  interestCharges: any[];
  installments: any[];
  receivables: any[];
  payments: any[];
  terms: any[];
}

interface LoanSummary {
  loan: any;
  totalReceivables: number;
  totalReceived: number;
  totalOutstanding: number;
  overdueCount: number;
  pendingCount: number;
  progressPercentage: number;
}

export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [summary, setSummary] = useState<LoanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charges' | 'installments' | 'receivables' | 'payments' | 'documents'>('overview');
  const [amortizationAmount, setAmortizationAmount] = useState('');

  useEffect(() => {
    loadLoan();
  }, [id]);

  const loadLoan = async () => {
    setLoading(true);
    try {
      const [loanRes, summaryRes] = await Promise.all([
        loansApi.get(id!),
        loansApi.getSummary(id!),
      ]);
      setLoan(loanRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Erro ao carregar empréstimo');
      navigate('/loans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.')) return;
    try {
      await loansApi.delete(id!);
      toast.success('Empréstimo excluído');
      navigate('/loans');
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const handleAmortization = async () => {
    if (!amortizationAmount || parseFloat(amortizationAmount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    try {
      await loansApi.amortization(id!, parseFloat(amortizationAmount));
      toast.success('Amortização aplicada');
      setAmortizationAmount('');
      loadLoan();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao aplicar amortização');
    }
  };

  const handleGenerateContract = async () => {
    try {
      await documentsApi.generateContract(id!);
      toast.success('Contrato gerado');
      loadLoan();
    } catch (error) {
      toast.error('Erro ao gerar contrato');
    }
  };

  const handleGenerateSettlement = async () => {
    try {
      await documentsApi.generateSettlement(id!);
      toast.success('Termo de quitação gerado');
      loadLoan();
    } catch (error) {
      toast.error('Erro ao gerar termo');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getModalityLabel = (modality: string) => {
    return modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos com Capital Preservado' : 'Empréstimo Parcelado';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-success-light text-success',
      PAID_OFF: 'bg-primary-light text-primary',
      OVERDUE: 'bg-danger-light text-danger',
      RESTRUCTURED: 'bg-warning-light text-warning',
      CANCELLED: 'bg-muted-light text-muted',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      PAID_OFF: 'Quitado',
      OVERDUE: 'Em atraso',
      RESTRUCTURED: 'Restruturado',
      CANCELLED: 'Cancelado',
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

  if (!loan) return null;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: DollarSign },
    { id: 'charges', label: `Juros (${loan.interestCharges.length})`, icon: Calculator },
    { id: 'installments', label: `Parcelas (${loan.installments.length})`, icon: Calculator },
    { id: 'receivables', label: `Recebíveis (${loan.receivables.length})`, icon: DollarSign },
    { id: 'payments', label: `Pagamentos (${loan.payments.length})`, icon: RotateCcw },
    { id: 'documents', label: `Documentos (${loan.documents.length})`, icon: Eye },
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
              <h1 className="text-2xl font-bold text-primary">{loan.client.fullName}</h1>
              <span className="px-3 py-1 text-sm font-medium bg-primary-light text-primary rounded-lg">
                {getModalityLabel(loan.modality)}
              </span>
            </div>
            <p className="text-secondary mt-1">Capital: {formatCurrency(loan.principalAmount)} • Taxa: {(Number(loan.interestRate) * 100).toFixed(2)}% • {loan.paymentFrequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerateContract} className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-background transition-colors">
            <Download className="w-4 h-4 mr-1" /> Contrato
          </button>
          {loan.status === 'PAID_OFF' && (
            <button onClick={handleGenerateSettlement} className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-background transition-colors">
              <Download className="w-4 h-4 mr-1" /> Quitação
            </button>
          )}
          <Link to={`/loans/${id}`} className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-background transition-colors">
            <Edit className="w-4 h-4 mr-1" /> Editar
          </Link>
          <button onClick={handleDelete} className="px-3 py-1.5 text-sm font-medium text-danger bg-danger-light rounded-lg hover:bg-danger/80 transition-colors">
            <Trash2 className="w-4 h-4 mr-1" /> Excluir
          </button>
        </div>
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
            <p className="text-sm font-medium text-secondary">Progresso</p>
            <p className="text-2xl font-bold text-primary mt-1">{summary.progressPercentage.toFixed(1)}%</p>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${summary.progressPercentage}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Amortization for periodic interest */}
      {loan.modality === 'PERIODIC_INTEREST' && loan.status === 'ACTIVE' && (
        <div className="bg-surface rounded-lg border border-border p-4 shadow">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            Amortização Extraordinária de Capital
          </h3>
          <p className="text-sm text-muted mb-3">Reduza o capital em aberto e diminua os juros futuros. Capital atual: {formatCurrency(loan.outstandingPrincipal)}</p>
          <div className="flex gap-3">
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={loan.outstandingPrincipal}
              value={amortizationAmount}
              onChange={(e) => setAmortizationAmount(e.target.value)}
              placeholder="Valor da amortização"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
            />
            <button onClick={handleAmortization} className="btn-primary">
              Aplicar Amortização
            </button>
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
              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detalhes do Empréstimo</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-secondary">Modalidade</dt><dd className="font-medium">{getModalityLabel(loan.modality)}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Capital</dt><dd className="font-medium">{formatCurrency(loan.principalAmount)}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Capital em Aberto</dt><dd className="font-medium">{formatCurrency(loan.outstandingPrincipal)}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Taxa de Juros</dt><dd className="font-medium">{(Number(loan.interestRate) * 100).toFixed(2)}%</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Método de Cálculo</dt><dd className="font-medium capitalize">{loan.calculationMethod.toLowerCase().replace(/_/g, ' ')}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Frequência</dt><dd className="font-medium capitalize">{loan.paymentFrequency.toLowerCase()}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Início</dt><dd className="font-medium">{format(new Date(loan.startDate), 'dd/MM/yyyy')}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">1º Vencimento</dt><dd className="font-medium">{format(new Date(loan.firstDueDate), 'dd/MM/yyyy')}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">Status</dt><dd>{getStatusBadge(loan.status)}</dd></div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between"><dt className="text-secondary">Nome</dt><dd className="font-medium">{loan.client.fullName}</dd></div>
                    <div className="flex justify-between"><dt className="text-secondary">WhatsApp</dt><dd className="font-medium">{loan.client.whatsapp || 'Não informado'}</dd></div>
                  </dl>
                </div>
              </div>

              {/* Notes */}
              {loan.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Observações</h3>
                  <p className="text-secondary whitespace-pre-wrap">{loan.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'charges' && (
            <div className="overflow-x-auto">
              {loan.interestCharges.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  <p className="mb-2">Nenhuma cobrança de juros gerada</p>
                  <button onClick={() => interestApi.generateFuture(id!, 12).then(() => { toast.success('Juros gerados'); loadLoan(); })} className="btn-primary">
                    <Plus className="w-4 h-4 mr-1" /> Gerar Juros Futuros
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Período</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loan.interestCharges.map((charge: any) => (
                      <tr key={charge.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{format(new Date(charge.referencePeriod), 'MM/yyyy')}</td>
                        <td className="p-3 text-sm">{format(new Date(charge.dueDate), 'dd/MM/yyyy')}</td>
                        <td className="p-3 font-medium">{formatCurrency(charge.amountDue)}</td>
                        <td className="p-3">{getStatusBadge(charge.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'installments' && (
            <div className="overflow-x-auto">
              {loan.installments.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhuma parcela gerada</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Nº</th>
                      <th className="p-3">Principal</th>
                      <th className="p-3">Juros</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Recebido</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">Vencimento</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loan.installments.map((inst: any) => (
                      <tr key={inst.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{inst.installmentNumber}</td>
                        <td className="p-3">{formatCurrency(inst.principalComponent)}</td>
                        <td className="p-3">{formatCurrency(inst.interestComponent)}</td>
                        <td className="p-3 font-medium">{formatCurrency(inst.totalAmount)}</td>
                        <td className="p-3">{formatCurrency(inst.amountReceived)}</td>
                        <td className="p-3">{formatCurrency(Number(inst.totalAmount) - Number(inst.amountReceived))}</td>
                        <td className="p-3 text-sm">{format(new Date(inst.dueDate), 'dd/MM/yyyy')}</td>
                        <td className="p-3">{getStatusBadge(inst.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'receivables' && (
            <div className="overflow-x-auto">
              {loan.receivables.length === 0 ? (
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
                    {loan.receivables.map((rec: any) => (
                      <tr key={rec.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{rec.sourceType === 'INTEREST_CHARGE' ? 'Juros' : rec.sourceType === 'INSTALLMENT' ? 'Parcela' : rec.sourceType}</td>
                        <td className="p-3">{formatCurrency(rec.originalAmount)}</td>
                        <td className="p-3">{formatCurrency(rec.amountReceived)}</td>
                        <td className="p-3 font-medium">{formatCurrency(rec.outstandingAmount)}</td>
                        <td className="p-3 text-sm">{format(new Date(rec.dueDate), 'dd/MM/yyyy')}</td>
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
              {loan.payments.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhum pagamento registrado</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Valor</th>
                      <th className="p-3">Método</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Comprovante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loan.payments.map((pay: any) => (
                      <tr key={pay.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{format(new Date(pay.receivedAt), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="p-3 font-medium">{formatCurrency(pay.amount)}</td>
                        <td className="p-3 text-sm">{pay.paymentMethod}</td>
                        <td className="p-3">{getStatusBadge(pay.status)}</td>
                        <td className="p-3">
                          {pay.receipts[0] && (
                            <button className="text-primary hover:underline text-sm">
                              {pay.receipts[0].receiptCode}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="overflow-x-auto">
              {loan.documents.length === 0 ? (
                <div className="text-center py-8 text-secondary">Nenhum documento</div>
              ) : (
                <table className="w-full">
                  <thead className="text-left text-sm font-medium text-secondary border-b border-border">
                    <tr>
                      <th className="p-3">Tipo</th>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Tamanho</th>
                      <th className="p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loan.documents.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-background">
                        <td className="p-3 text-sm">{doc.documentType}</td>
                        <td className="p-3">{doc.fileName}</td>
                        <td className="p-3 text-sm text-secondary">{format(new Date(doc.generatedAt), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="p-3 text-sm text-secondary">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                        <td className="p-3">
                          <a href={`/api/documents/${doc.id}/download`} className="text-primary hover:underline text-sm">Download</a>
                        </td>
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
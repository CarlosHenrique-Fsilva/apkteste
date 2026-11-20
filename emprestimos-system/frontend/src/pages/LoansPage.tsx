import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loansApi, clientsApi } from '../services/api';
import { format } from 'date-fns';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye, Calculator, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Loan {
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
  client: { id: string; fullName: string };
  _count: { interestCharges: number; installments: number; receivables: number };
}

interface Client {
  id: string;
  fullName: string;
}

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  useEffect(() => {
    loadLoans();
    loadClients();
  }, [search, statusFilter, clientFilter]);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const res = await loansApi.list({ status: statusFilter || undefined, clientId: clientFilter || undefined });
      setLoans(res.data);
    } catch (error) {
      toast.error('Erro ao carregar empréstimos');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este empréstimo? Esta ação não pode ser desfeita.')) return;
    try {
      await loansApi.delete(id);
      toast.success('Empréstimo excluído');
      loadLoans();
    } catch (error) {
      toast.error('Erro ao excluir empréstimo');
    }
  };

  const getModalityLabel = (modality: string) => {
    return modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado';
  };

  const getModalityIcon = (modality: string) => {
    return modality === 'PERIODIC_INTEREST' ? (
      <DollarSign className="w-4 h-4 text-primary" />
    ) : (
      <Calculator className="w-4 h-4 text-success" />
    );
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Empréstimos</h1>
          <p className="text-secondary mt-1">Gerencie seus empréstimos e modalidades</p>
        </div>
        <Link to="/loans/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Empréstimo
        </Link>
      </div>

      {/* Search & Filter */}
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
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-48"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="PAID_OFF">Quitado</option>
          <option value="OVERDUE">Em atraso</option>
          <option value="RESTRUCTURED">Restruturado</option>
          <option value="CANCELLED">Cancelado</option>
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-48"
        >
          <option value="">Todos os clientes</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.fullName}</option>
          ))}
        </select>
      </div>

      {/* Loans Table */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          </div>
        ) : loans.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <p className="mb-2">Nenhum empréstimo encontrado</p>
            <Link to="/loans/new" className="text-primary font-medium hover:underline">
              Criar primeiro empréstimo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-left text-sm font-medium text-secondary border-b border-border">
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Modalidade</th>
                  <th className="p-4">Capital</th>
                  <th className="p-4 hidden md:table-cell">Taxa</th>
                  <th className="p-4 hidden lg:table-cell">Frequência</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden lg:table-cell">Início</th>
                  <th className="p-4 hidden lg:table-cell">Próx. Venc.</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-background transition-colors">
                    <td className="p-4">
                      <Link to={`/clients/${loan.client.id}`} className="font-medium hover:text-primary">
                        {loan.client.fullName}
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5">
                        {getModalityIcon(loan.modality)}
                        <span className="capitalize text-sm">{getModalityLabel(loan.modality)}</span>
                      </span>
                    </td>
                    <td className="p-4 font-medium">{formatCurrency(loan.principalAmount)}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-secondary">
                      {(Number(loan.interestRate) * 100).toFixed(2)}%
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-secondary capitalize">
                      {loan.paymentFrequency.toLowerCase()}
                    </td>
                    <td className="p-4">{getStatusBadge(loan.status)}</td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted">
                      {format(new Date(loan.startDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-muted">
                      {format(new Date(loan.firstDueDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/loans/${loan.id}`} className="p-2 rounded-lg hover:bg-background text-secondary" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/loans/${loan.id}`} className="p-2 rounded-lg hover:bg-background text-secondary" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(loan.id)}
                          className="p-2 rounded-lg hover:bg-danger-light text-danger"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { clientsApi } from '../services/api';
import { format } from 'date-fns';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Archive, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  fullName: string;
  whatsapp?: string;
  administrativeStatus: string;
  createdAt: string;
  _count: { loans: number; receivables: number };
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await clientsApi.list({ search: search || undefined, status: statusFilter || undefined });
      setClients(res.data);
    } catch (error) {
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Arquivar este cliente?')) return;
    try {
      await clientsApi.archive(id);
      toast.success('Cliente arquivado');
      loadClients();
    } catch (error) {
      toast.error('Erro ao arquivar cliente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) return;
    try {
      await clientsApi.delete(id);
      toast.success('Cliente excluído');
      loadClients();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-success-light text-success',
      INACTIVE: 'bg-warning-light text-warning',
      BLOCKED: 'bg-danger-light text-danger',
      ARCHIVED: 'bg-muted-light text-muted',
    };
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      BLOCKED: 'Bloqueado',
      ARCHIVED: 'Arquivado',
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
          <h1 className="text-2xl font-bold text-primary">Clientes</h1>
          <p className="text-secondary mt-1">Gerencie seus clientes e empréstimos</p>
        </div>
        <Link to="/clients/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-surface rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface"
        >
          <option value="">Todos os status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="INACTIVE">Inativo</option>
          <option value="BLOCKED">Bloqueado</option>
          <option value="ARCHIVED">Arquivado</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <p className="mb-2">Nenhum cliente encontrado</p>
            <Link to="/clients/new" className="text-primary font-medium hover:underline">
              Cadastrar primeiro cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-left text-sm font-medium text-secondary border-b border-border">
                  <th className="p-4">Cliente</th>
                  <th className="p-4 hidden md:table-cell">Contato</th>
                  <th className="p-4 hidden lg:table-cell">Empréstimos</th>
                  <th className="p-4 hidden lg:table-cell">Recebíveis</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Cadastro</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-background transition-colors">
                    <td className="p-4">
                      <Link to={`/clients/${client.id}`} className="font-medium hover:text-primary">
                        {client.fullName}
                      </Link>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted text-sm">
                      {client.whatsapp || '—'}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-secondary">
                      {client._count.loans}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-secondary">
                      {client._count.receivables}
                    </td>
                    <td className="p-4">{getStatusBadge(client.administrativeStatus)}</td>
                    <td className="p-4 text-sm text-muted">{format(new Date(client.createdAt), 'dd/MM/yyyy')}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/clients/${client.id}`} className="p-2 rounded-lg hover:bg-background text-secondary" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/clients/${client.id}/edit`} className="p-2 rounded-lg hover:bg-background text-secondary" title="Editar">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {client.administrativeStatus !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleArchive(client.id)}
                            className="p-2 rounded-lg hover:bg-background text-secondary"
                            title="Arquivar"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(client.id)}
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

// Button component
const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
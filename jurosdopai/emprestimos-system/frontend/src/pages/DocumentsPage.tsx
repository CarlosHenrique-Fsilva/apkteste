import React, { useEffect, useState } from 'react';
import { documentsApi } from '../services/api';
import { format } from 'date-fns';
import { Search, Filter, Download, Eye, FileText, Trash2, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  generatedAt: string;
  client?: { id: string; fullName: string };
  loan?: { id: string; modality: string };
  payment?: { id: string; amount: number };
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadDocuments();
  }, [typeFilter]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentsApi.list({ documentType: typeFilter || undefined });
      setDocuments(res.data);
    } catch (error) {
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type: string, loanId?: string, paymentId?: string) => {
    setGenerating(type);
    try {
      let res;
      switch (type) {
        case 'contract':
          if (!loanId) return;
          res = await documentsApi.generateContract(loanId);
          break;
        case 'receipt':
          if (!paymentId) return;
          res = await documentsApi.generateReceipt(paymentId);
          break;
        case 'settlement':
          if (!loanId) return;
          res = await documentsApi.generateSettlement(loanId);
          break;
      }
      toast.success('Documento gerado com sucesso');
      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao gerar documento');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const res = await documentsApi.download(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar documento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este documento?')) return;
    try {
      await documentsApi.delete(id);
      toast.success('Documento excluído');
      loadDocuments();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CONTRACT': return <FileText className="w-4 h-4 text-primary" />;
      case 'RECEIPT': return <Eye className="w-4 h-4 text-success" />;
      case 'SETTLEMENT_TERM': return <FileText className="w-4 h-4 text-warning" />;
      case 'REPORT': return <Eye className="w-4 h-4 text-secondary" />;
      default: return <FileText className="w-4 h-4 text-muted" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CONTRACT: 'Contrato',
      RECEIPT: 'Comprovante',
      SETTLEMENT_TERM: 'Termo de Quitação',
      REPORT: 'Relatório',
      ATTACHMENT: 'Anexo',
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      CONTRACT: 'bg-primary-light text-primary',
      RECEIPT: 'bg-success-light text-success',
      SETTLEMENT_TERM: 'bg-warning-light text-warning',
      REPORT: 'bg-secondary-light text-secondary',
      ATTACHMENT: 'bg-muted-light text-muted',
    };
    return colors[type] || colors.ATTACHMENT;
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
          <h1 className="text-2xl font-bold text-primary">Documentos</h1>
          <p className="text-secondary mt-1">Contratos, comprovantes, termos e relatórios</p>
        </div>
      </div>

      {/* Generate Section */}
      <div className="bg-surface rounded-lg border border-border p-4">
        <h3 className="text-lg font-semibold mb-3">Gerar Documentos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleGenerate('contract')}
            disabled={generating}
            className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">Contrato de Empréstimo</p>
                <p className="text-sm text-muted">Gera PDF do contrato</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => handleGenerate('settlement')}
            disabled={generating}
            className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-warning" />
              <div>
                <p className="font-medium">Termo de Quitação</p>
                <p className="text-sm text-muted">Para empréstimos quitados</p>
              </div>
            </div>
          </button>
          <button
            disabled={generating}
            className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-6 h-6 text-secondary" />
              <div>
                <p className="font-medium">Relatórios</p>
                <p className="text-sm text-muted">Financeiro, clientes, etc.</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome do arquivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary bg-surface w-full sm:w-48"
        >
          <option value="">Todos os tipos</option>
          <option value="CONTRACT">Contrato</option>
          <option value="RECEIPT">Comprovante</option>
          <option value="SETTLEMENT_TERM">Termo de Quitação</option>
          <option value="REPORT">Relatório</option>
          <option value="ATTACHMENT">Anexo</option>
        </select>
      </div>

      {/* Documents Table */}
      <div className="bg-surface rounded-lg border border-border shadow overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            <FileText className="w-12 h-12 mx-auto text-muted mb-3" />
            <p>Nenhum documento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr className="text-left text-sm font-medium text-secondary border-b border-border">
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Arquivo</th>
                  <th className="p-4 hidden md:table-cell">Relacionado</th>
                  <th className="p-4 hidden lg:table-cell">Cliente</th>
                  <th className="p-4">Tamanho</th>
                  <th className="p-4">Data</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {documents
                  .filter((d) => d.fileName.toLowerCase().includes(search.toLowerCase()))
                  .map((doc) => (
                    <tr key={doc.id} className="hover:bg-background transition-colors">
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(doc.documentType)}`}>
                          {getTypeIcon(doc.documentType)}
                          {getTypeLabel(doc.documentType)}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium truncate max-w-xs">{doc.fileName}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-secondary">
                        {doc.loan ? (doc.loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado') + ' #' + doc.loan.id.slice(0, 8) :
                         doc.payment ? 'Pagamento #' + doc.payment.id.slice(0, 8) : '—'}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-secondary">
                        {doc.client?.fullName || '—'}
                      </td>
                      <td className="p-4 text-sm text-secondary">{(doc.fileSize / 1024).toFixed(1)} KB</td>
                      <td className="p-4 text-sm text-muted">{format(new Date(doc.generatedAt), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            disabled={generating}
                            className="p-2 rounded-lg hover:bg-background text-secondary"
                            title="Baixar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
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
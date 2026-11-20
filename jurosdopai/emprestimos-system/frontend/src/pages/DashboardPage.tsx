import React, { useEffect, useState } from 'react';
import { reportsApi, receivablesApi, notificationsApi } from '../services/api';
import { format } from 'date-fns';
import {
  DollarSign, Users, CreditCard, AlertTriangle, TrendingUp, Clock,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';

interface DashboardStats {
  totalClients: number;
  activeLoans: number;
  paidOffLoans: number;
  totalReceivables: number;
  totalReceived: number;
  totalOutstanding: number;
  totalOverdue: number;
  collectionRate: number;
}

interface UpcomingReceivable {
  id: string;
  client: { fullName: string; whatsapp?: string };
  loan: { modality: string };
  sourceType: string;
  outstandingAmount: number;
  dueDate: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingReceivable[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsCount, setNotificationsCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [financialRes, upcomingRes, overdueRes, notificationsRes] = await Promise.all([
        reportsApi.financial(),
        receivablesApi.getUpcoming(7),
        receivablesApi.getOverdue(),
        notificationsApi.getUnreadCount(),
      ]);

      setStats(financialRes.data.summary);
      setUpcoming(upcomingRes.data.slice(0, 5));
      setOverdue(overdueRes.data.receivables.slice(0, 5));
      setNotificationsCount(notificationsRes.data.count);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-warning bg-warning-light';
      case 'PARTIAL': return 'text-warning bg-warning-light';
      case 'OVERDUE': return 'text-danger bg-danger-light';
      case 'PAID': return 'text-success bg-success-light';
      default: return 'text-muted bg-background';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total a Receber',
      value: stats?.totalReceivables || 0,
      icon: DollarSign,
      color: 'text-primary bg-primary-light',
      trend: { value: stats?.collectionRate || 0, label: 'Taxa de cobrança' },
    },
    {
      title: 'Total Recebido',
      value: stats?.totalReceived || 0,
      icon: TrendingUp,
      color: 'text-success bg-success-light',
      trend: { value: stats?.totalReceived || 0, label: 'Confirmado' },
    },
    {
      title: 'Saldo Devedor',
      value: stats?.totalOutstanding || 0,
      icon: DollarSign,
      color: 'text-warning bg-warning-light',
      trend: { value: stats?.totalOverdue || 0, label: 'Em atraso', isNegative: true },
    },
    {
      title: 'Clientes Ativos',
      value: stats?.totalClients || 0,
      icon: Users,
      color: 'text-secondary bg-background',
      trend: { value: stats?.activeLoans || 0, label: 'Empréstimos ativos' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-1">Visão geral da sua carteira de empréstimos</p>
        </div>
        <div className="flex items-center gap-4">
          {notificationsCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-danger-light text-danger rounded-full">
              {notificationsCount} novas
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div key={index} className="bg-surface rounded-lg border border-border p-5 shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">{card.title}</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(card.value)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${card.trend.isNegative ? 'text-danger bg-danger-light' : 'text-success bg-success-light'}`}>
                    {card.trend.isNegative ? '↑' : '✓'} {formatCurrency(card.trend.value)}
                  </span>
                  <span className="text-xs text-muted">{card.trend.label}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming & Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimentos */}
        <div className="bg-surface rounded-lg border border-border shadow">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Próximos Vencimentos (7 dias)
            </h2>
          </div>
          <div className="divide-y divide-border">
            {upcoming.length === 0 ? (
              <div className="p-6 text-center text-secondary">
                Nenhum vencimento nos próximos 7 dias
              </div>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="p-4 hover:bg-background transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.client.fullName}</p>
                      <p className="text-sm text-muted">
                        {item.sourceType === 'INTEREST_CHARGE' ? 'Juros' : 'Parcela'} • {item.loan.modality === 'PERIODIC_INTEREST' ? 'Juros Periódicos' : 'Parcelado'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.outstandingAmount)}</p>
                      <p className="text-xs text-muted">{format(new Date(item.dueDate), 'dd/MM')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {upcoming.length > 0 && (
            <div className="p-4 border-t border-border">
              <a href="/receivables" className="text-sm text-primary font-medium hover:underline">
                Ver todos os recebíveis →
              </a>
            </div>
          )}
        </div>

        {/* Em Atraso */}
        <div className="bg-surface rounded-lg border border-border shadow">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              Em Atraso
            </h2>
          </div>
          <div className="divide-y divide-border">
            {overdue.length === 0 ? (
              <div className="p-6 text-center text-secondary">
                Nenhum recebível em atraso
              </div>
            ) : (
              overdue.map((item) => (
                <div key={item.id} className="p-4 hover:bg-background transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.client.fullName}</p>
                      <p className="text-sm text-muted">
                        {item.sourceType === 'INTEREST_CHARGE' ? 'Juros' : 'Parcela'} • {item.daysOverdue} dias atraso
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-danger">{formatCurrency(item.outstandingAmount)}</p>
                      <p className="text-xs text-muted">{format(new Date(item.dueDate), 'dd/MM')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {overdue.length > 0 && (
            <div className="p-4 border-t border-border">
              <a href="/receivables?overdueOnly=true" className="text-sm text-primary font-medium hover:underline">
                Ver todos em atraso →
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg border border-border shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/clients/new" className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium">Novo Cliente</p>
            <p className="text-sm text-muted mt-1">Cadastrar novo cliente</p>
          </a>
          <a href="/loans/new" className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
            <CreditCard className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium">Novo Empréstimo</p>
            <p className="text-sm text-muted mt-1">Criar empréstimo</p>
          </a>
          <a href="/payments" className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
            <ArrowRightLeft className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium">Confirmar Pagamento</p>
            <p className="text-sm text-muted mt-1">Registrar recebimento</p>
          </a>
          <a href="/reports" className="p-4 rounded-lg border border-border hover:bg-background hover:border-primary transition-colors text-center">
            <ArrowUpRight className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="font-medium">Ver Relatórios</p>
            <p className="text-sm text-muted mt-1">Exportar dados</p>
          </a>
        </div>
      </div>
    </div>
  );
}
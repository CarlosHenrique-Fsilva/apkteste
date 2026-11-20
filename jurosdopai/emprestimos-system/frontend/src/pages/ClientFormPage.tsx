import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clientsApi } from '../services/api';
import { ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const clientSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(150),
  whatsapp: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(500).optional().or(z.literal('')),
});

type ClientForm = z.infer<typeof clientSchema>;

export function ClientFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: '',
      whatsapp: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (isEditing) {
      loadClient();
    }
  }, [id]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const res = await clientsApi.get(id!);
      reset({
        fullName: res.data.fullName,
        whatsapp: res.data.whatsapp || '',
        notes: res.data.notes || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ClientForm) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await clientsApi.update(id!, data);
        toast.success('Cliente atualizado com sucesso');
      } else {
        await clientsApi.create(data);
        toast.success('Cliente cadastrado com sucesso');
      }
      navigate('/clients');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-background text-secondary">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-primary">{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</h1>
          <p className="text-secondary mt-1">{isEditing ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface rounded-lg border border-border p-6 shadow space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-1.5">
            Nome Completo <span className="text-danger">*</span>
          </label>
          <input
            {...register('fullName')}
            id="fullName"
            type="text"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.fullName ? 'border-danger' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
            placeholder="João da Silva"
            disabled={submitting}
          />
          {errors.fullName && <p className="mt-1 text-sm text-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-primary mb-1.5">
            WhatsApp
          </label>
          <input
            {...register('whatsapp')}
            id="whatsapp"
            type="tel"
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.whatsapp ? 'border-danger' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors`}
            placeholder="(11) 99999-9999"
            disabled={submitting}
          />
          {errors.whatsapp && <p className="mt-1 text-sm text-danger">{errors.whatsapp.message}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-1.5">
            Observações
          </label>
          <textarea
            {...register('notes')}
            id="notes"
            rows={4}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.notes ? 'border-danger' : 'border-border'
            } focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-colors resize-none`}
            placeholder="Observações sobre o cliente..."
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
              'Salvar Cliente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 transition-colors';
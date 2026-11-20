# Sistema de Gestão de Empréstimos - EmprestimosSystem

## Visão Geral
Sistema financeiro pessoal completo para gestão de clientes, empréstimos, juros, parcelas, pagamentos e documentos. Hospedado em infraestrutura própria (Oracle Cloud Always Free).

## Estrutura do Projeto
```
emprestimos-system/
├── backend/          # NestJS API
├── frontend/         # React + TypeScript
├── database/         # Migrations e seeds
├── storage/          # Diretórios para PDFs e documentos
├── backups/          # Backups automáticos
├── nginx/            # Configuração do Nginx
├── docker-compose.yml # orquestração de containers
├── install.bat       # Script de instalação automatizada
└── README.md         # Esta documentação
```

## Como Rodar Localmente (Sem Oracle Cloud)

### Opção 1: Script Automático (Recomendado)
Execute o `install.bat` como Administrador. Ele fará tudo automaticamente:
1. Verifica se tem Node.js e Docker
2. Cria pastas necessárias
3. Cria arquivo .env
4. Sobe os containers Docker
5. Executa migrações do banco
6. Cria usuário admin inicial
7. Mostra link de acesso e credenciais

### Opção 2: Manual (Passo a Passo)

#### 1. Instalar Dependências
```bash
# No diretório do backend
cd emprestimos-system/backend
npm install

# No diretório do frontend
cd emprestimos-system/frontend
npm install
```

#### 2. Configurar Variáveis de Ambiente
```bash
cd emprestimos-system
copy .env.example .env
# Edite o .env com suas senhas
```

#### 3. Rodar o Sistema
```bash
# Iniciar tudo via Docker Compose
docker compose up -d

# Ou manualmente:
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

#### 4. Acessar
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs

## Credenciais de Teste (criadas automaticamente)
- **Email**: admin@emprestimos.com
- **Senha**: admin123

## Funcionalidades Disponíveis

### Telas Principais (Frontend)
1. **Dashboard** - Visão geral financeira, estatísticas, próximos vencimentos
2. **Clientes** - Cadastro, listagem, visualização de detalhes
3. **Empréstimos** - Criar, editar, ver detalhes com cálculo de juros
4. **Recebíveis** - Gerenciar cobranças, multas, pagamentos parciais
5. **Pagamentos** - Confirmar recebimentos manualmente, emitir comprovantes
6. **Documentos** - Gerar contratos, comprovantes, termos de quitação
7. **Relatórios** - Exportar em CSV/PDF, dashboard financeiro
8. **Configurações** - Definir parâmetros do sistema

### Backend API Endpoints Principais
- `POST /api/auth/login` / `POST /api/auth/register` - Autenticação
- `GET /api/auth/me` - Perfil do usuário
- `GET/POST /api/clients` - Gestão de clientes
- `GET/POST /api/loans` - Gestão de empréstimos
- `GET/POST /api/payments` - Confirmação de pagamentos
- `GET/POST /api/receivables` - Gestão de recebíveis
- `GET /api/documents/generate/*` - Geração de PDFs
- `GET /api/reports/*` - Relatórios financeiros
- `GET /health` - Health check

## Estrutura do Banco de Dados
- **18 tabelas** principais (users, clients, loans, installments, payments, receivables, etc.)
- Todos os valores monetários usam `NUMERIC(15,2)` - nunca FLOAT
- Relacionamentos via Prisma ORM
- Auditoria completa de todas as alterações

## Modos de Juros
1. **Juros Periódicos com Capital Preservado** - Cliente paga juros, capital permanece igual
2. **Empréstimo Parcelado** - Tabela Price, juros simples sobre capital ou saldo devedor

## Segurança
- Autenticação JWT com refresh tokens
- Hash de senha com Argon2id
- Validação de entrada com Zod/NestJS Guards
- Proteção contra duplicidade de pagamentos
- Transações no banco de dados para operações críticas
- Arquivos privados (acesso pelo backend apenas)

## Backup e Recuperação
- Scripts de backup automático incluídos
- Backup inclui: PostgreSQL, arquivos PDF, configurações
- Documentação de restauração em README

## Personalização
- Altere as senhas no arquivo `.env`
- Modifique a taxa de juros padrão no schema Prisma
- Adicione mais usuários via API ou interface
- Ajuste frequências de pagamento conforme necessidade

## Próximos Passos (Oracle Cloud)
1. Criar VM Ubuntu 24.04 ARM64
2. Subir os arquivos para `/sessions/brave-pensive-brahmagupta/mnt/jurosdopai/`
3. Executar `install.bat` ou script manual
4. Configurar domínio e HTTPS com Let's Encrypt
5. Desativar porta 5432 publicamente
6. Configurar backup externo

---

**Desenvolvido com ❤️ para uso pessoal**
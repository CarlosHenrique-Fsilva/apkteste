@echo off
title Instalando Sistema de Gestão de Empréstimos
echo.
echo ============================================
echo  INSTALAÇÃO DO SISTEMA DE EMPRÉSTIMOS
echo ============================================
echo.

echo 1. Verificando Node.js e Docker...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b
)

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Instale o Docker Desktop primeiro.
    pause
    exit /b
)

echo.
echo 2. Criando estrutura de pastas...
mkdir -p storage/{contracts,receipts,settlements,reports,attachments}
mkdir -p backups
echo ✓ Pastas criadas.

echo.
echo 3. Configurando variáveis de ambiente...

if not exist .env (
    echo DB_PASSWORD=mudar123 > .env
    echo JWT_SECRET=seu-segredo-aqui >> .env
    echo CHANGE_THIS_PASSWORD=true >> .env
    echo ✓ .env criado. Lembre-se de alterar as senhas!
) else (
    echo ✓ .env já existe.
)

echo.
echo 4. Iniciando containers Docker...
echo Isso pode levar alguns minutos na primeira vez (download de imagens).

docker compose up -d

echo.
echo 5. Aguardando banco de dados ficar pronto...
timeout /t 10 /nobreak >nul

echo.
echo 6. Executando migrações do banco de dados...
docker compose exec backend npx prisma migrate dev --create-only

echo.
echo 7. Criando usuário administrador inicial...
docker compose exec backend npx ts-node -e "
const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function createAdmin() {
    const existing = await prisma.user.findFirst({ where: { email: 'admin@emprestimos.com' } });
    if (existing) {
        console.log('Admin já existe.');
        return;
    }
    const hash = await argon2.hash('admin123', { type: argon2.argon2id });
    await prisma.user.create({
        data: { name: 'Administrador', email: 'admin@emprestimos.com', passwordHash: hash, status: 'ACTIVE' }
    });
    console.log('Usuário admin criado: admin@emprestimos.com / senha: admin123');
}

createAdmin().finally(() => prisma.$disconnect());
"

echo.
echo 8. Sistema pronto! Acesse em:
echo http://localhost:3000
echo.
echo Credenciais de teste:
echo Email: admin@emprestimos.com
echo Senha: admin123
echo.
pause
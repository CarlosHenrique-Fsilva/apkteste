# Juros do Pai - App Android

App nativo Android para armazenar e gerenciar taxas de juros localmente, sem dependências externas.

## 📱 Funcionalidades

- **CRUD Completo**: Adicionar, editar, excluir e listar registros de juros
- **Campos**: Valor (%), Data, Categoria, Descrição
- **Categorias**: Empréstimo, Investimento, Pessoal, Outro
- **Busca e Filtros**: Por texto, categoria, faixa de valor
- **Exportação CSV**: Salva na pasta Downloads
- **Estatísticas**: Contagem, média, soma, min/max, por categoria
- **100% Offline**: Room Database local, sem servidor/cloud
- **Material Design 3**: Interface moderna e responsiva

## 🛠 Requisitos

- Android Studio (recomendado) ou JDK 11+ + Gradle 8.5+
- Android SDK API 24+ (Android 7.0)
- Dispositivo/emulador Android 7.0+

## 🚀 Como Compilar

### Opção 1: Android Studio (Recomendado)
1. Abra o Android Studio
2. `File > Open` → selecione a pasta `jurosdopai`
3. Aguarde o Gradle sincronizar
4. `Build > Build Bundle(s) / APK(s) > Build APK(s)`
5. O APK estará em `app/build/outputs/apk/debug/app-debug.apk`

### Opção 2: Linha de Comando
```bash
# Linux/Mac
chmod +x gradlew
./gradlew assembleDebug

# Windows
gradlew.bat assembleDebug
```

O APK será gerado em: `app/build/outputs/apk/debug/app-debug.apk`

## 📦 Instalação no Celular

1. Ative "Fontes desconhecidas" nas configurações de segurança
2. Transfira o APK para o celular (USB, email, Drive, etc.)
3. Toque no APK para instalar

## 🏗 Arquitetura

```
app/
├── data/
│   ├── entity/       # JurosEntry (Room Entity)
│   ├── dao/          # JurosDao (Database Access)
│   ├── db/           # AppDatabase, Converters
│   └── repository/   # JurosRepository
├── di/               # DatabaseModule (Hilt)
├── ui/
│   ├── main/         # MainActivity, MainViewModel, JurosAdapter
│   └── addedit/      # AddEditActivity, AddEditViewModel
└── JurosApplication  # Hilt Application
```

**Tecnologias:**
- Kotlin + Coroutines + Flow
- Room Database (SQLite)
- Hilt (Dependency Injection)
- Material Components 3
- MPAndroidChart (gráficos futuros)
- OpenCSV (exportação)

## 📊 Próximas Features (Roadmap)

- [ ] Gráficos de evolução temporal
- [ ] Backup/restore automático
- [ ] Widget na tela inicial
- [ ] Temas personalizados
- [ ] Cálculo de juros compostos

## 🔒 Privacidade

- **Zero dados saem do dispositivo**
- Nenhuma permissão de internet necessária
- Dados ficam no SQLite local do app
- Exportação apenas via CSV local

## 📄 Licença

Uso pessoal - Código aberto para modificação.
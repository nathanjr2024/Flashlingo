# FlashLingo 🧠

App de flashcards para aprender inglês com repetição espaçada (SRS) e pronúncia de falantes nativos.

## Funcionalidades

- **5 telas**: Início, Estudar, Adicionar, Palavras, Estatísticas
- **SRS (Spaced Repetition System)**: algoritmo SM-2 com intervalos [0, 1, 3, 7, 14, 30, 90] dias
- **Pronúncia nativa**: áudio de falantes nativos via Wikimedia Commons (CC BY-SA) com cache local e fallback TTS
- **Offline-first**: funciona 100% sem conexão após primeira abertura
- **Flip card 3D**: animação suave com React Native Reanimated
- **Notificações diárias**: lembrete local às 9h para manter a sequência
- **Dark mode**: suporte automático via preferência do sistema

## Stack

- **React Native + Expo** (SDK 52+)
- **Expo Router** (navegação por abas)
- **Drizzle ORM + op-sqlite** (banco local SQLite)
- **React Native Reanimated** (animações)
- **Zustand** (state management)
- **expo-av + expo-speech** (áudio)
- **expo-notifications** (lembretes locais)
- **Jest + ts-jest** (testes)

## Pré-requisitos

- Node.js 20+
- npm 10+
- Expo CLI (`npx expo install`)
- Para iOS: macOS + Xcode
- Para Android: Android Studio + SDK

## Como Rodar

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Rodar no emulador/simulador
npx expo start

# Ou diretamente em um dispositivo
npx expo start --android
npx expo start --ios
```

## Como Testar

```bash
# Rodar todos os testes com cobertura
npx jest --config jest.config.js --coverage

# Rodar testes em modo watch
npx jest --watch

# Rodar testes de um arquivo específico
npx jest src/__tests__/srs.test.ts
```

### Cobertura Atual

| Módulo | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| SRS Algorithm | 100% | 96% | 100% | 100% |
| SRS Types | 100% | 100% | 100% | 100% |
| Audio Service | 77% | 58% | 72% | 79% |
| **Total** | **83%** | **67%** | **78%** | **84%** |

## Como Buildar

```bash
# Build Android (APK)
npx expo run:android

# Build iOS (requer macOS)
npx expo run:ios

# Build para produção (EAS)
npx eas build --platform android
npx eas build --platform ios
```

## Arquitetura

```
src/
├── data/           # Camada de dados
│   ├── db/         # Schema SQLite + conexão
│   ├── repositories/ # WordRepository, StatsRepository
│   └── services/   # AudioService, NotificationService, SeedService
├── domain/         # Lógica de negócio pura
│   └── srs/        # Algoritmo SRS (funções puras, testáveis)
├── presentation/   # Camada de apresentação
│   ├── theme/      # Design tokens (cores, espaçamentos, tipografia)
│   ├── components/ # FlipCard, RatingButtons
│   └── hooks/      # useStudySession
├── app/            # Expo Router (file-based routing)
│   ├── _layout.tsx # Root layout
│   └── (tabs)/     # 5 telas principais
└── __tests__/      # Testes unitários e de integração
```

## Estrutura de Dados

### Word

```typescript
{
  id: string;          // UUID
  word: string;        // Palavra em inglês
  translation: string; // Tradução em português
  phonetic: string;    // Pronúncia IPA
  pos: string;         // Classe gramatical
  example: string;     // Exemplo em inglês
  examplePt: string;   // Tradução do exemplo
  tag: string;         // Categoria
  level: number;       // Nível SRS (0-6)
  nextReview: string;  // Próxima revisão (YYYY-MM-DD)
  lastReview: string;  // Última revisão (ISO datetime)
  totalReviews: number;
  easeFactor: number;  // Fator de facilidade (1.3-3.0)
  createdAt: string;   // Data de criação (ISO datetime)
}
```

## Licença

Projeto pessoal. Áudio de pronúncia sob licença CC BY-SA (Wikimedia Commons).

## Atribuição

Áudio de pronúncia fornecido por [Wikimedia Commons](https://commons.wikimedia.org/) sob licença Creative Commons Attribution-ShareAlike.
# Flashlingo — Plano de Desenvolvimento

## 1. Stack Recomendada

**React Native + Expo** é a stack escolhida para o Flashlingo. Para um desenvolvedor com experiência em web/JS construindo um app de flashcards offline-first, RN+Expo oferece o caminho mais rápido para produção com bibliotecas maduras cobrindo todos os requisitos: `react-native-reanimated` para animações 3D de flip card, `expo-speech` + `expo-av` para TTS nativo como fallback e áudio remoto cacheado, `@op-engineering/op-sqlite` ou `drizzle-orm` para SQLite com migrações, suporte a dark mode e acessibilidade via primitivas core, e a maior comunidade e ecossistema para apps de aprendizado de idiomas. Flutter oferece fidelidade de animação marginalmente melhor mas impõe Dart e um modelo mental de widget tree que adiciona meses de ramp-up; KMP com Compose Multiplatform ainda está amadurecendo no iOS e carece de profundidade de ecossistema para este caso de uso.

## 2. Escopo MVP com Critérios de Aceite

### 2.1 Telas

| Tela | Critérios de Aceite |
|------|---------------------|
| **Início** | Exibe sequência de dias, 4 contadores (Total, Revisar Hoje, Aprendidas, Novas). Botão "Estudar Revisões de Hoje" leva à tela de estudo com 1 toque. Botão secundário "Estudar Todas". Data formatada em pt-BR. |
| **Estudo** | Barra de progresso atualizada por cartão. Flip card com animação 3D suave. Botão de áudio (pronúncia nativa) na frente e verso. 4 botões de avaliação (Errei/Difícil/Bom/Fácil) aparecem apenas após virar. Tela de resumo ao final com cartões, corretas e precisão. |
| **Nova Palavra** | Campos: palavra (obrigatório), fonética, tradução (obrigatório), classe gramatical, exemplo EN, exemplo PT, tag. Validação reativa com feedback visual. Busca automática de pronúncia ao digitar palavra. Toast de sucesso/confirmação. Detecção de duplicata. |
| **Minhas Palavras** | Busca por palavra ou tradução. Filtros: Todas, Revisar Hoje, Novas, Aprendidas. Lista ordenada alfabeticamente. Exclusão com modal de confirmação. Tags visuais de status SRS. |
| **Estatísticas** | Totais (palavras, revisões, sequência, precisão). Gráfico de barras por nível SRS. Mapa de calor das últimas 5 semanas. Explicação do algoritmo SRS. |

### 2.2 Funcionalidades Transversais

| Funcionalidade | Critérios de Aceite |
|----------------|---------------------|
| **Pronúncia Nativa** | Botão de alto-falante toca áudio de falante nativo. Fallback para TTS do sistema quando gravação não disponível. Cache local para uso offline. Atribuição ao autor quando exigido pela licença. |
| **Offline-First** | App funciona 100% sem conexão após primeira abertura. Áudios cacheados persistem entre sessões. Banco local é a fonte primária de dados. |
| **Dark Mode** | Tema escuro funcional desde a primeira versão. Contraste WCAG AA em todas as telas. Respeita preferência do sistema e permite override manual. |
| **Acessibilidade** | Leitor de tela compatível (TalkBack/VoiceOver). Fontes dinâmicas respeitadas. Labels em todos os elementos interativos. Navegação por teclado/switch. |
| **SRS Correto** | Módulo isolado e testável. Intervalos [0,1,3,7,14,30,90] dias. EaseFactor 1.3–3.0. Correções aplicadas (ver seção 4). |

## 3. Arquitetura

### 3.1 Camadas

```
src/
├── data/           # Camada de dados
│   ├── db/         # SQLite schema, migrations, repositories
│   ├── services/   # AudioService, ImportExportService
│   └── models/     # Entidades de dados (Word, Stats)
├── domain/         # Lógica de negócio pura
│   ├── srs/        # Módulo SRS (funções puras, sem UI/DB)
│   ├── validators/ # Validação de entrada
│   └── types/      # Tipos e interfaces de domínio
├── presentation/   # Camada de apresentação
│   ├── screens/    # 5 telas principais
│   ├── components/ # Componentes reutilizáveis (FlipCard, RatingButtons, etc.)
│   ├── navigation/ # expo-router tabs config
│   ├── hooks/      # Custom hooks (useStudySession, useWords, etc.)
│   └── theme/      # Design tokens, cores, tipografia
├── __tests__/      # Testes organizados por camada
│   ├── unit/       # SRS, validators
│   ├── integration/# DB repositories, services
│   └── e2e/        # Fluxos completos
└── assets/         # Ícones, fontes
```

### 3.2 Schema SQLite

```sql
CREATE TABLE words (
  id TEXT PRIMARY KEY,          -- UUID v4
  word TEXT NOT NULL UNIQUE,
  translation TEXT NOT NULL,
  phonetic TEXT DEFAULT '',
  pos TEXT DEFAULT 'noun',      -- noun|verb|adjective|adverb|phrase|other
  example TEXT DEFAULT '',
  example_pt TEXT DEFAULT '',
  tag TEXT DEFAULT 'Geral',
  level INTEGER DEFAULT 0 CHECK(level BETWEEN 0 AND 6),
  next_review TEXT,             -- ISO date YYYY-MM-DD or NULL
  last_review TEXT,             -- ISO datetime or NULL
  total_reviews INTEGER DEFAULT 0,
  ease_factor REAL DEFAULT 2.5 CHECK(ease_factor BETWEEN 1.3 AND 3.0),
  created_at TEXT NOT NULL      -- ISO datetime
);

CREATE TABLE stats (
  id INTEGER PRIMARY KEY CHECK(id = 1), -- Singleton row
  total_reviews INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_study_date TEXT,         -- YYYY-MM-DD or NULL
  activity TEXT DEFAULT '{}'    -- JSON: {"YYYY-MM-DD": count}
);

CREATE INDEX idx_words_next_review ON words(next_review);
CREATE INDEX idx_words_level ON words(level);
```

**Estratégia de migração:** Usar `drizzle-orm` com `drizzle-kit` para gerar e aplicar migrações versionadas. Cada mudança de schema gera um arquivo SQL numerado (`0001_initial.sql`, `0002_add_audio_url.sql`, etc.).

### 3.3 State Management

**Zustand** para estado global simples e direto:

- `useWordStore`: CRUD de palavras, filtros, busca
- `useStudyStore`: sessão ativa, fila, progresso, flip state
- `useStatsStore`: estatísticas globais, streak, atividade
- `useSettingsStore`: tema, idioma, preferências de áudio

Cada store é um hook React puro, sem boilerplate, com persistência automática via `zustand/middleware/persist` sincronizado com SQLite.

### 3.4 Navegação

**expo-router** com file-based routing e 5 tabs:

```
app/
├── (tabs)/
│   ├── _layout.tsx   # Tab navigator config
│   ├── index.tsx     # Início
│   ├── study.tsx     # Estudar
│   ├── add.tsx       # Adicionar
│   ├── words.tsx     # Minhas Palavras
│   └── stats.tsx     # Estatísticas
├── _layout.tsx       # Root layout (theme provider, gesture handler)
└── study/
    └── session.tsx   # Tela de sessão de estudo (push from tab)
```

### 3.5 Importação/Exportação de Dados

- **Exportar:** Serializa todas as palavras + stats para JSON, compartilha via `expo-sharing`
- **Importar:** Lê JSON, valida schema com zod, insere/upsert no SQLite, mostra resumo
- **Migração do protótipo:** Script único que lê localStorage exportado do HTML e converte para o formato do app

## 4. Módulo SRS — Especificação

### 4.1 Interface (Funções Puras)

```typescript
// domain/srs/types.ts
type WordState = {
  level: number;        // 0-6
  easeFactor: number;   // 1.3-3.0
  nextReview: string | null;  // YYYY-MM-DD
  lastReview: string | null;  // ISO datetime
  totalReviews: number;
};

type Rating = 1 | 2 | 3 | 4; // Again | Hard | Good | Easy

// domain/srs/srs.ts
export function calculateNextState(word: WordState, rating: Rating, today: string): WordState;
export function isDue(word: WordState, today: string): boolean;
export function getIntervalDays(level: number, easeFactor: number): number;
export function shuffleDeck<T>(deck: T[]): T[]; // Fisher-Yates
```

### 4.2 Regras Corrigidas

| Regra | Protótipo (bug) | App Nativo (correto) |
|-------|-----------------|----------------------|
| **ID** | `Date.now() + Math.random()` (decimal) | UUID v4 via `expo-crypto` ou `uuid` |
| **Shuffle** | `sort(() => Math.random() - 0.5)` (enviesado) | Fisher-Yates iterativo correto |
| **Data due** | `new Date(nextReview) <= new Date()` (compara horário) | Comparar strings YYYY-MM-DD ou normalizar para início do dia |
| **"Errei"** | Comentário diz "reset to 1", código faz `max(0, level-1)` | Reset para level 0, easeFactor -= 0.2, nextReview = amanhã |
| **Streak** | Só verifica dia anterior exato | Verifica se estudou hoje OU ontem; se pulou >1 dia, reset para 1 |
| **Ease Factor** | Aplicado apenas level >= 3 arbitrariamente | Aplicado em todos os níveis >= 1 como multiplicador do intervalo base |

### 4.3 Casos de Teste Obrigatórios

- Novo cartão (level 0) com cada rating → transição correta
- Cartão mestre (level 6) com rating Again → reset para level 0
- Ease factor nos limites (1.3 e 3.0) → não ultrapassa bounds
- Data de revisão no passado → isDue retorna true
- Data de revisão hoje → isDue retorna true
- Data de revisão amanhã → isDue retorna false
- Shuffle produz distribuição uniforme (teste estatístico com 10k iterações)
- Streak: estuda dia 1, pula dia 2, estuda dia 3 → streak = 1
- Streak: estuda dia 1, estuda dia 2 → streak = 2
- Rating Hard em level 0 → vai para level 1 (não fica negativo)

## 5. Estratégia de Pronúncia

### 5.1 Fonte Primária: Wikimedia Commons / Wiktionary

- **Licença:** Creative Commons (CC BY-SA 3.0/4.0) — uso comercial permitido com atribuição
- **API:** MediaWiki API gratuita, sem chave necessária, rate limit generoso (~200 req/s)
- **Cobertura:** Excelente para inglês (>100k pronúncias), boa para outros idiomas europeus
- **Formato:** OGG/MP3, qualidade variável mas geralmente boa
- **Cache:** Permitido e incentivado; arquivos são estáticos por natureza
- **Atribuição:** Mostrar "Wikimedia Commons" + link do autor na tela de detalhes da palavra
- **Implementação:** Buscar via API `https://en.wiktionary.org/api/rest_v1/page/summary/{word}`, extrair URL de áudio do campo `pronunciation`

### 5.2 Fonte Secundária: Tatoeba Audio

- **Licença:** CC BY 2.0 — uso comercial com atribuição
- **API:** REST gratuita, sem chave
- **Cobertura:** Menor que Wikimedia, mas útil como fallback
- **Uso:** Tentar quando Wikimedia não tem gravação para a palavra

### 5.3 Fallback: TTS Nativo

- **Biblioteca:** `expo-speech` (usa VoiceOver/TalkBack engine nativa)
- **Quando usar:** Nenhuma gravação encontrada nas fontes acima
- **Configuração:** Idioma `en-US` padrão, velocidade 0.8 para clareza
- **UX:** Ícone diferente (robô vs humano) para indicar que é sintético

### 5.4 Camada de Serviço

```typescript
// data/services/AudioService.ts
interface AudioResult {
  url: string | null;     // null = not found
  source: 'wikimedia' | 'tatoeba' | 'tts';
  attribution?: string;   // Required for wikimedia/tatoeba
  cached: boolean;
}

class AudioService {
  async fetchPronunciation(word: string, lang?: string): Promise<AudioResult>;
  async getCachedAudio(wordId: string): Promise<string | null>;
  async cacheAudio(wordId: string, url: string): Promise<string>; // Returns local path
  clearCache(): Promise<void>;
}
```

- **Cache local:** Diretório `FileSystem.cacheDirectory/audio/{wordId}.mp3` via `expo-file-system`
- **Proxy backend:** NÃO necessário — ambas as APIs são públicas e sem chave
- **Timeout:** 5s por requisição, retry 1x com backoff exponencial
- **Seleção de sotaque:** Priorizar `en-US` > `en-GB` > qualquer inglês; futuro: picker nas settings

## 6. Fases e Branches

| Fase | Branch | Entregáveis | Estimativa |
|------|--------|-------------|------------|
| **1. Setup + SRS** | `feat/srs-module` | Projeto Expo inicializado, módulo SRS com 100% coverage, schema SQLite, migrations | 3-4 dias |
| **2. Banco + Dados** | `feat/data-layer` | Repositories, CRUD completo, import/export JSON, seed data | 2-3 dias |
| **3. Áudio** | `feat/pronunciation-audio` | AudioService, cache, TTS fallback, atribuição | 3-4 dias |
| **4. Tela Estudo** | `feat/study-screen` | Flip card animado, sessão completa, rating buttons, resumo | 3-4 dias |
| **5. Telas Restantes** | `feat/remaining-screens` | Início, Adicionar, Palavras, Estatísticas completas | 4-5 dias |
| **6. Polish** | `feat/polish` | Dark mode, acessibilidade, validações, empty states, error handling | 3-4 dias |
| **7. E2E + Review** | `feat/e2e-tests` | Testes E2E do fluxo principal, code review final, security scan | 2-3 dias |
| **8. Publicação** | `chore/release` | Ícone, screenshots, política de privacidade, builds assinados, CI/CD | 3-4 dias |

**Total estimado:** 23-31 dias de trabalho focado.

## 7. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Animação flip card com performance ruim em dispositivos antigos | Média | Alto | Usar `react-native-reanimated` com worklets; testar em device real low-end; fallback para animação 2D simples |
| Wikimedia API muda ou fica indisponível | Baixa | Médio | Abstração via interface; fallback automático para Tatoeba → TTS; cache agressivo |
| SQLite migration falha em update de versão | Baixa | Alto | Migrations idempotentes; backup automático antes de migrar; testes de migration em CI |
| Streak lógica incorreta desmotiva usuário | Média | Médio | Testes extensivos de edge cases; considerar "streak freeze" como feature futura |
| Rejeição na App Store por conteúdo/licença | Baixa | Alto | Atribuição correta; política de privacidade clara; sem conteúdo gerado por usuário; review guidelines checklist |
| Contexto de conversa excede limite durante implementação | Alta | Médio | `/context-budget` e `/save-session` proativos; checkpoints ao fim de cada fase |

## 8. Decisões Tomadas

1. **Stack:** React Native + Expo (decidido via comparação multi-agente)
2. **Banco:** SQLite via drizzle-orm (migrações type-safe)
3. **Estado:** Zustand (simplicidade, sem boilerplate)
4. **Navegação:** expo-router (file-based, tabs nativas)
5. **Áudio primário:** Wikimedia Commons (licença aberta, sem chave, boa cobertura)
6. **Áudio fallback:** expo-speech TTS nativo (offline, zero dependência externa)
7. **SRS "Errei":** Reset para level 0 (comportamento claro e previsível)
8. **IDs:** UUID v4 (sem colisão, compatível JSON)
9. **Datas:** Comparação por string YYYY-MM-DD (sem ambiguidade de timezone/horário)

## 9. Pendências

- [ ] Aprovação deste plano pelo usuário
- [ ] URL do repositório GitHub para configurar origin
- [ ] Confirmação de autenticação `gh auth status`
- [ ] Decisão sobre nome do pacote (ex: `com.flashlingo.app`)
- [ ] Contas de desenvolvedor Google Play e Apple Developer (para fase 8)

## 10. Próximo Passo

Após aprovação deste plano, iniciar **Fase 1: Setup + SRS** na branch `feat/srs-module`:

1. Inicializar projeto Expo com TypeScript
2. Configurar drizzle-orm + SQLite
3. Implementar módulo SRS puro com testes
4. Commit por ciclo verde, PR ao final da fase
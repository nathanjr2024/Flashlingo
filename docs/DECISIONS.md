# Flashlingo — Registro de Decisões

## Stack: React Native + Expo
**Data:** 2026-10-04
**Contexto:** Escolha entre Flutter, React Native/Expo e Kotlin Multiplatform para app cross-platform.
**Decisão:** React Native + Expo.
**Motivo:** Maior ecossistema para apps de aprendizado de idiomas, bibliotecas maduras para todas as necessidades (reanimated para flip card, expo-speech para TTS, drizzle-orm para SQLite), comunidade ativa, e caminho mais rápido para produção partindo de experiência web/JS. Flutter oferece fidelidade de animação marginalmente melhor mas impõe Dart e curva de aprendizado. KMP ainda está amadurecendo no iOS.

## Banco de Dados: SQLite via drizzle-orm
**Data:** 2026-10-04
**Contexto:** Persistência local offline-first com migrações versionadas.
**Decisão:** SQLite com drizzle-orm e drizzle-kit.
**Motivo:** Type-safe migrations, query builder leve, suporte a SQLite nativo via op-sqlite, sem dependência de rede. Alternativas consideradas: WatermelonDB (overkill para este escopo), AsyncStorage (sem queries estruturadas).

## State Management: Zustand
**Data:** 2026-10-04
**Contexto:** Estado global simples sem boilerplate excessivo.
**Decisão:** Zustand.
**Motivo:** API mínima, hooks React puros, persistência via middleware integrada, sem providers aninhados. Alternativas: Redux Toolkit (boilerplate desnecessário), Context API (re-renders excessivos sem otimização manual).

## Navegação: expo-router
**Data:** 2026-10-04
**Contexto:** Navegação por abas com 5 telas principais.
**Decisão:** expo-router com file-based routing.
**Motivo:** Tabs nativas, deep linking automático, integração com Expo SDK, configuração declarativa. Alternativa: React Navigation (mais flexível mas mais configuração manual).

## Fonte de Áudio Primária: Wikimedia Commons / Wiktionary
**Data:** 2026-10-04
**Contexto:** Pronúncia de falante nativo gratuita e legalmente viável para publicação.
**Decisão:** Wikimedia Commons como fonte primária, Tatoeba como secundária, expo-speech TTS como fallback.
**Motivo:** Licença CC BY-SA permite uso comercial com atribuição. API pública sem chave necessária. Cobertura excelente para inglês (>100k pronúncias). Cache permitido. Sem necessidade de proxy backend.
**Atribuição:** Mostrar "Wikimedia Commons" + link do autor na tela de detalhes.

## SRS "Errei": Reset para Level 0
**Data:** 2026-10-04
**Contexto:** Comportamento do rating "Again/Errei" no algoritmo SRS.
**Decisão:** Reset para level 0 (não level-1).
**Motivo:** Comportamento claro e previsível. O protótipo tinha inconsistência entre comentário ("reset to 1") e código (`max(0, level-1)`). Reset completo é pedagogicamente mais efetivo para reforço de memória.

## IDs: UUID v4
**Data:** 2026-10-04
**Contexto:** Identificadores únicos para palavras.
**Decisão:** UUID v4 via `uuid` ou `expo-crypto`.
**Motivo:** Sem colisão, compatível JSON, padrão da indústria. O protótipo usava `Date.now() + Math.random()` que gera decimais e pode colidir.

## Datas: Comparação por String YYYY-MM-DD
**Data:** 2026-10-04
**Contexto:** Verificação de due date no SRS.
**Decisão:** Armazenar e comparar datas como strings YYYY-MM-DD.
**Motivo:** Elimina ambiguidade de timezone/horário. O protótipo comparava `new Date()` objects incluindo horário, causando revisões prematuras ou atrasadas.

## Skills Instaladas
**Data:** 2026-10-04
- `find-skills` (vercel-labs/skills): Descoberta e instalação de skills especializadas conforme necessidade.
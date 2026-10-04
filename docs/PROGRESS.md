# Flashlingo — Progresso

## Etapa Atual: Fase 5 — Polish + Notificações + CI
### Status: 🟡 Em Andamento

## Concluído

- [x] Leitura e análise completa do protótipo Flashlingo.html
- [x] Inventário do protótipo (docs/INVENTORY.md)
- [x] Plano de desenvolvimento (plan.md)
- [x] Registro de decisões (docs/DECISIONS.md)
- [x] Inicialização do repositório Git (branch main)
- [x] Criação do .gitignore
- [x] Criação dos documentos base (HUMAN_TODO.md)
- [x] Commit inicial com documentação
- [x] Inicialização do projeto Expo com TypeScript
- [x] Remote origin configurado (https://github.com/nathanjr2024/Flashlingo.git)

### Fase 1: SRS Module ✅ (PR #1 merged)
- [x] Módulo SRS puro com tipos e algoritmo corrigido
- [x] 36 testes unitários, 100% cobertura
- [x] Branch feat/srs-module → PR #1 → merged

### Fase 2: Data Layer ✅ (PR #2 merged)
- [x] Schema SQLite via drizzle-orm (words + stats tables)
- [x] Conexão DB com op-sqlite e auto-inicialização
- [x] WordRepository: CRUD, search, getDue, getNew, getLearned
- [x] StatsRepository: singleton stats, recordReview com streak/activity
- [x] drizzle.config.ts para migrações
- [x] 30 testes de integração, 66 testes totais passando
- [x] Branch feat/data-layer → PR #2 → merged

### Fase 3: Audio/Pronunciation ✅ (PR #3 merged)
- [x] AudioService com Wikimedia Commons API (CC BY-SA, sem chave)
- [x] Cache local de áudio via expo-file-system
- [x] Fallback TTS via expo-speech
- [x] Fetch de transcrição fonética via Wiktionary API
- [x] Tracking de atribuição CC BY-SA
- [x] 23 testes unitários com mocks nativos
- [x] 89 testes totais passando
- [x] Branch feat/pronunciation-audio → PR #3 → merged

### Fase 4: UI/Telas ✅ (PR #4 merged)
- [x] Design system theme tokens (Colors, Spacing, Radius, Typography, Shadows, Animation)
- [x] FlipCard component com animação 3D reanimated
- [x] RatingButtons component para feedback SRS
- [x] useStudySession hook (card queue, flip state, ratings)
- [x] Tela Home: streak card, 4 contadores, botões de estudo
- [x] Tela Study: flip card, botão áudio, barra progresso, resumo sessão
- [x] Tela Add Word: formulário, validação, detecção duplicata, auto-fetch áudio
- [x] Tela Words List: busca, filtros, modal confirmação exclusão
- [x] Tela Stats: distribuição por nível, heatmap atividade, explicação SRS
- [x] Expo Router tab navigation (5 abas) + app.json configurado
- [x] Branch feat/screens-ui → PR #4 → merged

## Em Andamento
- [ ] Notificações locais diárias (lembrete de estudo)
- [ ] GitHub Actions CI (build + testes em cada PR)
- [ ] Seed data (5 palavras demo na primeira abertura)
- [ ] Dark mode completo
- [ ] README com instruções de como rodar/testar/buildar

## Pendente
- [ ] Fase 6: E2E tests (fluxo principal)
- [ ] Fase 7: Security scan + code review final
- [ ] Fase 8: Publicação (ícone, screenshots, política privacidade, builds assinados)

## Histórico

| Data | Evento |
|------|--------|
| 2026-10-04 | Projeto iniciado. Análise do protótipo concluída. Documentação base criada. Git inicializado. |
| 2026-10-04 | Fase 1 concluída: módulo SRS puro com 36 testes. PR #1 merged. |
| 2026-10-04 | Fase 2 concluída: camada de dados SQLite com drizzle-orm. PR #2 merged. |
| 2026-10-04 | Fase 3 concluída: serviço de áudio com Wikimedia Commons + TTS fallback. PR #3 merged. |
| 2026-10-04 | Fase 4 concluída: 5 telas com Expo Router + design system. PR #4 merged. |
| 2026-10-05 | Retomada: autenticação GitHub re-confirmada. Iniciando Fase 5 (polish + notificações + CI). |
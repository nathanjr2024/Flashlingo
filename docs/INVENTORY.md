# Flashlingo — Inventário do Protótipo

## Telas

### 1. Início (Home)
- Sequência de dias (streak) com ícone 🔥
- 4 contadores: Total de Palavras, Para Revisar Hoje, Aprendidas, Novas (nunca vistas)
- Botão primário "Estudar Revisões de Hoje" com badge de quantidade
- Botão secundário "Estudar Todas as Palavras"
- Data formatada em pt-BR (weekday, day, month)

### 2. Estudo (Study)
- Barra de progresso horizontal
- Contador de cartões (atual/total)
- Flip card com animação 3D (perspective 1200px, rotateY 180deg)
  - Frente: classe gramatical, palavra, fonética, hint "Toque para revelar"
  - Verso: classe gramatical, tradução, exemplo EN, exemplo PT
- 4 botões de avaliação (aparecem após virar): Errei 😭, Difícil 😅, Bom 😊, Fácil 🤩
- Tela de resumo ao final: cartões estudados, corretas, precisão %
- Botões "Voltar ao Início" e "Estudar Novamente"

### 3. Nova Palavra (Add)
- Campos: Palavra em inglês*, Pronúncia, Tradução*, Classe gramatical (select), Exemplo EN, Exemplo PT, Categoria/Tag
- Tags pré-definidas: Geral, Trabalho, Viagem, Tecnologia, Phrasal Verbs, Idioms, Formalidades, Coloquial
- Validação: palavra e tradução obrigatórias; detecção de duplicata
- Toast de sucesso/confirmação

### 4. Minhas Palavras (List)
- Busca por palavra ou tradução
- Filtros: Todas, Revisar Hoje, Novas, Aprendidas
- Lista ordenada alfabeticamente
- Cada item mostra: palavra, tradução, tag de status (Nova/Revisar/Nível SRS), tag de categoria, próxima revisão
- Exclusão com modal de confirmação

### 5. Estatísticas (Stats)
- 4 cards: Total Palavras, Revisões Totais, Sequência, Precisão Geral
- Gráfico de barras: distribuição por nível SRS (Novo, Lv1-Lv5, Mestre)
- Mapa de calor: atividade das últimas 5 semanas (35 células)
- Explicação do algoritmo SRS com passos visuais

## Estrutura de Dados

### Word
```json
{
  "id": "number (Date.now() + Math.random())",
  "word": "string",
  "translation": "string",
  "phonetic": "string",
  "pos": "noun|verb|adjective|adverb|phrase|other",
  "example": "string",
  "examplePt": "string",
  "tag": "string",
  "level": 0-6,
  "nextReview": "ISO date string | null",
  "lastReview": "ISO datetime string | null",
  "totalReviews": "number",
  "easeFactor": "number (1.3-3.0)",
  "createdAt": "ISO datetime string"
}
```

### Stats
```json
{
  "totalReviews": "number",
  "totalCorrect": "number",
  "streak": "number",
  "lastStudyDate": "YYYY-MM-DD | null",
  "activity": "{ 'YYYY-MM-DD': count }"
}
```

## Algoritmo SRS (SM-2 inspirado)

### Intervalos por nível
| Nível | Dias | Label |
|-------|------|-------|
| 0 | 0 | Novo |
| 1 | 1 | Lv1 (1d) |
| 2 | 3 | Lv2 (3d) |
| 3 | 7 | Lv3 (7d) |
| 4 | 14 | Lv4 (14d) |
| 5 | 30 | Lv5 (30d) |
| 6 | 90 | Mestre |

### Regras de rating
- **Errei (1):** level = max(0, level-1), easeFactor -= 0.2 (min 1.3)
- **Difícil (2):** level = max(1, level), easeFactor -= 0.15 (min 1.3)
- **Bom (3):** level = min(6, level+1)
- **Fácil (4):** level = min(6, level+2), easeFactor += 0.1 (max 3.0)
- Se level 0 e rating >= 3: força level 1
- Ease factor aplicado apenas em level >= 3: `days * (easeFactor / 2.5)`

## Problemas Identificados no Protótipo

| Problema | Descrição | Correção no App |
|----------|-----------|-----------------|
| ID decimal | `Date.now() + Math.random()` gera IDs não-inteiros e potencialmente duplicados | UUID v4 |
| Shuffle enviesado | `sort(() => Math.random() - 0.5)` não produz distribuição uniforme | Fisher-Yates iterativo |
| Comparação de data | `new Date(nextReview) <= new Date()` compara horário, não apenas dia | Comparar strings YYYY-MM-DD ou normalizar para início do dia |
| "Errei" inconsistente | Comentário diz "reset to 1", código faz `max(0, level-1)` | Reset claro para level 0 |
| Streak frágil | Só verifica dia anterior exato; se estudar às 23h e depois às 01h, streak pode quebrar | Normalizar datas para YYYY-MM-DD |
| Ease factor arbitrário | Aplicado apenas em level >= 3 sem justificativa | Aplicar como multiplicador em todos os níveis >= 1 |
| Idioma fixo | Hardcoded inglês → português | Configuração futura de par de idiomas |
| Sem áudio | Protótipo não tem pronúncia | Adicionar camada de áudio com fontes nativas |

## Seed Data (5 palavras demo)
1. serendipity - serendipidade, descoberta feliz por acaso
2. resilient - resiliente, que se recupera bem
3. procrastinate - procrastinar, adiar tarefas
4. ephemeral - efêmero, que dura pouco
5. give up - desistir, abrir mão (Phrasal Verbs)
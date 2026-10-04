# Flashlingo — Pendências Humanas

Itens que só o usuário pode resolver. O agente não bloqueia nestes itens; usa placeholders/mocks e segue em frente.

## ✅ Concluído pelo Agente

- [x] Repositório GitHub criado e configurado (https://github.com/nathanjr2024/Flashlingo)
- [x] Autenticação `gh` CLI realizada
- [x] Remote origin configurado
- [x] 5 PRs criados e merged (SRS, Data Layer, Audio, UI, Polish)
- [x] Tag v0.1.0 criada e pushed
- [x] CI com GitHub Actions configurado (.github/workflows/ci.yml)
- [x] Política de privacidade criada (docs/PRIVACY_POLICY.md)
- [x] README completo com instruções de setup/teste/build
- [x] Todas as 5 telas implementadas (Home, Study, Add, Words, Stats)
- [x] Módulo SRS puro com 36 testes (100% cobertura)
- [x] Camada de dados SQLite com drizzle-orm
- [x] Serviço de áudio com Wikimedia Commons + TTS fallback
- [x] Notificações locais diárias (9h)
- [x] Seed data (5 palavras demo na primeira abertura)
- [x] Design system completo (cores, tipografia, espaçamentos)
- [x] Flip card 3D com React Native Reanimated
- [x] 89 testes passando no total

## 🔴 Pendências do Usuário (Obrigatórias para Publicação)

### 1. Contas de Desenvolvedor

#### Google Play Console
- [ ] Criar conta de desenvolvedor Google Play ($25 taxa única)
  - Acesse: https://play.google.com/console
  - Pague a taxa de $25 (única, não recorrente)
  - Complete o perfil de desenvolvedor
- [ ] Gerar chave de assinatura Android (keystore .jks)
  ```bash
  keytool -genkeypair -v -keystore flashlingo-release.keystore -alias flashlingo -keyalg RSA -keysize 2048 -validity 10000
  ```
  - Guarde a senha em local seguro (não commite no git!)
- [ ] Configurar EAS Build para Android
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  eas build --platform android --profile production
  ```
- [ ] Subir APK/AAB no Play Console
  - Crie novo app: "FlashLingo"
  - Package name: `com.flashlingo.app`
  - Faça upload do AAB gerado pelo EAS
  - Preencha ficha da loja (descrição, screenshots, política de privacidade)
  - URL da política de privacidade: https://github.com/nathanjr2024/Flashlingo/blob/main/docs/PRIVACY_POLICY.md

#### Apple Developer
- [ ] Inscrever-se no Apple Developer Program ($99/ano)
  - Acesse: https://developer.apple.com/programs/enroll/
  - Pague a taxa anual de $99
  - Aguarde aprovação (pode levar 24-48h)
- [ ] Configurar certificados no Xcode
  - Abra o projeto iOS: `npx expo run:ios`
  - Xcode → Preferences → Accounts → Manage Certificates
  - Crie certificado de distribuição iOS
- [ ] Criar App ID no Apple Developer Portal
  - Identifiers → + → App IDs → App
  - Description: FlashLingo
  - Bundle ID: Explicit → `com.flashlingo.app`
- [ ] Criar provisioning profile de distribuição
  - Profiles → + → Distribution → App Store
  - Selecione o App ID criado acima
  - Selecione o certificado de distribuição
  - Baixe e instale no Xcode
- [ ] Configurar EAS Build para iOS
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Criar app no App Store Connect
  - Acesse: https://appstoreconnect.apple.com
  - My Apps → + → New App
  - Name: FlashLingo
  - Bundle ID: com.flashlingo.app
  - SKU: flashlingo-001
- [ ] Configurar TestFlight para testes beta
  - App Store Connect → TestFlight
  - Adicione testadores internos/externos
  - Faça upload do build via EAS ou Transporter

### 2. Assets da Loja

#### Ícone do App
- [ ] Criar ícone final 1024x1024 PNG (sem transparência)
  - Sugestão: usar o roxo #6C63FF com um cérebro ou livro estilizado
  - Ferramentas: Figma, Canva, ou contratar designer
  - Salvar em: `assets/icon-final.png`
- [ ] Gerar variações automáticas
  ```bash
  npx expo generate:icons
  ```

#### Screenshots
- [ ] Tirar screenshots do app em dispositivo real ou simulador
  - **Google Play:** mínimo 2 screenshots (320px-3840px)
    - Tamanhos recomendados: 1080x1920 (phone), 1200x1920 (tablet)
  - **App Store:** mínimo 3 screenshots por tamanho de tela
    - iPhone 6.7": 1290x2796
    - iPhone 6.5": 1242x2688
    - iPad Pro 12.9": 2048x2732
  - Telas sugeridas:
    1. Home com streak e contadores
    2. Study com flip card virado
    3. Add Word com formulário preenchido
    4. Words List com filtros
    5. Stats com heatmap e gráfico
- [ ] Editar screenshots se necessário (adicionar molduras, textos promocionais)
  - Ferramentas: Screenshots Pro, App Launchpad, ou Figma

#### Feature Graphic (Google Play)
- [ ] Criar feature graphic 1024x500 PNG
  - Deve mostrar o app em uso ou branding principal
  - Sem transparência
  - Salvar em: `assets/feature-graphic.png`

### 3. Textos das Lojas

#### Google Play
- [ ] Título curto (30 chars max): "FlashLingo: Aprenda Inglês"
- [ ] Descrição curta (80 chars max): "Flashcards com repetição espaçada e pronúncia nativa. Aprenda inglês offline."
- [ ] Descrição completa (4000 chars max):
  ```
  FlashLingo é um app de flashcards para aprender inglês com repetição espaçada (SRS) e pronúncia de falantes nativos.

  🧠 REPETIÇÃO ESPAÇADA INTELIGENTE
  Nosso algoritmo SRS adapta-se ao seu ritmo de aprendizado, mostrando cada palavra no momento ideal para maximizar a retenção.

  🔊 PRONÚNCIA NATIVA
  Ouça cada palavra pronunciada por falantes nativos. Áudios da Wikimedia Commons com cache local para uso offline.

  📚 5 TELAS COMPLETAS
  • Início: veja sua sequência, estatísticas e cartões pendentes
  • Estudar: flip cards 3D com avaliação de dificuldade
  • Adicionar: crie seus próprios flashcards com exemplos
  • Palavras: busque, filtre e gerencie seu deck
  • Estatísticas: acompanhe seu progresso com gráficos e heatmap

  ✨ FUNCIONALIDADES
  • 100% offline após primeiro uso
  • Notificações diárias para manter a sequência
  • Dark mode automático
  • Sem anúncios, sem login, sem rastreamento
  • Código aberto e transparente

  Comece hoje com 5 palavras demo incluídas!
  ```
- [ ] Categoria: Educação
- [ ] Tags: inglês, flashcards, vocabulário, educação, idiomas, SRS
- [ ] Classificação etária: preencher questionário IARC (provavelmente "Todos")
- [ ] Política de privacidade: https://github.com/nathanjr2024/Flashlingo/blob/main/docs/PRIVACY_POLICY.md

#### App Store
- [ ] Nome (30 chars max): "FlashLingo: Aprenda Inglês"
- [ ] Subtítulo (30 chars max): "Flashcards SRS + Áudio Nativo"
- [ ] Descrição (mesma do Google Play, adaptada se necessário)
- [ ] Keywords (100 chars max): inglês,flashcards,vocabulário,SRS,educação,idiomas,pronúncia,offline,estudo,aprender
- [ ] Support URL: https://github.com/nathanjr2024/Flashlingo
- [ ] Privacy Policy URL: https://github.com/nathanjr2024/Flashlingo/blob/main/docs/PRIVACY_POLICY.md
- [ ] Classificação etária: preencher questionário (provavelmente 4+)

### 4. Builds de Produção

#### Android
- [ ] Gerar keystore de produção (veja item 1 acima)
- [ ] Configurar `eas.json` com credenciais
  ```json
  {
    "cli": { "version": ">= 3.0.0" },
    "build": {
      "production": {
        "android": {
          "buildType": "app-bundle",
          "credentialsSource": "local"
        }
      }
    }
  }
  ```
- [ ] Rodar build de produção
  ```bash
  eas build --platform android --profile production
  ```
- [ ] Baixar AAB gerado e fazer upload no Play Console

#### iOS
- [ ] Configurar certificados Apple (veja item 1 acima)
- [ ] Rodar build de produção
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Baixar IPA gerado e fazer upload via Transporter ou App Store Connect

### 5. Testes Beta

#### Google Play
- [ ] Criar faixa de teste interno no Play Console
  - Testing → Internal testing → Create new release
  - Faça upload do AAB
  - Adicione emails de testadores (mínimo 1, máximo 100)
- [ ] Publicar para teste interno
- [ ] Coletar feedback dos testadores
- [ ] Corrigir bugs reportados
- [ ] Promover para teste fechado/aberto se necessário
- [ ] Submeter para revisão de produção

#### App Store
- [ ] Adicionar testadores no TestFlight
  - App Store Connect → TestFlight → Internal Testing
  - Adicione emails (mínimo 1, máximo 100)
- [ ] Publicar build para TestFlight
- [ ] Coletar feedback dos testadores
- [ ] Corrigir bugs reportados
- [ ] Submeter para revisão da App Store

### 6. Pós-Publicação
- [ ] Monitorar reviews e ratings nas lojas
- [ ] Responder a reviews dos usuários
- [ ] Monitorar crash reports (considerar adicionar Sentry ou Firebase Crashlytics)
- [ ] Planejar próximas features baseadas em feedback:
  - Export/import de deck (JSON)
  - Múltiplos decks
  - Estatísticas avançadas
  - Widgets de home screen
  - Suporte a outros idiomas (espanhol→português, etc.)
  - Sync entre dispositivos (opcional, requer backend)

## 📋 Checklist Final de Submissão

### Google Play
- [ ] Conta de desenvolvedor ativa
- [ ] Keystore de produção gerado e seguro
- [ ] AAB de produção buildado
- [ ] Ícone 512x512 uploaded
- [ ] Feature graphic 1024x500 uploaded
- [ ] Mínimo 2 screenshots uploaded
- [ ] Título, descrição curta e completa preenchidos
- [ ] Categoria e tags selecionadas
- [ ] Classificação etária completada
- [ ] Política de privacidade URL preenchida
- [ ] Teste interno publicado e testado
- [ ] Submissão para produção enviada

### App Store
- [ ] Apple Developer Program ativo
- [ ] Certificados e provisioning profiles configurados
- [ ] IPA de produção buildado
- [ ] App criado no App Store Connect
- [ ] Ícone 1024x1024 uploaded
- [ ] Mínimo 3 screenshots por tamanho uploaded
- [ ] Nome, subtítulo e descrição preenchidos
- [ ] Keywords preenchidas
- [ ] Support URL e Privacy Policy URL preenchidos
- [ ] Classificação etária completada
- [ ] TestFlight publicado e testado
- [ ] Submissão para revisão enviada

## 🚀 Comandos Úteis

```bash
# Rodar app em desenvolvimento
npx expo start

# Build Android local
npx expo run:android

# Build iOS local (macOS only)
npx expo run:ios

# Build produção com EAS
eas build --platform android --profile production
eas build --platform ios --profile production

# Submeter para lojas
eas submit --platform android
eas submit --platform ios

# Rodar testes
npx jest --coverage

# Verificar autenticação GitHub
gh auth status

# Ver PRs
gh pr list --state all
```

## 📞 Suporte

Para dúvidas técnicas sobre o código, abra uma issue no repositório:
https://github.com/nathanjr2024/Flashlingo/issues

Para dúvidas sobre publicação nas lojas, consulte:
- Google Play: https://support.google.com/googleplay/android-developer
- App Store: https://developer.apple.com/support/
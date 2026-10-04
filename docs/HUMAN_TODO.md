# Flashlingo — Pendências Humanas

Itens que só o usuário pode resolver. O agente não bloqueia nestes itens; usa placeholders/mocks e segue em frente.

## Contas e Credenciais

### 1. Repositório GitHub
- [ ] Criar repositório privado no GitHub (ou fornecer URL existente)
- [ ] Autenticar `gh` CLI: `gh auth login`
- **Status atual:** Trabalhando localmente apenas
- **Quando necessário:** Antes do primeiro push/PR

### 2. Conta Google Play Console
- [ ] Criar conta de desenvolvedor Google Play ($25 taxa única)
- [ ] Gerar chave de assinatura Android (keystore .jks)
- [ ] Preencher ficha da loja (descrição, screenshots, política de privacidade)
- **Quando necessário:** Fase 8 (Publicação)

### 3. Conta Apple Developer
- [ ] Inscrever-se no Apple Developer Program ($99/ano)
- [ ] Configurar certificados e provisioning profiles no Xcode
- [ ] Criar app no App Store Connect
- [ ] Configurar TestFlight para testes beta
- **Quando necessário:** Fase 8 (Publicação)

### 4. Nome do Pacote
- [ ] Decidir package name (sugestão: `com.flashlingo.app`)
- **Impacto:** Define ID nas lojas e configuração do Expo
- **Quando necessário:** Antes do primeiro build de release

## Revisões e Aprovações

### 5. Política de Privacidade
- [ ] Revisar e aprovar a política de privacidade gerada automaticamente
- [ ] Hospedar em URL acessível (GitHub Pages ou similar)
- **Quando necessário:** Fase 8 (obrigatório para ambas as lojas)

### 6. Screenshots e Assets da Loja
- [ ] Aprovar screenshots gerados para Google Play e App Store
- [ ] Aprovar ícone do app (512x512)
- [ ] Aprovar feature graphic (Google Play: 1024x500)
- **Quando necessário:** Fase 8

## Notas Técnicas

- Áudio de pronúncia: usando Wikimedia Commons (sem chave necessária). Se futuramente quiser Forvo ou outra fonte paga, será necessário criar conta e configurar proxy backend.
- Notificações push: usando expo-notifications local (sem servidor). Para push remoto futuro, precisará de Firebase Cloud Messaging (gratuito) e/ou APNs.
- Analytics/Crash reporting: não incluído no MVP. Futuro: Sentry ou Firebase Crashlytics (ambos gratuitos até certo volume).
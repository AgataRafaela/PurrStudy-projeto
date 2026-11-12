# PurrStudy

Aplicação React + Vite para foco de estudos, com Pomodoro, cronômetro livre, notificações do navegador, login Google via Firebase Authentication e histórico diário no Cloud Firestore.

## Requisitos
- Node.js 20+
- Projeto no [Firebase Console](https://console.firebase.google.com/)

## Rodar localmente
```bash
npm install
cp .env.example .env.local
npm run dev
```
Preencha `.env.local` com as credenciais de configuração do app Web Firebase. Reinicie o Vite após editar variáveis.

## Configuração do Firebase
1. Crie um projeto e registre um app Web.
2. Em **Authentication → Sign-in method**, habilite **Google**.
3. Em **Authentication → Settings → Authorized domains**, confira `localhost` e os domínios reais de produção.
4. Crie o banco **Cloud Firestore**.
5. Instale Firebase CLI, faça login e publique as regras:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use --add
   firebase deploy --only firestore:rules
   ```
6. Configure as variáveis `VITE_FIREBASE_*` no ambiente de deploy.

## Segurança e comportamento
- O login Google usa `signInWithPopup` e `onAuthStateChanged`; o app não guarda tokens manualmente.
- O histórico fica em `usuarios/{uid}/historico_estudos/{YYYY-MM-DD}`. As regras restringem o acesso ao UID autenticado.
- As credenciais `VITE_*` são configuração pública do cliente, não segredos. A segurança depende das regras do Firestore e da configuração do Auth.
- O total diário é incrementado apenas quando uma sessão Pomodoro completa. No cronômetro livre, o usuário pode finalizar uma sessão manualmente para registrá-la.
- A data do documento é calculada no fuso local do navegador, evitando o desvio de data que pode ocorrer com `toISOString()` perto da meia-noite.
- A Web Notifications API exige permissão explícita e normalmente contexto seguro (HTTPS ou localhost). O app pede permissão somente quando o usuário clicar no botão de ativação.
- O navegador pode suspender timers em abas em segundo plano; a contagem usa timestamps para reduzir deriva.
- Para produção, considere App Check, monitoramento de erros, testes das regras com Firebase Emulator Suite e política de privacidade.

## Estrutura
- `src/firebase.js`: inicialização segura e Auth/Firestore.
- `src/services/studyHistory.js`: gravação/leitura do histórico.
- `src/components/`: cabeçalho, temporizador e histórico.
- `firestore.rules`: isolamento dos dados por usuário.

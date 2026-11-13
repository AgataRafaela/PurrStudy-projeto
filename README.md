# 🐱 PurrStudy

o **PurrStudy** é uma aplicação web desenvolvida para ajudar estudantes a organizarem seus momentos de estudo, manterem a concentração e acompanharem sua evolução ao longo do tempo.

com uma interface intuitiva, o projeto reúne ferramentas de produtividade em um só lugar, oferecendo uma experiência simples e agradável para quem deseja criar uma rotina de estudos mais consistente.

a aplicação conta com temporizador Pomodoro, cronômetro livre, notificações do navegador e histórico de estudos sincronizado com a conta do usuário.

## 🐾 Funcionalidades

- **Temporizador Pomodoro:** utilize ciclos de concentração e descanso para organizar seus estudos e manter o foco.
- **Cronômetro livre:** acompanhe seu tempo de estudo sem duração predefinida, com a possibilidade de finalizar e registrar suas sessões manualmente.
- **Notificações:** receba avisos do navegador relacionados ao temporizador, mediante autorização.
- **Histórico de estudos:** acompanhe o tempo total estudado e a quantidade de sessões concluídas em cada dia.
- **Autenticação com Google:** entre com sua conta Google para acessar seus dados pessoais.
- **Sincronização na nuvem:** seus registros de estudo são armazenados no Cloud Firestore e associados à sua conta.
- **Progressive Web App (PWA):** instale o PurrStudy em dispositivos compatíveis e acesse a aplicação como um aplicativo. (em alguns navegadores não aparece para instalar automaticamente, basta clicar nos 3 pontinhos que vai encontrar para instalar ele)
- **Interface intuitiva:** experiência visual leve e acolhedora, pensada para tornar os momentos de estudo mais agradáveis.


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
- O total diário é incrementado apenas quando uma sessão Pomodoro completa. No cronômetro livre, o usuário pode finalizar uma sessão manualmente para registrá-la.
- A Web Notifications API exige permissão explícita e normalmente contexto seguro (HTTPS ou localhost). O app pede permissão somente quando o usuário clicar no botão de ativação.
- O navegador pode suspender timers em abas em segundo plano; a contagem usa timestamps para reduzir deriva.

<img width="1349" height="767" alt="Captura de tela 2026-11-13 113118" src="https://github.com/user-attachments/assets/5e1014a7-a4ff-4940-b181-efe90de6059e" />

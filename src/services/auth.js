import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase';

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase ainda não foi configurado. Preencha o .env.local.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  if (!auth) return;
  return signOut(auth);
}

export function friendlyAuthError(error) {
  const messages = {
    'auth/popup-closed-by-user': 'A janela de login foi fechada antes de concluir.',
    'auth/popup-blocked': 'O navegador bloqueou a janela. Permita pop-ups e tente novamente.',
    'auth/cancelled-popup-request': 'Já existe uma tentativa de login em andamento.',
    'auth/unauthorized-domain': 'Este domínio não está autorizado no Firebase Authentication.',
    'auth/network-request-failed': 'Falha de conexão. Confira sua internet e tente novamente.',
  };
  return messages[error?.code] || 'Não foi possível entrar agora. Tente novamente.';
}
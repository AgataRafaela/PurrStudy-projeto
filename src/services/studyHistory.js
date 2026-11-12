import {
  collection, doc, getDocs, increment, limit, orderBy, query,
  serverTimestamp, setDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

function localDateId(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function saveCompletedSession(seconds) {
  const user = auth?.currentUser;
  if (!user || !db) return { saved: false, reason: 'signed-out' };
  const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  if (!safeSeconds) return { saved: false, reason: 'empty-session' };

  const dayRef = doc(db, 'usuarios', user.uid, 'historico_estudos', localDateId());
  await setDoc(dayRef, {
    tempoTotalSegundos: increment(safeSeconds),
    sessoesConcluidas: increment(1),
    ultimaAtualizacao: serverTimestamp(),
  }, { merge: true });

  return { saved: true };
}

export async function getRecentHistory() {
  const user = auth?.currentUser;
  if (!user || !db) return [];
  const historyRef = collection(db, 'usuarios', user.uid, 'historico_estudos');
  const historyQuery = query(historyRef, orderBy('ultimaAtualizacao', 'desc'), limit(7));
  const snapshot = await getDocs(historyQuery);
  return snapshot.docs.map((item) => ({ data: item.id, ...item.data() }));
}

export function formatDuration(totalSeconds = 0) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${String(minutes).padStart(2, '0')}min`;
  return `${minutes} min`;
}

export function formatDate(dateId) {
  const [year, month, day] = dateId.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    .format(new Date(year, month - 1, day));
}
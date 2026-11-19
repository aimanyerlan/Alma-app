import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function fetchSchedule() {
  const querySnapshot = await getDocs(collection(db, 'schedule'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
} 
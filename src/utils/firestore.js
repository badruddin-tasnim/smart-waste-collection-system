import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, runTransaction, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function getAll(colName) {
  const snap = await getDocs(collection(db, colName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getWhere(colName, field, op, value) {
  const q = query(collection(db, colName), where(field, op, value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getById(colName, id) {
  const snap = await getDoc(doc(db, colName, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addRecord(colName, data) {
  const ref = await addDoc(collection(db, colName), data);
  return { id: ref.id, ...data };
}

export async function updateRecord(colName, id, updates) {
  await updateDoc(doc(db, colName, id), updates);
}

export async function deleteRecord(colName, id) {
  await deleteDoc(doc(db, colName, id));
}

// Generates a sequential human-readable code like "RT-014", safe under
// concurrent writes via a Firestore transaction on counters/{prefix}.
export async function nextCode(prefix) {
  const counterRef = doc(db, "counters", prefix);
  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? snap.data().count : 0;
    const updated = current + 1;
    tx.set(counterRef, { count: updated }, { merge: true });
    return updated;
  });
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

export { serverTimestamp };

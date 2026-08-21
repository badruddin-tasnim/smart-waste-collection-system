import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * Register a new resident.
 * Creates a Firebase Auth account and a matching /users/{uid} document.
 */
export async function registerResident({ name, email, password, phone, address, zone }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    phone: phone || "",
    address: address || "",
    zone: zone || "",
    role: "resident",
    createdAt: serverTimestamp(),
  });
  return cred.user;
}

/**
 * Sign in an existing user (resident or admin).
 * Returns the Firebase User object.
 */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/**
 * Fetch the Firestore user profile for the given uid.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

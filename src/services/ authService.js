import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase";

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  return signOut(auth);
}
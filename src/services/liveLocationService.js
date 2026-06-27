import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db } from "../firebase/firebase";

const liveRef = collection(db, "liveLocations");

export async function ensureAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function updateMyLiveLocation(lat, lng) {
  const user = await ensureAnonymousUser();

  return setDoc(doc(db, "liveLocations", user.uid), {
    lat,
    lng,
    displayName: "Anonymous User",
    status: "online",
    updatedAt: serverTimestamp(),
  });
}

export async function removeMyLiveLocation() {
  if (!auth.currentUser) return;
  return deleteDoc(doc(db, "liveLocations", auth.currentUser.uid));
}

export function listenLiveLocations(callback) {
  return onSnapshot(liveRef, (snapshot) => {
    const now = Date.now();

    const users = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((u) => {
        if (!u.lat || !u.lng) return false;
        if (!u.updatedAt?.toDate) return true;

        const diff = now - u.updatedAt.toDate().getTime();
        return diff < 5 * 60 * 1000;
      });

    callback(users);
  });
}
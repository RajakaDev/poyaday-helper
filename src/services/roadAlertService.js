import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const roadAlertsRef = collection(db, "roadAlerts");

export function listenRoadAlerts(callback) {
  const q = query(roadAlertsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    },
    (error) => {
      console.error(error);
      callback([]);
    }
  );
}

export async function addRoadAlert(data) {
  return addDoc(roadAlertsRef, {
    ...data,
    active: true,
    reports: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateRoadAlert(id, data) {
  return updateDoc(doc(db, "roadAlerts", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRoadAlert(id) {
  return deleteDoc(doc(db, "roadAlerts", id));
}
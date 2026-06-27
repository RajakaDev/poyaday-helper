import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const roadAlertsRef = collection(db, "roadAlerts");

export function listenRoadAlerts(callback) {
  const q = query(
    roadAlertsRef,
    orderBy("createdAt", "desc"),
    limit(200)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })));
    },
    (error) => {
      console.error("Road alerts listener:", error);
      callback([]);
    }
  );
}

export async function addRoadAlert(data) {
  return addDoc(roadAlertsRef, {
    type: data.type || "other",

    area: data.area || "",
    town: data.town?.trim() || "",
    description: data.description?.trim() || "",

    lat: data.lat ?? null,
    lng: data.lng ?? null,

    active: true,
    status: "active",

    reports: 0,
    views: 0,

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

export async function reportRoadAlert(alertId, userId, reason) {
  await setDoc(
    doc(db, "roadAlerts", alertId, "reports", userId),
    {
      reason,
      createdAt: serverTimestamp(),
    }
  );

  const reports = await getDocs(
    collection(db, "roadAlerts", alertId, "reports")
  );

  await updateRoadAlert(alertId, {
    reports: reports.size,
    active: reports.size < 10,
  });
}
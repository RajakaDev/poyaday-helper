import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const promotionsRef = collection(db, "promotions");

export function listenPromotions(callback) {
  const q = query(promotionsRef, orderBy("priority", "desc"), limit(50));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("Promotions listener error:", error);
      callback([]);
    }
  );
}

export function listenActivePromotions(callback) {
  return listenPromotions((promotions) => {
    callback(promotions.filter((p) => p.active !== false));
  });
}

export async function addPromotion(data) {
  return addDoc(promotionsRef, {
    title: data.title?.trim() || "",
    businessName: data.businessName?.trim() || "",
    description: data.description?.trim() || "",
    imageUrl: data.imageUrl?.trim() || "",
    targetUrl: data.targetUrl?.trim() || "",
    phone: data.phone?.trim() || "",
    whatsapp: data.whatsapp?.trim() || "",
    category: data.category || "other",
    district: data.district || "",
    town: data.town?.trim() || "",
    priority: Number(data.priority || 0),
    active: data.active ?? true,
    impressions: 0,
    clicks: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePromotion(id, data) {
  return updateDoc(doc(db, "promotions", id), {
    ...data,
    priority: Number(data.priority || 0),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePromotion(id) {
  return deleteDoc(doc(db, "promotions", id));
}

export async function trackPromotionImpression(id) {
  return updateDoc(doc(db, "promotions", id), {
    impressions: increment(1),
  });
}

export async function trackPromotionClick(id) {
  return updateDoc(doc(db, "promotions", id), {
    clicks: increment(1),
  });
}
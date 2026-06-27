import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const lostFoundRef = collection(db, "lostFound");

export async function addLostFound(data) {
  return addDoc(lostFoundRef, {
    title: data.title?.trim() || "",
    description: data.description?.trim() || "",

    type: data.type || "lost",          // lost / found
    itemType: data.itemType || "other",

    district: data.district || "",
    town: data.town?.trim() || "",
    address: data.address?.trim() || "",

    contactName: data.contactName?.trim() || "",
    contactPhone: data.contactPhone?.trim() || "",

    image: data.image || "",

    lat: data.lat || null,
    lng: data.lng || null,

    status: "open",
    verified: false,
    hidden: false,

    reports: 0,
    views: 0,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateLostFound(id, data) {
  return updateDoc(doc(db, "lostFound", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
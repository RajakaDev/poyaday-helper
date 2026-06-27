import {
  addDoc,
  collection,
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

const placesRef = collection(db, "places");

export function listenPlaces(callback) {
  const q = query(placesRef, orderBy("createdAt", "desc"), limit(300));

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("Places listener error:", error);
      callback([]);
    }
  );
}

export async function addPlace(placeData) {
  return addDoc(placesRef, {
    name: placeData.name?.trim() || "",
    type: placeData.type || "other",
    category: placeData.category || placeData.type || "other",

    district: placeData.district || "",
    town: placeData.town?.trim() || "",
    address: placeData.address?.trim() || "",
    description: placeData.description?.trim() || "",
    mapLink: placeData.mapLink?.trim() || "",

    date: placeData.date || "",
    openTime: placeData.openTime || "",
    closeTime: placeData.closeTime || "",

    lat: placeData.lat ?? null,
    lng: placeData.lng ?? null,

    festivalType: placeData.festivalType || "poyaday",
    year: placeData.year || "2026",

    verified: false,
    hidden: false,
    status: "open",
    crowdLevel: "medium",

    crowdVotesCount: 0,
    reports: 0,
    favorites: 0,
    views: 0,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePlace(placeId, data) {
  return updateDoc(doc(db, "places", placeId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function voteCrowd(placeId, userId, crowdLevel) {
  await setDoc(doc(db, "places", placeId, "crowdVotes", userId), {
    crowdLevel,
    votedAt: serverTimestamp(),
  });

  const snap = await getDocs(collection(db, "places", placeId, "crowdVotes"));
  const votes = snap.docs.map((d) => d.data().crowdLevel);

  const counts = votes.reduce((acc, level) => {
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  await updatePlace(placeId, {
    crowdLevel: winner?.[0] || "medium",
    crowdVotesCount: votes.length,
  });
}

export function listenPlaceComments(placeId, callback) {
  const q = query(
    collection(db, "places", placeId, "comments"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("Comments listener error:", error);
      callback([]);
    }
  );
}

export async function addPlaceComment(placeId, message) {
  return addDoc(collection(db, "places", placeId, "comments"), {
    message: message.trim(),
    user: "anonymous",
    createdAt: serverTimestamp(),
  });
}

export async function reportPlace(placeId, userId, reason) {
  await setDoc(doc(db, "places", placeId, "reports", userId), {
    reason,
    reportedAt: serverTimestamp(),
  });

  const snap = await getDocs(collection(db, "places", placeId, "reports"));

  await updatePlace(placeId, {
    reports: snap.size,
    hidden: snap.size >= 10,
  });
}

export function listenPlacePhotos(placeId, callback) {
  const q = query(
    collection(db, "places", placeId, "photos"),
    orderBy("createdAt", "desc"),
    limit(30)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    },
    (error) => {
      console.error("Photos listener error:", error);
      callback([]);
    }
  );
}

export async function addPlacePhoto(placeId, url) {
  return addDoc(collection(db, "places", placeId, "photos"), {
    url,
    createdAt: serverTimestamp(),
  });
}
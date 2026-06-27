import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const feedRef = collection(db, "communityFeed");

export function listenFeed(callback) {
  const q = query(
    feedRef,
    orderBy("createdAt", "desc"),
    limit(100)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    },
    (error) => {
      console.error("Feed listener error:", error);
      callback([]);
    }
  );
}

export async function addFeedPost(data) {
  return addDoc(feedRef, {
    type: data.type || "📢 Update",
    message: data.message?.trim() || "",
    area: data.area?.trim() || "",
    user: data.user || "anonymous",
    likes: 0,
    reports: 0,
    hidden: false,
    createdAt: serverTimestamp(),
  });
}
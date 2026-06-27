import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export function useLostFound() {
  const [items, setItems] = useState([]);
  const [loadingLostFound, setLoadingLostFound] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "lostFound"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItems(data);
      setLoadingLostFound(false);
    });

    return () => unsub();
  }, []);

  return { items, loadingLostFound };
}
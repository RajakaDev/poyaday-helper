import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";

export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "promotions"),
      where("active", "==", true)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      setPromotions(data);
      setLoadingPromotions(false);
    });

    return () => unsub();
  }, []);

  return {
    promotions,
    loadingPromotions,
  };
}
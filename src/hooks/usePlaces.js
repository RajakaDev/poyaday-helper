import { useEffect, useState } from "react";
import { listenPlaces } from "../services/placeService";
import { getOfflinePlaces, saveOfflinePlaces } from "../utils/offlineCache";

export function usePlaces() {
  const [places, setPlaces] = useState(getOfflinePlaces());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenPlaces((data) => {
      setPlaces(data);
      saveOfflinePlaces(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { places, loading };
}
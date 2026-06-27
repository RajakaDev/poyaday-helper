import { useEffect, useState } from "react";
import { listenPlaces } from "../services/placeService";
import { saveOfflinePlaces, getOfflinePlaces } from "../utils/offlineCache";

export function usePlaces() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState(getOfflinePlaces());

  const visible = data.filter((p) => p.hidden !== true);
setPlaces(visible);
saveOfflinePlaces(visible);

  useEffect(() => {
    const unsub = listenPlaces((data) => {
      setPlaces(data.filter((p) => p.hidden !== true));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { places, loading };
}
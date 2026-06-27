import { useEffect, useState } from "react";
import {
  listenLiveLocations,
  removeMyLiveLocation,
  updateMyLiveLocation,
} from "../services/liveLocationService";

export function useLiveLocation() {
  const [liveUsers, setLiveUsers] = useState([]);
  const [sharing, setSharing] = useState(() => {
    return localStorage.getItem("share_live_location") !== "false";
  });

  useEffect(() => {
    localStorage.setItem("share_live_location", sharing ? "true" : "false");
  }, [sharing]);

  useEffect(() => {
    const unsub = listenLiveLocations(setLiveUsers);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!sharing || !navigator.geolocation) {
      removeMyLiveLocation();
      return;
    }

    let intervalId;

    const update = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await updateMyLiveLocation(
            pos.coords.latitude,
            pos.coords.longitude
          );
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    };

    update();
    intervalId = setInterval(update, 60000);

    const cleanup = () => {
      removeMyLiveLocation();
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [sharing]);

  return { liveUsers, sharing, setSharing };
}
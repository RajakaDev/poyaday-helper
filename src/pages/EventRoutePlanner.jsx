import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaces } from "../hooks/usePlaces";
import { distanceKm } from "../utils/distance";

export default function EventRoutePlanner({ lang = "si" }) {
  const { places, loading } = usePlaces();

  const [selectedIds, setSelectedIds] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  const events = useMemo(() => {
    return places.filter(
      (p) =>
        p.hidden !== true &&
        p.lat &&
        p.lng &&
        (p.type === "event" ||
          p.type === "poson_zone" ||
          p.type === "bana" ||
          p.type === "bhakthi_gee")
    );
  }, [places]);

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === "si" ? "GPS support නැහැ" : "GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert(
          lang === "si"
            ? "GPS permission ලබාදෙන්න"
            : "Please allow GPS permission"
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const sortedEvents = useMemo(() => {
    if (!userLocation) return events;

    return [...events].sort((a, b) => {
      const da = distanceKm(
        userLocation.lat,
        userLocation.lng,
        Number(a.lat),
        Number(a.lng)
      );

      const db = distanceKm(
        userLocation.lat,
        userLocation.lng,
        Number(b.lat),
        Number(b.lng)
      );

      return da - db;
    });
  }, [events, userLocation]);

  const selectedEvents = selectedIds
    .map((id) => events.find((event) => event.id === id))
    .filter(Boolean);

  const totalDistance = useMemo(() => {
    if (selectedEvents.length === 0) return 0;

    let total = 0;

    if (userLocation && selectedEvents[0]) {
      total += distanceKm(
        userLocation.lat,
        userLocation.lng,
        Number(selectedEvents[0].lat),
        Number(selectedEvents[0].lng)
      );
    }

    for (let i = 0; i < selectedEvents.length - 1; i++) {
      const a = selectedEvents[i];
      const b = selectedEvents[i + 1];

      total += distanceKm(
        Number(a.lat),
        Number(a.lng),
        Number(b.lat),
        Number(b.lng)
      );
    }

    return total;
  }, [selectedEvents, userLocation]);

  const travelMinutes = Math.round((totalDistance / 20) * 60);
  const trafficBuffer = Math.round(travelMinutes * 0.3);
  const visitMinutes = selectedEvents.length * 20;
  const totalMinutes = travelMinutes + trafficBuffer + visitMinutes;

  const recommended = sortedEvents[0];

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const optimizeRoute = () => {
    if (selectedEvents.length < 2) return;

    const remaining = [...selectedEvents];
    const optimized = [];

    let current = userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : remaining.shift();

    if (!userLocation && current?.id) optimized.push(current);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remaining.forEach((event, index) => {
        const dist = distanceKm(
          Number(current.lat),
          Number(current.lng),
          Number(event.lat),
          Number(event.lng)
        );

        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = index;
        }
      });

      current = remaining.splice(nearestIndex, 1)[0];
      optimized.push(current);
    }

    setSelectedIds(optimized.map((event) => event.id));
  };

  const openGoogleMapsRoute = () => {
    if (selectedEvents.length === 0) return;

    const points = [];

    if (userLocation) {
      points.push(`${userLocation.lat},${userLocation.lng}`);
    }

    selectedEvents.forEach((event) => {
      points.push(`${event.lat},${event.lng}`);
    });

    window.open(
      `https://www.google.com/maps/dir/${points.join("/")}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🧭 {lang === "si" ? "Event Route සැලසුම් කරන්න" : "Plan Event Route"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "GPS ඇති events තෝරාගෙන Google Maps route එකක් සාදන්න."
            : "Select GPS events and create a Google Maps route."}
        </p>

        <button className="gps-btn" type="button" onClick={getMyLocation}>
          📍 {lang === "si" ? "මගේ ස්ථානය ලබාගන්න" : "Get My Location"}
        </button>

        <div className="route-report">
          <strong>{lang === "si" ? "Route වාර්තාව" : "Route Report"}</strong>

          <p>
            {lang === "si" ? "තෝරාගත් Events" : "Selected Events"}:{" "}
            {selectedEvents.length}
          </p>

          <p>
            {lang === "si" ? "මුළු දුර" : "Estimated Distance"}:{" "}
            {totalDistance.toFixed(1)} km
          </p>

          <p>
            {lang === "si" ? "ගමන් කාලය" : "Travel Time"}: {travelMinutes} mins
          </p>

          <p>Traffic Buffer: {trafficBuffer} mins</p>

          <p>
            {lang === "si" ? "බලන කාලය" : "Viewing Time"}: {visitMinutes} mins
          </p>

          <p>
            <strong>
              {lang === "si" ? "මුළු කාලය" : "Total Time"}: {totalMinutes} mins
            </strong>
          </p>

          {recommended && (
            <p>
              🌕 {lang === "si" ? "ආසන්නතම Event" : "Nearest Event"}:{" "}
              <strong>{recommended.name}</strong>
            </p>
          )}

          <div className="route-action-grid">
            <button
              className="home-action-btn"
              type="button"
              disabled={selectedEvents.length < 2}
              onClick={optimizeRoute}
            >
              ⚡ {lang === "si" ? "කෙටිම Route" : "Optimize Route"}
            </button>

            <button
              className="submit-btn"
              type="button"
              disabled={selectedEvents.length === 0}
              onClick={openGoogleMapsRoute}
            >
              🗺️ {lang === "si" ? "Google Maps Route" : "Open Google Maps Route"}
            </button>

            {selectedEvents.length > 0 && (
              <button
                className="clear-gps-btn"
                type="button"
                onClick={() => setSelectedIds([])}
              >
                ✕ {lang === "si" ? "Route ඉවත් කරන්න" : "Clear Route"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="empty-state">
            {lang === "si" ? "GPS ඇති Events තවම නැහැ." : "No GPS events yet."}
          </div>
        ) : (
          sortedEvents.map((event) => {
            const dist =
              userLocation && event.lat && event.lng
                ? distanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    Number(event.lat),
                    Number(event.lng)
                  )
                : null;

            return (
              <button
                key={event.id}
                className={`route-card ${
                  selectedIds.includes(event.id) ? "selected" : ""
                }`}
                onClick={() => toggleSelect(event.id)}
                type="button"
              >
                <div>
                  <strong>🏮 {event.name}</strong>
                  <p>
                    📍 {event.district || "-"}{" "}
                    {event.town ? `- ${event.town}` : ""}
                  </p>
                  <p>📌 {event.address || "-"}</p>
                  {dist !== null && <p>📍 {dist.toFixed(1)} km away</p>}
                </div>

                <span>
                  {selectedIds.includes(event.id)
                    ? lang === "si"
                      ? "තෝරාගෙන ඇත"
                      : "Selected"
                    : lang === "si"
                    ? "තෝරන්න"
                    : "Select"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
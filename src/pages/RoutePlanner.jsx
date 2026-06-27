import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaces } from "../hooks/usePlaces";
import { distanceKm } from "../utils/distance";
import { PLACE_TYPES } from "../utils/types";

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

export default function RoutePlanner({ lang = "si" }) {
  const { places, loading } = usePlaces();

  const [selectedIds, setSelectedIds] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Please allow GPS permission"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const gpsPlaces = useMemo(() => {
    return places
      .filter((p) => p.hidden !== true && p.lat && p.lng)
      .map((p) => ({
        ...p,
        distance:
          userLocation && p.lat && p.lng
            ? distanceKm(
                userLocation.lat,
                userLocation.lng,
                Number(p.lat),
                Number(p.lng)
              )
            : null,
      }))
      .filter((p) => typeFilter === "all" || p.type === typeFilter)
      .sort((a, b) => {
        if (!userLocation) return 0;
        return (a.distance ?? 99999) - (b.distance ?? 99999);
      });
  }, [places, userLocation, typeFilter]);

  const selectedPlaces = selectedIds
    .map((id) => gpsPlaces.find((p) => p.id === id))
    .filter(Boolean);

  const totalDistance = useMemo(() => {
    if (selectedPlaces.length === 0) return 0;

    let total = 0;

    if (userLocation && selectedPlaces[0]) {
      total += distanceKm(
        userLocation.lat,
        userLocation.lng,
        Number(selectedPlaces[0].lat),
        Number(selectedPlaces[0].lng)
      );
    }

    for (let i = 0; i < selectedPlaces.length - 1; i++) {
      const a = selectedPlaces[i];
      const b = selectedPlaces[i + 1];

      total += distanceKm(
        Number(a.lat),
        Number(a.lng),
        Number(b.lat),
        Number(b.lng)
      );
    }

    return total;
  }, [selectedPlaces, userLocation]);

  const estimatedMinutes = Math.round((totalDistance / 25) * 60);

  const categories = [
    ...new Set(selectedPlaces.map((p) => p.category || p.type).filter(Boolean)),
  ];

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearRoute = () => {
    setSelectedIds([]);
  };

  const optimizeRoute = () => {
    if (selectedPlaces.length < 2) return;

    const remaining = [...selectedPlaces];
    const optimized = [];

    let current = userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : remaining.shift();

    if (!userLocation && current?.id) optimized.push(current);

    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      remaining.forEach((p, index) => {
        const dist = distanceKm(
          Number(current.lat),
          Number(current.lng),
          Number(p.lat),
          Number(p.lng)
        );

        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestIndex = index;
        }
      });

      current = remaining.splice(nearestIndex, 1)[0];
      optimized.push(current);
    }

    setSelectedIds(optimized.map((p) => p.id));
  };

  const smartRoute = () => {
    if (!userLocation) {
      alert("Please get your location first.");
      return;
    }

    const neededTypes = ["parking", "temple", "water", "toilet", "dansal"];

    const smartSelected = [];

    neededTypes.forEach((type) => {
      const nearest = gpsPlaces
        .filter((p) => p.type === type && !smartSelected.some((s) => s.id === p.id))
        .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999))[0];

      if (nearest) smartSelected.push(nearest);
    });

    if (smartSelected.length === 0) {
      alert("No suitable GPS places found.");
      return;
    }

    setSelectedIds(smartSelected.map((p) => p.id));
  };

  const openGoogleMapsRoute = () => {
    if (selectedPlaces.length === 0) return;

    const points = [];

    if (userLocation) {
      points.push(`${userLocation.lat},${userLocation.lng}`);
    }

    selectedPlaces.forEach((p) => {
      points.push(`${p.lat},${p.lng}`);
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
          🧭 {lang === "si" ? "ගමන් මාර්ගය සැලසුම් කරන්න" : "Plan Route"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "GPS ඇති ස්ථාන තෝරාගෙන හොඳ route එකක් සැලසුම් කරන්න."
            : "Select GPS-enabled places and plan a better route."}
        </p>

        <div className="home-action-row">
          <button className="gps-btn" type="button" onClick={getMyLocation}>
            📍 {lang === "si" ? "මගේ ස්ථානය" : "My Location"}
          </button>

          <button className="home-action-btn" type="button" onClick={smartRoute}>
            🤖 Smart Route
          </button>

          <button
            className="home-action-btn"
            type="button"
            onClick={optimizeRoute}
            disabled={selectedPlaces.length < 2}
          >
            ⚡ Optimize
          </button>
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Places</option>
            {PLACE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div className="route-report">
          <strong>🚗 {lang === "si" ? "Route Summary" : "Route Summary"}</strong>

          <p>
            {lang === "si" ? "තෝරාගත් ස්ථාන" : "Selected Places"}:{" "}
            {selectedPlaces.length}
          </p>

          <p>
            {lang === "si" ? "වර්ග" : "Types Covered"}:{" "}
            {categories.length ? categories.join(", ") : "-"}
          </p>

          <p>
            {lang === "si" ? "මුළු දුර" : "Estimated Distance"}:{" "}
            {totalDistance.toFixed(1)} km
          </p>

          <p>
            {lang === "si" ? "අනුමාන කාලය" : "Estimated Time"}:{" "}
            {estimatedMinutes} mins
          </p>

          <div className="route-action-grid">
            <button
              className="submit-btn"
              type="button"
              disabled={selectedPlaces.length === 0}
              onClick={openGoogleMapsRoute}
            >
              🗺️ {lang === "si" ? "Google Maps" : "Open Google Maps"}
            </button>

            {selectedPlaces.length > 0 && (
              <button className="clear-gps-btn" type="button" onClick={clearRoute}>
                ✕ {lang === "si" ? "Route ඉවත් කරන්න" : "Clear Route"}
              </button>
            )}
          </div>
        </div>

        {selectedPlaces.length > 0 && (
          <div className="analytics-section">
            <h3>🧭 Route Timeline</h3>

            {selectedPlaces.map((p, index) => (
              <div className="analytics-row" key={p.id}>
                <span>
                  {index + 1}. {getTypeLabel(p.type)} {p.name}
                </span>
                <strong>
                  {p.distance !== null && p.distance !== undefined
                    ? `${p.distance.toFixed(1)} km`
                    : "GPS"}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : gpsPlaces.length === 0 ? (
          <div className="empty-state">
            {lang === "si" ? "GPS ඇති ස්ථාන තවම නැහැ." : "No GPS places yet."}
          </div>
        ) : (
          gpsPlaces.map((p) => (
            <button
              key={p.id}
              className={`route-card ${
                selectedIds.includes(p.id) ? "selected" : ""
              }`}
              onClick={() => toggleSelect(p.id)}
              type="button"
            >
              <div>
                <strong>
                  {getTypeLabel(p.type)} {p.name}
                </strong>

                <p>
                  📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                </p>

                <p>🏷️ {p.category || p.type || "Place"}</p>

                <p>👥 {p.crowdLevel || "medium"}</p>

                {p.distance !== null && p.distance !== undefined && (
                  <p>📏 {p.distance.toFixed(1)} km away</p>
                )}
              </div>

              <span>
                {selectedIds.includes(p.id)
                  ? lang === "si"
                    ? "තෝරාගෙන ඇත"
                    : "Selected"
                  : lang === "si"
                  ? "තෝරන්න"
                  : "Select"}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
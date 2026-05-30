import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase";

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function RoutePlanner({ lang = "si" }) {
  const [dansals, setDansals] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "dansals"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((d) => d.hidden !== true && d.lat && d.lng);

      setDansals(data);
    });

    return () => unsub();
  }, []);

  const selectedDansals = dansals.filter((d) => selectedIds.includes(d.id));

  const totalDistance = useMemo(() => {
    if (selectedDansals.length < 2) return 0;

    let total = 0;

    for (let i = 0; i < selectedDansals.length - 1; i++) {
      const a = selectedDansals[i];
      const b = selectedDansals[i + 1];

      total += distanceKm(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng));
    }

    return total;
  }, [selectedDansals]);

  const estimatedMinutes = Math.round((totalDistance / 25) * 60);

  const foodTypes = [
    ...new Set(selectedDansals.map((d) => d.foodType).filter(Boolean)),
  ];

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const openGoogleMapsRoute = () => {
    if (selectedDansals.length === 0) return;

    const points = selectedDansals
      .map((d) => `${d.lat},${d.lng}`)
      .join("/");

    window.open(`https://www.google.com/maps/dir/${points}`, "_blank");
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🧭 {lang === "si" ? "දන්සල් මාර්ගය සැලසුම් කරන්න" : "Plan Dansal Route"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "GPS location ඇති දන්සල් තෝරාගෙන Google Maps මාර්ගයක් සාදන්න."
            : "Select dansals with GPS locations and create a Google Maps route."}
        </p>

        <div className="route-report">
          <strong>
            {lang === "si" ? "මාර්ග වාර්තාව" : "Route Report"}
          </strong>

          <p>
            {lang === "si" ? "තෝරාගත් දන්සල්" : "Selected Dansals"}:{" "}
            {selectedDansals.length}
          </p>

          <p>
            {lang === "si" ? "ආහාර වර්ග" : "Food Types Covered"}:{" "}
            {foodTypes.length ? foodTypes.join(", ") : "-"}
          </p>

          <p>
            {lang === "si" ? "මුළු දුර" : "Estimated Distance"}:{" "}
            {totalDistance.toFixed(1)} km
          </p>

          <p>
            {lang === "si" ? "අනුමාන කාලය" : "Estimated Time"}:{" "}
            {estimatedMinutes} mins
          </p>

          <button
            className="submit-btn"
            type="button"
            disabled={selectedDansals.length === 0}
            onClick={openGoogleMapsRoute}
          >
            🗺️ {lang === "si" ? "Google Maps Route විවෘත කරන්න" : "Open Google Maps Route"}
          </button>
        </div>
      </div>

      <div className="cards">
        {dansals.length === 0 ? (
          <div className="empty-state">
            {lang === "si"
              ? "GPS ඇති දන්සල් තවම නැහැ."
              : "No GPS dansals yet."}
          </div>
        ) : (
          dansals.map((d) => (
            <button
              key={d.id}
              className={`route-card ${selectedIds.includes(d.id) ? "selected" : ""}`}
              onClick={() => toggleSelect(d.id)}
              type="button"
            >
              <div>
                <strong>🍛 {d.name}</strong>
                <p>📍 {d.location} {d.customLocation ? `- ${d.customLocation}` : ""}</p>
                <p>🍽️ {d.foodType}</p>
              </div>

              <span>
                {selectedIds.includes(d.id)
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
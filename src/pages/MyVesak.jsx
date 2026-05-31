import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCoveredDansals, removeCoveredDansal } from "../utils/coveredDansals";

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

export default function MyVesak({ lang = "si" }) {
  const [covered, setCovered] = useState(getCoveredDansals());

  const stats = useMemo(() => {
    const count = covered.length;

    const foodTypes = [...new Set(covered.map((d) => d.foodType).filter(Boolean))];

    let totalKm = 0;
    for (let i = 0; i < covered.length - 1; i++) {
      const a = covered[i];
      const b = covered[i + 1];

      if (a.lat && a.lng && b.lat && b.lng) {
        totalKm += distanceKm(Number(a.lat), Number(a.lng), Number(b.lat), Number(b.lng));
      }
    }

    const travelMinutes = Math.round((totalKm / 25) * 60);
    const visitMinutes = count * 30;
    const totalMinutes = travelMinutes + visitMinutes;

    return {
      count,
      foodTypes,
      totalKm,
      travelMinutes,
      visitMinutes,
      totalMinutes,
    };
  }, [covered]);

  const clearOne = (id) => {
    const updated = removeCoveredDansal(id);
    setCovered(updated);
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          ✨ {lang === "si" ? "මගේ වෙසක් ගමන" : "My Vesak Journey"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "ඔබ ගිය දන්සල්, ආහාර වර්ග, දුර සහ කාලය මෙතැනින් බලන්න."
            : "See your covered dansals, food types, distance, and time summary."}
        </p>

        <div className="my-vesak-hero">
          <div className="vesak-glow">🏮</div>
          <h2>
            {lang === "si" ? "ඔබේ දන්සල් මතක සටහන" : "Your Dansal Memory Summary"}
          </h2>
          <p>
            {lang === "si"
              ? "දන්සල් ගමන ලස්සන මතකයක් කරගන්න."
              : "Turn your dansal journey into a memory timeline."}
          </p>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <span>✅</span>
            <strong>{stats.count}</strong>
            <p>{lang === "si" ? "ගිය දන්සල්" : "Covered Dansals"}</p>
          </div>

          <div className="analytics-card">
            <span>🍛</span>
            <strong>{stats.foodTypes.length}</strong>
            <p>{lang === "si" ? "ආහාර වර්ග" : "Food Types"}</p>
          </div>

          <div className="analytics-card">
            <span>📍</span>
            <strong>{stats.totalKm.toFixed(1)}</strong>
            <p>{lang === "si" ? "කි.මී." : "Total KM"}</p>
          </div>

          <div className="analytics-card">
            <span>⏱️</span>
            <strong>{stats.totalMinutes}</strong>
            <p>{lang === "si" ? "මුළු මිනිත්තු" : "Total Minutes"}</p>
          </div>
        </div>

        <div className="analytics-section">
          <h3>{lang === "si" ? "ආහාර වර්ග" : "Food Types Covered"}</h3>
          <p className="small-note">
            {stats.foodTypes.length ? stats.foodTypes.join(", ") : "-"}
          </p>
        </div>

        <div className="analytics-section">
          <h3>{lang === "si" ? "කාල වාර්තාව" : "Time Report"}</h3>
          <div className="analytics-row">
            <span>{lang === "si" ? "ගමන් කාලය" : "Travel Time"}</span>
            <strong>{stats.travelMinutes} mins</strong>
          </div>
          <div className="analytics-row">
            <span>{lang === "si" ? "දන්සල් වල ගතවන කාලය" : "Visit Time"}</span>
            <strong>{stats.visitMinutes} mins</strong>
          </div>
          <div className="analytics-row">
            <span>{lang === "si" ? "මුළු කාලය" : "Total Time"}</span>
            <strong>{stats.totalMinutes} mins</strong>
          </div>
        </div>

        <div className="analytics-section">
          <h3>🗺️ {lang === "si" ? "Map Timeline" : "Map Timeline"}</h3>

          {covered.length === 0 ? (
            <p className="small-note">
              {lang === "si"
                ? "තවම දන්සලක් cover කර නැහැ."
                : "No covered dansals yet."}
            </p>
          ) : (
            covered.map((d, index) => (
              <div className="timeline-item" key={d.id}>
                <div className="timeline-dot">{index + 1}</div>
                <div>
                  <strong>{d.name}</strong>
                  <p>
                    🍽️ {d.foodType} <br />
                    📍 {d.location} {d.customLocation ? `- ${d.customLocation}` : ""}
                    <br />
                    🕒 {new Date(d.coveredAt).toLocaleString()}
                  </p>

                  <button className="report-btn" onClick={() => clearOne(d.id)}>
                    ✕ {lang === "si" ? "ඉවත් කරන්න" : "Remove"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
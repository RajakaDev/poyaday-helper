import { Link } from "react-router-dom";
import { usePlaces } from "../hooks/usePlaces";
import { PLACE_TYPES } from "../utils/types";

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || type || "Place";
}

export default function Analytics({ lang = "si" }) {
  const { places, loading } = usePlaces();

  const total = places.length;
  const open = places.filter((p) => p.status !== "closed").length;
  const closed = places.filter((p) => p.status === "closed").length;
  const verified = places.filter((p) => p.verified).length;
  const withGps = places.filter((p) => p.lat && p.lng).length;

  const typeCounts = {};
  const areaCounts = {};
  const crowdCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  places.forEach((p) => {
    const type = p.type || "other";
    const area = p.district || "Unknown";
    const crowd = p.crowdLevel || "medium";

    typeCounts[type] = (typeCounts[type] || 0) + 1;
    areaCounts[area] = (areaCounts[area] || 0) + 1;

    if (crowdCounts[crowd] !== undefined) {
      crowdCounts[crowd] += 1;
    }
  });

  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const topAreas = Object.entries(areaCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          📊 {lang === "si" ? "PoyaDay විශ්ලේෂණ" : "PoyaDay Analytics"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "සජීවී ස්ථාන සංඛ්‍යා ලේඛන සහ ප්‍රජා තොරතුරු."
            : "Live place statistics and community insights."}
        </p>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="analytics-card">
                <span>📍</span>
                <strong>{total}</strong>
                <p>{lang === "si" ? "මුළු ස්ථාන" : "Total Places"}</p>
              </div>

              <div className="analytics-card">
                <span>🟢</span>
                <strong>{open}</strong>
                <p>{lang === "si" ? "විවෘත" : "Open"}</p>
              </div>

              <div className="analytics-card">
                <span>🔴</span>
                <strong>{closed}</strong>
                <p>{lang === "si" ? "වසා ඇත" : "Closed"}</p>
              </div>

              <div className="analytics-card">
                <span>✅</span>
                <strong>{verified}</strong>
                <p>{lang === "si" ? "තහවුරු කළ" : "Verified"}</p>
              </div>

              <div className="analytics-card">
                <span>🗺️</span>
                <strong>{withGps}</strong>
                <p>{lang === "si" ? "GPS සහිත" : "With GPS"}</p>
              </div>

              <div className="analytics-card">
                <span>👥</span>
                <strong>
                  {crowdCounts.low + crowdCounts.medium + crowdCounts.high}
                </strong>
                <p>{lang === "si" ? "Crowd data" : "Crowd Data"}</p>
              </div>
            </div>

            <div className="analytics-section">
              <h3>{lang === "si" ? "ජනප්‍රිය වර්ග" : "Top Place Types"}</h3>

              {topTypes.length === 0 ? (
                <p className="small-note">No data</p>
              ) : (
                topTypes.map(([type, count]) => (
                  <div className="analytics-row" key={type}>
                    <span>{getTypeLabel(type)}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="analytics-section">
              <h3>{lang === "si" ? "ජනප්‍රිය ප්‍රදේශ" : "Top Areas"}</h3>

              {topAreas.length === 0 ? (
                <p className="small-note">No data</p>
              ) : (
                topAreas.map(([area, count]) => (
                  <div className="analytics-row" key={area}>
                    <span>{area}</span>
                    <strong>{count}</strong>
                  </div>
                ))
              )}
            </div>

            <div className="analytics-section">
              <h3>{lang === "si" ? "Crowd තත්ත්වය" : "Crowd Summary"}</h3>

              <div className="analytics-row">
                <span>🟢 Low</span>
                <strong>{crowdCounts.low}</strong>
              </div>

              <div className="analytics-row">
                <span>🟠 Medium</span>
                <strong>{crowdCounts.medium}</strong>
              </div>

              <div className="analytics-row">
                <span>🔴 High</span>
                <strong>{crowdCounts.high}</strong>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
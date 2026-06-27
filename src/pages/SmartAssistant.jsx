import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePlaces } from "../hooks/usePlaces";
import { useLocation } from "../hooks/useLocation";
import { distanceKm } from "../utils/distance";
import { PLACE_TYPES } from "../utils/types";

const QUICK_ACTIONS = [
  { label: "🍛 Food", type: "dansal", keywords: ["rice", "food", "dansal"] },
  { label: "🚰 Water", type: "water", keywords: ["water"] },
  { label: "🚻 Toilet", type: "toilet", keywords: ["toilet"] },
  { label: "🚗 Parking", type: "parking", keywords: ["parking"] },
  { label: "🏥 Hospital", type: "hospital", keywords: ["hospital"] },
  { label: "🏛 Temple", type: "temple", keywords: ["temple"] },
  { label: "🩺 First Aid", type: "firstaid", keywords: ["first aid", "medical"] },
];

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

export default function SmartAssistant({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const { location, loadingLocation, getLocation } = useLocation();

  const [selected, setSelected] = useState(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  const results = useMemo(() => {
    if (!selected) return [];

    return places
      .filter((p) => p.hidden !== true)
      .map((p) => {
        const distance =
          location && p.lat && p.lng
            ? distanceKm(
                location.lat,
                location.lng,
                Number(p.lat),
                Number(p.lng)
              )
            : null;

        return { ...p, distance };
      })
      .filter((p) => {
        const text = `${p.name || ""} ${p.type || ""} ${p.category || ""} ${
          p.district || ""
        } ${p.town || ""} ${p.address || ""}`.toLowerCase();

        const matchesType = p.type === selected.type;
        const matchesKeyword = selected.keywords.some((k) => text.includes(k));
        const matchesNearby =
          !nearbyOnly || (p.distance !== null && p.distance <= 10);

        return (matchesType || matchesKeyword) && matchesNearby;
      })
      .sort((a, b) => {
        if (!location) return 0;
        return (a.distance ?? 99999) - (b.distance ?? 99999);
      });
  }, [places, selected, location, nearbyOnly]);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">🤖 Smart Helper</div>

        <p className="form-section-desc">
          {lang === "si"
            ? "ඔබට අවශ්‍ය දේ tap කරන්න. Type කරන්න අවශ්‍ය නැහැ."
            : "Tap what you need. No typing needed."}
        </p>

        <div className="home-action-row">
          <button
            className="home-action-btn"
            type="button"
            onClick={() => {
              getLocation();
              setNearbyOnly(true);
            }}
          >
            📍 {loadingLocation ? "Finding..." : "Nearby First"}
          </button>

          {nearbyOnly && (
            <button
              className="home-action-btn"
              type="button"
              onClick={() => setNearbyOnly(false)}
            >
              ✕ Clear Nearby
            </button>
          )}
        </div>

        <div className="poson-category-row">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              className={`poson-category-chip ${
                selected?.label === action.label ? "active-chip" : ""
              }`}
              type="button"
              onClick={() => setSelected(action)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">
          {selected ? selected.label : "Choose what you need"}
        </span>
        <span className="count-badge">{results.length}</span>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : !selected ? (
          <div className="empty-state">Tap a button above to find places.</div>
        ) : results.length === 0 ? (
          <div className="empty-state">No matching places found.</div>
        ) : (
          results.map((p) => (
            <Link key={p.id} to={`/place/${p.id}`} className="dansal-card">
              <div className="card-name">
                {getTypeLabel(p.type)} {p.name}
              </div>

              <div className="card-loc">
                📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
              </div>

              <div className="card-tags">
                <span className="tag tag-food">
                  🏷️ {p.category || p.type || "place"}
                </span>

                <span className="tag tag-food">
                  👥 {p.crowdLevel || "medium"}
                </span>

                {p.distance !== null && p.distance !== undefined && (
                  <span className="tag tag-food">
                    📍 {p.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
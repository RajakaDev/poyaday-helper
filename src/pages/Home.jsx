import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SponsorBanner from "../components/SponsorBanner";
import SponsorNativeCard from "../components/SponsorNativeCard";
import { useLocation } from "../hooks/useLocation";
import { usePlaces } from "../hooks/usePlaces";
import { distanceKm } from "../utils/distance";
import { getPlaceTimeStatus } from "../utils/placeStatus";
import { PLACE_TYPES } from "../utils/types";

const MAIN_FILTERS = ["dansal", "temple", "water", "toilet"];

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

function crowdText(level) {
  if (level === "low") return "🟢 Low";
  if (level === "high") return "🔴 Busy";
  return "🟠 Medium";
}

export default function Home({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const { location, loadingLocation, getLocation } = useLocation();

  const [online, setOnline] = useState(navigator.onLine);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [nearbyOnly, setNearbyOnly] = useState(false);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const visiblePlaces = useMemo(() => {
    return places
      .filter((p) => p.hidden !== true)
      .map((p) => {
        const distance =
          location && p.lat && p.lng
            ? distanceKm(location.lat, location.lng, Number(p.lat), Number(p.lng))
            : null;

        return { ...p, distance };
      })
      .filter((p) => {
        const text = `${p.name || ""} ${p.district || ""} ${p.town || ""} ${
          p.address || ""
        } ${p.category || ""} ${p.customCategory || ""} ${p.type || ""}`.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || p.type === typeFilter;
        const matchesNearby =
          !nearbyOnly || (p.distance !== null && p.distance <= 10);

        return matchesSearch && matchesType && matchesNearby;
      })
      .sort((a, b) => {
        if (!location) return 0;
        return (a.distance ?? 99999) - (b.distance ?? 99999);
      });
  }, [places, search, typeFilter, nearbyOnly, location]);

  const mainFilters = PLACE_TYPES.filter((t) => MAIN_FILTERS.includes(t.id));
  const moreFilters = PLACE_TYPES.filter((t) => !MAIN_FILTERS.includes(t.id));

  const handleNearby = () => {
    getLocation();
    setNearbyOnly(true);
  };

  return (
    <div className="page active home-page home-clean">
      <section className="home-clean-hero">
        <div className="home-brand-row">
          <div>
            <div className="hero-badge">🌕 PoyaDay Helper</div>
            <h1 className="home-clean-title">
              {lang === "si" ? "අසල දන්සල් ඉක්මනින් සොයන්න" : "Find nearby dansals fast"}
            </h1>
          </div>

          <Link to="/map" className="home-map-pill">
            🗺 Map
          </Link>
        </div>

        <div className="search-wrap home-search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder={
              lang === "si"
                ? "දන්සල්, නගරය, ප්‍රදේශය සොයන්න..."
                : "Search dansal, town, area..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="home-main-actions">
          <button
            className="home-action-btn primary-action"
            type="button"
            onClick={handleNearby}
          >
            📍 {loadingLocation ? "Finding..." : lang === "si" ? "මා අසල" : "Near Me"}
          </button>

          <Link to="/route" className="home-action-btn">
            🧭 Route
          </Link>

          <Link to="/add" className="home-action-btn">
            ➕ Add
          </Link>
        </div>

        {nearbyOnly && (
          <button
            className="clear-gps-btn"
            type="button"
            onClick={() => setNearbyOnly(false)}
          >
            ✕ {lang === "si" ? "Nearby ඉවත් කරන්න" : "Clear Nearby"}
          </button>
        )}
      </section>

      <div className="home-filter-wrap">
        <button
          className={`poson-category-chip ${typeFilter === "all" ? "active-chip" : ""}`}
          onClick={() => setTypeFilter("all")}
          type="button"
        >
          🏛 All
        </button>

        {mainFilters.map((type) => (
          <button
            key={type.id}
            className={`poson-category-chip ${typeFilter === type.id ? "active-chip" : ""}`}
            onClick={() => setTypeFilter(type.id)}
            type="button"
          >
            {type.name}
          </button>
        ))}

        <button
          className="poson-category-chip"
          type="button"
          onClick={() => setShowMoreFilters((v) => !v)}
        >
          ☰ More
        </button>
      </div>

      {showMoreFilters && (
        <div className="more-filter-panel">
          {moreFilters.map((type) => (
            <button
              key={type.id}
              className={`poson-category-chip ${typeFilter === type.id ? "active-chip" : ""}`}
              onClick={() => {
                setTypeFilter(type.id);
                setShowMoreFilters(false);
              }}
              type="button"
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {!online && (
        <div className="notice-box">
          <strong>Offline Mode</strong>
          <p>You are offline. Some live features may not update.</p>
        </div>
      )}

      <SponsorBanner />

      <div className="section-header">
        <span className="section-title">
          {nearbyOnly ? "Nearby Places" : typeFilter === "all" ? "Live Places" : getTypeLabel(typeFilter)}
        </span>
        <span className="count-badge">{visiblePlaces.length}</span>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : visiblePlaces.length === 0 ? (
          <div className="empty-state">
            {nearbyOnly ? "No places found within 10km." : "No places found."}
          </div>
        ) : (
          visiblePlaces.map((p, index) => {
            const timeStatus = getPlaceTimeStatus(p.date, p.openTime, p.closeTime);
            const mapsUrl =
              p.lat && p.lng
                ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                : p.mapLink || "";

            return (
              <div key={p.id} className="card-wrap">
                {index === 3 && <SponsorNativeCard />}

                <div className="dansal-card home-place-card">
                  <Link to={`/place/${p.id}`} className="home-card-main">
                    <div className="card-top">
                      <div>
                        <div className="card-name">
                          {getTypeLabel(p.type)} {p.name}
                          {p.verified && <span className="verified-badge">✅</span>}
                        </div>

                        <div className="card-loc">
                          📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                        </div>
                      </div>

                      <span className={`status-${timeStatus.type}`}>
                        {timeStatus.label}
                      </span>
                    </div>

                    <div className="home-card-meta">
                      {timeStatus.message && <span>⏳ {timeStatus.message}</span>}

                      {p.distance !== null && p.distance !== undefined && (
                        <span>📏 {p.distance.toFixed(1)} km</span>
                      )}

                      <span>👥 {crowdText(p.crowdLevel)}</span>
                    </div>

                    <div className="card-tags">
                      <span className="tag tag-food">
                        🏷️ {p.customCategory || p.category || p.type || "place"}
                      </span>
                      {p.lat && p.lng && <span className="tag tag-food">📍 GPS</span>}
                    </div>
                  </Link>

                  <div className="home-card-actions">
                    {mapsUrl && (
                      <a
                        className="home-card-btn"
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🧭 Navigate
                      </a>
                    )}

                    <Link className="home-card-btn" to={`/place/${p.id}`}>
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="creator-footer">
        <strong>Powered by Zytrix Solution</strong>
        <br />
        Developed by Zytrix Solution Team
      </footer>
    </div>
  );
}
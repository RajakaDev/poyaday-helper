import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SponsorBanner from "../components/SponsorBanner";
import SponsorNativeCard from "../components/SponsorNativeCard";

import { useLocation } from "../hooks/useLocation";
import { usePlaces } from "../hooks/usePlaces";

import { distanceKm } from "../utils/distance";
import { getPlaceTimeStatus } from "../utils/placeStatus";
import { PLACE_TYPES } from "../utils/types";

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

export default function Home({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const { location, loadingLocation, getLocation } = useLocation();

  const [online, setOnline] = useState(navigator.onLine);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
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
        } ${p.category || ""} ${p.type || ""}`.toLowerCase();

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

  const handleNearby = () => {
    getLocation();
    setNearbyOnly(true);
  };

  return (
    <div className="page active home-page">
      <section className="hero home-hero">
        <div className="hero-badge">🌕 PoyaDay Helper</div>

        <h1 className="hero-title">
          {lang === "si"
            ? "ඔබ අසල වැදගත් ස්ථාන සොයන්න"
            : "Find useful places near you"}
        </h1>

        <p className="hero-desc">
          {lang === "si"
            ? "දන්සල්, ජල ස්ථාන, parking, toilets, පන්සල්, first aid සහ events පහසුවෙන් සොයන්න."
            : "Find dansals, water points, parking, toilets, temples, first aid and events easily."}
        </p>

        <div className="search-wrap home-search">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder={
              lang === "si"
                ? "නම, නගරය, ප්‍රදේශය සොයන්න..."
                : "Search name, city, area..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="home-primary-actions">
          <button
            className="home-action-btn primary-action"
            type="button"
            onClick={handleNearby}
          >
            📍 {loadingLocation ? "Finding..." : lang === "si" ? "මා අසල" : "Nearby"}
          </button>

          <Link to="/assistant" className="home-action-btn">
            🤖 Smart
          </Link>

          <Link to="/emergency" className="home-action-btn">
            🚨 Emergency
          </Link>

          <Link to="/map" className="home-action-btn">
            🗺️ Map
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

      <div className="quick-grid">
        <Link to="/add" className="quick-card">
          ➕ <span>Add Place</span>
        </Link>
        <Link to="/add-event" className="quick-card">
          🏮 <span>Add Event</span>
        </Link>
        <Link to="/route" className="quick-card">
          🧭 <span>Route</span>
        </Link>
        <Link to="/lost-found" className="quick-card">
          🔍 <span>Lost & Found</span>
        </Link>
        <Link to="/road-alerts" className="quick-card">
          🚧 <span>Roads</span>
        </Link>
        <Link to="/feed" className="quick-card">
          📢 <span>Feed</span>
        </Link>
        <Link to="/events" className="quick-card">
          🌕 <span>Events</span>
        </Link>
        <Link to="/about" className="quick-card">
          ℹ️ <span>About</span>
        </Link>
      </div>

      <div className="poson-category-row home-category-row">
        <button
          className={`poson-category-chip ${
            typeFilter === "all" ? "active-chip" : ""
          }`}
          onClick={() => setTypeFilter("all")}
          type="button"
        >
          🏛 All
        </button>

        {PLACE_TYPES.map((type) => (
          <button
            key={type.id}
            className={`poson-category-chip ${
              typeFilter === type.id ? "active-chip" : ""
            }`}
            onClick={() => setTypeFilter(type.id)}
            type="button"
          >
            {type.name}
          </button>
        ))}
      </div>

      {!online && (
        <div className="notice-box">
          <strong>Offline Mode</strong>
          <p>You are offline. Some live features may not update.</p>
        </div>
      )}

      <div className="notice-box">
        <strong>Beta Version</strong>
        <p>
          {lang === "si"
            ? "තොරතුරු මහජනතාව විසින් එකතු කරන බැවින් යාමට පෙර නැවත පරීක්ෂා කරන්න."
            : "Details are added by the public, so please verify before visiting."}
        </p>
      </div>

      <SponsorBanner />

      <div className="section-header">
        <span className="section-title">
          {nearbyOnly
            ? lang === "si"
              ? "මා අසල ස්ථාන"
              : "Nearby Places"
            : lang === "si"
            ? "සජීවී ස්ථාන"
            : "Live Places"}
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
            const timeStatus = getPlaceTimeStatus(
  p.date,
  p.openTime,
  p.closeTime
);

            return (
              <div key={p.id} className="card-wrap">
                {index === 3 && <SponsorNativeCard />}

                <Link to={`/place/${p.id}`} className="dansal-card">
                  <div className="card-top">
                    <div>
                      <div className="card-name">
                        {getTypeLabel(p.type)} {p.name}
                        {p.verified && (
                          <span className="verified-badge">✅ Verified</span>
                        )}
                      </div>

                      <div className="card-loc">
                        📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                      </div>

                      <div className="card-exact">{p.address || ""}</div>
                    </div>

                    <span className={`status-${timeStatus.type}`}>
                      {timeStatus.label}
                    </span>
                  </div>

                  <div className="card-tags">
                    <span className="tag tag-food">
                      🏷️ {p.category || p.type || "place"}
                    </span>

                    <span className="tag tag-food">
                      👥 {p.crowdLevel || "medium"}
                    </span>

                    {p.lat && p.lng && <span className="tag tag-food">📍 GPS</span>}

                    {p.distance !== null && p.distance !== undefined && (
                      <span className="tag tag-food">
                        📏 {p.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>

                 <div className="card-status">

  <span className={`status-${timeStatus.type}`}>

    {timeStatus.label}

  </span>

</div>

<div className="card-time">

  <span>📅 {p.date}</span>

  <span>🕒 {p.openTime} - {p.closeTime}</span>

  <span>⏳ {timeStatus.message}</span>

</div>
                </Link>
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
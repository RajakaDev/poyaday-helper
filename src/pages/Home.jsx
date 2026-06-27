import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import SponsorBanner from "../components/SponsorBanner";
import SponsorNativeCard from "../components/SponsorNativeCard";

import { useLocation } from "../hooks/useLocation";
import { usePlaces } from "../hooks/usePlaces";

import { distanceKm } from "../utils/distance";
import { getPlaceTimeStatus } from "../utils/placeStatus";

const DISTRICTS = [
  "Anuradhapura",
  "Mihintale",
  "Colombo",
  "Kandy",
  "Gampaha",
  "Kalutara",
  "Kurunegala",
  "Galle",
  "Matara",
  "Badulla",
  "Ratnapura",
];

const FOOD_TYPES = [
  "rice",
  "kottu",
  "tea",
  "coffee",
  "ice cream",
  "noodles",
  "water",
  "drink",
  "soup",
  "bread",
];

function crowdText(level) {
  if (level === "low") return "🟢 Low";
  if (level === "high") return "🔴 Busy";
  return "🟠 Medium";
}

function statusRank(status) {
  if (status.type === "open") return 1;
  if (status.type === "coming") return 2;
  if (status.type === "unknown") return 3;
  return 4;
}

export default function Home({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const { location, loadingLocation, getLocation } = useLocation();

  const [online, setOnline] = useState(navigator.onLine);
  const [search, setSearch] = useState("");
  const [foodFilter, setFoodFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [openOnly, setOpenOnly] = useState(true);
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
      .filter((p) => p.type === "dansal")
      .map((p) => {
        const distance =
          location && p.lat && p.lng
            ? distanceKm(location.lat, location.lng, Number(p.lat), Number(p.lng))
            : null;

        const timeStatus = getPlaceTimeStatus(p.date, p.openTime, p.closeTime);

        return {
          ...p,
          distance,
          timeStatus,
        };
      })
      .filter((p) => {
        const text = `${p.name || ""} ${p.district || ""} ${p.town || ""} ${
          p.address || ""
        } ${p.category || ""} ${p.customCategory || ""}`.toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        const matchesFood =
          foodFilter === "all" ||
          String(p.category || "").toLowerCase() === foodFilter ||
          String(p.customCategory || "").toLowerCase() === foodFilter;

        const matchesDistrict =
          districtFilter === "all" || p.district === districtFilter;

        const matchesNearby =
          !nearbyOnly || (p.distance !== null && p.distance <= 10);

        const matchesOpen =
          !openOnly ||
          p.timeStatus.type === "open" ||
          p.timeStatus.type === "coming";

        return (
          matchesSearch &&
          matchesFood &&
          matchesDistrict &&
          matchesNearby &&
          matchesOpen
        );
      })
      .sort((a, b) => {
        const statusSort = statusRank(a.timeStatus) - statusRank(b.timeStatus);
        if (statusSort !== 0) return statusSort;

        if (location) return (a.distance ?? 99999) - (b.distance ?? 99999);

        return 0;
      });
  }, [places, search, foodFilter, districtFilter, nearbyOnly, openOnly, location]);

  const handleNearby = () => {
    getLocation();
    setNearbyOnly(true);
  };

  return (
    <div className="page active home-page simple-home">
      <section className="simple-home-header">
        <div className="simple-top">
          <div>
            <div className="simple-logo">🌕 PoyaDay Helper</div>
            <div className="simple-subtitle">
              {lang === "si" ? "අසල දන්සල් ඉක්මනින් සොයන්න" : "Find nearby dansals fast"}
            </div>
          </div>

          <div className="simple-header-actions">
            <button className="mini-action" type="button">
              {lang === "si" ? "EN" : "සිං"}
            </button>

            <Link to="/map" className="mini-action">
              🗺️ Map
            </Link>

            <Link to="/assistant" className="mini-action">
              🤖 AI
            </Link>

            <Link to="/road-alerts" className="mini-action">
              🚧 Roads
            </Link>
          </div>
        </div>

        <div className="search-wrap simple-search">
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

        <button className="nearby-wide-btn" type="button" onClick={handleNearby}>
          📍 {loadingLocation ? "Finding..." : lang === "si" ? "මා අසල දන්සල්" : "Nearby Dansals"}
        </button>

        {nearbyOnly && (
          <button
            className="clear-gps-btn"
            type="button"
            onClick={() => setNearbyOnly(false)}
          >
            ✕ Clear Nearby
          </button>
        )}
      </section>

      <section className="simple-filter-card">
        <div className="filter-compact-grid">
          <div className="form-group">
            <label className="form-label">🍚 Food Type</label>
            <select
              className="form-select"
              value={foodFilter}
              onChange={(e) => setFoodFilter(e.target.value)}
            >
              <option value="all">All Foods</option>
              {FOOD_TYPES.map((food) => (
                <option key={food} value={food}>
                  {food}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">📍 District</label>
            <select
              className="form-select"
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
            >
              <option value="all">All Districts</option>
              {DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="open-toggle">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={(e) => setOpenOnly(e.target.checked)}
          />
          <span>🟢 Show Open / Coming Soon only</span>
        </label>
      </section>

      {!online && (
        <div className="notice-box">
          <strong>Offline Mode</strong>
          <p>You are offline. Some live features may not update.</p>
        </div>
      )}

      <SponsorBanner />

      <div className="section-header">
        <span className="section-title">
          🔥 {nearbyOnly ? "Nearby Open Dansals" : "Dansals"}
        </span>
        <span className="count-badge">{visiblePlaces.length}</span>
      </div>

      <div className="cards simple-cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : visiblePlaces.length === 0 ? (
          <div className="empty-state">
            No dansals found. Try changing filters.
          </div>
        ) : (
          visiblePlaces.map((p, index) => {
            const mapsUrl =
              p.lat && p.lng
                ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
                : p.mapLink || "";

            return (
              <div key={p.id} className="card-wrap">
                {index === 4 && <SponsorNativeCard />}

                <div className="dansal-card simple-dansal-card">
                  <Link to={`/place/${p.id}`} className="simple-card-main">
                    <div className="simple-card-title-row">
                      <div>
                        <div className="card-name">
                          🍚 {p.name}
                          {p.verified && <span className="verified-badge">✅</span>}
                        </div>

                        <div className="card-loc">
                          📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                        </div>
                      </div>

                      <span className={`status-${p.timeStatus.type}`}>
                        {p.timeStatus.label}
                      </span>
                    </div>

                    <div className="simple-card-info">
                      {p.timeStatus.message && <span>⏳ {p.timeStatus.message}</span>}

                      <span>👥 {crowdText(p.crowdLevel)}</span>

                      {p.distance !== null && p.distance !== undefined && (
                        <span>📏 {p.distance.toFixed(1)} km</span>
                      )}
                    </div>

                    <div className="card-tags">
                      <span className="tag">
                        🏷️ {p.customCategory || p.category || "dansal"}
                      </span>
                      {p.lat && p.lng && <span className="tag">📍 GPS</span>}
                    </div>
                  </Link>

                  <div className="simple-card-actions">
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
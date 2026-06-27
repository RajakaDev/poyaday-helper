import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { usePlaces } from "../hooks/usePlaces";
import { timeAgo } from "../utils/timeAgo";

function isEventPlace(place) {
  return (
    place.type === "event" ||
    place.type === "poson_zone" ||
    place.type === "bana" ||
    place.type === "bhakthi_gee"
  );
}

export default function Events({ lang = "si" }) {
  const { places, loading } = usePlaces();

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");

  const events = useMemo(() => {
    return places.filter((p) => p.hidden !== true && isEventPlace(p));
  }, [places]);

  const districts = useMemo(() => {
    return [...new Set(events.map((p) => p.district).filter(Boolean))].sort();
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const text = `${event.name || ""} ${event.district || ""} ${
        event.town || ""
      } ${event.address || ""} ${event.description || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDistrict =
        districtFilter === "all" || event.district === districtFilter;

      return matchesSearch && matchesDistrict;
    });
  }, [events, search, districtFilter]);

  return (
    <div className="page active">
      <div className="hero">
        <span className="hero-emoji">🏮✨🌕</span>

        <h1 className="hero-title">
          {lang === "si" ? "පොසොන් Events" : "Poson Events"}
        </h1>

        <p className="hero-desc">
          {lang === "si"
            ? "පොසොන් events, බණ වැඩසටහන් සහ භක්ති ගී සොයන්න."
            : "Find Poson events, bana programs and bhakthi gee near you."}
        </p>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder={
              lang === "si"
                ? "Event, නගරය හෝ ප්‍රදේශය සොයන්න..."
                : "Search event, city or area..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="all">
              {lang === "si" ? "සියලු ප්‍රදේශ" : "All Areas"}
            </option>

            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="home-action-row">
          <Link to="/event-route" className="home-action-btn">
            🧭 {lang === "si" ? "Event Route" : "Event Route"}
          </Link>

          <Link to="/add" className="home-action-btn">
            + {lang === "si" ? "Event එකතු කරන්න" : "Add Event"}
          </Link>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">
          {lang === "si" ? "Events" : "Events"}
        </span>

        <span className="count-badge">{filtered.length}</span>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {lang === "si" ? "Events හමු නොවීය." : "No events found."}
          </div>
        ) : (
          filtered.map((event) => (
            <Link key={event.id} to={`/place/${event.id}`} className="dansal-card">
              <div className="card-top">
                <div>
                  <div className="card-name">
                    🏮 {event.name}
                    {event.verified && (
                      <span className="verified-badge">
                        ✅ {lang === "si" ? "තහවුරුයි" : "Verified"}
                      </span>
                    )}
                  </div>

                  <div className="card-loc">
                    📍 {event.district || "-"}{" "}
                    {event.town ? `- ${event.town}` : ""}
                  </div>

                  <div className="card-exact">{event.address || ""}</div>
                </div>

                <span className={`status-${event.status || "open"}`}>
                  {event.status || "open"}
                </span>
              </div>

              <div className="card-time">
                <span>📅 {event.date || "Date not set"}</span>
                <span>
                  🕒 {event.openTime || "-"}{" "}
                  {event.closeTime ? `– ${event.closeTime}` : ""}
                </span>
              </div>

              <div className="last-updated">
                🔄 {timeAgo(event.updatedAt || event.createdAt, lang)}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
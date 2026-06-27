import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";

import { useLiveLocation } from "../hooks/useLiveLocation";
import { useLocation } from "../hooks/useLocation";
import { usePlaces } from "../hooks/usePlaces";
import { distanceKm } from "../utils/distance";
import { getPlaceTimeStatus } from "../utils/placeStatus";
import { PLACE_TYPES } from "../utils/types";

const CENTER_SRI_LANKA = [7.8731, 80.7718];

const ICONS = {
  dansal: "🍚",
  temple: "☸️",
  parking: "🚗",
  toilet: "🚻",
  water: "💧",
  hospital: "🏥",
  fuel: "⛽",
  bus: "🚌",
  railway: "🚆",
  restaurant: "🍽️",
  hotel: "🏨",
  shop: "🛒",
  pharmacy: "💊",
  other: "📍",
};

function makeIcon(type) {
  const emoji = ICONS[type] || "📍";

  return L.divIcon({
    className: "emoji-map-marker",
    html: `<div>${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -36],
  });
}

const userIcon = L.divIcon({
  className: "user-map-marker",
  html: "<div>🔵</div>",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const liveUserIcon = L.divIcon({
  className: "live-user-marker",
  html: "<div>👤</div>",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 14, { duration: 1 });
    }
  }, [location, map]);

  return null;
}

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

export default function MapPage({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const { location, loadingLocation, getLocation } = useLocation();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState(null);

  const mapPlaces = useMemo(() => {
    return places
      .filter((p) => p.hidden !== true)
      .filter((p) => p.lat && p.lng)
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

        return matchesSearch && matchesType;
      })
      .sort((a, b) => (a.distance ?? 99999) - (b.distance ?? 99999));
  }, [places, location, search, typeFilter]);

  const selectedStatus = selectedPlace
    ? getPlaceTimeStatus(selectedPlace.openTime, selectedPlace.closeTime)
    : null;

  const navigateUrl = selectedPlace
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`
    : "";
    const { liveUsers, sharing, setSharing } = useLiveLocation();

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← Back
        </Link>

        <div className="form-section-title">🗺️ Interactive Map</div>

        <p className="form-section-desc">
          Find nearby dansals, temples, toilets, water, parking and hospitals on the map.
        </p>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search place, town, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="poson-category-row">
          <button
            className={`poson-category-chip ${typeFilter === "all" ? "active-chip" : ""}`}
            onClick={() => setTypeFilter("all")}
            type="button"
          >
            🏛 All
          </button>

          {PLACE_TYPES.map((type) => (
            <button
              key={type.id}
              className={`poson-category-chip ${typeFilter === type.id ? "active-chip" : ""}`}
              onClick={() => setTypeFilter(type.id)}
              type="button"
            >
              {type.name}
            </button>
          ))}
        </div>

        <div className="map-actions">
          <button className="gps-btn" type="button" onClick={getLocation}>
            📍 {loadingLocation ? "Finding..." : "My Location"}
          </button>

          <button
  className="home-action-btn"
  type="button"
  onClick={() => setSharing(!sharing)}
>
  {sharing ? "📍 Live ON" : "📍 Live OFF"}
</button>

          <Link className="home-action-btn" to="/add">
            ➕ Add Place
          </Link>
        </div>

        <p className="small-note">
          Showing {mapPlaces.length} GPS places.
        </p>
      </div>

      <div className="map-wrap">
        {loading ? (
          <div className="empty-state">Loading map places...</div>
        ) : (
          <MapContainer
            center={CENTER_SRI_LANKA}
            zoom={8}
            scrollWheelZoom
            className="leaflet-map"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {location && (
              <>
                <FlyToLocation location={location} />
                <Marker position={[location.lat, location.lng]} icon={userIcon}>
                  <Popup>You are here</Popup>
                </Marker>
              </>
            )}

            {mapPlaces.map((p) => {
              const status = getPlaceTimeStatus(p.openTime, p.closeTime);

              return (
                <Marker
                  key={p.id}
                  position={[Number(p.lat), Number(p.lng)]}
                  icon={makeIcon(p.type)}
                  eventHandlers={{
                    click: () => setSelectedPlace(p),
                  }}
                >
                  <Popup>
                    <strong>{getTypeLabel(p.type)} {p.name}</strong>
                    <br />
                    {p.verified ? "✅ Verified" : "🟡 Community"}
                    <br />
                    {status.label}
                    <br />
                    {p.distance !== null && p.distance !== undefined
                      ? `📏 ${p.distance.toFixed(1)} km`
                      : "📍 GPS available"}
                    <br />
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🧭 Navigate
                    </a>
                    <br />
                    <a href={`/place/${p.id}`}>📄 View Details</a>
                  </Popup>
                </Marker>
              );
            })}
            {liveUsers.map((user) => (
  <Marker
    key={user.id}
    position={[Number(user.lat), Number(user.lng)]}
    icon={liveUserIcon}
  >
    <Popup>
      👤 Anonymous User
      <br />
      Active nearby
    </Popup>
  </Marker>
))}
          </MapContainer>
        )}
      </div>

      {selectedPlace && (
        <div className="map-bottom-sheet">
          <button
            className="map-sheet-close"
            type="button"
            onClick={() => setSelectedPlace(null)}
          >
            ✕
          </button>

          <div className="card-name">
            {getTypeLabel(selectedPlace.type)} {selectedPlace.name}
          </div>

          <div className="card-loc">
            📍 {selectedPlace.district || "-"}{" "}
            {selectedPlace.town ? `- ${selectedPlace.town}` : ""}
          </div>

          <div className="card-exact">{selectedPlace.address || ""}</div>

          <div className="card-tags">
            <span className={`status-${selectedStatus.type}`}>
              {selectedStatus.label}
            </span>

            <span className="tag">
              {selectedPlace.verified ? "✅ Verified" : "🟡 Community"}
            </span>

            {selectedPlace.distance !== null && selectedPlace.distance !== undefined && (
              <span className="tag">📏 {selectedPlace.distance.toFixed(1)} km</span>
            )}

            <span className="tag">👥 {selectedPlace.crowdLevel || "medium"}</span>
          </div>

          <div className="card-time">
            <span>🕒 Opens: {selectedPlace.openTime || "Anytime"}</span>
            <span>Closes: {selectedPlace.closeTime || "-"}</span>
            <span>⏳ {selectedStatus.message}</span>
          </div>

          <div className="home-action-row">
            <a
              className="home-action-btn"
              href={navigateUrl}
              target="_blank"
              rel="noreferrer"
            >
              🧭 Navigate
            </a>

            <Link className="home-action-btn" to={`/place/${selectedPlace.id}`}>
              📄 Details
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
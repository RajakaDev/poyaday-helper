import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { usePlaces } from "../hooks/usePlaces";
import { PLACE_TYPES } from "../utils/types";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

function RecenterMap({ center, zoom = 13 }) {
  const map = useMap();

  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

export default function Map({ lang = "si" }) {
  const { places, loading } = usePlaces();

  const [userLocation, setUserLocation] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const mapPlaces = useMemo(() => {
    return places.filter((p) => {
      const hasGps = p.lat && p.lng;
      const visible = p.hidden !== true;
      const matchesType = typeFilter === "all" || p.type === typeFilter;

      return hasGps && visible && matchesType;
    });
  }, [places, typeFilter]);

  const showMyLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === "si" ? "GPS support නැහැ" : "GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert(lang === "si" ? "GPS permission දෙන්න" : "Please allow GPS");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🗺️ {lang === "si" ? "PoyaDay සිතියම" : "PoyaDay Map"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "දන්සල්, ජල ස්ථාන, parking, toilets, first aid සහ events සිතියමෙන් බලන්න."
            : "View dansals, water points, parking, toilets, first aid and events on the map."}
        </p>

        <div className="map-actions">
          <button className="gps-btn" type="button" onClick={showMyLocation}>
            📍 {lang === "si" ? "මගේ ස්ථානය පෙන්වන්න" : "Show My Location"}
          </button>

          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">
              {lang === "si" ? "සියලු ස්ථාන" : "All Places"}
            </option>

            {PLACE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <p className="small-note">
          {loading
            ? "Loading..."
            : lang === "si"
            ? `GPS ඇති ස්ථාන ${mapPlaces.length}ක් පෙන්වයි.`
            : `Showing ${mapPlaces.length} places with GPS.`}
        </p>
      </div>

      <div className="map-wrap">
        <MapContainer
          center={[8.35, 80.5]}
          zoom={8}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <>
              <RecenterMap center={userLocation} zoom={13} />
              <Marker position={userLocation} icon={userIcon}>
                <Popup>{lang === "si" ? "ඔබගේ ස්ථානය" : "Your Location"}</Popup>
              </Marker>
            </>
          )}

          {mapPlaces.map((p) => {
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;

            return (
              <Marker
                key={p.id}
                position={[Number(p.lat), Number(p.lng)]}
                icon={markerIcon}
              >
                <Popup>
                  <strong>{getTypeLabel(p.type)} {p.name}</strong>
                  <br />
                  🏷️ {p.category || p.type || "Place"}
                  <br />
                  📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                  <br />
                  👥 Crowd: {p.crowdLevel || "medium"}
                  <br />
                  <a href={`/place/${p.id}`}>
                    {lang === "si" ? "විස්තර බලන්න" : "View Details"}
                  </a>
                  <br />
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                    🗺️ {lang === "si" ? "Google Maps යන්න" : "Navigate"}
                  </a>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
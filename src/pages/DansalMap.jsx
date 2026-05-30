import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { db } from "../firebase";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function DansalMap({ lang = "si" }) {
  const [dansals, setDansals] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "dansals"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((d) => d.hidden !== true && d.lat && d.lng);

      setDansals(data);
    });

    return () => unsub();
  }, []);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🗺️ {lang === "si" ? "දන්සල් සිතියම" : "Dansal Map"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "GPS location ඇති දන්සල් සිතියමෙන් බලන්න."
            : "View dansals with GPS locations on the map."}
        </p>
      </div>

      <div className="map-wrap">
        <MapContainer
          center={[7.8731, 80.7718]}
          zoom={8}
          scrollWheelZoom={true}
          className="leaflet-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {dansals.map((d) => (
            <Marker
              key={d.id}
              position={[Number(d.lat), Number(d.lng)]}
              icon={markerIcon}
            >
              <Popup>
                <strong>{d.name}</strong>
                <br />
                {d.foodType}
                <br />
                {d.location} {d.customLocation ? `- ${d.customLocation}` : ""}
                <br />
                <a href={`/dansal/${d.id}`}>
                  {lang === "si" ? "විස්තර බලන්න" : "View Details"}
                </a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
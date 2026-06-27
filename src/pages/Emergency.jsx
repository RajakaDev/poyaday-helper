import { useEffect } from "react";
import { Link } from "react-router-dom";
import { saveOfflineEmergency } from "../utils/offlineCache";

const EMERGENCY = [
  { title: "Suwa Seriya Ambulance", number: "1990", emoji: "🚑", color: "#e53935" },
  { title: "Police", number: "119", emoji: "👮", color: "#1565c0" },
  { title: "Fire & Rescue", number: "110", emoji: "🚒", color: "#ef6c00" },
  { title: "Disaster Management", number: "117", emoji: "⚠️", color: "#6d4c41" },
  { title: "Government Information", number: "1919", emoji: "☎️", color: "#00897b" },
];

const SERVICES = [
  { title: "Nearby Hospital", emoji: "🏥", url: "https://www.google.com/maps/search/hospital+near+me" },
  { title: "Nearby Pharmacy", emoji: "💊", url: "https://www.google.com/maps/search/pharmacy+near+me" },
  { title: "Nearby Police", emoji: "👮", url: "https://www.google.com/maps/search/police+station+near+me" },
  { title: "Nearby Toilet", emoji: "🚻", url: "https://www.google.com/maps/search/public+toilet+near+me" },
  { title: "Nearby Water", emoji: "🚰", url: "https://www.google.com/maps/search/drinking+water+near+me" },
  { title: "Nearby Fuel", emoji: "⛽", url: "https://www.google.com/maps/search/fuel+station+near+me" },
];

export default function Emergency({ lang = "si" }) {
  useEffect(() => {
    saveOfflineEmergency(EMERGENCY);
  }, []);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🚨 {lang === "si" ? "හදිසි උපකාර" : "Emergency Help"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "හදිසි අවස්ථාවකදී එක click එකකින් ඇමතුම් සහ සේවාවන්."
            : "Emergency contacts and nearby services with one tap."}
        </p>
      </div>

      <div className="cards">
        {EMERGENCY.map((item) => (
          <div key={item.number} className="emergency-card">
            <div className="emergency-left">
              <span className="emergency-icon" style={{ background: item.color }}>
                {item.emoji}
              </span>

              <div>
                <h3>{item.title}</h3>
                <p>{item.number}</p>
              </div>
            </div>

            <a href={`tel:${item.number}`} className="call-btn">
              📞 Call
            </a>
          </div>
        ))}
      </div>

      <div className="add-form">
        <div className="form-section-title">
          📍 {lang === "si" ? "අසල සේවාවන්" : "Nearby Services"}
        </div>

        <div className="cards">
          {SERVICES.map((item) => (
            <button
              key={item.title}
              className="service-card"
              type="button"
              onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
            >
              <span className="service-icon">{item.emoji}</span>

              <div>
                <strong>{item.title}</strong>
                <p>Google Maps</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
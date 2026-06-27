import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listenRoadAlerts } from "../services/roadAlertService";
import { ROAD_ALERT_TYPES } from "../utils/roadAlertTypes";

function getAlertLabel(type) {
  return ROAD_ALERT_TYPES.find((t) => t.id === type)?.label || "⚠️ Alert";
}

export default function RoadAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsub = listenRoadAlerts((data) => {
      setAlerts(data.filter((a) => a.active !== false));
    });

    return () => unsub();
  }, []);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">← Back</Link>

        <div className="form-section-title">🚧 Road Alerts</div>

        <p className="form-section-desc">
          Community road, traffic and parking updates.
        </p>

        <Link to="/add-road-alert" className="submit-btn">
          ➕ Add Road Alert
        </Link>
      </div>

      <div className="cards">
        {alerts.length === 0 ? (
          <div className="empty-state">No road alerts yet.</div>
        ) : (
          alerts.map((a) => (
            <div key={a.id} className="dansal-card">
              <div className="card-name">{getAlertLabel(a.type)}</div>
              <div className="card-loc">📍 {a.area} {a.town ? `- ${a.town}` : ""}</div>
              <div className="card-exact">{a.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
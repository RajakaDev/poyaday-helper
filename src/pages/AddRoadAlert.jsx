import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addRoadAlert } from "../services/roadAlertService";
import { ALERT_AREAS, ROAD_ALERT_TYPES } from "../utils/roadAlertTypes";

export default function AddRoadAlert() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    type: "heavy_traffic",
    area: "Anuradhapura",
    town: "",
    description: "",
  });

  const change = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.description.trim()) {
      alert("Please add a short description.");
      return;
    }

    setSaving(true);

    try {
      await addRoadAlert({
        type: form.type,
        area: form.area,
        town: form.town.trim(),
        description: form.description.trim(),
      });

      navigate("/road-alerts");
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/road-alerts">
          ← Back
        </Link>

        <div className="form-section-title">🚧 Add Road Alert</div>

        <p className="form-section-desc">
          Add traffic, road closed, parking full, or safety updates.
        </p>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Alert Type</label>
              <select
                className="form-select"
                name="type"
                value={form.type}
                onChange={change}
                disabled={saving}
              >
                {ROAD_ALERT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Area</label>
              <select
                className="form-select"
                name="area"
                value={form.area}
                onChange={change}
                disabled={saving}
              >
                {ALERT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-full">
              <label className="form-label">Town / Road</label>
              <input
                className="form-input"
                name="town"
                placeholder="Example: Mihintale Road"
                value={form.town}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                name="description"
                rows="4"
                placeholder="Example: Heavy traffic near entrance"
                value={form.description}
                onChange={change}
                disabled={saving}
                required
              />
            </div>
          </div>

          <button className="submit-btn" disabled={saving}>
            {saving ? "Saving..." : "Submit Alert"}
          </button>
        </form>
      </div>
    </div>
  );
}
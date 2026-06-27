import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addPlace } from "../services/placeService";

const DISTRICTS = [
  "Anuradhapura",
  "Mihintale",
  "Polonnaruwa",
  "Kurunegala",
  "Dambulla",
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Galle",
  "Matara",
  "Ratnapura",
  "Kegalle",
  "Badulla",
];

const EVENT_TYPES = [
  { id: "event", label: "🏮 Poson Event" },
  { id: "bana", label: "📖 Bana Program" },
  { id: "bhakthi_gee", label: "🎶 Bhakthi Gee" },
  { id: "poson_zone", label: "🌕 Poson Zone" },
];

function extractLatLngFromMapLink(url) {
  if (!url) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return { lat: match[1], lng: match[2] };
  }

  return null;
}

export default function AddEvent({ lang = "si" }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "event",
    district: "",
    town: "",
    address: "",
    description: "",
    mapLink: "",
    date: "",
    openTime: "",
    closeTime: "",
    lat: "",
    lng: "",
  });

  const change = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleMapLinkChange = (e) => {
    const value = e.target.value;
    const coords = extractLatLngFromMapLink(value);

    setForm((p) => ({
      ...p,
      mapLink: value,
      lat: coords ? coords.lat : p.lat,
      lng: coords ? coords.lng : p.lng,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!form.name.trim() || !form.district || !form.address.trim()) {
      alert("Please fill event name, district and address.");
      return;
    }

    setSaving(true);

    try {
      await addPlace({
        festivalType: "poyaday",
        year: "2026",

        name: form.name.trim(),
        type: form.type,
        category: "event",

        district: form.district,
        town: form.town.trim(),
        address: form.address.trim(),
        description: form.description.trim(),
        mapLink: form.mapLink.trim(),

        date: form.date,
        openTime: form.openTime,
        closeTime: form.closeTime,

        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      });

      navigate("/events");
    } catch (err) {
      console.error(err);
      alert("Event save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/events">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">
          🏮 {lang === "si" ? "Event එකතු කරන්න" : "Add Event"}
        </div>

        <p className="form-section-desc">
          {lang === "si"
            ? "පොසොන් events, බණ වැඩසටහන්, භක්ති ගී සහ කලාප එකතු කරන්න."
            : "Add Poson events, bana programs, bhakthi gee and zones."}
        </p>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Event Name</label>
              <input
                className="form-input"
                name="name"
                placeholder="Example: Mihintale Poson Bhakthi Gee"
                value={form.name}
                onChange={change}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select
                className="form-select"
                name="type"
                value={form.type}
                onChange={change}
                disabled={saving}
              >
                {EVENT_TYPES.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District / Area</label>
              <select
                className="form-select"
                name="district"
                value={form.district}
                onChange={change}
                disabled={saving}
                required
              >
                <option value="">Select area</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Town / Village</label>
              <input
                className="form-input"
                name="town"
                placeholder="Example: Mihintale"
                value={form.town}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Exact Location</label>
              <input
                className="form-input"
                name="address"
                placeholder="Example: Near temple entrance"
                value={form.address}
                onChange={change}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                name="description"
                rows="3"
                placeholder="Short event details..."
                value={form.description}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Google Maps Link</label>
              <input
                className="form-input"
                name="mapLink"
                placeholder="https://maps.google.com/..."
                value={form.mapLink}
                onChange={handleMapLinkChange}
                disabled={saving}
              />
              <p className="small-note">
                If the link has coordinates, latitude/longitude will fill automatically.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={form.date}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                className="form-input"
                name="openTime"
                type="time"
                value={form.openTime}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                className="form-input"
                name="closeTime"
                type="time"
                value={form.closeTime}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>
              <input
                className="form-input"
                name="lat"
                inputMode="decimal"
                placeholder="8.3500"
                value={form.lat}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>
              <input
                className="form-input"
                name="lng"
                inputMode="decimal"
                placeholder="80.5000"
                value={form.lng}
                onChange={change}
                disabled={saving}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Event"}
          </button>
        </form>
      </div>
    </div>
  );
}
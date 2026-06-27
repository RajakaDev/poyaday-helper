import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addPlace } from "../services/placeService";
import { PLACE_TYPES } from "../utils/types";

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

const DANSAL_CATEGORIES = [
  "Rice",
  "Noodles",
  "Kottu",
  "Tea",
  "Coffee",
  "Ice Cream",
  "Drink",
  "Soup",
  "Bread",
  "Other",
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

function isValidCoordinate(value, type) {
  if (value === "") return true;

  const num = Number(value);
  if (Number.isNaN(num)) return false;

  if (type === "lat") return num >= -90 && num <= 90;
  if (type === "lng") return num >= -180 && num <= 180;

  return false;
}

export default function AddPlace({ lang = "si" }) {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "dansal",
    category: "",
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

  const selectedType = PLACE_TYPES.find((t) => t.id === form.type);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "type") {
        return {
          ...prev,
          type: value,
          category: value === "dansal" ? "" : value,
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleMapLinkChange = (e) => {
    const value = e.target.value;
    const coords = extractLatLngFromMapLink(value);

    setForm((prev) => ({
      ...prev,
      mapLink: value,
      lat: coords ? coords.lat : prev.lat,
      lng: coords ? coords.lng : prev.lng,
    }));
  };

  const useMyLocation = () => {
    const ok = confirm(
      lang === "si"
        ? "ඔබ දැන් මෙම ස්ථානයේ සිටිනවාද? එසේ නම් පමණක් OK ඔබන්න."
        : "Are you currently at this place? Press OK only if you are there."
    );

    if (!ok) return;

    if (!navigator.geolocation) {
      alert(lang === "si" ? "GPS support නැහැ" : "GPS not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        }));

        alert(lang === "si" ? "GPS ස්ථානය එකතු වුණා" : "GPS location added");
      },
      () => {
        alert(
          lang === "si"
            ? "GPS permission ලබාදෙන්න."
            : "Please allow GPS permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (
      !form.name.trim() ||
      !form.type ||
      !form.district ||
      !form.address.trim()
    ) {
      alert(
        lang === "si"
          ? "අනිවාර්ය තොරතුරු පුරවන්න."
          : "Please fill required fields."
      );
      return;
    }

    if (!isValidCoordinate(form.lat, "lat") || !isValidCoordinate(form.lng, "lng")) {
      alert("Please enter valid latitude and longitude.");
      return;
    }

    if ((form.lat && !form.lng) || (!form.lat && form.lng)) {
      alert("Please add both latitude and longitude, or leave both empty.");
      return;
    }

    setSubmitting(true);

    try {
      await addPlace({
        festivalType: "poyaday",
        year: "2026",

        name: form.name.trim(),
        type: form.type,
        category: form.category || form.type,

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

      navigate("/");
    } catch (err) {
      console.error(err);
      alert(
        lang === "si"
          ? "Save වුණේ නැහැ. නැවත උත්සාහ කරන්න."
          : "Save failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <div style={{ paddingTop: 8 }}>
          <Link className="detail-back" to="/">
            ← {lang === "si" ? "ආපසු" : "Back"}
          </Link>

          <div className="form-section-title">
            {lang === "si" ? "ස්ථානයක් එක් කරන්න" : "Add Place"}
          </div>

          <p className="form-section-desc">
            {lang === "si"
              ? "දන්සල්, ජල ස්ථාන, parking, toilets, temples, first aid සහ events එකතු කරන්න."
              : "Add dansals, water points, parking, toilets, temples, first aid and events."}
          </p>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">
                {lang === "si" ? "ස්ථානයේ නම" : "Place Name"}
              </label>

              <input
                className="form-input"
                name="name"
                required
                disabled={submitting}
                placeholder="Example: Mihintale Rice Dansal"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "ස්ථාන වර්ගය" : "Place Type"}
              </label>

              <select
                className="form-select"
                name="type"
                required
                disabled={submitting}
                value={form.type}
                onChange={handleChange}
              >
                {PLACE_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {form.type === "dansal" ? (
              <div className="form-group">
                <label className="form-label">
                  {lang === "si" ? "දන්සල් වර්ගය" : "Dansal Category"}
                </label>

                <select
                  className="form-select"
                  name="category"
                  disabled={submitting}
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">
                    {lang === "si" ? "වර්ගය තෝරන්න" : "Select category"}
                  </option>

                  {DANSAL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  {lang === "si" ? "තෝරාගත් වර්ගය" : "Selected Type"}
                </label>

                <input
                  className="form-input"
                  value={selectedType?.name || form.type}
                  readOnly
                  disabled
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "ප්‍රදේශය / දිස්ත්‍රික්කය" : "District / Area"}
              </label>

              <select
                className="form-select"
                name="district"
                required
                disabled={submitting}
                value={form.district}
                onChange={handleChange}
              >
                <option value="">
                  {lang === "si" ? "ප්‍රදේශය තෝරන්න" : "Select area"}
                </option>

                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "නගරය / ගම" : "Town / Village"}
              </label>

              <input
                className="form-input"
                name="town"
                disabled={submitting}
                placeholder="Example: Mihintale"
                value={form.town}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">
                {lang === "si" ? "නිශ්චිත ස්ථානය" : "Exact Address"}
              </label>

              <input
                className="form-input"
                name="address"
                required
                disabled={submitting}
                placeholder="Example: Near bus stand / Near temple"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">
                {lang === "si" ? "විස්තර" : "Description"}
              </label>

              <textarea
                className="form-input"
                name="description"
                rows="3"
                disabled={submitting}
                placeholder="Short details..."
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Google Maps Link</label>

              <input
                className="form-input"
                name="mapLink"
                disabled={submitting}
                placeholder="https://maps.google.com/..."
                value={form.mapLink}
                onChange={handleMapLinkChange}
              />

              <p className="small-note">
                {lang === "si"
                  ? "Map link එකේ coordinates තිබේ නම් latitude/longitude ස්වයංක්‍රීයව පිරේ."
                  : "If the map link contains coordinates, latitude/longitude will be filled automatically."}
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "දිනය" : "Date"}
              </label>

              <input
                className="form-input"
                name="date"
                type="date"
                disabled={submitting}
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "ආරම්භ වේලාව" : "Start Time"}
              </label>

              <input
                className="form-input"
                name="openTime"
                type="time"
                disabled={submitting}
                value={form.openTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                {lang === "si" ? "අවසන් වේලාව" : "End Time"}
              </label>

              <input
                className="form-input"
                name="closeTime"
                type="time"
                disabled={submitting}
                value={form.closeTime}
                onChange={handleChange}
              />
            </div>

            <div className="gps-warning form-full">
              <strong>
                {lang === "si"
                  ? "GPS පිළිබඳ වැදගත් දැනුම්දීම"
                  : "Important GPS Notice"}
              </strong>

              <p>
                {lang === "si"
                  ? "ඔබ මෙම ස්ථානයේ සිටිනවා නම් පමණක් GPS භාවිතා කරන්න."
                  : "Use GPS only if you are physically at this place."}
              </p>

              <button
                type="button"
                className="gps-btn"
                onClick={useMyLocation}
                disabled={submitting}
              >
                📍 {lang === "si" ? "GPS භාවිතා කරන්න" : "Use GPS"}
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Latitude</label>

              <input
                className="form-input"
                name="lat"
                inputMode="decimal"
                disabled={submitting}
                placeholder="8.3500"
                value={form.lat}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude</label>

              <input
                className="form-input"
                name="lng"
                inputMode="decimal"
                disabled={submitting}
                placeholder="80.5000"
                value={form.lng}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={submitting}>
            {submitting
              ? lang === "si"
                ? "Save වෙමින්..."
                : "Saving..."
              : lang === "si"
              ? "Save කරන්න"
              : "Save Place"}
          </button>
        </form>
      </div>
    </div>
  );
}
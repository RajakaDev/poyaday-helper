import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addPlace } from "../services/placeService";
import { PLACE_TYPES } from "../utils/types";
import { getAllFoodTypes, saveCustomFoodType } from "../utils/foodTypes";

const DISTRICTS = [
  "Anuradhapura", "Mihintale", "Polonnaruwa", "Kurunegala", "Dambulla",
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale",
  "Galle", "Matara", "Ratnapura", "Kegalle", "Badulla",
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
  const [foodTypes, setFoodTypes] = useState(getAllFoodTypes());
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [customFood, setCustomFood] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "dansal",
    category: "",
    customCategory: "",
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
    phone: "",
    website: "",
    facebook: "",
    parking: false,
    toilet: false,
    water: false,
    firstAid: false,
    wheelchair: false,
    charging: false,
  });

  const selectedType = PLACE_TYPES.find((t) => t.id === form.type);

  const updateForm = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      updateForm(name, checked);
      return;
    }

    if (name === "type") {
      setForm((prev) => ({
        ...prev,
        type: value,
        category: value === "dansal" ? "" : value,
        customCategory: "",
      }));
      setShowCustomFood(false);
      return;
    }

    updateForm(name, value);
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

  const addCustomFood = () => {
    const value = customFood.trim();
    if (!value) return;

    saveCustomFoodType(value);
    setFoodTypes(getAllFoodTypes());

    setForm((prev) => ({
      ...prev,
      category: value.toLowerCase(),
      customCategory: value,
    }));

    setCustomFood("");
    setShowCustomFood(false);
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
        alert(lang === "si" ? "GPS permission ලබාදෙන්න." : "Please allow GPS permission.");
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

    if (!form.name.trim() || !form.type || !form.district || !form.address.trim()) {
      alert(lang === "si" ? "අනිවාර්ය තොරතුරු පුරවන්න." : "Please fill required fields.");
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
        customCategory: form.customCategory || "",

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

        phone: form.phone.trim(),
        website: form.website.trim(),
        facebook: form.facebook.trim(),

        parking: form.parking,
        toilet: form.toilet,
        water: form.water,
        firstAid: form.firstAid,
        wheelchair: form.wheelchair,
        charging: form.charging,
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      alert(lang === "si" ? "Save වුණේ නැහැ. නැවත උත්සාහ කරන්න." : "Save failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
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

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Place Name *</label>
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
              <label className="form-label">Place Type *</label>
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
                <label className="form-label">Dansal Food Type</label>
                <select
                  className="form-select"
                  disabled={submitting}
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "other") {
                      setShowCustomFood(true);
                      return;
                    }

                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                      customCategory: "",
                    }));
                  }}
                >
                  <option value="">Select food type</option>
                  {foodTypes.map((food) => (
                    <option key={food} value={food.toLowerCase()}>
                      {food}
                    </option>
                  ))}
                </select>

                <button
                  className="home-action-btn"
                  type="button"
                  style={{ marginTop: 8 }}
                  disabled={submitting}
                  onClick={() => setShowCustomFood(true)}
                >
                  ➕ Add New Food Type
                </button>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Selected Type</label>
                <input
                  className="form-input"
                  value={selectedType?.name || form.type}
                  readOnly
                  disabled
                />
              </div>
            )}

            {showCustomFood && (
              <div className="form-group form-full">
                <label className="form-label">New Food Type</label>
                <div className="food-add-row">
                  <input
                    className="form-input"
                    placeholder="Example: Kottu"
                    value={customFood}
                    disabled={submitting}
                    onChange={(e) => setCustomFood(e.target.value)}
                  />
                  <button
                    className="home-action-btn"
                    type="button"
                    disabled={submitting}
                    onClick={addCustomFood}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">District / Area *</label>
              <select
                className="form-select"
                name="district"
                required
                disabled={submitting}
                value={form.district}
                onChange={handleChange}
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
                disabled={submitting}
                placeholder="Example: Mihintale"
                value={form.town}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Exact Address *</label>
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
              <label className="form-label">Description</label>
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
                If the map link contains coordinates, latitude/longitude will be filled automatically.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
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
              <label className="form-label">Start Time</label>
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
              <label className="form-label">End Time</label>
              <input
                className="form-input"
                name="closeTime"
                type="time"
                disabled={submitting}
                value={form.closeTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                name="phone"
                disabled={submitting}
                placeholder="0712345678"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                className="form-input"
                name="website"
                disabled={submitting}
                placeholder="https://example.com"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Facebook Page</label>
              <input
                className="form-input"
                name="facebook"
                disabled={submitting}
                placeholder="https://facebook.com/..."
                value={form.facebook}
                onChange={handleChange}
              />
            </div>

            <div className="gps-warning form-full">
              <strong>Important GPS Notice</strong>
              <p>Use GPS only if you are physically at this place.</p>
              <button
                type="button"
                className="gps-btn"
                onClick={useMyLocation}
                disabled={submitting}
              >
                📍 Use GPS
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

            <div className="form-group form-full">
              <label className="form-label">Facilities</label>
              <div className="facility-grid">
                {[
                  ["parking", "🚗 Parking"],
                  ["toilet", "🚻 Toilet"],
                  ["water", "💧 Water"],
                  ["firstAid", "🏥 First Aid"],
                  ["wheelchair", "🦽 Wheelchair"],
                  ["charging", "🔌 Charging"],
                ].map(([key, label]) => (
                  <label key={key} className="facility-chip">
                    <input
                      type="checkbox"
                      name={key}
                      checked={form[key]}
                      disabled={submitting}
                      onChange={handleChange}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button className="submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Save Place"}
          </button>
        </form>
      </div>
    </div>
  );
}
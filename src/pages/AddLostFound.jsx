import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addLostFound } from "../services/lostFoundService";
import { uploadImage } from "../utils/uploadImage";
import {
  LOST_FOUND_DISTRICTS,
  LOST_FOUND_TYPES,
} from "../utils/lostFoundTypes";

export default function AddLostFound({ lang = "si" }) {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [form, setForm] = useState({
    type: "lost",
    itemType: "phone",
    title: "",
    description: "",
    district: "Anuradhapura",
    town: "",
    contactName: "",
    phone: "",
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const change = (e) => {
    setForm((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));
  };

  const choosePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const cleanPhone = form.phone.trim();

    if (!form.title.trim() || !form.description.trim() || !cleanPhone) {
      alert("Please fill title, description and phone.");
      return;
    }

    if (cleanPhone.length < 9) {
      alert("Please enter a valid phone number.");
      return;
    }

    setSaving(true);

    try {
      let photoUrl = "";

      if (photoFile) {
        photoUrl = await uploadImage(photoFile, "poyaday-helper/lost-found");
      }

      await addLostFound({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        town: form.town.trim(),
        contactName: form.contactName.trim(),
        phone: cleanPhone,
        photo: photoUrl,
      });

      navigate("/lost-found");
    } catch (err) {
      console.error(err);
      alert("Save failed. Check Cloudinary preset.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/lost-found">
          ← Back
        </Link>

        <div className="form-section-title">🔎 Add Lost / Found Item</div>

        <p className="form-section-desc">
          Add lost or found items to help people recover them.
        </p>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                name="type"
                value={form.type}
                onChange={change}
                disabled={saving}
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Item Type</label>
              <select
                className="form-select"
                name="itemType"
                value={form.itemType}
                onChange={change}
                disabled={saving}
              >
                {LOST_FOUND_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-full">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="Example: Lost Samsung Phone"
                value={form.title}
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
                rows="4"
                placeholder="Where did you lose/find it?"
                value={form.description}
                onChange={change}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <select
                className="form-select"
                name="district"
                value={form.district}
                onChange={change}
                disabled={saving}
              >
                {LOST_FOUND_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Town / Area</label>
              <input
                className="form-input"
                name="town"
                placeholder="Example: Sacred City"
                value={form.town}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                className="form-input"
                name="contactName"
                placeholder="Your name"
                value={form.contactName}
                onChange={change}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                className="form-input"
                name="phone"
                placeholder="0771234567"
                value={form.phone}
                onChange={change}
                disabled={saving}
                required
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Photo</label>
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={choosePhoto}
                disabled={saving}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="lost-preview-image"
                />
              )}
            </div>
          </div>

          <button className="submit-btn" disabled={saving}>
            {saving ? "Uploading & Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
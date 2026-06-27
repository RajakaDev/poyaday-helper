import { useEffect, useState } from "react";
import {
  addPromotion,
  deletePromotion,
  listenPromotions,
  updatePromotion,
} from "../services/promotionService";

const CATEGORIES = [
  "Restaurant",
  "Hotel",
  "Shop",
  "Supermarket",
  "Fuel",
  "Taxi",
  "Hospital",
  "Pharmacy",
  "Bank",
  "Electronics",
  "Fashion",
  "Travel",
  "Event",
  "Service",
  "Education",
  "Other",
];

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [form, setForm] = useState({
    businessName: "",
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    whatsapp: "",
    phone: "",
    category: "Other",
    district: "",
    town: "",
    priority: 0,
    active: true,
  });

  useEffect(() => {
    const unsub = listenPromotions(setPromotions);
    return () => unsub();
  }, []);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.businessName || !form.title || !form.description) {
      alert("Fill business name, title and description");
      return;
    }

    await addPromotion(form);

    setForm({
      businessName: "",
      title: "",
      description: "",
      imageUrl: "",
      targetUrl: "",
      whatsapp: "",
      phone: "",
      category: "Other",
      district: "",
      town: "",
      priority: 0,
      active: true,
    });
  };

  return (
    <div className="admin-promo-box">
      <h2>⭐ Promotions</h2>

      <form onSubmit={submit} className="form-grid">
        <input
          className="form-input"
          name="businessName"
          placeholder="Business Name"
          value={form.businessName}
          onChange={change}
        />

        <input
          className="form-input"
          name="title"
          placeholder="Promotion Title"
          value={form.title}
          onChange={change}
        />

        <textarea
          className="form-input form-full"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={change}
        />

        <input
          className="form-input form-full"
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={change}
        />

        <input
          className="form-input form-full"
          name="targetUrl"
          placeholder="Website / Facebook / Google Maps Link"
          value={form.targetUrl}
          onChange={change}
        />

        <input
          className="form-input"
          name="whatsapp"
          placeholder="WhatsApp e.g. +94771234567"
          value={form.whatsapp}
          onChange={change}
        />

        <input
          className="form-input"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={change}
        />

        <select
          className="form-select"
          name="category"
          value={form.category}
          onChange={change}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input
          className="form-input"
          name="district"
          placeholder="District"
          value={form.district}
          onChange={change}
        />

        <input
          className="form-input"
          name="town"
          placeholder="Town"
          value={form.town}
          onChange={change}
        />

        <input
          className="form-input"
          name="priority"
          type="number"
          placeholder="Priority"
          value={form.priority}
          onChange={change}
        />

        <label className="small-note">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={change}
          />{" "}
          Active
        </label>

        <button className="submit-btn form-full">Add Promotion</button>
      </form>

      <div className="admin-list">
        {promotions.map((p) => (
          <div key={p.id} className="admin-card">
            <h3>{p.businessName}</h3>
            <p>{p.title}</p>
            <p>{p.description}</p>
            <p>
              {p.category} | {p.district}
            </p>

            <div className="admin-actions">
              <button
                type="button"
                onClick={() => updatePromotion(p.id, { active: !p.active })}
              >
                {p.active ? "Deactivate" : "Activate"}
              </button>

              <button
                className="danger"
                type="button"
                onClick={() => deletePromotion(p.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
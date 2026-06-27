import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addFeedPost, listenFeed } from "../services/feedService";

const TYPES = [
  "🍛 Rice Dansal Started",
  "🚗 Parking Full",
  "🚰 Free Water Available",
  "🚨 Road Closed",
  "👥 Crowd High",
  "🚻 Toilet Available",
  "📢 Other Update",
];

export default function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [type, setType] = useState(TYPES[0]);
  const [message, setMessage] = useState("");
  const [area, setArea] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = listenFeed(setPosts);
    return () => unsub();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!message.trim()) {
      alert("Please write a quick update.");
      return;
    }

    setSaving(true);

    try {
      await addFeedPost({
        type,
        message: message.trim(),
        area: area.trim(),
        user: "anonymous",
      });

      setMessage("");
      setArea("");
    } catch (err) {
      console.error(err);
      alert("Post failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← Back
        </Link>

        <div className="form-section-title">📢 Community Updates</div>

        <p className="form-section-desc">
          Share quick updates like parking full, free water, road closed, or crowd high.
        </p>

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Update Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={saving}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-full">
              <label className="form-label">Area</label>
              <input
                className="form-input"
                placeholder="Area e.g. Mihintale"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="form-group form-full">
              <label className="form-label">Message</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Write quick update..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <button className="submit-btn" disabled={saving}>
            {saving ? "Posting..." : "Post Update"}
          </button>
        </form>
      </div>

      <div className="cards">
        {posts.length === 0 ? (
          <div className="empty-state">No community updates yet.</div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="dansal-card">
              <div className="card-name">{p.type}</div>
              <div className="card-loc">📍 {p.area || "Unknown area"}</div>
              <div className="card-exact">{p.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
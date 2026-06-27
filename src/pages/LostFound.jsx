import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLostFound } from "../hooks/useLostFound";
import { LOST_FOUND_TYPES } from "../utils/lostFoundTypes";

function getItemType(id) {
  return LOST_FOUND_TYPES.find((x) => x.id === id)?.label || "📦 Other";
}

export default function LostFound({ lang = "si" }) {
  const { items, loadingLostFound } = useLostFound();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.title || ""} ${item.description || ""} ${
        item.district || ""
      } ${item.town || ""}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter = filter === "all" || item.type === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">🔍 Lost & Found</div>

        <input
          className="search-input"
          placeholder="Search lost or found item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="home-action-row">
          <button
            type="button"
            className={`home-action-btn ${filter === "all" ? "active-chip" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={`home-action-btn ${filter === "lost" ? "active-chip" : ""}`}
            onClick={() => setFilter("lost")}
          >
            🔴 Lost
          </button>

          <button
            type="button"
            className={`home-action-btn ${filter === "found" ? "active-chip" : ""}`}
            onClick={() => setFilter("found")}
          >
            🟢 Found
          </button>

          <Link className="home-action-btn" to="/add-lost-found">
            ➕ Add
          </Link>
        </div>
      </div>

      <div className="cards">
        {loadingLostFound ? (
          <div className="empty-state">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No items found.</div>
        ) : (
          filtered.map((item) => (
            <Link
              key={item.id}
              to={`/lost-found/${item.id}`}
              className="dansal-card"
            >
              <div className="card-top">
                <div>
                  <div className="card-name">
                    {getItemType(item.itemType)} {item.title}
                  </div>

                  <div className="card-loc">
                    📍 {item.district || "-"} {item.town ? `- ${item.town}` : ""}
                  </div>
                </div>

                <span className={`status-${item.type}`}>
                  {item.type || "open"}
                </span>
              </div>

              <div className="card-tags">
                <span className="tag tag-food">{item.status || "open"}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
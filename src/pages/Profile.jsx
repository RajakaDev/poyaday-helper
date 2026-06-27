import { Link } from "react-router-dom";
import { usePlaces } from "../hooks/usePlaces";
import { PLACE_TYPES } from "../utils/types";

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem("favorite_places") || "[]");
  } catch {
    return [];
  }
}

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

export default function Profile({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const favoriteIds = getFavoriteIds();
  const favorites = places.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">👤 My PoyaDay</div>

        <p className="form-section-desc">
          {lang === "si"
            ? "ඔබ save කළ ස්ථාන සහ app shortcuts මෙතැනින් බලන්න."
            : "View your saved places and quick app shortcuts."}
        </p>

        <div className="analytics-grid">
          <div className="analytics-card">
            <span>❤️</span>
            <strong>{favorites.length}</strong>
            <p>{lang === "si" ? "Save කළ ස්ථාන" : "Saved Places"}</p>
          </div>

          <div className="analytics-card">
            <span>📍</span>
            <strong>{places.length}</strong>
            <p>{lang === "si" ? "මුළු ස්ථාන" : "Total Places"}</p>
          </div>
        </div>

        <div className="home-action-row">
          <Link to="/favorites" className="home-action-btn">
            ❤️ Favorites
          </Link>

          <Link to="/assistant" className="home-action-btn">
            🤖 Smart Helper
          </Link>

          <Link to="/emergency" className="home-action-btn">
            🚨 Emergency
          </Link>

          <Link to="/lost-found" className="home-action-btn">
            🔍 Lost & Found
          </Link>
        </div>
      </div>

      <div className="section-header">
        <span className="section-title">
          {lang === "si" ? "Save කළ ස්ථාන" : "Saved Places"}
        </span>
        <span className="count-badge">{favorites.length}</span>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            {lang === "si" ? "තවම save කළ ස්ථාන නැහැ." : "No saved places yet."}
          </div>
        ) : (
          favorites.map((p) => (
            <Link key={p.id} to={`/place/${p.id}`} className="dansal-card">
              <div className="card-name">
                {getTypeLabel(p.type)} {p.name}
              </div>

              <div className="card-loc">
                📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
              </div>

              <div className="card-tags">
                <span className="tag tag-food">
                  👥 {p.crowdLevel || "medium"}
                </span>
                <span className="tag tag-food">
                  🏷️ {p.category || p.type || "place"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
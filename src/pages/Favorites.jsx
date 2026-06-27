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

export default function Favorites({ lang = "si" }) {
  const { places, loading } = usePlaces();
  const favoriteIds = getFavoriteIds();

  const favorites = places.filter((p) => favoriteIds.includes(p.id));

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">❤️ Favorites</div>

        <p className="form-section-desc">
          {lang === "si"
            ? "ඔබ save කළ ස්ථාන මෙතැනින් බලන්න."
            : "View your saved places here."}
        </p>
      </div>

      <div className="cards">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            {lang === "si" ? "Save කළ ස්ථාන නැහැ." : "No favorite places yet."}
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
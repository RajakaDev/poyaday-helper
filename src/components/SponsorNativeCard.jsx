import { SPONSOR } from "../config/sponsor";

export default function SponsorNativeCard() {
  return (
    <div className="dansal-card sponsor-native-card">
      <div className="card-top">
        <div>
          <div className="card-name">
            {SPONSOR.badge} • {SPONSOR.title}
          </div>

          <div className="card-loc">{SPONSOR.subtitle}</div>

          <div className="card-exact">{SPONSOR.description}</div>
        </div>

        <span className="status-open">Ad</span>
      </div>

      <div className="card-tags">
        {SPONSOR.tags.map((tag) => (
          <span key={tag} className="tag tag-food">
            {tag}
          </span>
        ))}
      </div>

      <button
        className="submit-btn"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log("Sponsor clicked:", SPONSOR.id);
          window.location.href = "/sponsor";
        }}
      >
        {SPONSOR.button}
      </button>
    </div>
  );
}
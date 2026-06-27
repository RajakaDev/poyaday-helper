import { Link } from "react-router-dom";

export default function More() {
  const items = [
    ["🚨 Emergency", "/emergency"],
    ["🔍 Lost & Found", "/lost-found"],
    ["📢 Community Feed", "/feed"],
    ["🤖 Smart Assistant", "/assistant"],
    ["⚙️ Settings", "/settings"],
    ["ℹ️ About", "/about"],
    ["👤 Profile", "/profile"],
    ["🛠 Admin", "/admin"],
  ];

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">← Back</Link>

        <div className="form-section-title">☰ More Features</div>
        <p className="form-section-desc">
          Access emergency, community, settings and admin tools.
        </p>

        <div className="more-grid">
          {items.map(([label, path]) => (
            <Link key={path} to={path} className="more-card">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
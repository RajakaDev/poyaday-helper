import { Link } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";

export default function Settings({ lang = "si" }) {
  const { lang: appLang, setLang, theme, setTheme, online } = useApp();
  const { user, logout } = useAuth();

  const clearWelcome = () => {
    sessionStorage.removeItem("poyaday_intro_seen");
    sessionStorage.removeItem("poson_intro_seen");
    alert("Welcome screen will show again after refresh.");
  };

  const clearFavorites = () => {
    const ok = confirm("Clear all saved favorite places?");
    if (!ok) return;

    localStorage.removeItem("favorite_places");
    alert("Favorites cleared.");
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">⚙️ Settings</div>

        <p className="form-section-desc">
          {lang === "si"
            ? "App language, theme සහ account settings."
            : "Manage app language, theme and account settings."}
        </p>

        <div className="analytics-section">
          <h3>🌐 Language</h3>

          <div className="home-action-row">
            <button
              className={`home-action-btn ${appLang === "si" ? "active-chip" : ""}`}
              type="button"
              onClick={() => setLang("si")}
            >
              සිංහල
            </button>

            <button
              className={`home-action-btn ${appLang === "en" ? "active-chip" : ""}`}
              type="button"
              onClick={() => setLang("en")}
            >
              English
            </button>
          </div>
        </div>

        <div className="analytics-section">
          <h3>🎨 Theme</h3>

          <div className="home-action-row">
            <button
              className={`home-action-btn ${theme === "dark" ? "active-chip" : ""}`}
              type="button"
              onClick={() => setTheme("dark")}
            >
              🌙 Dark
            </button>

            <button
              className={`home-action-btn ${theme === "light" ? "active-chip" : ""}`}
              type="button"
              onClick={() => setTheme("light")}
            >
              ☀️ Light
            </button>
          </div>
        </div>

        <div className="analytics-section">
          <h3>📶 App Status</h3>

          <div className="analytics-row">
            <span>Internet</span>
            <strong>{online ? "Online" : "Offline"}</strong>
          </div>

          <div className="analytics-row">
            <span>Version</span>
            <strong>1.0.0</strong>
          </div>
        </div>

        <div className="analytics-section">
          <h3>👤 Account</h3>

          {user ? (
            <>
              <div className="notice-box">
                <strong>Logged in</strong>
                <p>{user.email}</p>
              </div>

              <button className="close-btn" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="submit-btn" to="/login">
              Login with Google
            </Link>
          )}
        </div>

        <div className="analytics-section">
          <h3>🧹 Reset</h3>

          <div className="home-action-row">
            <button className="home-action-btn" type="button" onClick={clearWelcome}>
              Show Welcome Again
            </button>

            <button className="report-btn" type="button" onClick={clearFavorites}>
              Clear Favorites
            </button>
          </div>
        </div>

        <div className="analytics-section">
          <h3>🔗 Zytrix Solution</h3>

          <div className="home-action-row">
            <a className="home-action-btn" href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>

            <a className="home-action-btn" href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>

            <a className="home-action-btn" href="https://linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
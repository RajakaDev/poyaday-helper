import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login({ lang = "si" }) {
  const navigate = useNavigate();
  const { user, authLoading, loginWithGoogle, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Google login failed.");
    }
  };

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">🔐 Login</div>

        <p className="form-section-desc">
          {lang === "si"
            ? "Google account එකෙන් login වෙන්න."
            : "Login using your Google account."}
        </p>

        {authLoading ? (
          <div className="empty-state">Loading...</div>
        ) : user ? (
          <>
            <div className="notice-box">
              <strong>✅ Logged in</strong>
              <p>{user.email}</p>
            </div>

            <button className="close-btn" type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button className="submit-btn" type="button" onClick={handleLogin}>
            Continue with Google
          </button>
        )}
      </div>
    </div>
  );
}
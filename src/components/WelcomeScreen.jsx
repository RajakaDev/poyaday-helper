import { useEffect } from "react";

export default function WelcomeScreen({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 4500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcome-screen">
      <div className="welcome-moon" />

      <div className="welcome-stars">
        {Array.from({ length: 45 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="welcome-lantern wl-1">🏮</div>
      <div className="welcome-lantern wl-2">🏮</div>
      <div className="welcome-lantern wl-3">🏮</div>

      <div className="welcome-card">
        <div className="welcome-icon">🪔</div>

        <h1>
          පිංබර වෙසක්
          <br />
          මංගල්‍යක් වේවා!
        </h1>

        <p>Find Dansals • Find Thorans • Live Updates</p>

        <div className="welcome-dev">✨ Developed By Zytrix ✨</div>

        <button type="button" onClick={onFinish}>
          Enter
        </button>
      </div>

      <div className="welcome-lamps">🪔 🪔 🪔 🪔 🪔</div>
    </div>
  );
}
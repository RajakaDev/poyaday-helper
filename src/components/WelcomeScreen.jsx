import { useEffect, useMemo } from "react";

export default function WelcomeScreen({ onFinish }) {
  const stars = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 3}s`,
      duration: `${2 + Math.random() * 3}s`,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(onFinish, 4200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="welcome-screen">
      <div className="welcome-bg-glow" />
      <div className="welcome-moon" />

      <div className="welcome-stars">
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="welcome-lantern wl-1">🏮</div>
      <div className="welcome-lantern wl-2">🏮</div>
      <div className="welcome-lantern wl-3">🏮</div>

      <div className="welcome-card">
        <div className="welcome-logo-wrap">
          <img src="/pwa-192x192.png" alt="PoyaDay Logo" className="welcome-logo" />
        </div>

        <h1>PoyaDay Helper</h1>

        <p className="welcome-tagline">
          Sri Lanka&apos;s Smart Poya Guide
        </p>

        <div className="welcome-features">
          <span>📍 Places</span>
          <span>🗺 Maps</span>
          <span>🚨 Emergency</span>
          <span>🔍 Lost & Found</span>
          <span>🤖 Smart Helper</span>
        </div>

        <div className="welcome-powered">
          <small>Powered by</small>
          <strong>Zytrix Solution</strong>
        </div>

        <div className="welcome-loading">
          <span />
        </div>

        <button type="button" onClick={onFinish}>
          Enter App
        </button>
      </div>

      <div className="welcome-footer">
        Version 1.0.0
        <br />© 2026 Zytrix Solution
      </div>
    </div>
  );
}
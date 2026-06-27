import { useEffect, useMemo } from "react";

export default function SplashScreen({ onFinish }) {
  const stars = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2.5}s`,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-glow" />
      <div className="splash-moon" />

      <div className="splash-stars">
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="splash-card">
        <img src="/pwa-192x192.png" alt="PoyaDay Helper" />
        <h1>PoyaDay Helper</h1>
        <p>Sri Lanka&apos;s Smart Poya Guide</p>

        <div className="splash-loader">
          <span />
        </div>

        <div className="splash-powered">
          Powered by <strong>Zytrix Solution</strong>
        </div>
      </div>
    </div>
  );
}
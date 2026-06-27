import { useEffect, useState } from "react";
import { SPONSOR } from "../config/sponsor";

const STORAGE_KEY = `${SPONSOR.id}_popup_last_seen`;
const ONE_DAY = 24 * 60 * 60 * 1000;

export default function SponsorPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const now = Date.now();

    if (now - lastSeen > ONE_DAY) {
      const timer = setTimeout(() => setShow(true), 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  const visitSponsor = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    console.log("Sponsor popup clicked:", SPONSOR.id);
    window.location.href = "/sponsor";
    setShow(false);
  };

  if (!show) return null;

  return (
  <div className="sponsor-popup-overlay">
    <div className="sponsor-popup">

      <span className="sponsor-badge">
        {SPONSOR.badge} • {SPONSOR.label}
      </span>

      <img
        src={SPONSOR.images.popup}
        alt={SPONSOR.name}
        className="sponsor-popup-image"
      />

      <h3>{SPONSOR.title}</h3>

      <p>{SPONSOR.description}</p>

      <div className="sponsor-popup-actions">
          <button type="button" onClick={closePopup}>
            Close
          </button>

          <button type="button" onClick={visitSponsor}>
            {SPONSOR.button}
          </button>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";

const STORAGE_KEY = "sponsor_popup_last_seen";
const ONE_HOUR = 60 * 60 * 1000;

export default function SponsorPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(STORAGE_KEY) || 0);

    if (Date.now() - lastSeen >= ONE_HOUR) {
      setOpen(true);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setOpen(false);
  };

  const visitSponsor = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    window.open("https://cinzesub.com", "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="sponsor-popup-overlay">
      <div className="sponsor-popup">

        <span className="sponsor-badge">
          ⭐ Sponsored
        </span>

        <img
          src="/cinzesub-banner.jpg"
          alt="CinzeSub"
          className="sponsor-popup-image"
        />

        <h2>CinzeSub</h2>

        <p>
          Watch movies and TV series online.
        </p>

        <div className="sponsor-popup-actions">

          <button
            className="promotion-btn"
            onClick={visitSponsor}
          >
            Visit Sponsor
          </button>

          <button
            className="close-btn"
            onClick={closePopup}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
}
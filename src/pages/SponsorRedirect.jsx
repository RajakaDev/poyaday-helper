import { useEffect } from "react";
import { SPONSOR } from "../config/sponsor";

export default function SponsorRedirect() {
  useEffect(() => {
    console.log("Sponsor impression:", SPONSOR.id);

    const timer = setTimeout(() => {
      window.location.href = SPONSOR.url;
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page active">
      <div className="add-form">

        <div className="my-vesak-hero">
          <div className="vesak-glow">⭐</div>

          <h2>{SPONSOR.badge}</h2>

          <p>
            You are being redirected to our trusted sponsor.
          </p>

          <h3>{SPONSOR.title}</h3>

          <p>{SPONSOR.description}</p>

          <div className="welcome-loading">
            <span></span>
          </div>

          <small>Redirecting...</small>

        </div>

      </div>
    </div>
  );
}
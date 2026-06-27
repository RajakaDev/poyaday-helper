import { SPONSOR } from "../config/sponsor";

export default function SponsorBanner() {
  return (
    <section className="sponsor-banner">
      <div>
        <span>{SPONSOR.badge} • {SPONSOR.label}</span>
        <strong>{SPONSOR.title}</strong>
        <p>{SPONSOR.description}</p>
      </div>

      <button
        type="button"
        onClick={() =>
         window.location.href = "/sponsor"
        }
      >
        {SPONSOR.button}
      </button>
    </section>
  );
}
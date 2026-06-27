export default function PromotionCard({ promotion }) {
  const openPromotion = () => {
    if (promotion.targetUrl) {
      window.open(promotion.targetUrl, "_blank");
      return;
    }

    if (promotion.whatsapp) {
      window.open(
        `https://wa.me/${promotion.whatsapp.replace(/\D/g, "")}`,
        "_blank"
      );
      return;
    }

    if (promotion.phone) {
      window.location.href = `tel:${promotion.phone}`;
    }
  };

  return (
    <div className="promotion-card" onClick={openPromotion}>
      <img
        src={promotion.imageUrl}
        alt={promotion.title}
        className="promotion-image"
      />

      <div className="promotion-body">
        <div className="promotion-badge">
          ⭐ Sponsored
        </div>

        <h3>{promotion.businessName}</h3>

        <p>{promotion.title}</p>

        <button className="promotion-btn">
          View Offer
        </button>
      </div>
    </div>
  );
}
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  addPlaceComment,
  addPlacePhoto,
  listenPlaceComments,
  listenPlacePhotos,
  reportPlace,
  voteCrowd,
} from "../services/placeService";
import { usePlaces } from "../hooks/usePlaces";
import { uploadImage } from "../utils/uploadImage";
import { distanceKm } from "../utils/distance";
import { PLACE_TYPES } from "../utils/types";

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || "📍 Place";
}

function getFavoriteIds() {
  try {
    return JSON.parse(localStorage.getItem("favorite_places") || "[]");
  } catch {
    return [];
  }
}

function getGuestId() {
  let id = localStorage.getItem("guest_user_id");

  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("guest_user_id", id);
  }

  return id;
}

function crowdLabel(level) {
  if (level === "low") return "🟢 Low";
  if (level === "high") return "🔴 Busy";
  return "🟠 Medium";
}

export default function PlaceDetails({ lang = "si" }) {
  const { id } = useParams();
  const { places } = usePlaces();

  const [place, setPlace] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [voting, setVoting] = useState(false);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    setFavorite(getFavoriteIds().includes(id));

    const unsubPlace = onSnapshot(doc(db, "places", id), (snap) => {
      if (snap.exists()) {
        setPlace({ id: snap.id, ...snap.data() });
      }
    });

    const unsubComments = listenPlaceComments(id, setComments);
    const unsubPhotos = listenPlacePhotos(id, setPhotos);

    return () => {
      unsubPlace();
      unsubComments();
      unsubPhotos();
    };
  }, [id]);

  const nearbyFacilities = useMemo(() => {
    if (!place?.lat || !place?.lng) return [];

    return places
      .filter((p) => p.id !== place.id && p.hidden !== true && p.lat && p.lng)
      .map((p) => ({
        ...p,
        distance: distanceKm(
          Number(place.lat),
          Number(place.lng),
          Number(p.lat),
          Number(p.lng)
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [places, place]);

  if (!place) {
    return <div className="empty-state">Loading...</div>;
  }

  const googleMapsUrl =
    place.lat && place.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
      : place.mapLink || "";

  const sharePlace = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: `${place.name} - ${place.district || ""}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = () => {
    const current = getFavoriteIds();
    const updated = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];

    localStorage.setItem("favorite_places", JSON.stringify(updated));
    setFavorite(updated.includes(id));
  };

  const submitCrowdVote = async (level) => {
    if (voting) return;

    const userId = auth.currentUser?.uid || getGuestId();

    setVoting(true);

    try {
      await voteCrowd(id, userId, level);
      alert("Crowd updated. Thank you!");
    } catch (err) {
      console.error(err);
      alert("Vote failed.");
    } finally {
      setVoting(false);
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await addPlaceComment(id, comment.trim());
      setComment("");
    } catch (err) {
      console.error(err);
      alert("Comment failed.");
    }
  };

  const submitReport = async (reason) => {
    const userId = auth.currentUser?.uid || getGuestId();

    try {
      await reportPlace(id, userId, reason);
      alert("Report received. Thank you!");
    } catch (err) {
      console.error(err);
      alert("Report failed.");
    }
  };

  const uploadPlacePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    setUploadingPhoto(true);

    try {
      const url = await uploadImage(file, "poyaday-helper/place-photos");
      await addPlacePhoto(id, url);
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const status = getPlaceTimeStatus(
    place.date,
    place.openTime,
    place.closeTime
);

  return (
    <div className="page active page-detail">
      <div className="detail-hero">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="detail-name">
          {getTypeLabel(place.type)} {place.name}
          {place.verified && (
            <span className="verified-badge">
              ✅ {lang === "si" ? "තහවුරුයි" : "Verified"}
            </span>
          )}
        </div>

        <div className="detail-status">
    {status.label}
</div>

<div className="detail-countdown">
    {status.message}
</div>

        <div className="detail-meta">
          <div className="detail-meta-row">
            📍 {place.district || "-"} {place.town ? `- ${place.town}` : ""}
          </div>

          <div className="detail-meta-row">📌 {place.address || "-"}</div>

          <div className="detail-meta-row">
            🏷️ {place.category || place.type || "place"}
          </div>

          {place.description && (
            <div className="detail-meta-row">📝 {place.description}</div>
          )}

          <div className="detail-meta-row">
            👥 Crowd: {crowdLabel(place.crowdLevel)}
          </div>

          <div className="detail-meta-row">
            🟢 Status: {place.status || "open"}
          </div>

          <div className="detail-meta-row">
            🕒 {place.openTime || "Anytime"}{" "}
            {place.closeTime ? `– ${place.closeTime}` : ""}
          </div>
        </div>

        <div className="home-action-row">
          {googleMapsUrl && (
            <a
              className="home-action-btn"
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              🧭 Navigate
            </a>
          )}

          <button className="home-action-btn" type="button" onClick={sharePlace}>
            📤 Share
          </button>

          <button className="home-action-btn" type="button" onClick={toggleFavorite}>
            {favorite ? "❤️ Saved" : "🤍 Save"}
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">📍 Nearby Facilities</div>

        {nearbyFacilities.length === 0 ? (
          <p className="small-note">No nearby GPS places found.</p>
        ) : (
          nearbyFacilities.map((p) => (
            <Link key={p.id} to={`/place/${p.id}`} className="route-card">
              <strong>
                {getTypeLabel(p.type)} {p.name}
              </strong>
              <span>{p.distance.toFixed(1)} km</span>
            </Link>
          ))
        )}
      </div>

      <div className="detail-section">
        <div className="detail-section-title">👥 Crowd Voting</div>

        <p className="small-note">
          Current: {crowdLabel(place.crowdLevel)} | Votes:{" "}
          {place.crowdVotesCount || 0}
        </p>

        <div className="home-action-row">
          <button
            className="home-action-btn"
            disabled={voting}
            onClick={() => submitCrowdVote("low")}
            type="button"
          >
            🟢 Low
          </button>

          <button
            className="home-action-btn"
            disabled={voting}
            onClick={() => submitCrowdVote("medium")}
            type="button"
          >
            🟠 Medium
          </button>

          <button
            className="home-action-btn"
            disabled={voting}
            onClick={() => submitCrowdVote("high")}
            type="button"
          >
            🔴 Busy
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">📷 Photos</div>

        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={uploadPlacePhoto}
          disabled={uploadingPhoto}
        />

        {uploadingPhoto && <p className="small-note">Uploading...</p>}

        <div className="photo-grid">
          {photos.length === 0 ? (
            <p className="small-note">No photos yet.</p>
          ) : (
            photos.map((p) => <img key={p.id} src={p.url} alt="Place" />)
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">💬 Live Updates</div>

        <form className="comment-form" onSubmit={submitComment}>
          <input
            className="comment-input"
            placeholder="Add update..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="comment-send" type="submit">
            Send
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="small-note">No updates yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                {c.message}
                <div className="comment-time">{c.user || "anonymous"}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">🚨 Report / Update</div>

        <div className="home-action-row">
          <button
            className="home-action-btn"
            type="button"
            onClick={() => submitReport("closed")}
          >
            🚫 Closed
          </button>

          <button
            className="home-action-btn"
            type="button"
            onClick={() => submitReport("wrong_location")}
          >
            📍 Wrong Location
          </button>

          <button
            className="home-action-btn"
            type="button"
            onClick={() => submitReport("wrong_info")}
          >
            ⚠️ Wrong Info
          </button>
        </div>

        <p className="small-note">Reports: {place.reports || 0}/10</p>
      </div>
    </div>
  );
}
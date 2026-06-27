import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase/firebase";
import { uploadImage } from "../utils/uploadImage";

const PHOTO_LIMIT = 25;

export default function PosonZoneDetails({ lang = "si" }) {
  const { id } = useParams();

  const [posonZone, setPosonZone] = useState(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubZone = onSnapshot(doc(db, "posonZones", id), (snap) => {
      if (snap.exists()) {
        setPosonZone({ id: snap.id, ...snap.data() });
      }
    });

    const commentsQuery = query(
      collection(db, "posonZones", id, "comments"),
      orderBy("createdAt", "desc")
    );

    const unsubComments = onSnapshot(commentsQuery, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const photosQuery = query(
      collection(db, "posonZones", id, "photos"),
      orderBy("createdAt", "desc")
    );

    const unsubPhotos = onSnapshot(photosQuery, (snap) => {
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubZone();
      unsubComments();
      unsubPhotos();
    };
  }, [id]);

  const sharePosonZone = async () => {
    if (!posonZone) return;

    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: posonZone.name,
        text: `${posonZone.name} - ${posonZone.location || ""}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  const reportWrongInfo = async () => {
    const userId = `guest_${Date.now()}`;

    const reason = prompt(
      lang === "si"
        ? "වැරදි තොරතුර කෙටියෙන් ලියන්න:"
        : "Briefly explain what is wrong:"
    );

    if (!reason?.trim()) return;

    await setDoc(doc(db, "posonZones", id, "reports", userId), {
      reason: reason.trim(),
      createdAt: serverTimestamp(),
    });

    const snap = await getDocs(collection(db, "posonZones", id, "reports"));
    const count = snap.size;

    await updateDoc(doc(db, "posonZones", id), {
      reportCount: count,
      hidden: count >= 10,
      updatedAt: serverTimestamp(),
    });

    alert(`Report received. Reports: ${count}/10`);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addDoc(collection(db, "posonZones", id, "comments"), {
      message: comment.trim(),
      user: "anonymous",
      createdAt: serverTimestamp(),
    });

    setComment("");
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (photos.length >= PHOTO_LIMIT) {
      alert(`Maximum ${PHOTO_LIMIT} photos allowed.`);
      return;
    }

    setUploading(true);

    try {
      const url = await uploadImage(file, "poyaday-helper/poson-zones");

      await addDoc(collection(db, "posonZones", id, "photos"), {
        url,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      alert("Photo upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (!posonZone) {
    return <div className="empty-state">Loading...</div>;
  }

  return (
    <div className="page active page-detail">
      <div className="detail-hero">
        <Link className="detail-back" to="/poson-zones">
          ← {lang === "si" ? "සියලු පොසොන් කලාප" : "All Poson Zones"}
        </Link>

        <div className="detail-name">
          🏮 {posonZone.name}
          {posonZone.verified && (
            <span className="verified-badge">
              ✅ {lang === "si" ? "තහවුරුයි" : "Verified"}
            </span>
          )}
        </div>

        <div className="detail-meta">
          <div className="detail-meta-row">
            📍 {posonZone.location || "-"}{" "}
            {posonZone.customLocation ? `— ${posonZone.customLocation}` : ""}{" "}
            {posonZone.exactLocation ? `— ${posonZone.exactLocation}` : ""}
          </div>

          <div className="detail-meta-row">
            🕒 {posonZone.startTime || "-"}{" "}
            {posonZone.endTime ? `– ${posonZone.endTime}` : ""} | 📅{" "}
            {posonZone.date || "-"}
          </div>

          {posonZone.description && (
            <div className="detail-meta-row">📝 {posonZone.description}</div>
          )}

          {posonZone.mapLink && (
            <div className="detail-meta-row" style={{ marginTop: 6 }}>
              <a
                className="map-link-btn"
                href={posonZone.mapLink}
                target="_blank"
                rel="noreferrer"
              >
                📍 {lang === "si" ? "Map එක බලන්න" : "Open Map"}
              </a>
            </div>
          )}

          <button className="share-btn" type="button" onClick={sharePosonZone}>
            📤 {lang === "si" ? "බෙදාගන්න" : "Share"}
          </button>

          <button className="report-btn" type="button" onClick={reportWrongInfo}>
            ⚠️ {lang === "si" ? "වැරදි තොරතුරක් Report කරන්න" : "Report Wrong Info"}
          </button>

          <p className="small-note">Reports: {posonZone.reportCount || 0}/10</p>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          {lang === "si" ? "පොසොන් මතකයන්" : "Poson Zone Memories"}
        </div>

        <p className="small-note">
          Photos {photos.length}/{PHOTO_LIMIT}
        </p>

        <input
          className="form-input"
          type="file"
          accept="image/*"
          disabled={uploading || photos.length >= PHOTO_LIMIT}
          onChange={uploadPhoto}
        />

        {uploading && <p className="small-note">Uploading...</p>}

        <div className="photo-grid">
          {photos.map((p) => (
            <img key={p.id} src={p.url} alt="Poson zone memory" />
          ))}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section-title">
          {lang === "si" ? "සජීවී යාවත්කාලීන" : "Live Updates"}
        </div>

        <form className="comment-form" onSubmit={addComment}>
          <input
            className="comment-input"
            placeholder="Add live update..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button className="comment-send" type="submit">
            {lang === "si" ? "යවන්න" : "Send"}
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
    </div>
  );
}
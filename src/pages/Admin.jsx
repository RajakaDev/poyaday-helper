import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { PLACE_TYPES } from "../utils/types";
import AdminPromotions from "../components/AdminPromotions";

const ADMIN_EMAIL = "udararajaka80@gmail.com";

function getTypeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.name || type || "Place";
}

export default function Admin({ lang = "si" }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [photosByPlace, setPhotosByPlace] = useState({});
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const isAdmin =
    user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    setLoadingPlaces(true);

    const unsubPlaces = onSnapshot(
      collection(db, "places"),
      async (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setPlaces(data);

        const photoData = {};

        for (const item of data) {
          try {
            const photoSnap = await getDocs(
              collection(db, "places", item.id, "photos")
            );

            photoData[item.id] = photoSnap.docs.map((p) => ({
              id: p.id,
              ...p.data(),
            }));
          } catch (err) {
            console.error("Photo load error:", item.id, err);
            photoData[item.id] = [];
          }
        }

        setPhotosByPlace(photoData);
        setLoadingPlaces(false);
      },
      (error) => {
        console.error("Admin read error:", error);
        alert(
          lang === "si"
            ? "Admin data load වෙන්නේ නැහැ. Firestore rules බලන්න."
            : "Admin data not loading. Check Firestore rules."
        );
        setLoadingPlaces(false);
      }
    );

    return () => unsubPlaces();
  }, [isAdmin, lang]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed. Check console error.");
    }
  };

  const updatePlace = async (id, data) => {
    try {
      await updateDoc(doc(db, "places", id), data);
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed. Check Firestore rules.");
    }
  };

  const deletePlace = async (id) => {
    const ok = confirm("Delete this place permanently?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "places", id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Check Firestore rules.");
    }
  };

  const deletePhoto = async (placeId, photoId) => {
    const ok = confirm("Delete this photo from website?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "places", placeId, "photos", photoId));
    } catch (err) {
      console.error("Photo delete error:", err);
      alert("Photo delete failed. Check Firestore rules.");
    }
  };

  if (!authChecked) {
    return (
      <div className="page active">
        <div className="add-form">
          <div className="form-section-title">Loading admin...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page active">
        <div className="add-form">
          <Link className="detail-back" to="/">
            ← Back
          </Link>

          <div className="form-section-title">🔐 Admin Login</div>

          <p className="form-section-desc">
            Login with admin Google account:
            <br />
            <strong>{ADMIN_EMAIL}</strong>
          </p>

          <button className="submit-btn" type="button" onClick={login}>
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page active">
        <div className="add-form">
          <Link className="detail-back" to="/">
            ← Back
          </Link>

          <div className="form-section-title">Access Denied</div>

          <p className="form-section-desc">
            Logged in as:
            <br />
            <strong>{user.email}</strong>
            <br />
            Required admin:
            <br />
            <strong>{ADMIN_EMAIL}</strong>
          </p>

          <button className="close-btn" type="button" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← Back
        </Link>

        <div className="form-section-title">🛠 PoyaDay Admin Dashboard</div>

        <p className="form-section-desc">
          Logged in as {user.email}
          <br />
          Total Places: {places.length}
        </p>

        <button className="close-btn" type="button" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>

      <div className="admin-list">
        {loadingPlaces && <div className="empty-state">Loading places...</div>}

        {!loadingPlaces && places.length === 0 && (
          <div className="empty-state">No places found. Add a place first.</div>
        )}

        {places.map((p) => (
          <div key={p.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>
                  {getTypeLabel(p.type)} {p.name || "No name"}
                </h3>

                <p>
                  📍 {p.district || "-"} {p.town ? `- ${p.town}` : ""}
                </p>

                <p>📌 {p.address || "-"}</p>
                <p>🏷️ {p.category || p.type || "-"}</p>

                <p>
                  📅 {p.date || "-"} | 🕒 {p.openTime || "-"}{" "}
                  {p.closeTime ? `- ${p.closeTime}` : ""}
                </p>

                <p>👥 Crowd: {p.crowdLevel || "medium"}</p>
                <p>⚠️ Reports: {p.reports || 0}</p>
                <p>Status: {p.status || "open"}</p>
                <p>Hidden: {p.hidden ? "Yes" : "No"}</p>
                <p>Verified: {p.verified ? "Yes" : "No"}</p>
                <p>GPS: {p.lat && p.lng ? `${p.lat}, ${p.lng}` : "No GPS"}</p>
              </div>
            </div>

            <div className="admin-actions">
              <button
                type="button"
                onClick={() => updatePlace(p.id, { hidden: !p.hidden })}
              >
                {p.hidden ? "Unhide" : "Hide"}
              </button>

              <button
                type="button"
                onClick={() => updatePlace(p.id, { verified: !p.verified })}
              >
                {p.verified ? "Remove Verify" : "Verify"}
              </button>

              <button
                type="button"
                onClick={() =>
                  updatePlace(p.id, {
                    status: p.status === "closed" ? "open" : "closed",
                  })
                }
              >
                {p.status === "closed" ? "Mark Open" : "Mark Closed"}
              </button>

              <button
                type="button"
                onClick={() =>
                  updatePlace(p.id, {
                    reports: 0,
                    status: "open",
                    hidden: false,
                  })
                }
              >
                Clear Reports
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => deletePlace(p.id)}
              >
                Delete
              </button>
            </div>

            <div className="admin-photos">
              {(photosByPlace[p.id] || []).map((photo) => (
                <div key={photo.id} className="admin-photo-item">
                  <img src={photo.url} alt="memory" />

                  <button
                    type="button"
                    className="danger"
                    onClick={() => deletePhoto(p.id, photo.id)}
                  >
                    Delete Photo
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AdminPromotions lang={lang} />
    </div>
  );
}
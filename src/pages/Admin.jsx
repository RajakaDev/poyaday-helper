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
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { Link } from "react-router-dom";
import { db } from "../firebase";

const ADMIN_EMAIL = "udararajaka80@gmail.com";

export default function Admin({ lang = "si" }) {
  const auth = getAuth();

  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [dansals, setDansals] = useState([]);
  const [photosByDansal, setPhotosByDansal] = useState({});
  const [loadingDansals, setLoadingDansals] = useState(false);

  const isAdmin =
    user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });

    return () => unsubAuth();
  }, [auth]);

  useEffect(() => {
    if (!isAdmin) return;

    setLoadingDansals(true);

    const unsubDansals = onSnapshot(
      collection(db, "dansals"),
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

        setDansals(data);

        const photoData = {};

        for (const item of data) {
          try {
            const photoSnap = await getDocs(
              collection(db, "dansals", item.id, "photos")
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

        setPhotosByDansal(photoData);
        setLoadingDansals(false);
      },
      (error) => {
        console.error("Admin dansal read error:", error);
        alert(
          lang === "si"
            ? "Admin data load වෙන්නේ නැහැ. Firestore rules බලන්න."
            : "Admin data not loading. Check Firestore rules."
        );
        setLoadingDansals(false);
      }
    );

    return () => unsubDansals();
  }, [isAdmin, lang]);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login error:", err);
      alert(
        lang === "si"
          ? "Google login අසාර්ථකයි. Console error බලන්න."
          : "Google login failed. Check console error."
      );
    }
  };

  const updateDansal = async (id, data) => {
    try {
      await updateDoc(doc(db, "dansals", id), data);
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed. Check Firestore rules.");
    }
  };

  const deleteDansal = async (id) => {
    const ok = confirm("Delete this dansal permanently?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "dansals", id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Check Firestore rules.");
    }
  };

  const deletePhoto = async (dansalId, photoId) => {
    const ok = confirm("Delete this photo from website?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "dansals", dansalId, "photos", photoId));
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

        <div className="form-section-title">🛠 Admin Dashboard</div>

        <p className="form-section-desc">
          Logged in as {user.email}
          <br />
          Total Dansals: {dansals.length}
        </p>

        <button className="close-btn" type="button" onClick={() => signOut(auth)}>
          Logout
        </button>
      </div>

      <div className="admin-list">
        {loadingDansals && (
          <div className="empty-state">Loading dansals...</div>
        )}

        {!loadingDansals && dansals.length === 0 && (
          <div className="empty-state">
            No dansals found. Add a dansal first.
          </div>
        )}

        {dansals.map((d) => (
          <div key={d.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <h3>🍛 {d.name || "No name"}</h3>
                <p>
                  📍 {d.location || "-"}{" "}
                  {d.customLocation ? `- ${d.customLocation}` : ""}
                </p>
                <p>📌 {d.exactLocation || "-"}</p>
                <p>🍽️ {d.foodType || "-"}</p>
                <p>📅 {d.date || "-"} | 🕒 {d.openTime || "-"} {d.closeTime ? `- ${d.closeTime}` : ""}</p>
                <p>⚠️ Reports: {d.reportCount || 0}</p>
                <p>Status: {d.status || "open"}</p>
                <p>Hidden: {d.hidden ? "Yes" : "No"}</p>
                <p>Verified: {d.verified ? "Yes" : "No"}</p>
                <p>GPS: {d.lat && d.lng ? `${d.lat}, ${d.lng}` : "No GPS"}</p>
              </div>
            </div>

            <div className="admin-actions">
              <button
                type="button"
                onClick={() => updateDansal(d.id, { hidden: !d.hidden })}
              >
                {d.hidden ? "Unhide" : "Hide"}
              </button>

              <button
                type="button"
                onClick={() => updateDansal(d.id, { verified: !d.verified })}
              >
                {d.verified ? "Remove Verify" : "Verify"}
              </button>

              <button
                type="button"
                onClick={() =>
                  updateDansal(d.id, {
                    status: d.status === "closed" ? "open" : "closed",
                  })
                }
              >
                {d.status === "closed" ? "Mark Open" : "Mark Closed"}
              </button>

              <button
                type="button"
                className="danger"
                onClick={() => deleteDansal(d.id)}
              >
                Delete
              </button>
            </div>

            <div className="admin-photos">
              {(photosByDansal[d.id] || []).map((p) => (
                <div key={p.id} className="admin-photo-item">
                  <img src={p.url} alt="memory" />
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deletePhoto(d.id, p.id)}
                  >
                    Delete Photo
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
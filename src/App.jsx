import { useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

import InstallAppButton from "./components/InstallAppButton";
import SponsorPopup from "./components/SponsorPopup";
import WelcomeScreen from "./components/WelcomeScreen";

import Home from "./pages/Home";
import AddPlace from "./pages/AddPlace";
import AddEvent from "./pages/AddEvent";
import PlaceDetails from "./pages/PlaceDetails";
import MapPage from "./pages/Map";
import RoutePlanner from "./pages/RoutePlanner";
import EventRoutePlanner from "./pages/EventRoutePlanner";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Emergency from "./pages/Emergency";
import LostFound from "./pages/LostFound";
import AddLostFound from "./pages/AddLostFound";
import LostFoundDetails from "./pages/LostFoundDetails";
import Favorites from "./pages/Favorites";
import CommunityFeed from "./pages/CommunityFeed";
import SmartAssistant from "./pages/SmartAssistant";
import RoadAlerts from "./pages/RoadAlerts";
import AddRoadAlert from "./pages/AddRoadAlert";
import Events from "./pages/Events";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import About from "./pages/About";

export default function App() {
  const [lang, setLang] = useState("si");

  const [showWelcome, setShowWelcome] = useState(() => {
    return sessionStorage.getItem("poyaday_intro_seen") !== "true";
  });

  const finishWelcome = () => {
    sessionStorage.setItem("poyaday_intro_seen", "true");
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeScreen onFinish={finishWelcome} />;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <SponsorPopup />

        <nav className="nav">
          <Link to="/" className="nav-brand">
            <div className="nav-title">🌕 PoyaDay Helper</div>
            <div className="nav-sub">Find places, help people</div>
          </Link>

          <div className="nav-links">
            <button
              className="nav-btn"
              type="button"
              onClick={() => setLang(lang === "si" ? "en" : "si")}
            >
              {lang === "si" ? "EN" : "සිං"}
            </button>

            <InstallAppButton />

            <Link to="/add" className="nav-btn">
              ➕ {lang === "si" ? "Add" : "Add"}
            </Link>

            <Link to="/map" className="nav-btn">
              🗺️ {lang === "si" ? "Map" : "Map"}
            </Link>

            <Link to="/assistant" className="nav-btn">
              🤖 AI
            </Link>

            <Link to="/emergency" className="nav-btn">
              🚨 {lang === "si" ? "හදිසි" : "Emergency"}
            </Link>

            <Link to="/road-alerts" className="nav-btn">
              🚧 Roads
            </Link>

            <Link to="/lost-found" className="nav-btn">
              🔍 Lost
            </Link>

            <Link to="/profile" className="nav-btn">
              👤 Profile
            </Link>

            <Link to="/settings" className="nav-btn">
              ⚙️
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home lang={lang} />} />

          <Route path="/add" element={<AddPlace lang={lang} />} />
          <Route path="/add-event" element={<AddEvent lang={lang} />} />

          <Route path="/place/:id" element={<PlaceDetails lang={lang} />} />

          <Route path="/map" element={<MapPage lang={lang} />} />
          <Route path="/route" element={<RoutePlanner lang={lang} />} />
          <Route
            path="/event-route"
            element={<EventRoutePlanner lang={lang} />}
          />

          <Route path="/events" element={<Events lang={lang} />} />
          <Route path="/analytics" element={<Analytics lang={lang} />} />
          <Route path="/admin" element={<Admin lang={lang} />} />
          <Route path="/profile" element={<Profile lang={lang} />} />
          <Route path="/favorites" element={<Favorites lang={lang} />} />

          <Route path="/emergency" element={<Emergency lang={lang} />} />

          <Route path="/lost-found" element={<LostFound lang={lang} />} />
          <Route
            path="/add-lost-found"
            element={<AddLostFound lang={lang} />}
          />
          <Route
            path="/lost-found/:id"
            element={<LostFoundDetails lang={lang} />}
          />

          <Route path="/feed" element={<CommunityFeed lang={lang} />} />
          <Route path="/assistant" element={<SmartAssistant lang={lang} />} />

          <Route path="/road-alerts" element={<RoadAlerts lang={lang} />} />
          <Route
            path="/add-road-alert"
            element={<AddRoadAlert lang={lang} />}
          />

          <Route path="/login" element={<Login lang={lang} />} />
          <Route path="/settings" element={<Settings lang={lang} />} />
          <Route path="/about" element={<About lang={lang} />} />

          <Route path="*" element={<Home lang={lang} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
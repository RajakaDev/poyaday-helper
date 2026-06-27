import { Link } from "react-router-dom";

const SOCIALS = [
  {
    name: "Facebook",
    icon: "📘",
    url: "https://facebook.com",
  },
  {
    name: "Instagram",
    icon: "📸",
    url: "https://instagram.com",
  },
  {
    name: "LinkedIn",
    icon: "💼",
    url: "https://linkedin.com",
  },
  {
    name: "Website",
    icon: "🌐",
    url: "https://zytrixsolution.com",
  },
];

export default function About({ lang = "si" }) {
  return (
    <div className="page active">
      <div className="add-form">
        <Link className="detail-back" to="/">
          ← {lang === "si" ? "ආපසු" : "Back"}
        </Link>

        <div className="form-section-title">ℹ️ About PoyaDay Helper</div>

        <p className="form-section-desc">
          PoyaDay Helper is a smart community app developed by Zytrix Solution
          to help people find useful places, emergency support, events, road
          alerts, lost & found items and nearby facilities during Poya days in
          Sri Lanka.
        </p>

        <div className="notice-box">
          <strong>Developed by Zytrix Solution Team</strong>
          <p>
            Co-founder: <strong>H.D.R.U Anurasiri</strong>
            <br />
            Undergraduate Software Engineering Student — SCU
          </p>
        </div>

        <div className="analytics-section">
          <h3>🎯 Our Mission</h3>
          <p className="small-note">
            Our mission is to build simple, useful and community-powered
            digital solutions that make real-life journeys safer, easier and
            more connected for Sri Lankan people.
          </p>
        </div>

        <div className="analytics-section">
          <h3>🚀 Our Target</h3>
          <p className="small-note">
            We aim to make PoyaDay Helper the most trusted digital companion
            for Poya day travel, pilgrimage, emergency help, public updates and
            local discovery in Sri Lanka.
          </p>
        </div>

        <div className="analytics-section">
          <h3>🌟 Future Vision</h3>
          <p className="small-note">
            In the future, Zytrix Solution plans to improve this platform with
            smarter AI assistance, verified business listings, offline support,
            live alerts and more professional community services.
          </p>
        </div>

        <div className="analytics-section">
          <h3>✨ Key Features</h3>

          <div className="card-tags">
            <span className="tag tag-food">📍 Places</span>
            <span className="tag tag-food">🗺 Map</span>
            <span className="tag tag-food">🚨 Emergency</span>
            <span className="tag tag-food">🔍 Lost & Found</span>
            <span className="tag tag-food">🚧 Road Alerts</span>
            <span className="tag tag-food">🤖 Smart Helper</span>
          </div>
        </div>

        <div className="analytics-section">
          <h3>🔗 Social Media</h3>

          <div className="home-action-row">
            {SOCIALS.map((item) => (
              <a
                key={item.name}
                className="home-action-btn"
                href={item.url}
                target="_blank"
                rel="noreferrer"
              >
                {item.icon} {item.name}
              </a>
            ))}
          </div>
        </div>

        <footer className="creator-footer">
          <strong>Powered by Zytrix Solution</strong>
          <br />
          © 2026 Zytrix Solution. All Rights Reserved.
        </footer>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/">🏠<span>Home</span></Link>
      <Link to="/map">🗺️<span>Map</span></Link>
      <Link to="/route">🧭<span>Route</span></Link>
      <Link to="/add">➕<span>Add</span></Link>
      <Link to="/more">☰<span>More</span></Link>
    </nav>
  );
}
import "../styles/bottom-nav.css";
import { useNavigate, useLocation } from "react-router-dom";
import chatIcon from '../assets/icons/chat.png'
import dashboardIcon from '../assets/icons/dashboard.png'
import profileIcon from '../assets/icons/profile.png'
import videoIcon from '../assets/icons/video.png'
import exploreIcon from '../assets/icons/explore.png'
// import chatIcon from '../assets/icons/chat.png'

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on Chat page
  if (location.pathname === "/chat") {
    return null;
  }

  const navItems = [
    { icon: {dashboardIcon}, label: "Home", path: "/dashboard" },
    { icon: {exploreIcon}, label: "Explore", path: "/explore" },
    { icon: {chatIcon}, label: "Chat", path: "/chat", isCenter: true },
    { icon: {videoIcon}, label: "Video", path: "/video" },
    { icon: {profileIcon}, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item, i) => (
        <div
          key={`${item.label}-${i}`}
          className={`nav-item ${item.isCenter ? "center" : ""} ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
        >
          <span>{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

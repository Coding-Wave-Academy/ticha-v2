import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/coming-soon.css";
import sadTicha from "../assets/sad_ticha.png";
import MobileOnly from "../components/MobileOnly";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <MobileOnly>
      <div className="coming-soon-container">
        <div className="content">
          <img src={sadTicha} alt="Sad Ticha" className="sad-ticha" />
          <h1 className="title">Oops! Coming Soon</h1>
          <p className="message">
            Ticha is working hard to build this part of your learning journey.
            It's not quite ready yet, but it's going to be awesome!
          </p>
          <button
            className="back-button"
            onClick={() => navigate("/dashboard")}
          >
            Take me back Home
          </button>
        </div>
      </div>
    </MobileOnly>
  );
}

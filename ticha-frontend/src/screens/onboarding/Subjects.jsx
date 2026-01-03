import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import { useOnboarding } from "../../context/useOnboarding";
import { subjectsByLevel } from "../../data/subjectByLevel";
import ProgressDots from "../../components/ProgressDots";
import "../../styles/subjects.css";

export default function Subjects() {
  const { language } = useLanguage();
  const { onboarding } = useOnboarding();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);

  // Get the level mapping
  const levelMap = {
    ol: "GCE O/L",
    al: "GCE A/L",
    uni: "University",
  };

  const selectedLevel = levelMap[onboarding.level];

  // Set limits based on level
  const limits = {
    "GCE O/L": { min: 3, max: 11 },
    "GCE A/L": { min: 2, max: 5 },
    University: { min: 0, max: 0 },
  };

  const currentLimit = limits[selectedLevel] || { min: 3, max: 8 };

  useEffect(() => {
    if (selectedLevel === "University") {
      navigate("/dashboard");
    }
  }, [selectedLevel, navigate]);

  if (selectedLevel === "University") return null;

  const subjects = subjectsByLevel[selectedLevel] || [];

  const toggle = (subject) => {
    setSelected((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((s) => s !== subject);
      }
      if (prev.length >= currentLimit.max) return prev;
      return [...prev, subject];
    });
  };

  const isValid =
    selected.length >= currentLimit.min && selected.length <= currentLimit.max;

  const continueHandler = () => {
    if (!isValid) return;
    localStorage.setItem(
      "ticha_onboarding",
      JSON.stringify({ subjects: selected })
    );
    navigate("/auth");
  };

  return (
    <div
      className="screen-v2"
      style={{ flexDirection: "column", position: "relative" }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 32,
          width: "15%",
          position: "absolute",
          top: 0,
          left: 15,
          backgroundColor: "#fff",
          boxShadow: "3px 3px 0px #000",
          borderRadius: "32px",
          padding: "12px",
          border: "2px solid #000",
          fontWeight: "bold",
          cursor: "pointer",
          minWidth: "50px",
        }}
      >
        ←
      </button>

      <ProgressDots step={4} />

      <div className="header">
     
 <h1 className="title">
        {language === "fr" ? "SÉLECTIONNE TES SUJETS" : "SELECT YOUR SUBJECTS"}
      </h1>
      
<p
        style={{
          fontSize: 14,
          marginBottom: 32,
          marginTop: 0,
          textAlign: "center",
        }}
      >
        {language === "fr"
          ? `Choisis ${currentLimit.min} à ${currentLimit.max} sujets (${selected.length}/${currentLimit.max} sélectionnés)`
          : `Choose ${currentLimit.min} to ${currentLimit.max} subjects (${selected.length}/${currentLimit.max} selected)`}
      </p>
 
      </div>

     
      

      <div className="subjects-bubbles">
        {subjects.map((subj) => (
          <button
            key={subj}
            className={`subject-bubble ${
              selected.includes(subj) ? "active" : ""
            }`}
            onClick={() => toggle(subj)}
            type="button"
          >
            {subj}
          </button>
        ))}
      </div>

      <button
        className="button-v1"
        style={{
          background: isValid ? "var(--green)" : "#ccc",
          marginTop: 40,
          color: isValid ? "#000" : "#777",
          maxWidth: 500,
          width: "100%",
        }}
        disabled={!isValid}
        onClick={continueHandler}
      >
        {language === "fr" ? "CONTINUER" : "CONTINUE"}
      </button>
    </div>
  );
}

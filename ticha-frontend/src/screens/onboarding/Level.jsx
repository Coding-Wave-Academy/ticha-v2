import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import { useOnboarding } from "../../context/useOnboarding";
import ProgressDots from "../../components/ProgressDots";
import Goals from "./Goals";

const LEVELS = [
  {
    id: "ol",
    en: "GCE Ordinary Level(O/L)",
    fr: "GCE Ordinaire",
    descEn: "Form 5",
    descFr: "Examens secondaires de base",
    icon: "🔥",
  },
  {
    id: "al",
    en: "GCE Advanced Level(A/L)",
    fr: "GCE Avancé",
    descEn: "Upper Sixth",
    descFr: "Accès à l’université",
    icon: "🏆",
  },
  {
    id: "uni",
    en: "University Student",
    fr: "Étudiant Universitaire",
    descEn: "Continuous assessments & exams",
    descFr: "Contrôles et examens universitaires",
    icon: "🥹",
  },
];

export default function Level() {
  const { language } = useLanguage();
  const { onboarding, setLevel } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div
      className="screen-v2"
      style={{ flexDirection: "column", position: "relative" }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: 32 * 1.2,
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

      <ProgressDots step={3} />

      <div className="header">
        <h1 className="title">
          {language === "fr" ? "TON NIVEAU D'ÉTUDES" : "YOUR EDUCATION LEVEL"}
        </h1>
      </div>

      <div
        style={{
          marginTop: 24,
          marginBottom: 64,
          maxWidth: 500,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {LEVELS.map((lvl) => {
          const selected = onboarding.level === lvl.id;

          return (
            <button
              key={lvl.id}
              onClick={() => setLevel(lvl.id)}
              className="button-v1"
              style={{
                margin: "32px auto",
                background: selected ? "var(--yellow)" : "white",
                textAlign: "left",
                boxShadow: selected ? "4px 4px 0 #000" : "8px 8px 0 #000",
                display: "flex",
                gap: "1em",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: "300%" }}>
                {lvl.icon}
              </div>
              <div className="info">
                <div style={{ fontWeight: 900 }}>
                  {language === "fr" ? lvl.fr : lvl.en}
                </div>
                <div style={{ fontSize: 14, marginTop: 6, fontWeight: 500 }}>
                  {language === "fr" ? lvl.descFr : lvl.descEn}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        className="button-v1"
        style={{
          background: "var(--green)",
          marginTop: 24,
          opacity: onboarding.level ? 1 : 0.5,
          maxWidth: 500,
          width: "100%",
        }}
        disabled={!onboarding.level}
        onClick={() =>
          navigate(onboarding.level === "uni" ? "/upload-courses" : "/subjects")
        }
      >
        {language === "fr" ? "CONTINUER" : "CONTINUE"}
      </button>
    </div>
  );
}

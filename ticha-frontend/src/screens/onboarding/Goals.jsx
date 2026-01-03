import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import { useOnboarding } from "../../context/useOnboarding";
import ProgressDots from "../../components/ProgressDots";
import icon from '../../assets/cameroon_icon.png'

const GOALS = [
  { id: "pass_exam", en: "Pass GCE Exams", fr: "Réussir aux examens GCE" },
  { id: "excel_ca", en: "Excel in CAs/ Exams", fr: "Réussir aux contrôles/examens" },
  { id: "confidence", en: "Build Confidence", fr: "Gagner en confiance" },
  { id: "discipline", en: "Stay Consistent", fr: "Être régulier" }
];

export default function Goals() {
  const { language } = useLanguage();
  const { onboarding, toggleGoal } = useOnboarding();
  const navigate = useNavigate();

  return (
    <div className="screen-v2" style={{ flexDirection: "column", position: "relative" }}>
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
          minWidth: "50px"
        }}
      >
        ←
      </button>
      <ProgressDots step={2}  />
      <div className="header">
     

      <h1 className="title">
        {language === "fr"
          ? "QUEL EST TON OBJECTIF ?"
          : "WHAT'S YOUR MAIN GOAL?"}
      </h1>
      <p>Select one or more - we will tailor your experience to help you succeed </p>

 
      </div>

      <div className="box">
        

          {GOALS.map((goal) => {
          const selected = onboarding.goals.includes(goal.id);
          return (

            <div className="btn-box" key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              style={{
                
                background: selected ? "var(--yellow)" : "white",
                boxShadow: selected ? "4px 4px 0 #000" : "8px 8px 0 #000",
                transition: selected ? "ease-in 100ms" : "ease-out 100ms"
              }}>
                <div className="goal-btn-header">
                {selected? "🏆": ''}
                </div>
                {language === "fr" ? goal.fr : goal.en}
               
            </div>
          
          );
        })}
      </div>
     
     
      <button
        className="button-v1"
        style={{
          background: "var(--green)",
          marginTop: 24,
          opacity: onboarding.goals.length ? 1 : 0.5,
          maxWidth: 500,
          width: "100%"
        }}
        disabled={!onboarding.goals.length}
        onClick={() => navigate("/level")}
      >
        {language === "fr" ? "CONTINUER" : "CONTINUE"}
      </button>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import '../../styles/LanguageSelect.css'
import langImg from '../../assets/LangIllustration.webp'

export default function LanguageSelect() {
  const { switchLanguage } = useLanguage();
  const navigate = useNavigate();

  const choose = (lang) => {
    switchLanguage(lang);
    navigate("/welcome");
  };

  return (
    <div className="screen">
      <div>
        <h1 className="title">
          Language Selection
        </h1>
        <div className="img-holder">
            <img src={langImg} alt="Ticha's billboard for Language Selection" />
        </div>

        <div style={{display: 'flex', gap:'1em', alignItems:'center', margin:'2em auto'}}>
          <button
          className="button"
          style={{ background: "var(--green)" }}
          onClick={() => choose("en")}
        >
          English
        </button>

        <button
          className="button"
          style={{ background: "var(--yellow)" }}
          onClick={() => choose("fr")}
        >
           Français
        </button>
        </div>

        <p style={{ textAlign: "center", marginTop: 12 }}>
          You can change this in settings anytime
        </p>
      </div>
    </div>
  );
}

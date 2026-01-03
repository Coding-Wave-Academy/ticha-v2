import { useLanguage } from "../../context/useLanguage";
import { useNavigate } from "react-router-dom";
import image from '../../assets/Ticha_1.jpg'
import cameroonImage from '../../assets/cameroon_icon.png'
import ProgressDots from "../../components/ProgressDots";

export default function Welcome() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <div className="screen-v2">
      <div className="">
         <ProgressDots step={1} />
        
        <div className="imgHolder" style={{position:'relative'}}>
          <img src={image} alt="Ticha Image"  style={{width:'100%', borderRadius:20, marginTop:'5em', border:'3px solid black', boxShadow:'5px 5px 0 black'}}/>

          <img src={cameroonImage} alt="Ticha Image"  style={{width:'15%', border:'3px solid black', borderRadius:40, boxShadow:'3px 3px 0 black', position:'absolute', top:0,left:290, transform: "rotateY('45deg')", opacity:'60%'}}/>
        </div>

        <h1 style={{textAlign:'center',fontSize:'2em', fontWeight:800}}>
          {language === "fr"
            ? "BIENVENUE SUR TICHA AI"
            : "WELCOME TO TICHA"}
        </h1>

        <p style={{ fontSize: 16, textAlign: "center", marginTop: 0, marginBottom: 0 }}>
          {language === "fr"
            ? "Ton professeur personnel pour réussir."
            : "Your personal Tutor for GCE O/L, A/L and University success."}
        </p>

       <div className="btn-grp">
         <button
          className="button-v1" 
          onClick={() => navigate("/goals")}
          style={{ background: "var(--green)", marginTop: 128 }}
        >
          {language === "fr" ? "COMMENCER" : "Get Started!"}
        </button>
         <button
          onClick={() => navigate("/auth")}
          style={{ background:'none', border:0,textAlign:'center', width: '100%', marginTop:24, fontSize:16  }}
        > Already have an account? <a href="#" style={{color:'var(--yellow)'}}>Sign in</a>
        </button>
       </div>
       
      </div>
    </div>
  );
}

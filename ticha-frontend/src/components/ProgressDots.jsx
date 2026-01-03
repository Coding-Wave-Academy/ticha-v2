export default function ProgressDots({ step }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 16 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            // fontSize: 50,
            margin: "0 6px",
            borderRadius: '10px',
            background:i === step ? "#FFD400" : "#bbb",
            color: i === step ? "#FFD400" : "#bbb",
             border: i === step ? "1px solid #000" : "#bbb",
            fontSize: i === step ? '20px' : '15px',
          
          }}
        >
          ●
        </span>
      ))}
    </div>
  );
}

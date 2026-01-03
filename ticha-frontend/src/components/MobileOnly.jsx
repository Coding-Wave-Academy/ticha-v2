export default function MobileOnly({ children }) {
  if (window.innerWidth > 768) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        textAlign: "center",
        padding: "20px"
      }}>
        TICHA is mobile-first. Please use a phone.
      </div>
    );
  }
  return children;
}

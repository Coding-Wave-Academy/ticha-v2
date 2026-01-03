import React from "react";
import { useNavigate } from "react-router-dom";

export default function AuthTriggerModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="daily-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          border: "4px solid #000",
          borderRadius: "16px",
          padding: "24px",
          maxWidth: "400px",
          width: "90%",
          boxShadow: "8px 8px 0px #000",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "24px", fontWeight: "900" }}>
            Wait a sec! 🛑
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ marginBottom: "24px", lineHeight: "1.5" }}>
          Uni students need to be authorized to properly parse and save their
          Course List.
          <br />
          <br />
          <strong>Please Login or Signup to add and analyze your list.</strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            className="button"
            style={{
              background: "var(--green)",
              color: "#000",
              border: "3px solid #000",
              padding: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => navigate("/auth")}
          >
            LOGIN / SIGN UP
          </button>
          <button
            className="button"
            style={{
              background: "#fff",
              color: "#000",
              border: "3px solid #000",
              padding: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

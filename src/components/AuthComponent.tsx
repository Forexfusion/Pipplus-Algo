import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

type Props = {
  onLoginSuccess: () => void;
};

const AuthComponent: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      onLoginSuccess();
    } catch (error: any) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#121212",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#1f1f1f",
          padding: "2rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "400px",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1.8rem",
            fontSize: "1.8rem",
            fontWeight: "600",
          }}
        >
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.8rem 1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#2b2b2b",
            color: "#fff",
            fontSize: "1rem",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.8rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #444",
            background: "#2b2b2b",
            color: "#fff",
            fontSize: "1rem",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.9rem 1rem",
            backgroundColor: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AuthComponent;

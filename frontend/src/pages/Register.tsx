import { useState } from "react";
import { registerUser } from "../services/api";
import "../styles/auth.scss"; // ✅ Import du CSS

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(email, password);
      setMessage("✅ Inscription réussie !");
    } catch {
      setMessage("❌ Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Inscription</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">S'inscrire</button>
        </form>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Register;

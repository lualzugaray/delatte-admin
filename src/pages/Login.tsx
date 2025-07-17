import { useAuth0 } from "@auth0/auth0-react";
import logo from "../assets/logo.png";
import "../styles/Login.css";

export default function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();
  if (isLoading) return null;

  return (
    <div className="login-split">
      <div className="login-split__panel" />

      <div className="login-split__form-container">
        <img src={logo} alt="Delatte logo" className="login-logo" />
        <div className="login-card">
          <h2>Bienvenido a Delatte</h2>
          <p>Pero panel de administración :)</p>
          <button onClick={() => loginWithRedirect()} className="login-button">
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

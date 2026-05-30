import "./LoginPage.css";

function LoginPage({ onGoRegister }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Login Page</h1>

        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button>Login</button>

        <p className="switch-text">
          Belum punya akun?{" "}
          <button type="button" onClick={onGoRegister} className="switch-link">
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
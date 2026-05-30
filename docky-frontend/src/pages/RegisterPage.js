import "./RegisterPage.css";

function RegisterPage({ onGoLogin }) {
  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Register Page</h1>

        <input type="text" placeholder="Full Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button>Register</button>

        <p className="switch-text">
          Sudah punya akun?{" "}
          <button type="button" onClick={onGoLogin} className="switch-link">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
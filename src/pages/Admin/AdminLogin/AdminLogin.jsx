import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css";

const ADMIN_USER = "admin";
const ADMIN_PASS = "12345678";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ user: "", pass: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(""); };

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (form.user === ADMIN_USER && form.pass === ADMIN_PASS) {
        sessionStorage.setItem("adminAuth", "true");
        navigate("/admin", { replace: true });
      } else {
        setError("Usuario o contraseña incorrectos.");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>A</span>
          <span className={styles.logoText}>Admin Panel</span>
        </div>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.sub}>Acceso restringido al equipo de Mi Vehículo</p>

        <form className={styles.form} onSubmit={submit}>
          <div className={styles.field}>
            <label>Usuario</label>
            <input
              type="text"
              value={form.user}
              onChange={handle("user")}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </div>
          <div className={styles.field}>
            <label>Contraseña</label>
            <input
              type="password"
              value={form.pass}
              onChange={handle("pass")}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

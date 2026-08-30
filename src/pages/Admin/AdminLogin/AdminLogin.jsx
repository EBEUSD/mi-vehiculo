import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import styles from "./AdminLogin.module.css";

const AdminLogin = () => {
  const navigate    = useNavigate();
  const { signIn }  = useAuth();
  const [form, setForm]     = useState({ email: "", pass: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error: err } = await signIn(form.email, form.pass);
      if (err) throw err;
      if (data?.user?.role !== "ADMIN") {
        setError("No tenés permisos de administrador.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch {
      setError("Credenciales incorrectas.");
    } finally {
      setLoading(false);
    }
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
            <label>Email</label>
            <input
              type="text"
              value={form.email}
              onChange={handle("email")}
              placeholder="admin@mivehiculo.com.sv"
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

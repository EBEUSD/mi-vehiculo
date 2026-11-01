import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { warmupCatalog } from "./lib/catalogCache";
import { needsOnboarding } from "./lib/identity";
import { takeNext } from "./lib/redirect";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Footer from "./components/Footer/Footer";
import InstallPrompt from "./components/InstallPrompt/InstallPrompt";
import PageLoader from "./components/PageLoader/PageLoader";
import Home from "./pages/Home/Home";

// El resto de las páginas se descarga recién cuando se visita la ruta
const Vehiculos = lazy(() => import("./pages/Vehiculos/Vehiculos"));
const VehiculoDetalle = lazy(() => import("./pages/VehiculoDetalle/VehiculoDetalle"));
const Productos = lazy(() => import("./pages/Productos/Productos"));
const ProductoDetalle = lazy(() => import("./pages/ProductoDetalle/ProductoDetalle"));
const Favoritos = lazy(() => import("./pages/Favoritos/Favoritos"));
const VendedorDashboard = lazy(() => import("./pages/Vendedor/Dashboard/VendedorDashboard"));
const PublicarCategoria = lazy(() => import("./pages/Vendedor/PublicarCategoria/PublicarCategoria"));
const PublicarVehiculo = lazy(() => import("./pages/Vendedor/PublicarVehiculo/PublicarVehiculo"));
const PublicarRepuesto = lazy(() => import("./pages/Vendedor/PublicarRepuesto/PublicarRepuesto"));
const PublicarAccesorio = lazy(() => import("./pages/Vendedor/PublicarAccesorio/PublicarAccesorio"));
const EditarVehiculo = lazy(() => import("./pages/Vendedor/EditarVehiculo/EditarVehiculo"));
const EditarProducto = lazy(() => import("./pages/Vendedor/EditarProducto/EditarProducto"));
const Login = lazy(() => import("./pages/Login/Login"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona/ComoFunciona"));
const Contacto = lazy(() => import("./pages/Contacto/Contacto"));
const Terminos = lazy(() => import("./pages/Terminos/Terminos"));
const FAQ = lazy(() => import("./pages/FAQ/FAQ"));
const Privacidad = lazy(() => import("./pages/Privacidad/Privacidad"));
const Nosotros = lazy(() => import("./pages/Nosotros/Nosotros"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const AdminLogin = lazy(() => import("./pages/Admin/AdminLogin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard/AdminDashboard"));
const PagoResultado = lazy(() => import("./pages/PagoResultado/PagoResultado"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword"));
const CompletarPerfil = lazy(() => import("./pages/CompletarPerfil/CompletarPerfil"));

warmupCatalog();

function OAuthLanding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate(takeNext() || (user.role === "ADMIN" ? "/admin" : "/vendedor"), { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);
  return null;
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === "ADMIN" ? children : <Navigate to="/admin/login" replace />;
}

const NO_FOOTER_PREFIXES = ["/login", "/reset-password", "/completar-perfil", "/admin", "/vendedor", "/publicar", "/editar", "/pago"];

// Rutas a las que se puede entrar sin haber completado el perfil
const ONBOARDING_EXEMPT = ["/completar-perfil", "/login", "/reset-password", "/oauth-landing", "/admin", "/terminos", "/privacidad", "/contacto"];

const matchesPrefix = (pathname, list) => list.some((p) => pathname === p || pathname.startsWith(p + "/"));

function AppRoutes() {
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const showFooter = !matchesPrefix(pathname, NO_FOOTER_PREFIXES);

  // Cuenta sin teléfono (típico al entrar con Google/Apple): completar antes de seguir
  if (needsOnboarding(user) && !matchesPrefix(pathname, ONBOARDING_EXEMPT)) {
    const next = encodeURIComponent(pathname + search);
    return <Navigate to={`/completar-perfil?next=${next}`} replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculo/:slug" element={<VehiculoDetalle />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:slug" element={<ProductoDetalle />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route
          path="/vendedor"
          element={
            <PrivateRoute>
              <VendedorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendedor/*"
          element={<PrivateRoute><Navigate to="/vendedor" replace /></PrivateRoute>}
        />
        <Route
          path="/publicar/nuevo"
          element={
            <PrivateRoute>
              <PublicarCategoria />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/vehiculo"
          element={
            <PrivateRoute>
              <PublicarVehiculo />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/repuesto"
          element={
            <PrivateRoute>
              <PublicarRepuesto />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicar/accesorio"
          element={
            <PrivateRoute>
              <PublicarAccesorio />
            </PrivateRoute>
          }
        />
        <Route
          path="/editar/vehiculo/:slug"
          element={
            <PrivateRoute>
              <EditarVehiculo />
            </PrivateRoute>
          }
        />
        <Route
          path="/editar/producto/:id"
          element={
            <PrivateRoute>
              <EditarProducto />
            </PrivateRoute>
          }
        />
        <Route path="/pago/resultado" element={<PrivateRoute><PagoResultado /></PrivateRoute>} />
        <Route path="/oauth-landing" element={<OAuthLanding />} />
        <Route path="/completar-perfil" element={<PrivateRoute><CompletarPerfil /></PrivateRoute>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      {showFooter && <Footer />}
      <InstallPrompt />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

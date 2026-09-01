import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { warmupCatalog } from "./lib/catalogCache";

warmupCatalog();
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Vehiculos from "./pages/Vehiculos/Vehiculos";
import VehiculoDetalle from "./pages/VehiculoDetalle/VehiculoDetalle";
import Productos from "./pages/Productos/Productos";
import ProductoDetalle from "./pages/ProductoDetalle/ProductoDetalle";
import Favoritos from "./pages/Favoritos/Favoritos";
import VendedorDashboard from "./pages/Vendedor/Dashboard/VendedorDashboard";
import PublicarCategoria from "./pages/Vendedor/PublicarCategoria/PublicarCategoria";
import PublicarVehiculo from "./pages/Vendedor/PublicarVehiculo/PublicarVehiculo";
import PublicarRepuesto from "./pages/Vendedor/PublicarRepuesto/PublicarRepuesto";
import PublicarAccesorio from "./pages/Vendedor/PublicarAccesorio/PublicarAccesorio";
import EditarVehiculo from "./pages/Vendedor/EditarVehiculo/EditarVehiculo";
import EditarProducto from "./pages/Vendedor/EditarProducto/EditarProducto";
import Login from "./pages/Login/Login";
import ComoFunciona from "./pages/ComoFunciona/ComoFunciona";
import Contacto from "./pages/Contacto/Contacto";
import Terminos from "./pages/Terminos/Terminos";
import FAQ from "./pages/FAQ/FAQ";
import Privacidad from "./pages/Privacidad/Privacidad";
import NotFound from "./pages/NotFound/NotFound";
import AdminLogin from "./pages/Admin/AdminLogin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard";
import PagoResultado from "./pages/PagoResultado/PagoResultado";

function OAuthLanding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) {
      navigate(user.role === "ADMIN" ? "/admin" : "/vendedor", { replace: true });
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

const NO_FOOTER_PREFIXES = ["/login", "/admin", "/vendedor", "/publicar", "/editar", "/pago"];

function AppRoutes() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculo/:slug" element={<VehiculoDetalle />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/producto/:slug" element={<ProductoDetalle />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/como-funciona" element={<ComoFunciona />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacidad" element={<Privacidad />} />
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
      {showFooter && <Footer />}
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

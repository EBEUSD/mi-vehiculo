import {
  Home,
  Car,
  MessageCircle,
  Settings,
  Heart,
  PlusCircle,
  Headphones,
  ArrowRight,
  Clock3,
  Users,
  Sparkles,
} from "lucide-react";

import SellerNavbar from "../components/SellerNavbar/SellerNavbar";
import styles from "./VendedorDashboard.module.css";

const VendedorDashboard = () => {
  return (
    <div className={styles.page}>
      <SellerNavbar />

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <nav className={styles.sideNav}>
            <button className={`${styles.sideItem} ${styles.active}`} type="button">
              <span className={styles.sideIcon}>
                <Home size={22} />
              </span>
              Inicio
            </button>

            <button className={styles.sideItem} type="button">
              <span className={styles.sideIcon}>
                <Car size={22} />
              </span>
              Mis publicaciones
            </button>

            <button className={styles.sideItem} type="button">
              <span className={styles.sideIcon}>
                <MessageCircle size={22} />
              </span>
              Consultas
            </button>

            <button className={styles.sideItem} type="button">
              <span className={styles.sideIcon}>
                <Settings size={22} />
              </span>
              Configuración
            </button>
          </nav>

          <div className={styles.supportCard}>
            <div className={styles.supportIcon}>
              <Headphones size={24} />
            </div>

            <div>
              <h3>¿Necesitás ayuda?</h3>
              <p>Estamos para ayudarte con tu publicación.</p>
            </div>

            <button className={styles.supportBtn} type="button">
              Contactar soporte
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>

        <main className={styles.content}>
          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <Car size={29} />
              </div>

              <div>
                <strong>0</strong>
                <h3>Publicaciones</h3>
                <p>Vehículos publicados</p>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                <MessageCircle size={30} />
              </div>

              <div>
                <strong>0</strong>
                <h3>Consultas</h3>
                <p>Recibidas en total</p>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.purple}`}>
                <Heart size={31} />
              </div>

              <div>
                <strong>0</strong>
                <h3>Favoritos</h3>
                <p>Veces que te marcaron</p>
              </div>
            </article>
          </section>

          <section className={styles.emptyPanel}>
            <div className={styles.badge}>
              <Sparkles size={17} />
              Panel de vendedor
            </div>

            <div className={styles.heroContent}>
              <div className={styles.illustration} aria-hidden="true">
                <div className={`${styles.cloud} ${styles.cloudOne}`}></div>
                <div className={`${styles.cloud} ${styles.cloudTwo}`}></div>

                <div className={styles.browserMockup}>
                  <div className={styles.browserBar}>
                    <span></span>
                    <span></span>
                    <span></span>
                    <i></i>
                  </div>

                  <div className={styles.browserBody}>
                    <div className={styles.imagePlaceholder}></div>

                    <div className={styles.lines}>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>

                <div className={styles.carMockup}>
                  <div className={styles.carBody}></div>
                  <div className={styles.carRoof}></div>
                  <div className={styles.carWindow}></div>
                  <div className={styles.carWheelOne}></div>
                  <div className={styles.carWheelTwo}></div>
                </div>

                <div className={styles.plusBubble}>
                  <PlusCircle size={42} />
                </div>
              </div>

              <div className={styles.emptyText}>
                <h1>Todavía no tenés vehículos publicados</h1>

                <p>
                  Cuando publiques tu primer vehículo, vas a poder gestionar tus
                  publicaciones, recibir consultas y aumentar tus oportunidades de
                  venta desde un solo lugar.
                </p>

                <div className={styles.ctaRow}>
                  <button className={styles.primaryCta} type="button">
                    <PlusCircle size={21} />
                    Publicar mi primer vehículo
                  </button>

                  <button className={styles.linkCta} type="button">
                    Ver cómo funciona
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.benefitsGrid}>
              <article className={styles.benefitCard}>
                <div className={`${styles.benefitIcon} ${styles.blue}`}>
                  <Clock3 size={30} />
                </div>

                <div>
                  <h3>Publicá en minutos</h3>
                  <p>
                    Completá los datos de tu vehículo con un proceso simple,
                    guiado y rápido.
                  </p>
                </div>
              </article>

              <article className={styles.benefitCard}>
                <div className={`${styles.benefitIcon} ${styles.green}`}>
                  <Users size={31} />
                </div>

                <div>
                  <h3>Llegá a más compradores</h3>
                  <p>
                    Tu publicación queda lista para aparecer en búsquedas,
                    favoritos y listados.
                  </p>
                </div>
              </article>

              <article className={styles.benefitCard}>
                <div className={`${styles.benefitIcon} ${styles.purple}`}>
                  <MessageCircle size={31} />
                </div>

                <div>
                  <h3>Recibí consultas directas</h3>
                  <p>
                    Los interesados pueden contactarte fácilmente desde la
                    plataforma.
                  </p>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default VendedorDashboard;
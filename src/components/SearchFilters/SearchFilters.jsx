import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SearchFilters.module.css";
import { FiSearch } from "react-icons/fi";

const SearchFilters = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    type: "Autos",
    brand: "",
    model: "",
    yearMin: "",
    yearMax: "",
    priceMax: "",
    location: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNavigate = () => {
    const params = new URLSearchParams();

    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") {
        params.set(key, value);
      }
    });

    params.set("condition", "used");
    params.set("sortBy", "relevant");
    params.set("page", "1");

    navigate(`/vehiculos?${params.toString()}`);
  };

  const handleClear = () => {
    setForm({
      type: "Autos",
      brand: "",
      model: "",
      yearMin: "",
      yearMax: "",
      priceMax: "",
      location: "",
    });
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>
          <FiSearch />
          <span>Encontrá tu vehículo ideal</span>
        </h2>
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.field}>
          <label>Tipo</label>
          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
          >
            <option value="Autos">Autos</option>
            <option value="Motos">Motos</option>
            <option value="Camionetas">Camionetas</option>
            <option value="Camiones">Camiones</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Marca</label>
          <select
            value={form.brand}
            onChange={(e) => handleChange("brand", e.target.value)}
          >
            <option value="">Todas las marcas</option>
            <option value="Toyota">Toyota</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="Ford">Ford</option>
            <option value="Honda">Honda</option>
            <option value="Nissan">Nissan</option>
            <option value="Peugeot">Peugeot</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Modelo</label>
          <input
            type="text"
            placeholder="Todos los modelos"
            value={form.model}
            onChange={(e) => handleChange("model", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Año desde</label>
          <input
            type="number"
            placeholder="Año mínimo"
            value={form.yearMin}
            onChange={(e) => handleChange("yearMin", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Año hasta</label>
          <input
            type="number"
            placeholder="Año máximo"
            value={form.yearMax}
            onChange={(e) => handleChange("yearMax", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Precio máximo</label>
          <input
            type="number"
            placeholder="Precio máximo"
            value={form.priceMax}
            onChange={(e) => handleChange("priceMax", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Ubicación</label>
          <input
            type="text"
            placeholder="Todas las provincias"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleNavigate}>
            Ver resultados
          </button>
          <button className={styles.clearBtn} onClick={handleClear}>
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
import { useEffect, useId, useState } from "react";
import { api } from "../../../../lib/api";

// Departamento → municipio. Carga los catálogos y emite
// onChange({ provinceId, provincia, cityId, ciudad }) con los campos que cambian.
const LocationSelect = ({
  provinceId, cityId, onChange,
  required = false,
  fieldClassName, reqClassName,
  provinceLabel = "Departamento", cityLabel = "Municipio",
}) => {
  const uid = useId();
  const [provinces, setProvinces] = useState([]);
  // Municipios guardados junto al departamento que los pidió
  const [citiesState, setCitiesState] = useState({ provinceId: null, list: [] });

  useEffect(() => {
    let ignore = false;
    api.get("/location/provinces")
      .then((res) => { if (!ignore) setProvinces(res.data || []); })
      .catch(() => { if (!ignore) setProvinces([]); });
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!provinceId) return;
    let ignore = false;
    api.get(`/location/provinces/${provinceId}/cities`)
      .then((res) => { if (!ignore) setCitiesState({ provinceId: String(provinceId), list: res.data || [] }); })
      .catch(() => { if (!ignore) setCitiesState({ provinceId: String(provinceId), list: [] }); });
    return () => { ignore = true; };
  }, [provinceId]);

  const loaded        = !!provinceId && citiesState.provinceId === String(provinceId);
  const cities        = loaded ? citiesState.list : [];
  const loadingCities = !!provinceId && !loaded;

  const handleProvince = (e) => {
    const prov = provinces.find((p) => String(p.id) === e.target.value);
    onChange({ provinceId: prov?.id ?? "", provincia: prov?.name || "", cityId: "", ciudad: "" });
  };

  const handleCity = (e) => {
    const city = cities.find((c) => String(c.id) === e.target.value);
    onChange({ cityId: city?.id ?? "", ciudad: city?.name || "" });
  };

  const req = required && <span className={reqClassName}>*</span>;

  return (
    <>
      <div className={fieldClassName}>
        <label htmlFor={`${uid}-prov`}>{provinceLabel} {req}</label>
        <select id={`${uid}-prov`} value={provinceId || ""} onChange={handleProvince}>
          <option value="">Seleccioná el departamento</option>
          {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className={fieldClassName}>
        <label htmlFor={`${uid}-city`}>{cityLabel} {req}</label>
        <select
          id={`${uid}-city`}
          value={cityId || ""}
          onChange={handleCity}
          disabled={!provinceId || loadingCities}
        >
          <option value="">
            {!provinceId ? "Elegí primero el departamento"
              : loadingCities ? "Cargando municipios…"
              : "Seleccioná el municipio"}
          </option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </>
  );
};

export default LocationSelect;

// Catálogo central de categorías de la plataforma (home, búsqueda, publicar).
//
// `api` es el enum VehicleCategory del backend. El backend todavía no tiene
// enums propios para Panel/Microbús ni Maquinaria, así que por ahora se
// guardan como CAMIONETA y OTRO. Cuando el backend los agregue, cambiar acá.

import {
  Car, Motorbike, Truck, Van, Tractor, Sailboat, Plane, Bike, Scooter, Cog, Package, Wrench,
} from "lucide-react";
import {
  AUTO_BRANDS, MOTO_BRANDS, TRUCK_BRANDS, PANEL_BRANDS, MAQUINARIA_BRANDS,
  ACUATICO_BRANDS, AERONAVE_BRANDS, BICICLETA_BRANDS, OTROS_BRANDS,
  REPUESTO_BRANDS, ACCESORIO_BRANDS,
} from "./vehicleBrands";

// Qué filtros/campos aplican a cada categoría
const MOTOR = { km: true, fuel: true, transmission: true, year: true };
const SIN_MOTOR = { km: false, fuel: false, transmission: false, year: true };
const NINGUNO = { km: false, fuel: false, transmission: false, year: false };

export const VEHICLE_CATEGORIES = [
  { id: "carros",     label: "Carro / Pickup / SUV", short: "Carros",       icon: Car,   api: "AUTO",      brands: AUTO_BRANDS,       filters: MOTOR },
  { id: "motos",      label: "Moto",                 short: "Motos",        icon: Motorbike, api: "MOTO",      brands: MOTO_BRANDS,       filters: MOTOR },
  { id: "camiones",   label: "Camión / Bus",         short: "Camión / Bus", icon: Truck, api: "CAMION",    brands: TRUCK_BRANDS,      filters: MOTOR },
  { id: "panel",      label: "Panel / Microbús",     short: "Panel",        icon: Van,   api: "CAMIONETA", brands: PANEL_BRANDS,      filters: MOTOR },
  { id: "maquinaria", label: "Maquinaria",           short: "Maquinaria",   icon: Tractor, api: "OTRO",      brands: MAQUINARIA_BRANDS, filters: { ...MOTOR, km: false } },
  { id: "acuaticos",  label: "Acuáticos",            short: "Acuáticos",    icon: Sailboat, api: "ACUATICO",  brands: ACUATICO_BRANDS,   filters: { ...MOTOR, km: false, transmission: false } },
  { id: "aeronaves",  label: "Aeronaves",            short: "Aeronaves",    icon: Plane, api: "AEREO",     brands: AERONAVE_BRANDS,   filters: { ...MOTOR, km: false, transmission: false } },
  { id: "bicicletas", label: "Bicicletas / Remolques", short: "Bicicletas", icon: Bike,  api: "BICICLETA", brands: BICICLETA_BRANDS,  filters: SIN_MOTOR },
  { id: "otros",      label: "Otros vehículos",      short: "Otros",        icon: Scooter, api: "OTRO",      brands: OTROS_BRANDS,      filters: SIN_MOTOR },
];

export const PRODUCT_CATEGORIES = [
  { id: "repuestos",  label: "Repuestos",  icon: Cog,   brands: REPUESTO_BRANDS,  filters: NINGUNO, href: "/productos?tipo=repuestos" },
  { id: "accesorios", label: "Accesorios", icon: Package, brands: ACCESORIO_BRANDS, filters: NINGUNO, href: "/productos?tipo=accesorios" },
  { id: "servicios",  label: "Servicios",  icon: Wrench,   brands: [],               filters: NINGUNO, href: "/productos?tipo=servicios" },
];

export const SERVICE_TYPES = [
  "Taller mecánico general y escáner",
  "Talleres de marca y especializados",
  "Mantenimiento preventivo (cambio de aceite y filtros)",
  "Aire acondicionado automotriz",
  "Detailing y tratamientos de pintura",
  "Limpieza de tapicería",
  "CarWash",
  "Enderezado y pintura (E&P)",
  "Trámites de tránsito y SERTRACEN",
  "Seguros de vehículos",
  "Emisión de gases y revisión técnica",
  "Valuaciones y peritajes pre-compra",
  "Servicio de grúas y auxilio vial",
  "Transporte de vehículos y plataformas",
  "Llantería móvil",
  "Car audio y alarmas",
  "Polarizado y wrapping",
  "Cerrajería automotriz y llaves con chip",
  "Accesorios 4x4 y equipamiento de paneles",
  "Mecánica de flotas e hidráulica pesada",
  "Llantería industrial y agrícola",
  "Soldadura industrial y torno",
];

export const OPERATION_TYPES = ["Venta", "Compra", "Alquiler", "Leasing", "Permuta", "Servicios"];

export const SELLER_TYPES = ["Particular", "Agencia/Lote", "Importado"];

// Nombres viejos que pueden venir en URLs o borradores guardados
const ALIASES = {
  autos: "carros", camionetas: "carros", "camionetas y pickups": "carros",
  "autos chocados y averiados": "carros", "autos de colección": "carros",
  moto: "motos", camion: "camiones", "colectivos y buses": "camiones",
  "náutica": "acuaticos", nautica: "acuaticos", "otros vehículos": "otros",
};

export const findVehicleCategory = (idOrLabel) => {
  const raw = String(idOrLabel || "").toLowerCase();
  const key = ALIASES[raw] || raw;
  return VEHICLE_CATEGORIES.find(
    (c) => c.id === key || c.label.toLowerCase() === key || c.short.toLowerCase() === key
  ) || null;
};

export const getVehicleCategory = (idOrLabel) => findVehicleCategory(idOrLabel) || VEHICLE_CATEGORIES[0];

export const getBrandsForCategory = (idOrLabel) => getVehicleCategory(idOrLabel).brands;

// Etiqueta a mostrar para un enum del backend
const API_LABEL = {
  AUTO: "Carro / Pickup / SUV", MOTO: "Moto", CAMION: "Camión / Bus",
  CAMIONETA: "Panel / Microbús", ACUATICO: "Acuáticos", AEREO: "Aeronaves",
  BICICLETA: "Bicicletas / Remolques", OTRO: "Otros vehículos",
};
export const labelForApiCategory = (api) => API_LABEL[api] || "Otros vehículos";

export const DEPARTAMENTOS = [
  "Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán", "La Libertad", "La Paz", "La Unión",
  "Morazán", "San Miguel", "San Salvador", "San Vicente", "Santa Ana", "Sonsonate", "Usulután",
];

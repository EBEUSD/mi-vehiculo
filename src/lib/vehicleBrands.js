// Marcas principales por categoría (orden definido por el cliente).
// En los selectores siempre se ofrece además "Otra marca" con texto libre,
// y se suman las marcas que ya existen en el catálogo del backend.

export const AUTO_BRANDS = [
  "Toyota", "Nissan", "Kia", "Hyundai", "Chevrolet", "Ford", "Honda", "Mazda",
  "Mitsubishi", "Suzuki", "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Jeep",
  "Isuzu", "JAC", "Chery", "Changan", "BYD",
];

export const MOTO_BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "Bajaj", "TVS", "Hero", "AKT", "BMW",
  "Haojue", "Freedom", "Dayun", "Serpento", "Katana", "Genesis",
];

export const TRUCK_BRANDS = [
  "Isuzu", "Hino", "Fuso", "Freightliner", "International", "Mercedes-Benz",
  "Volvo", "Scania", "Kenworth", "Ford", "Chevrolet", "Foton", "JAC", "JMC", "Hyundai",
];

export const PANEL_BRANDS = [
  "Toyota", "Hyundai", "Kia", "Nissan", "Chevrolet", "Ford", "Mercedes-Benz",
  "Volkswagen", "Foton", "JAC", "JMC", "Changan", "Dongfeng", "Maxus",
];

export const MAQUINARIA_BRANDS = [
  "Caterpillar", "John Deere", "Komatsu", "JCB", "Kubota", "New Holland", "Case IH",
  "Case Construction", "Volvo", "Bobcat", "Hyundai", "Hitachi", "Doosan", "Kobelco",
  "Wacker Neuson", "XCMG", "Mack", "Mitsubishi", "Sullair", "Lincoln Electric", "Kalmar",
];

export const ACUATICO_BRANDS = [
  "Yamaha", "Suzuki", "Mercury", "Honda Marine", "Sea-Doo", "Kawasaki", "Tohatsu",
  "Honda", "Evinrude", "Volvo Penta", "MerCruiser", "Bayliner", "Boston Whaler",
  "Sea Ray", "Chaparral", "Regal", "Tracker", "Grady-White",
];

export const AERONAVE_BRANDS = [
  "Cessna", "Piper", "Beechcraft", "Cirrus", "Robinson", "Bell", "Airbus Helicopters",
  "MD Helicopters", "Embraer", "Gulfstream", "Bombardier", "Boeing",
];

export const BICICLETA_BRANDS = [
  "Specialized", "Trek", "Giant", "Cannondale", "Scott", "Merida", "GT", "Santa Cruz",
  "Orbea", "Bianchi", "Cube", "Kona", "Marin", "Raleigh", "Shimano", "SRAM", "Thule",
  "Yakima", "Burley",
];

export const OTROS_BRANDS = [
  "Honda", "Yamaha", "Suzuki", "Kawasaki", "KTM", "Husqvarna", "Can-Am", "Polaris",
  "Segway", "Kymco", "Vespa", "Piaggio", "Aprilia", "Ducati", "BMW Motorrad",
  "Royal Enfield", "Harley-Davidson", "Bajaj", "TVS", "Hero",
];

export const REPUESTO_BRANDS = [
  "Bosch", "Denso", "NGK", "SKF", "Gates", "KYB", "Monroe", "Mann-Filter", "Donaldson",
  "Fleetguard", "ACDelco", "Mahle", "Valeo", "Continental", "Hella", "TRW", "Moog",
  "Timken", "Sachs", "Luk", "Exedy", "Brembo", "Wagner", "Caterpillar", "John Deere",
];

export const ACCESORIO_BRANDS = [
  "3M", "Stanley", "DeWalt", "Milwaukee", "Makita", "Bosch", "Thule", "Yakima", "K&N",
  "Hella", "Philips", "Osram", "WeatherTech", "Meguiar's", "Turtle Wax", "Castrol",
  "Mobil", "Shell", "Motul", "Red Line", "Michelin", "Goodyear", "Bridgestone", "BFGoodrich",
];

// Modelos más buscados por categoría y marca: se ofrecen como sugerencia además
// de los que ya existen en el catálogo (que crece con cada publicación nueva).
// Va por categoría porque la misma marca tiene modelos distintos (Honda auto ≠ Honda moto).
export const POPULAR_MODELS = {
  carros: {
    Toyota: ["Hilux", "Corolla", "Yaris", "RAV4", "Land Cruiser Prado", "Land Cruiser", "Fortuner", "Tacoma", "4Runner", "Rush"],
    Nissan: ["Frontier", "Sentra", "Versa", "Kicks", "X-Trail", "Pathfinder", "Navara", "Altima", "March"],
    Kia: ["Picanto", "Rio", "Soluto", "Sportage", "Sorento", "Seltos", "Sonet", "K5", "Carnival"],
    Hyundai: ["Accent", "Elantra", "Tucson", "Santa Fe", "Creta", "Grand i10", "Venue", "Sonata"],
    Chevrolet: ["Aveo", "Spark", "Beat", "Sail", "Onix", "Colorado", "D-Max", "Tracker", "Captiva", "Silverado", "Tahoe"],
    Ford: ["Ranger", "F-150", "Explorer", "Escape", "EcoSport", "Edge", "Bronco", "Territory", "Mustang"],
    Honda: ["Civic", "CR-V", "HR-V", "Fit", "Accord", "Pilot", "City", "BR-V"],
    Mazda: ["Mazda 2", "Mazda 3", "CX-3", "CX-30", "CX-5", "CX-9", "BT-50"],
    Mitsubishi: ["L200", "Montero", "Montero Sport", "Outlander", "ASX", "Mirage", "Xpander"],
    Suzuki: ["Swift", "Vitara", "Grand Vitara", "Jimny", "Ertiga", "Dzire", "S-Presso", "Celerio"],
    Volkswagen: ["Jetta", "Gol", "Polo", "Tiguan", "Amarok", "T-Cross", "Virtus", "Taos"],
    BMW: ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "X6"],
    "Mercedes-Benz": ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE", "Clase G"],
    Audi: ["A3", "A4", "A6", "Q2", "Q3", "Q5", "Q7"],
    Jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator"],
    Isuzu: ["D-Max", "MU-X"],
    JAC: ["T6", "T8", "JS2", "JS3", "JS4", "J7"],
    Chery: ["Tiggo 2", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 5"],
    Changan: ["CS15", "CS35 Plus", "CS55 Plus", "Alsvin", "Hunter"],
    BYD: ["Dolphin", "Seal", "Atto 3", "Song Plus", "Tang", "Shark"],
  },
  motos: {
    Honda: ["CB125F", "CB190R", "CGL 125", "XR150L", "XR190L", "XRE 300", "Navi", "Dio", "Wave", "CRF250F"],
    Yamaha: ["YBR 125", "FZ", "MT-03", "MT-15", "R15", "XTZ 125", "XTZ 150", "Crypton", "NMAX", "DT 125"],
    Suzuki: ["GN 125", "AX 100", "Gixxer", "GSX-R150", "DR 200", "Burgman 125", "V-Strom 250"],
    Kawasaki: ["Ninja 400", "Z400", "KLX 150", "KLR 650", "Versys 650", "Z900"],
    Bajaj: ["Pulsar NS 200", "Pulsar 180", "Pulsar NS 160", "Boxer 150", "Discover 125", "Platina", "Dominar 400"],
    TVS: ["Apache RTR 160", "Apache RTR 200", "Raider 125", "Sport 100", "HLX 125", "Ntorq 125"],
    Hero: ["Hunk 160R", "Xpulse 200", "Splendor", "Eco Deluxe", "Ignitor"],
    AKT: ["NKD 125", "CR4 125", "TT 150", "AK 125"],
    BMW: ["G 310 R", "G 310 GS", "F 850 GS", "R 1250 GS", "S 1000 RR"],
    Haojue: ["DK 150", "KA 150", "NK 150", "Express 125"],
  },
  camiones: {
    Isuzu: ["NPR", "NQR", "NMR", "ELF", "FRR", "FVR", "FTR"],
    Hino: ["Serie 300", "Dutro", "Serie 500", "FC", "GH"],
    Fuso: ["Canter", "FE", "FI", "Fighter"],
    Freightliner: ["Cascadia", "Columbia", "Century", "M2 106", "M2 112"],
    International: ["4300", "4700", "7400", "LT", "ProStar", "MV"],
    "Mercedes-Benz": ["Actros", "Atego", "Axor", "Accelo", "Arocs"],
    Volvo: ["FH", "FM", "FMX", "VNL", "VM"],
    Scania: ["Serie R", "Serie G", "Serie P", "Serie S"],
    Kenworth: ["T800", "T680", "W900", "T370"],
    Ford: ["F-350", "F-450", "F-550", "Cargo"],
    Chevrolet: ["NHR", "NPR", "NQR", "FRR", "Kodiak"],
    Foton: ["Aumark", "Auman", "Ollin"],
    JAC: ["N56", "N75", "N120", "HFC 1035", "HFC 1061"],
    JMC: ["Carrying", "N800", "Conquer"],
    Hyundai: ["HD65", "HD72", "HD78", "Mighty", "Xcient", "County"],
  },
  panel: {
    Toyota: ["Hiace", "Coaster"],
    Hyundai: ["H-1", "Staria", "H100", "County"],
    Kia: ["K2700", "K3000", "Pregio"],
    Nissan: ["Urvan", "NV350", "Civilian"],
    Chevrolet: ["N300", "Express"],
    Ford: ["Transit", "E-350"],
    "Mercedes-Benz": ["Sprinter", "Vito"],
    Volkswagen: ["Crafter", "Transporter"],
    Foton: ["View", "Toano"],
    JAC: ["Sunray", "Refine"],
    JMC: ["Touring"],
    Changan: ["Star", "MD201"],
    Maxus: ["V80", "Deliver 9", "G10"],
  },
  maquinaria: {
    Caterpillar: ["Excavadora 320", "Retroexcavadora 416", "Retroexcavadora 420", "Tractor D6", "Cargador 950", "Motoniveladora 120", "Compactador CS533"],
    "John Deere": ["Tractor 5075E", "Tractor 6110J", "Retroexcavadora 310L", "Cargador 544", "Motoniveladora 670G"],
    Komatsu: ["Excavadora PC200", "Cargador WA320", "Tractor D61", "Motoniveladora GD555"],
    JCB: ["Retroexcavadora 3CX", "Retroexcavadora 4CX", "Excavadora JS200", "Telehandler 540"],
    Kubota: ["Tractor L4508", "Tractor M7040", "Miniexcavadora KX040", "Miniexcavadora U35"],
    "New Holland": ["Tractor TT75", "Tractor TD5", "Tractor 7630", "Retroexcavadora B95"],
    "Case IH": ["Farmall", "Puma", "Maxxum"],
    "Case Construction": ["Retroexcavadora 580N", "Retroexcavadora 590 Super N", "Excavadora CX210"],
    Volvo: ["Excavadora EC210", "Cargador L120", "Compactador SD110"],
    Bobcat: ["Minicargador S70", "Minicargador S450", "Minicargador S650", "Miniexcavadora E35"],
    Hyundai: ["Excavadora R210", "Cargador HL960"],
    Hitachi: ["Excavadora ZX130", "Excavadora ZX200"],
    Doosan: ["Excavadora DX225", "Cargador DL250"],
    Kobelco: ["Excavadora SK140", "Excavadora SK200"],
    "Wacker Neuson": ["Apisonador BS60", "Placa compactadora DPU", "Rodillo RD12"],
    XCMG: ["Excavadora XE215", "Cargador LW300", "Motoniveladora GR165"],
    Mack: ["Granite", "Anthem", "Pinnacle"],
    Mitsubishi: ["Montacargas FG25", "Montacargas FD30"],
    Sullair: ["Compresor 185"],
    "Lincoln Electric": ["Ranger 225", "Bobcat 250"],
    Kalmar: ["Montacargas DCG", "Reach stacker DRG"],
  },
  acuaticos: {
    Yamaha: ["WaveRunner VX", "WaveRunner FX", "WaveRunner GP", "Fuera de borda F115", "Fuera de borda F150", "Enduro 40"],
    Suzuki: ["DF40", "DF115", "DF140", "DF250"],
    Mercury: ["40 FourStroke", "115 FourStroke", "150 FourStroke", "Pro XS", "Verado"],
    "Honda Marine": ["BF40", "BF115", "BF150", "BF250"],
    "Sea-Doo": ["Spark", "GTI", "GTX", "RXP-X", "Fish Pro"],
    Kawasaki: ["Jet Ski STX 160", "Jet Ski Ultra 310"],
    Tohatsu: ["MFS 40", "MFS 115"],
    Evinrude: ["E-TEC 115", "E-TEC 150"],
    "Volvo Penta": ["D4", "D6", "V8"],
    MerCruiser: ["4.5L", "6.2L"],
    Bayliner: ["Element", "VR5", "Trophy"],
    "Boston Whaler": ["Montauk", "Dauntless", "Outrage"],
    "Sea Ray": ["SPX 190", "SDX", "SLX"],
    Chaparral: ["SSi", "SSX"],
    Regal: ["LS4", "LX"],
    Tracker: ["Pro Team", "Targa"],
    "Grady-White": ["Fisherman 180", "Freedom 235", "Canyon"],
  },
  aeronaves: {
    Cessna: ["152", "172 Skyhawk", "182 Skylane", "206 Stationair", "208 Caravan", "Citation"],
    Piper: ["PA-28 Cherokee", "Archer", "Seminole", "Seneca", "Cub"],
    Beechcraft: ["Bonanza", "Baron", "King Air"],
    Cirrus: ["SR20", "SR22", "Vision Jet"],
    Robinson: ["R22", "R44", "R66"],
    Bell: ["206 JetRanger", "407", "505"],
    "Airbus Helicopters": ["H125", "H130", "H145"],
    "MD Helicopters": ["500E", "530F"],
    Embraer: ["Phenom 100", "Phenom 300"],
    Gulfstream: ["G280", "G650"],
    Bombardier: ["Learjet 45", "Challenger 350", "Global 6000"],
    Boeing: ["737", "BBJ"],
  },
  bicicletas: {
    Specialized: ["Rockhopper", "Stumpjumper", "Epic", "Allez", "Tarmac", "Sirrus"],
    Trek: ["Marlin", "Fuel EX", "FX", "Domane", "Émonda"],
    Giant: ["Talon", "ATX", "Trance", "Escape", "TCR", "Defy"],
    Cannondale: ["Trail", "Scalpel", "CAAD13", "Synapse", "SuperSix"],
    Scott: ["Aspect", "Scale", "Spark", "Addict", "Speedster"],
    Merida: ["Big.Nine", "One-Twenty", "Scultura", "Reacto"],
    GT: ["Avalanche", "Aggressor", "Grade"],
    "Santa Cruz": ["Hightower", "Tallboy", "5010", "Blur"],
    Orbea: ["Alma", "Occam", "Orca", "Avant"],
    Bianchi: ["Oltre", "Sprint", "Methanol"],
    Cube: ["Aim", "Reaction", "Attain"],
    Kona: ["Lava Dome", "Process", "Honzo"],
    Marin: ["Bobcat Trail", "Rift Zone", "Fairfax"],
    Thule: ["Chariot (remolque)", "Coaster (remolque)"],
    Burley: ["Bee (remolque)", "D'Lite (remolque)", "Travoy (remolque)"],
  },
  otros: {
    "Can-Am": ["Outlander", "Maverick", "Defender", "Ryker", "Spyder"],
    Polaris: ["Sportsman", "RZR", "Ranger", "General"],
    Honda: ["TRX 420 FourTrax", "TRX 520 Foreman", "Pioneer 700"],
    Yamaha: ["Grizzly", "Kodiak", "YFZ450", "Viking"],
    Suzuki: ["KingQuad", "QuadSport Z400"],
    Kawasaki: ["Brute Force", "KFX", "Mule", "Teryx"],
    KTM: ["Duke 200", "Duke 390", "390 Adventure", "EXC"],
    Husqvarna: ["Svartpilen 401", "Vitpilen 401", "TE 300"],
    Segway: ["Ninebot Max", "Ninebot E2", "Villain", "Snarler"],
    Kymco: ["Agility", "Like", "People", "MXU"],
    Vespa: ["Primavera", "Sprint", "GTS"],
    Piaggio: ["Liberty", "Medley", "Ape"],
    Aprilia: ["SR 160", "RS 457", "Tuono"],
    Ducati: ["Monster", "Scrambler", "Panigale", "Multistrada"],
    "BMW Motorrad": ["G 310 R", "R 1250 GS", "S 1000 RR"],
    "Royal Enfield": ["Classic 350", "Hunter 350", "Meteor 350", "Himalayan"],
    "Harley-Davidson": ["Sportster", "Street Glide", "Fat Boy", "Iron 883"],
  },
};

// Modelos sugeridos para una marca dentro de una categoría.
// Sin categoría (ej. búsqueda general) se juntan los de todas.
export const getPopularModels = (categoryId, brand) => {
  if (!brand) return [];
  if (categoryId && POPULAR_MODELS[categoryId]) return POPULAR_MODELS[categoryId][brand] || [];
  return mergeNames(...Object.values(POPULAR_MODELS).map((byBrand) => byBrand[brand] || []));
};

// Unifica lista estática + catálogo del backend, sin duplicados (case-insensitive)
export const mergeNames = (...lists) => {
  const seen = new Set();
  const out = [];
  lists.flat().forEach((name) => {
    const key = String(name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(String(name).trim());
  });
  return out;
};

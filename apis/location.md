# Catalog & Location API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

# CATALOG

Endpoints para obtener los datos de referencia que necesita el formulario de publicación de vehículos. Todos los GET son públicos.

---

## GET /catalog/brands

Devuelve todas las marcas disponibles. Se puede filtrar por categoría de vehículo.

**Request**
```
GET /catalog/brands
GET /catalog/brands?category=AUTO
```

| Query param | Tipo | Requerido | Valores posibles |
|---|---|---|---|
| category | string | ❌ | AUTO, MOTO, CAMIONETA, CAMION, ACUATICO, AEREO, BICICLETA, OTRO |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Toyota",
      "category": null,
      "logoUrl": null,
      "_count": {
        "models": 6,
        "vehicles": 12
      }
    },
    {
      "id": 2,
      "name": "Nissan",
      "category": null,
      "logoUrl": null,
      "_count": {
        "models": 6,
        "vehicles": 5
      }
    }
  ]
}
```

---

## GET /catalog/brands/:id

Devuelve el detalle de una marca específica.

**Request**
```
GET /catalog/brands/1
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Toyota",
    "category": null,
    "logoUrl": null
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Marca no encontrada |

---

## GET /catalog/brands/:id/models

Devuelve los modelos disponibles para una marca. Usado para el select dependiente en el formulario.

**Request**
```
GET /catalog/brands/1/models
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Corolla",
      "brandId": 1,
      "_count": {
        "vehicles": 4
      }
    },
    {
      "id": 2,
      "name": "Hilux",
      "brandId": 1,
      "_count": {
        "vehicles": 7
      }
    }
  ]
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Marca no encontrada |

---

## GET /catalog/segments

Devuelve los segmentos de vehículos. Se puede filtrar por categoría.

**Request**
```
GET /catalog/segments
GET /catalog/segments?category=AUTO
```

| Query param | Tipo | Requerido | Valores posibles |
|---|---|---|---|
| category | string | ❌ | AUTO, MOTO, CAMIONETA, CAMION, ACUATICO, AEREO, BICICLETA, OTRO |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sedán",
      "category": "AUTO",
      "sortOrder": 0
    },
    {
      "id": 2,
      "name": "SUV",
      "category": "AUTO",
      "sortOrder": 0
    },
    {
      "id": 3,
      "name": "Hatchback",
      "category": "AUTO",
      "sortOrder": 0
    }
  ]
}
```

---

## GET /catalog/features

Devuelve todas las características disponibles para asociar a un vehículo.

**Request**
```
GET /catalog/features
```

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "ABS" },
    { "id": 2, "name": "Aire acondicionado" },
    { "id": 3, "name": "Airbag conductor" },
    { "id": 4, "name": "Asientos calefaccionados" }
  ]
}
```

---

## GET /catalog/attribute-definitions

Devuelve los atributos dinámicos por categoría de vehículo. Usado para renderizar los campos del paso 3 del formulario.

**Request**
```
GET /catalog/attribute-definitions
GET /catalog/attribute-definitions?category=AUTO
```

| Query param | Tipo | Requerido |
|---|---|---|
| category | string | ❌ |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Combustible",
      "category": "AUTO",
      "required": true,
      "filterable": true,
      "unit": null,
      "sortOrder": 0
    },
    {
      "id": 2,
      "name": "Transmisión",
      "category": "AUTO",
      "required": true,
      "filterable": true,
      "unit": null,
      "sortOrder": 1
    }
  ]
}
```

---

## POST /catalog/brands

Crea una nueva marca. Solo para administradores.

**Request**
```
POST /catalog/brands
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "Subaru",
  "category": "AUTO",
  "logoUrl": "https://res.cloudinary.com/..."
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| name | string | ✅ | Nombre de la marca |
| category | string | ❌ | Categoría de vehículo |
| logoUrl | string | ❌ | URL del logo |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 13,
    "name": "Subaru",
    "category": "AUTO",
    "logoUrl": "https://res.cloudinary.com/..."
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## POST /catalog/brands/:id/models

Agrega un modelo a una marca existente. Solo para administradores.

**Request**
```
POST /catalog/brands/1/models
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "GR86"
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| name | string | ✅ |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 73,
    "name": "GR86",
    "brandId": 1
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Marca no encontrada |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

# LOCATION

Endpoints para obtener departamentos y municipios de El Salvador. Todos son públicos.

---

## GET /location/provinces

Devuelve todos los departamentos de El Salvador.

**Request**
```
GET /location/provinces
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ahuachapán",
      "_count": { "cities": 3 }
    },
    {
      "id": 2,
      "name": "Cabañas",
      "_count": { "cities": 3 }
    },
    {
      "id": 3,
      "name": "Chalatenango",
      "_count": { "cities": 3 }
    }
  ]
}
```

---

## GET /location/provinces/:provinceId/cities

Devuelve los municipios de un departamento. Usado para el select dependiente en el formulario.

**Request**
```
GET /location/provinces/1/cities
```

**Response 200**
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Ahuachapán", "provinceId": 1 },
    { "id": 2, "name": "Atiquizaya", "provinceId": 1 },
    { "id": 3, "name": "Tacuba", "provinceId": 1 }
  ]
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Departamento no encontrado |

---

## GET /location/cities?q=san

Busca municipios por nombre. Mínimo 2 caracteres.

**Request**
```
GET /location/cities?q=san
```

| Query param | Tipo | Requerido | Validación |
|---|---|---|---|
| q | string | ✅ | Mínimo 2 caracteres |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "name": "San Miguel",
      "province": { "id": 5, "name": "San Miguel" }
    },
    {
      "id": 5,
      "name": "San Salvador",
      "province": { "id": 6, "name": "San Salvador" }
    },
    {
      "id": 6,
      "name": "San Vicente",
      "province": { "id": 13, "name": "San Vicente" }
    }
  ]
}
```

> Devuelve máximo 20 resultados. Si `q` tiene menos de 2 caracteres devuelve array vacío.

---

## GET /location/cities/:id

Devuelve el detalle de un municipio con su departamento.

**Request**
```
GET /location/cities/4
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "San Miguel",
    "provinceId": 5,
    "province": {
      "id": 5,
      "name": "San Miguel"
    }
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Ciudad no encontrada |

---

## Flujo de uso en el formulario de publicación

```
Paso 1 - Datos básicos:
1. GET /catalog/brands              → cargar select de marcas
2. GET /catalog/brands/:id/models   → cargar select de modelos (al elegir marca)
3. GET /catalog/segments?category=AUTO → cargar select de segmento

Paso 3 - Características:
4. GET /catalog/attribute-definitions?category=AUTO → campos dinámicos
5. GET /catalog/features            → checkboxes de equipamiento

Paso 6 - Contacto y ubicación:
6. GET /location/provinces          → cargar select de departamento
7. GET /location/provinces/:id/cities → cargar select de municipio (al elegir depto)
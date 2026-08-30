# Catalog & Location API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

# CATALOG

Endpoints para obtener los datos de referencia que necesita el formulario de publicación de vehículos. Todos los GET son públicos. Los endpoints de creación, edición y borrado son exclusivos de administradores.

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

Devuelve los segmentos de vehículos ("carrocería": Sedán, SUV, Pickup, etc.). Se puede filtrar por categoría.

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

> Este mismo valor se usa como filtro `segmentId` en `GET /vehicles`.

---

## GET /catalog/features

Devuelve todas las características disponibles para asociar a un vehículo (aire acondicionado, ABS, cámara de reversa, etc.).

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

Devuelve los atributos dinámicos por categoría de vehículo (combustible, transmisión, motor, etc.). Usado para renderizar los campos del paso 3 del formulario, y también para saber qué `definitionId` usar al filtrar `GET /vehicles?attributes[...]`.

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

> El `id` de cada atributo (ej. `1` para Combustible) es el que hay que usar como clave en `GET /vehicles?attributes[1]=Nafta`.

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
| 409 | DUPLICATE_ENTRY | Ya existe una marca con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /catalog/brands/:id

Edita una marca existente. Solo para administradores.

**Request**
```
PATCH /catalog/brands/1
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "Toyota Corp",
  "logoUrl": "https://res.cloudinary.com/nuevo-logo.png"
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| name | string | ❌ | Nombre de la marca |
| category | string | ❌ | Categoría de vehículo |
| logoUrl | string | ❌ | URL del logo |

> Solo enviá los campos que querés actualizar.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Toyota Corp",
    "category": "AUTO",
    "logoUrl": "https://res.cloudinary.com/nuevo-logo.png"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Marca no encontrada |
| 409 | DUPLICATE_ENTRY | Ya existe otra marca con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## DELETE /catalog/brands/:id

Elimina una marca. Solo para administradores. **No se puede eliminar una marca que ya tiene vehículos asociados** — hay que reasignar o eliminar esos vehículos primero.

**Request**
```
DELETE /catalog/brands/1
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true, "id": 1 }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Marca no encontrada |
| 409 | CONFLICT | Hay vehículos asociados a esta marca (el mensaje incluye la cantidad) |

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
| 409 | DUPLICATE_ENTRY | Ya existe un modelo con ese nombre para esta marca |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /catalog/brands/:id/models/:modelId

Edita el nombre de un modelo existente. Solo para administradores.

**Request**
```
PATCH /catalog/brands/1/models/73
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "GR86 GT"
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| name | string | ✅ |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 73,
    "name": "GR86 GT",
    "brandId": 1
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Modelo no encontrado |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## DELETE /catalog/brands/:id/models/:modelId

Elimina un modelo. Solo para administradores. **No se puede eliminar un modelo que ya tiene vehículos asociados.**

**Request**
```
DELETE /catalog/brands/1/models/73
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true, "id": 73 }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Modelo no encontrado |
| 409 | CONFLICT | Hay vehículos asociados a este modelo (el mensaje incluye la cantidad) |

---

## POST /catalog/segments

Crea un nuevo segmento ("carrocería"). Solo para administradores.

**Request**
```
POST /catalog/segments
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "Pickup",
  "category": "CAMIONETA",
  "sortOrder": 1
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| name | string | ✅ | Nombre del segmento |
| category | string | ✅ | Categoría de vehículo (a diferencia de marca, acá es obligatoria) |
| sortOrder | number | ❌ | Orden de aparición en selects. Default: 0 |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "name": "Pickup",
    "category": "CAMIONETA",
    "sortOrder": 1
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 409 | DUPLICATE_ENTRY | Ya existe un segmento con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /catalog/segments/:id

Edita un segmento existente. Solo para administradores.

**Request**
```
PATCH /catalog/segments/8
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "sortOrder": 2
}
```

> Solo enviá los campos que querés actualizar.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "name": "Pickup",
    "category": "CAMIONETA",
    "sortOrder": 2
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Segmento no encontrado |
| 409 | DUPLICATE_ENTRY | Ya existe otro segmento con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## DELETE /catalog/segments/:id

Elimina un segmento. Solo para administradores. **No se puede eliminar un segmento que ya está siendo usado por algún vehículo** (`segmentId`).

**Request**
```
DELETE /catalog/segments/8
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true, "id": 8 }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Segmento no encontrado |
| 409 | CONFLICT | Hay vehículos usando este segmento (el mensaje incluye la cantidad) |

---

## POST /catalog/attribute-definitions

Crea un nuevo atributo dinámico (ej. "Color de tapizado", un nuevo tipo de dato para el paso 3 del formulario). Solo para administradores.

**Request**
```
POST /catalog/attribute-definitions
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "Color de tapizado",
  "category": "AUTO",
  "required": false,
  "filterable": false,
  "unit": null,
  "sortOrder": 5
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| name | string | ✅ | Nombre del atributo |
| category | string | ✅ | Categoría de vehículo |
| required | boolean | ❌ | Si es obligatorio completarlo al publicar. Default: false |
| filterable | boolean | ❌ | Si aparece como filtro en el PLP. Default: true |
| unit | string | ❌ | Unidad de medida, si aplica (ej. "cv", "L") |
| sortOrder | number | ❌ | Orden de aparición. Default: 0 |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Color de tapizado",
    "category": "AUTO",
    "required": false,
    "filterable": false,
    "unit": null,
    "sortOrder": 5
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 409 | DUPLICATE_ENTRY | Ya existe un atributo con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /catalog/attribute-definitions/:id

Edita un atributo dinámico existente. Solo para administradores.

**Request**
```
PATCH /catalog/attribute-definitions/9
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "filterable": true
}
```

> Solo enviá los campos que querés actualizar. Ojo al cambiar `required` a `true` sobre un atributo que ya tenía vehículos publicados sin ese dato completo — no revalida retroactivamente los vehículos existentes.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": 9,
    "name": "Color de tapizado",
    "category": "AUTO",
    "required": false,
    "filterable": true,
    "unit": null,
    "sortOrder": 5
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Atributo no encontrado |
| 409 | DUPLICATE_ENTRY | Ya existe otro atributo con ese nombre y categoría |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## DELETE /catalog/attribute-definitions/:id

Elimina un atributo dinámico. Solo para administradores. **No se puede eliminar un atributo que ya tiene valores cargados en al menos un vehículo.**

**Request**
```
DELETE /catalog/attribute-definitions/9
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true, "id": 9 }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 403 | FORBIDDEN | El usuario no es administrador |
| 404 | NOT_FOUND | Atributo no encontrado |
| 409 | CONFLICT | Hay vehículos con este atributo cargado (el mensaje incluye la cantidad) |

---

# LOCATION

Endpoints para obtener provincias (departamentos) y ciudades (municipios) de El Salvador. Todos son públicos.

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
3. GET /catalog/segments?category=AUTO → cargar select de segmento ("carrocería")

Paso 3 - Características:
4. GET /catalog/attribute-definitions?category=AUTO → campos dinámicos
5. GET /catalog/features            → checkboxes de equipamiento

Paso 6 - Contacto y ubicación:
6. GET /location/provinces          → cargar select de departamento
7. GET /location/provinces/:id/cities → cargar select de municipio (al elegir depto)
```

## Flujo de mantenimiento de catálogo (panel admin)

```
Marcas y modelos:
→ POST   /catalog/brands
→ PATCH  /catalog/brands/:id
→ DELETE /catalog/brands/:id                          (falla con 409 si tiene vehículos)
→ POST   /catalog/brands/:id/models
→ PATCH  /catalog/brands/:id/models/:modelId
→ DELETE /catalog/brands/:id/models/:modelId          (falla con 409 si tiene vehículos)

Segmentos:
→ POST   /catalog/segments
→ PATCH  /catalog/segments/:id
→ DELETE /catalog/segments/:id                        (falla con 409 si tiene vehículos)

Atributos dinámicos:
→ POST   /catalog/attribute-definitions
→ PATCH  /catalog/attribute-definitions/:id
→ DELETE /catalog/attribute-definitions/:id           (falla con 409 si hay vehículos con el valor cargado)

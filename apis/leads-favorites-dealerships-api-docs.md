# Leads, Favorites & Dealerships API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

# LEADS

Módulo de consultas de compradores. Cualquier persona puede crear un lead. Solo el vendedor dueño del vehículo o un admin puede verlos y gestionarlos.

---

## POST /vehicles/:vehicleId/leads

Crea una consulta sobre un vehículo. No requiere autenticación — cualquier visitante puede consultar.

**Request**
```
POST /vehicles/uuid/leads
Content-Type: application/json
```

```json
{
  "name": "Carlos López",
  "email": "carlos@email.com",
  "phone": "+50312345678",
  "message": "Hola, me interesa el vehículo. ¿Está disponible para verlo este fin de semana?",
  "source": "FORM"
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| name | string | ✅ | Mínimo 2 caracteres |
| email | string | ❌ | Email válido |
| phone | string | ❌ | — |
| message | string | ✅ | Mínimo 5 caracteres |
| source | string | ❌ | FORM, WHATSAPP, EMAIL. Default: FORM |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carlos López",
    "email": "carlos@email.com",
    "phone": "+50312345678",
    "message": "Hola, me interesa el vehículo...",
    "source": "FORM",
    "status": "NEW",
    "createdAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## GET /vehicles/:vehicleId/leads

Devuelve todas las consultas de un vehículo. Solo el vendedor dueño o un admin.

**Request**
```
GET /vehicles/uuid/leads
Authorization: Bearer <accessToken>
```

| Query param | Tipo | Descripción |
|---|---|---|
| page | number | Página actual. Default: 1 |
| limit | number | Resultados por página. Default: 20 |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos López",
      "email": "carlos@email.com",
      "phone": "+50312345678",
      "message": "Me interesa el vehículo...",
      "source": "FORM",
      "status": "NEW",
      "notes": null,
      "createdAt": "2026-06-06T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |

---

## GET /leads/me

Devuelve todas las consultas recibidas por el vendedor autenticado, de todos sus vehículos.

**Request**
```
GET /leads/me
Authorization: Bearer <accessToken>
```

| Query param | Tipo | Descripción |
|---|---|---|
| page | number | Página actual |
| limit | number | Resultados por página |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Carlos López",
      "email": "carlos@email.com",
      "phone": "+50312345678",
      "message": "Me interesa el vehículo...",
      "source": "FORM",
      "status": "CONTACTED",
      "notes": "Lo llamé, viene el sábado",
      "createdAt": "2026-06-06T00:00:00.000Z",
      "vehicle": {
        "id": "uuid",
        "title": "Toyota Corolla XEI 2020",
        "slug": "toyota-corolla-xei-2020-a3f2"
      }
    }
  ],
  "meta": {
    "total": 18,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |

---

## PATCH /leads/:id/status

Actualiza el estado de una consulta y agrega notas opcionales. Solo el vendedor dueño o un admin.

**Request**
```
PATCH /leads/uuid/status
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "status": "CONTACTED",
  "notes": "Lo llamé, viene a ver el auto el sábado a las 10am"
}
```

| Campo | Tipo | Requerido | Valores posibles |
|---|---|---|---|
| status | string | ✅ | NEW, CONTACTED, NEGOTIATING, WON, LOST |
| notes | string | ❌ | Notas internas del vendedor |

**Estados del lead**

| Estado | Descripción |
|---|---|
| NEW | Consulta nueva, sin respuesta |
| CONTACTED | El vendedor ya contactó al comprador |
| NEGOTIATING | En proceso de negociación |
| WON | Venta concretada |
| LOST | No se concretó la venta |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CONTACTED",
    "notes": "Lo llamé, viene el sábado a las 10am"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |
| 404 | NOT_FOUND | Consulta no encontrada |
| 422 | VALIDATION_ERROR | Estado inválido |

---

# FAVORITES

Módulo para guardar y gestionar vehículos favoritos. Todos los endpoints requieren autenticación.

---

## GET /favorites

Devuelve todos los vehículos guardados como favoritos por el usuario autenticado.

**Request**
```
GET /favorites
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-favorito",
      "createdAt": "2026-06-06T00:00:00.000Z",
      "vehicle": {
        "id": "uuid-vehiculo",
        "title": "Toyota Hilux 2022",
        "slug": "toyota-hilux-2022-b7c1",
        "status": "ACTIVE",
        "price": "32000.00",
        "currency": "USD",
        "category": "CAMIONETA",
        "year": 2022,
        "mileage": 30000,
        "images": [{ "url": "https://res.cloudinary.com/..." }],
        "brand": { "id": 1, "name": "Toyota" },
        "city": { "id": 5, "name": "San Salvador" }
      }
    }
  ]
}
```

> Los favoritos se ordenan por fecha de guardado, más recientes primero.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |

---

## POST /favorites/:vehicleId

Agrega un vehículo a favoritos.

**Request**
```
POST /favorites/uuid-vehiculo
Authorization: Bearer <accessToken>
```

Sin body.

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid-favorito",
    "vehicleId": "uuid-vehiculo",
    "createdAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 409 | CONFLICT | El vehículo ya está en favoritos |

---

## DELETE /favorites/:vehicleId

Elimina un vehículo de favoritos.

**Request**
```
DELETE /favorites/uuid-vehiculo
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": { "removed": true }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 404 | NOT_FOUND | El vehículo no estaba en favoritos |

---

## GET /favorites/:vehicleId/check

Verifica si un vehículo específico está guardado como favorito. Usado para mostrar el ícono de corazón activo/inactivo en el PDP.

**Request**
```
GET /favorites/uuid-vehiculo/check
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "isFavorite": true }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |

---

## Flujo de uso en el PDP

```
1. GET  /favorites/:vehicleId/check  → saber si mostrar corazón lleno o vacío
2. POST /favorites/:vehicleId        → usuario hace click en "guardar"
3. DELETE /favorites/:vehicleId      → usuario hace click en "quitar de favoritos"
4. GET  /favorites                   → usuario entra a "Mis favoritos"
```

---

# DEALERSHIPS

Módulo de concesionarias. Los endpoints públicos muestran el perfil y los vehículos activos. La creación y edición es solo para admins.

---

## GET /dealerships

Devuelve el listado de todas las concesionarias.

**Request**
```
GET /dealerships
GET /dealerships?page=1&limit=20
```

| Query param | Tipo | Descripción |
|---|---|---|
| page | number | Página actual |
| limit | number | Resultados por página |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "AutoCenter El Salvador",
      "slug": "autocenter-el-salvador",
      "description": "Concesionaria líder en El Salvador...",
      "phone": "+50322345678",
      "email": "ventas@autocenter.com.sv",
      "logoUrl": "https://res.cloudinary.com/...",
      "isVerified": true,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "_count": { "vehicles": 45, "profiles": 3 }
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## GET /dealerships/:slug

Devuelve el perfil completo de una concesionaria con sus vehículos activos.

**Request**
```
GET /dealerships/autocenter-el-salvador
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "AutoCenter El Salvador",
    "slug": "autocenter-el-salvador",
    "description": "Concesionaria líder en El Salvador...",
    "phone": "+50322345678",
    "email": "ventas@autocenter.com.sv",
    "logoUrl": "https://res.cloudinary.com/...",
    "isVerified": true,
    "createdAt": "2026-01-01T00:00:00.000Z",
    "_count": { "vehicles": 45, "profiles": 3 },
    "vehicles": [
      {
        "id": "uuid",
        "title": "Toyota Hilux 2022",
        "slug": "toyota-hilux-2022-b7c1",
        "price": "32000.00",
        "currency": "USD",
        "year": 2022,
        "mileage": 30000,
        "images": [{ "url": "https://res.cloudinary.com/..." }]
      }
    ]
  }
}
```

> Incluye hasta 12 vehículos activos ordenados por fecha de publicación.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Concesionaria no encontrada |

---

## POST /dealerships

Crea una nueva concesionaria. Solo para admins.

**Request**
```
POST /dealerships
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "name": "AutoCenter El Salvador",
  "slug": "autocenter-el-salvador",
  "description": "Concesionaria líder en El Salvador",
  "phone": "+50322345678",
  "email": "ventas@autocenter.com.sv",
  "logoUrl": "https://res.cloudinary.com/..."
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| name | string | ✅ | Mínimo 2 caracteres |
| slug | string | ✅ | Solo letras minúsculas, números y guiones |
| description | string | ❌ | — |
| phone | string | ❌ | — |
| email | string | ❌ | Email válido |
| logoUrl | string | ❌ | URL válida |

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "AutoCenter El Salvador",
    "slug": "autocenter-el-salvador",
    "isVerified": false,
    "createdAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es admin |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /dealerships/:id

Edita una concesionaria existente. Solo para admins.

**Request**
```
PATCH /dealerships/uuid
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "phone": "+50322345679",
  "description": "Nueva descripción actualizada"
}
```

> Solo enviá los campos que querés actualizar.

**Response 200**

Devuelve la concesionaria actualizada completa.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es admin |
| 404 | NOT_FOUND | Concesionaria no encontrada |
| 422 | VALIDATION_ERROR | Datos inválidos |

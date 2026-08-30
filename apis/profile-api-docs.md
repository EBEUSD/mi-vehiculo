# Profile API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

> Todos los endpoints requieren `Authorization: Bearer <accessToken>`

---

## GET /profile

Devuelve el perfil del usuario autenticado.

**Request**
```
GET /profile
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "test@test.com",
    "fullName": "Test User",
    "phone": "+5492614000000",
    "role": "USER",
    "type": "INDIVIDUAL",
    "dealershipId": null,
    "createdAt": "2026-06-06T00:00:00.000Z",
    "updatedAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 404 | NOT_FOUND | Perfil no encontrado |

---

## PATCH /profile

Edita los datos del perfil del usuario autenticado.

**Request**
```
PATCH /profile
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "fullName": "Nuevo Nombre",
  "phone": "+5492614000000"
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| fullName | string | ❌ | Mínimo 2 caracteres |
| phone | string | ❌ | — |

> Al menos uno de los dos campos debe enviarse.

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "test@test.com",
    "fullName": "Nuevo Nombre",
    "phone": "+5492614000000",
    "role": "USER",
    "type": "INDIVIDUAL",
    "dealershipId": null,
    "createdAt": "2026-06-06T00:00:00.000Z",
    "updatedAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |
| 404 | NOT_FOUND | Perfil no encontrado |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## GET /profile/vehicles

Devuelve todas las publicaciones del usuario autenticado con métricas básicas.

**Request**
```
GET /profile/vehicles
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Toyota Corolla XEI 2020",
      "slug": "toyota-corolla-xei-2020-a3f2",
      "status": "ACTIVE",
      "price": "18500.00",
      "currency": "USD",
      "category": "AUTO",
      "condition": "USED",
      "year": 2020,
      "mileage": 55000,
      "createdAt": "2026-06-06T00:00:00.000Z",
      "publishedAt": "2026-06-06T00:00:00.000Z",
      "images": [
        { "url": "https://res.cloudinary.com/..." }
      ],
      "_count": {
        "leads": 5,
        "vehicleViews": 142,
        "whatsappClicks": 18
      }
    }
  ]
}
```

> Los vehículos se ordenan por `createdAt` descendente (más recientes primero).
> `_count` incluye leads recibidos, vistas totales y clicks en WhatsApp.

**Posibles valores de `status`**
| Valor | Descripción |
|---|---|
| DRAFT | Borrador, no visible públicamente |
| PENDING | Pendiente de revisión |
| ACTIVE | Publicado y visible |
| PAUSED | Pausado temporalmente |
| SOLD | Marcado como vendido |
| REJECTED | Rechazado por moderación |
| DELETED | Eliminado |

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |

---

## GET /profile/favorites

Devuelve los vehículos guardados como favoritos por el usuario autenticado.

**Request**
```
GET /profile/favorites
Authorization: Bearer <accessToken>
```

Sin body.

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
        "title": "Volkswagen Amarok 2019",
        "slug": "volkswagen-amarok-2019-b7c1",
        "status": "ACTIVE",
        "price": "27000.00",
        "currency": "USD",
        "category": "CAMIONETA",
        "year": 2019,
        "mileage": 80000,
        "images": [
          { "url": "https://res.cloudinary.com/..." }
        ]
      }
    }
  ]
}
```

> Los favoritos se ordenan por `createdAt` descendente (más recientes primero).

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |

---

## Flujo de uso recomendado

```
1. GET  /profile            → ver perfil actual
2. PATCH /profile           → editar fullName o phone
3. GET  /profile/vehicles   → ver mis publicaciones y sus métricas
4. GET  /profile/favorites  → ver mis vehículos guardados
```

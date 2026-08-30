# Admin & Products API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

# ADMIN

Todos los endpoints de admin requieren autenticación y rol `ADMIN`.

```
Authorization: Bearer <accessToken>  // usuario con role: ADMIN
```

---

## GET /admin/stats

Devuelve métricas generales de la plataforma.

**Request**
```
GET /admin/stats
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "vehicles": {
      "total": 284,
      "active": 198,
      "pending": 12
    },
    "profiles": {
      "total": 543
    },
    "leads": {
      "total": 1820
    },
    "views": {
      "total": 48320
    },
    "whatsappClicks": {
      "total": 6240
    }
  }
}
```

> Para contadores públicos livianos (sin autenticación, pensados para la Home del sitio), usar `GET /vehicles/stats/public` en su lugar.

---

## GET /admin/vehicles

Devuelve todos los vehículos del sistema con filtro por estado. A diferencia del listado público (`GET /vehicles`), este endpoint sí puede filtrar y devolver vehículos en cualquier estado, incluyendo `DRAFT`.

**Request**
```
GET /admin/vehicles
GET /admin/vehicles?status=PENDING&page=1&limit=20
Authorization: Bearer <accessToken>
```

| Query param | Tipo | Descripción | Valores posibles |
|---|---|---|---|
| status | string | Filtrar por estado | DRAFT, PENDING, ACTIVE, REJECTED, PAUSED, SOLD, DELETED |
| page | number | Página actual | — |
| limit | number | Resultados por página | — |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Toyota Corolla XEI 2020",
      "slug": "toyota-corolla-xei-2020-a3f2",
      "status": "PENDING",
      "price": "18500.00",
      "currency": "USD",
      "category": "AUTO",
      "moderationNotes": null,
      "publishedAt": null,
      "createdAt": "2026-06-06T00:00:00.000Z",
      "featuredUntil": null,
      "seller": {
        "id": "uuid",
        "fullName": "Juan Pérez",
        "email": "juan@email.com"
      },
      "brand": { "id": 1, "name": "Toyota" },
      "images": [{ "url": "https://res.cloudinary.com/..." }],
      "_count": { "leads": 0, "vehicleViews": 0 }
    }
  ],
  "meta": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## PATCH /admin/vehicles/:id/status

Cambia el estado de cualquier vehículo. El admin puede usar todos los estados disponibles.

**Publicar un vehículo (`ACTIVE`) exige que ya tenga las 4 fotos obligatorias cargadas** (FRENTE, LATERAL, TRASERA, INTERIOR) — la misma regla que aplica al vendedor con `POST /vehicles/:id/publish` (ver `vehicles.md`). Este endpoint no es un atajo para saltarse esa validación.

**Request — caso normal (aprobar publicación ya completa)**
```
PATCH /admin/vehicles/uuid/status
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "status": "ACTIVE",
  "notes": "Publicación aprobada. Imágenes correctas."
}
```

**Request — forzar activación sin las fotos obligatorias**

Para casos operativos puntuales (ej. el vendedor mandó las fotos por otro canal y hay que publicar mientras se completa la carga formal), se puede pasar `force: true`. En ese caso, `notes` pasa a ser **obligatorio**, para dejar registrado el motivo:

```json
{
  "status": "ACTIVE",
  "force": true,
  "notes": "Cliente envió fotos por WhatsApp, se publica manualmente mientras el vendedor sube el resto"
}
```

| Campo | Tipo | Requerido | Valores posibles |
|---|---|---|---|
| status | string | ✅ | ACTIVE, PENDING, REJECTED, PAUSED, SOLD, DELETED |
| notes | string | ❌ (✅ si `force: true`) | Notas de moderación visibles al vendedor |
| force | boolean | ❌ | Solo aplica cuando `status: ACTIVE` y faltan fotos obligatorias |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACTIVE",
    "moderationNotes": "Publicación aprobada."
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Vehículo no encontrado |
| 422 | VALIDATION_ERROR | Estado inválido |
| 422 | — | Intento de poner `ACTIVE` sin fotos obligatorias y sin `force` |
| 422 | — | `force: true` sin `notes` |

---

## PATCH /admin/vehicles/:id/featured

Destaca un vehículo hasta una fecha específica, o quita el destacado.

**Request**
```
PATCH /admin/vehicles/uuid/featured
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "featuredUntil": "2026-07-31T23:59:59.000Z"
}
```

Para quitar el destacado:
```json
{
  "featuredUntil": null
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| featuredUntil | string (datetime) \| null | ✅ | Fecha hasta la que estará destacado. null para quitar |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "featuredUntil": "2026-07-31T23:59:59.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Vehículo no encontrado |
| 422 | VALIDATION_ERROR | Formato de fecha inválido |

---

## GET /admin/profiles

Devuelve todos los usuarios registrados con filtro por rol.

**Request**
```
GET /admin/profiles
GET /admin/profiles?role=SELLER&page=1&limit=20
Authorization: Bearer <accessToken>
```

| Query param | Tipo | Valores posibles |
|---|---|---|
| role | string | USER, SELLER, ADMIN |
| page | number | — |
| limit | number | — |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "juan@email.com",
      "fullName": "Juan Pérez",
      "phone": "+50312345678",
      "role": "SELLER",
      "type": "INDIVIDUAL",
      "createdAt": "2026-01-15T00:00:00.000Z",
      "_count": {
        "vehicles": 5,
        "leads": 23
      }
    }
  ],
  "meta": {
    "total": 543,
    "page": 1,
    "limit": 20,
    "totalPages": 28
  }
}
```

---

## PATCH /admin/profiles/:id/role

Cambia el rol de un usuario.

**Request**
```
PATCH /admin/profiles/uuid/role
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "role": "SELLER"
}
```

| Campo | Tipo | Requerido | Valores posibles |
|---|---|---|---|
| role | string | ✅ | USER, SELLER, ADMIN |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "juan@email.com",
    "role": "SELLER"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Usuario no encontrado |
| 422 | VALIDATION_ERROR | Rol inválido |

---

## PATCH /admin/profiles/:id/dealership

Asigna o quita la concesionaria (`dealershipId`) de un usuario — por ejemplo, para vincular un vendedor a una concesionaria existente.

**Request — asignar**
```
PATCH /admin/profiles/uuid/dealership
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "dealershipId": "uuid-de-la-concesionaria"
}
```

**Request — desvincular**
```json
{
  "dealershipId": null
}
```

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| dealershipId | string (uuid) \| null | ✅ | ID de la concesionaria a asignar, o null para quitarla |

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "juan@email.com",
    "fullName": "Juan Pérez",
    "dealershipId": "uuid-de-la-concesionaria"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Usuario no encontrado |
| 404 | NOT_FOUND | Concesionaria no encontrada (si se envió un `dealershipId` que no existe) |
| 422 | VALIDATION_ERROR | `dealershipId` con formato inválido |

---

## GET /admin/leads

Devuelve todas las consultas del sistema con filtro por estado.

**Request**
```
GET /admin/leads
GET /admin/leads?status=NEW&page=1&limit=20
Authorization: Bearer <accessToken>
```

| Query param | Tipo | Valores posibles |
|---|---|---|
| status | string | NEW, CONTACTED, NEGOTIATING, WON, LOST |
| page | number | — |
| limit | number | — |

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
      "createdAt": "2026-06-06T00:00:00.000Z",
      "vehicle": {
        "id": "uuid",
        "title": "Toyota Corolla XEI 2020",
        "slug": "toyota-corolla-xei-2020-a3f2"
      }
    }
  ],
  "meta": {
    "total": 1820,
    "page": 1,
    "limit": 20,
    "totalPages": 91
  }
}
```

---

## Flujo típico de moderación

```
1. GET   /admin/vehicles?status=PENDING   → ver publicaciones pendientes
2. GET   /vehicles/:slug/detail           → revisar el detalle completo
3. PATCH /admin/vehicles/:id/status       → aprobar { "status": "ACTIVE" }
                                          → rechazar { "status": "REJECTED", "notes": "Motivo" }
                                          → forzar sin fotos completas { "status": "ACTIVE", "force": true, "notes": "Motivo" }
4. PATCH /admin/vehicles/:id/featured     → destacar si corresponde
```

## Flujo típico de gestión de usuarios

```
1. GET   /admin/profiles?role=SELLER              → ver vendedores
2. PATCH /admin/profiles/:id/role                 → cambiar rol si corresponde
3. PATCH /admin/profiles/:id/dealership           → vincular a una concesionaria
```

---

# PRODUCTS

Módulo de accesorios y repuestos. Funciona de forma similar a Vehicles con su propio sistema de imágenes, vistas y clicks de WhatsApp.

---

## GET /products

Listado público de productos con filtros.

**Request**
```
GET /products
GET /products?categoryId=1&brandId=1&modelId=3&minPrice=10&maxPrice=500&page=1
```

| Query param | Tipo | Descripción |
|---|---|---|
| categoryId | number | ID de la categoría de producto |
| condition | string | NEW, USED |
| minPrice | number | Precio mínimo |
| maxPrice | number | Precio máximo |
| currency | string | ARS, USD |
| brandId | number | Filtrar por compatibilidad de marca |
| modelId | number | Filtrar por compatibilidad de modelo |
| page | number | Página actual |
| limit | number | Resultados por página |

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Filtro de aceite Toyota Corolla",
      "slug": "filtro-de-aceite-toyota-corolla-a1b2",
      "price": "25.00",
      "currency": "USD",
      "stock": 10,
      "condition": "NEW",
      "status": "ACTIVE",
      "createdAt": "2026-06-06T00:00:00.000Z",
      "category": { "id": 1, "name": "Filtros" },
      "seller": { "id": "uuid", "fullName": "Repuestos García" },
      "images": [{ "id": "uuid", "url": "https://res.cloudinary.com/...", "isPrimary": true }],
      "compatibilities": [
        {
          "id": 1,
          "fromYear": 2018,
          "toYear": 2023,
          "brand": { "id": 1, "name": "Toyota" },
          "model": { "id": 3, "name": "Corolla" }
        }
      ],
      "_count": { "views": 42, "whatsappClicks": 8 }
    }
  ],
  "meta": {
    "total": 85,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

## GET /products/:slug/detail

Devuelve el detalle completo de un producto.

**Request**
```
GET /products/filtro-de-aceite-toyota-corolla-a1b2/detail
```

**Response 200**

Devuelve el mismo objeto que el listado pero con `description` incluida.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Producto no encontrado |

---

## POST /products/:id/view

Registra una vista de un producto. No cuenta vistas repetidas del mismo IP en la última hora.

**Request**
```
POST /products/uuid/view
```

Sin body. Sin autenticación requerida.

**Response 204** — Sin body.

---

## POST /products/:id/whatsapp-click

Registra un click en el botón de WhatsApp del producto.

**Request**
```
POST /products/uuid/whatsapp-click
```

Sin body. Sin autenticación requerida.

**Response 204** — Sin body.

---

## GET /products/me

Devuelve todos los productos del vendedor autenticado.

**Request**
```
GET /products/me
Authorization: Bearer <accessToken>
```

**Response 200**

Devuelve array de productos con el mismo formato que el listado.

---

## POST /products

Crea un nuevo producto.

**Request**
```
POST /products
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "title": "Filtro de aceite Toyota Corolla",
  "description": "Filtro de aceite original para Toyota Corolla 2018-2023",
  "price": 25,
  "currency": "USD",
  "stock": 10,
  "condition": "NEW",
  "categoryId": 1,
  "compatibilities": [
    {
      "brandId": 1,
      "modelId": 3,
      "fromYear": 2018,
      "toYear": 2023
    }
  ]
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| title | string | ✅ | Mínimo 3 caracteres |
| price | number | ✅ | Mayor a 0 |
| currency | string | ✅ | ARS, USD |
| stock | number | ✅ | Mínimo 1 |
| condition | string | ✅ | NEW, USED |
| categoryId | number | ✅ | ID de categoría válido |
| description | string | ❌ | — |
| compatibilities | array | ❌ | Marcas/modelos compatibles |

**Response 201** — Devuelve el producto completo.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /products/:id

Edita un producto. Solo el dueño o un admin.

**Request**
```
PATCH /products/uuid
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "price": 22,
  "stock": 5
}
```

> Solo enviá los campos que querés actualizar.

**Response 200** — Devuelve el producto actualizado.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |
| 404 | NOT_FOUND | Producto no encontrado |

---

## PATCH /products/:id/status

Cambia el estado de un producto.

**Request**
```
PATCH /products/uuid/status
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "status": "PAUSED"
}
```

| Estado | Descripción |
|---|---|
| ACTIVE | Visible públicamente |
| PAUSED | Oculto temporalmente |
| SOLD | Sin stock / vendido |
| DELETED | Eliminado (soft delete) |

**Response 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "PAUSED" }
}
```

---

## POST /products/:id/images

Sube imágenes al producto. Máximo 10 imágenes en total.

**Request**
```
POST /products/uuid/images
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| Campo | Tipo | Descripción |
|---|---|---|
| images | File[] | JPG, PNG o WEBP. Máx 5MB cada una |

**Response 201** — Devuelve el array de imágenes creadas.

---

## DELETE /products/:id/images/:imageId

Elimina una imagen del producto y de Cloudinary.

**Request**
```
DELETE /products/uuid/images/image-uuid
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## GET /products/:id/stats/views

Estadísticas de vistas del producto. Solo el dueño o admin.

**Request**
```
GET /products/uuid/stats/views
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 42,
    "last7days": 12,
    "last30days": 35
  }
}
```

---

## GET /products/:id/stats/whatsapp

Estadísticas de clicks en WhatsApp del producto. Solo el dueño o admin.

**Request**
```
GET /products/uuid/stats/whatsapp
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 8,
    "last7days": 3,
    "last30days": 7
  }
}
```

---

## Resumen de todos los endpoints del sistema

### Públicos (sin autenticación)
| Módulo | Método | Ruta |
|---|---|---|
| Auth | POST | `/api/v1/auth/register` |
| Auth | POST | `/api/v1/auth/login` |
| Auth | POST | `/api/v1/auth/refresh` |
| Catalog | GET | `/api/v1/catalog/brands` |
| Catalog | GET | `/api/v1/catalog/brands/:id` |
| Catalog | GET | `/api/v1/catalog/brands/:id/models` |
| Catalog | GET | `/api/v1/catalog/segments` |
| Catalog | GET | `/api/v1/catalog/features` |
| Catalog | GET | `/api/v1/catalog/attribute-definitions` |
| Location | GET | `/api/v1/location/provinces` |
| Location | GET | `/api/v1/location/provinces/:id/cities` |
| Location | GET | `/api/v1/location/cities` |
| Location | GET | `/api/v1/location/cities/:id` |
| Vehicles | GET | `/api/v1/vehicles` |
| Vehicles | GET | `/api/v1/vehicles/stats/public` |
| Vehicles | GET | `/api/v1/vehicles/featured` |
| Vehicles | GET | `/api/v1/vehicles/:slug/detail` |
| Vehicles | GET | `/api/v1/vehicles/:id/related` |
| Vehicles | GET | `/api/v1/vehicles/:id/videos` |
| Vehicles | POST | `/api/v1/vehicles/:id/view` |
| Vehicles | POST | `/api/v1/vehicles/:id/whatsapp-click` (rate limit: 20 / 15min por IP) |
| Leads | POST | `/api/v1/vehicles/:vehicleId/leads` (rate limit: 15 / hora por IP) |
| Dealerships | GET | `/api/v1/dealerships` |
| Dealerships | GET | `/api/v1/dealerships/:slug` |
| Products | GET | `/api/v1/products` |
| Products | GET | `/api/v1/products/:slug/detail` |
| Products | POST | `/api/v1/products/:id/view` |
| Products | POST | `/api/v1/products/:id/whatsapp-click` |

### Protegidos (requieren autenticación)
| Módulo | Método | Ruta |
|---|---|---|
| Auth | POST | `/api/v1/auth/logout` |
| Auth | GET | `/api/v1/auth/me` |
| Profile | GET | `/api/v1/profile` |
| Profile | PATCH | `/api/v1/profile` |
| Profile | GET | `/api/v1/profile/vehicles` |
| Profile | GET | `/api/v1/profile/favorites` |
| Vehicles | POST | `/api/v1/vehicles` (crea en estado DRAFT) |
| Vehicles | POST | `/api/v1/vehicles/:id/publish` |
| Vehicles | GET | `/api/v1/vehicles/:id/images/missing-required` |
| Vehicles | PATCH | `/api/v1/vehicles/:id` |
| Vehicles | PATCH | `/api/v1/vehicles/:id/status` |
| Vehicles | DELETE | `/api/v1/vehicles/:id` |
| Vehicles | POST | `/api/v1/vehicles/:id/images` (por categoría) |
| Vehicles | PATCH | `/api/v1/vehicles/:id/images/:imageId/primary` |
| Vehicles | DELETE | `/api/v1/vehicles/:id/images/:imageId` |
| Vehicles | PATCH | `/api/v1/vehicles/:id/images/reorder` |
| Vehicles | POST | `/api/v1/vehicles/:id/videos` |
| Vehicles | DELETE | `/api/v1/vehicles/:id/videos/:videoId` |
| Vehicles | PATCH | `/api/v1/vehicles/:id/videos/reorder` |
| Vehicles | GET | `/api/v1/vehicles/:id/stats/views` |
| Vehicles | GET | `/api/v1/vehicles/:id/stats/whatsapp` |
| Leads | GET | `/api/v1/vehicles/:vehicleId/leads` |
| Leads | GET | `/api/v1/leads/me` |
| Leads | PATCH | `/api/v1/leads/:id/status` |
| Favorites | GET | `/api/v1/favorites` |
| Favorites | POST | `/api/v1/favorites/:vehicleId` |
| Favorites | DELETE | `/api/v1/favorites/:vehicleId` |
| Favorites | GET | `/api/v1/favorites/:vehicleId/check` |
| Products | GET | `/api/v1/products/me` |
| Products | POST | `/api/v1/products` |
| Products | PATCH | `/api/v1/products/:id` |
| Products | PATCH | `/api/v1/products/:id/status` |
| Products | POST | `/api/v1/products/:id/images` |
| Products | DELETE | `/api/v1/products/:id/images/:imageId` |
| Products | GET | `/api/v1/products/:id/stats/views` |
| Products | GET | `/api/v1/products/:id/stats/whatsapp` |

### Solo ADMIN
| Módulo | Método | Ruta |
|---|---|---|
| Admin | GET | `/api/v1/admin/stats` |
| Admin | GET | `/api/v1/admin/vehicles` |
| Admin | PATCH | `/api/v1/admin/vehicles/:id/status` |
| Admin | PATCH | `/api/v1/admin/vehicles/:id/featured` |
| Admin | GET | `/api/v1/admin/profiles` |
| Admin | PATCH | `/api/v1/admin/profiles/:id/role` |
| Admin | PATCH | `/api/v1/admin/profiles/:id/dealership` |
| Admin | GET | `/api/v1/admin/leads` |
| Catalog | POST | `/api/v1/catalog/brands` |
| Catalog | PATCH | `/api/v1/catalog/brands/:id` |
| Catalog | DELETE | `/api/v1/catalog/brands/:id` |
| Catalog | POST | `/api/v1/catalog/brands/:id/models` |
| Catalog | PATCH | `/api/v1/catalog/brands/:id/models/:modelId` |
| Catalog | DELETE | `/api/v1/catalog/brands/:id/models/:modelId` |
| Catalog | POST | `/api/v1/catalog/segments` |
| Catalog | PATCH | `/api/v1/catalog/segments/:id` |
| Catalog | DELETE | `/api/v1/catalog/segments/:id` |
| Catalog | POST | `/api/v1/catalog/attribute-definitions` |
| Catalog | PATCH | `/api/v1/catalog/attribute-definitions/:id` |
| Catalog | DELETE | `/api/v1/catalog/attribute-definitions/:id` |
| Dealerships | POST | `/api/v1/dealerships` |
| Dealerships | PATCH | `/api/v1/dealerships/:id` |

> Los endpoints de creación/edición/borrado de `brands`, `models`, `segments` y `attribute-definitions` no eliminan el registro si ya está siendo usado por al menos un vehículo — devuelven `409 CONFLICT` en su lugar. Ver detalle en `catalog-location-api-docs.md`.
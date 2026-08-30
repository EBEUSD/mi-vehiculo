# Vehicles API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

## GET /vehicles

Listado público de vehículos con filtros. Usado en el PLP. Solo devuelve vehículos con `status: ACTIVE` — el parámetro `status` no está disponible en este endpoint público (para ver vehículos en otros estados, usar `GET /profile/vehicles` o `GET /admin/vehicles`).

**Request**
```
GET /vehicles
GET /vehicles?category=AUTO&brandId=1&minPrice=5000&maxPrice=20000&orderBy=price_asc&page=1&limit=20
GET /vehicles?q=corolla
GET /vehicles?attributes[1]=Nafta&attributes[2]=Automática
```

**Query params disponibles**

| Param | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| q | string | Búsqueda por texto libre (título, marca, modelo). Mínimo 2 caracteres | corolla |
| attributes | object | Filtro por atributos dinámicos. Clave = `definitionId`, valor = el valor exacto (insensible a mayúsculas) | attributes[1]=Nafta |
| category | string | Categoría del vehículo | AUTO, MOTO, CAMIONETA |
| brandId | number | ID de la marca | 1 |
| modelId | number | ID del modelo | 3 |
| segmentId | number | ID del segmento (también cubre "carrocería": Sedán, SUV, etc.) | 2 |
| condition | string | Condición | NEW, USED |
| minPrice | number | Precio mínimo | 5000 |
| maxPrice | number | Precio máximo | 20000 |
| minYear | number | Año mínimo | 2015 |
| maxYear | number | Año máximo | 2023 |
| maxMileage | number | Kilometraje máximo | 100000 |
| currency | string | Moneda | ARS, USD |
| cityId | number | ID de la ciudad | 5 |
| provinceId | number | ID del departamento | 2 |
| featured | boolean | Solo destacados | true |
| orderBy | string | Orden de resultados | price_asc, price_desc, year_desc, year_asc, newest, oldest |
| page | number | Página actual | 1 |
| limit | number | Resultados por página (máx 50) | 20 |

> Para filtrar por combustible, transmisión u otro atributo dinámico, primero consultar `GET /catalog/attribute-definitions` para obtener el `definitionId` correspondiente, y usarlo como clave en `attributes`.

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
      "acceptsExchange": true,
      "negotiablePrice": false,
      "featuredUntil": null,
      "publishedAt": "2026-06-06T00:00:00.000Z",
      "createdAt": "2026-06-06T00:00:00.000Z",
      "brand": { "id": 1, "name": "Toyota" },
      "model": { "id": 3, "name": "Corolla" },
      "city": {
        "id": 5,
        "name": "San Salvador",
        "province": { "id": 6, "name": "San Salvador" }
      },
      "images": [{ "url": "https://res.cloudinary.com/...", "sortOrder": 0 }],
      "_count": { "leads": 3, "vehicleViews": 87, "whatsappClicks": 12 }
    }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## GET /vehicles/stats/public

Contadores generales para la Home (vehículos activos, marcas, concesionarias). Público, sin autenticación.

**Request**
```
GET /vehicles/stats/public
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "activeVehicles": 198,
    "totalBrands": 24,
    "totalDealerships": 8
  }
}
```

---

## GET /vehicles/featured

Devuelve los vehículos destacados para mostrar en la Home.

**Request**
```
GET /vehicles/featured
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Toyota Hilux 2022",
      "slug": "toyota-hilux-2022-b7c1",
      "price": "32000.00",
      "currency": "USD",
      "featuredUntil": "2026-07-01T00:00:00.000Z",
      "images": [{ "url": "https://res.cloudinary.com/..." }]
    }
  ]
}
```

> Devuelve máximo 6 vehículos ordenados por `featuredUntil` descendente.

---

## GET /vehicles/:slug/detail

Devuelve el detalle completo de un vehículo. Usado en el PDP.

**Request**
```
GET /vehicles/toyota-corolla-xei-2020-a3f2/detail
```

**Response 200**
```json
{
  "success": true,
  "data": {
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
    "version": "XEI",
    "description": "Vehículo en excelente estado...",
    "contactPhone": "+50312345678",
    "showWhatsapp": true,
    "contactHours": "Lunes a viernes de 9 a 18hs",
    "acceptsExchange": true,
    "financingAvailable": false,
    "negotiablePrice": false,
    "generalCondition": "VERY_GOOD",
    "ownershipType": "OWNER",
    "documentsUpToDate": true,
    "hasVTV": true,
    "hasDebts": false,
    "isVerified": false,
    "publishedAt": "2026-06-06T00:00:00.000Z",
    "createdAt": "2026-06-06T00:00:00.000Z",
    "updatedAt": "2026-06-06T00:00:00.000Z",
    "brand":   { "id": 1, "name": "Toyota" },
    "model":   { "id": 3, "name": "Corolla" },
    "segment": { "id": 1, "name": "Sedán" },
    "city": {
      "id": 5,
      "name": "San Salvador",
      "province": { "id": 6, "name": "San Salvador" }
    },
    "seller": {
      "id": "uuid",
      "fullName": "Juan Pérez",
      "phone": "+50312345678",
      "email": "juan@email.com"
    },
    "dealership": null,
    "images": [
      { "id": "uuid", "url": "https://res.cloudinary.com/...", "isPrimary": true, "sortOrder": 0 },
      { "id": "uuid", "url": "https://res.cloudinary.com/...", "isPrimary": false, "sortOrder": 1 }
    ],
    "videos": [
      { "id": "uuid", "url": "https://res.cloudinary.com/...", "sortOrder": 0, "createdAt": "2026-06-06T00:00:00.000Z" }
    ],
    "features": [
      { "feature": { "id": 1, "name": "Aire acondicionado" } },
      { "feature": { "id": 2, "name": "ABS" } }
    ],
    "attributes": [
      { "value": "Nafta", "definition": { "id": 1, "name": "Combustible", "unit": null } },
      { "value": "Automática", "definition": { "id": 2, "name": "Transmisión", "unit": null } }
    ],
    "priceHistory": [
      { "oldPrice": "20000.00", "newPrice": "18500.00", "changedAt": "2026-05-01T00:00:00.000Z" }
    ],
    "_count": { "leads": 3, "vehicleViews": 87, "whatsappClicks": 12 }
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 404 | NOT_FOUND | Vehículo no encontrado |

---

## GET /vehicles/:id/related

Devuelve vehículos relacionados por marca y ciudad. Usado al final del PDP.

**Request**
```
GET /vehicles/uuid/related
```

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Toyota Corolla LE 2019",
      "slug": "toyota-corolla-le-2019-c4d2",
      "price": "15000.00",
      "currency": "USD",
      "images": [{ "url": "https://res.cloudinary.com/..." }]
    }
  ]
}
```

> Devuelve máximo 4 vehículos activos de la misma marca o ciudad.

---

## POST /vehicles/:id/view

Registra una vista de un vehículo. No cuenta vistas repetidas del mismo IP en la última hora.

**Request**
```
POST /vehicles/uuid/view
```

Sin body. Sin autenticación requerida.

**Response 204** — Sin body.

---

## POST /vehicles/:id/whatsapp-click

Registra un click en el botón de WhatsApp del PDP. Limitado a 20 clicks cada 15 minutos por IP.

**Request**
```
POST /vehicles/uuid/whatsapp-click
```

Sin body. Sin autenticación requerida.

**Response 204** — Sin body.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 429 | RATE_LIMIT_EXCEEDED | Demasiados intentos, esperar unos minutos |

---

## POST /vehicles

Crea una nueva publicación de vehículo. **El vehículo se crea en estado `DRAFT`, no visible en el PLP ni en búsquedas.** Para que aparezca públicamente, hay que subir las fotos obligatorias y publicarlo con `POST /vehicles/:id/publish` (ver más abajo).

**Request**
```
POST /vehicles
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "category": "AUTO",
  "brandId": 1,
  "modelId": 3,
  "year": 2020,
  "version": "XEI",
  "condition": "USED",
  "mileage": 55000,
  "segmentId": 1,
  "price": 18500,
  "currency": "USD",
  "acceptsExchange": true,
  "financingAvailable": false,
  "negotiablePrice": false,
  "attributes": [
    { "definitionId": 1, "value": "Nafta" },
    { "definitionId": 2, "value": "Automática" }
  ],
  "featureIds": [1, 2, 5],
  "generalCondition": "VERY_GOOD",
  "ownershipType": "OWNER",
  "documentsUpToDate": true,
  "hasVTV": true,
  "hasDebts": false,
  "description": "Vehículo en excelente estado...",
  "cityId": 5,
  "contactPhone": "+50312345678",
  "showWhatsapp": true,
  "contactHours": "Lunes a viernes de 9 a 18hs",
  "title": "Toyota Corolla XEI 2020"
}
```

**Campos requeridos**

| Campo | Tipo | Descripción |
|---|---|---|
| category | string | Categoría del vehículo |
| condition | string | NEW o USED |
| price | number | Precio |
| currency | string | ARS o USD |
| cityId | number | ID de la ciudad |

> El resto de los campos son opcionales. Si no se envía `title`, se genera automáticamente. `contactHours` acepta texto libre, hasta 100 caracteres (ej. "Lunes a viernes de 9 a 18hs").

**Response 201** — Devuelve el vehículo completo igual que el PDP, con `status: "DRAFT"`.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## PATCH /vehicles/:id

Edita un vehículo existente. Solo el dueño o un admin pueden editarlo.

**Request**
```
PATCH /vehicles/uuid
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "price": 17000,
  "description": "Nuevo texto...",
  "contactHours": "Todos los días de 10 a 20hs",
  "negotiablePrice": true
}
```

> Solo enviá los campos que querés actualizar. Si cambia el precio, se guarda automáticamente en el historial.

**Response 200** — Devuelve el vehículo actualizado completo.

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |
| 404 | NOT_FOUND | Vehículo no encontrado |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## POST /vehicles/:id/publish

Publica el vehículo (pasa de `DRAFT`/`PAUSED`/etc. a `ACTIVE`), pero **solo si ya tiene subidas las 4 fotos obligatorias**: FRENTE, LATERAL, TRASERA e INTERIOR. También se usa para reactivar un vehículo pausado — es el único camino normal para llevar un vehículo a `ACTIVE`, tanto para el vendedor como para el admin.

**Request**
```
POST /vehicles/uuid/publish
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "ACTIVE", "moderationNotes": null }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |
| 404 | NOT_FOUND | Vehículo no encontrado |
| 409 | — | El vehículo ya está ACTIVE, o está SOLD/DELETED |
| 422 | — | Faltan fotos obligatorias (el mensaje detalla cuáles) |

---

## GET /vehicles/:id/images/missing-required

Devuelve qué categorías de fotos obligatorias todavía faltan subir. Útil para mostrarle al vendedor qué le falta antes de intentar publicar. Solo el dueño o admin.

**Request**
```
GET /vehicles/uuid/images/missing-required
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "missing": ["TRASERA", "INTERIOR"] }
}
```

> Si `missing` es un array vacío, el vehículo ya puede publicarse con `POST /vehicles/:id/publish`.

---

## PATCH /vehicles/:id/status

Cambia el estado de una publicación. **No se usa para activar/reactivar un vehículo** — para eso está `POST /vehicles/:id/publish`, que valida las fotos obligatorias.

**Request**
```
PATCH /vehicles/uuid/status
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "status": "PAUSED",
  "notes": "Motivo opcional"
}
```

**Permisos por estado**

| Estado | Vendedor | Admin |
|---|---|---|
| PAUSED | ✅ | ✅ |
| SOLD | ✅ | ✅ |
| DELETED | ✅ | ✅ |
| ACTIVE | ❌ | ⚠️ ver abajo |
| PENDING | ❌ | ✅ |
| REJECTED | ❌ | ✅ |

**Sobre ACTIVE vía este endpoint (solo admin):** el admin también pasa por la misma validación de fotos obligatorias que `publish`. Si el vehículo no tiene las 4 fotos, el request falla con `422` a menos que se envíe `force: true` **y** un `notes` explicando el motivo (queda guardado en `moderationNotes`, auditable). Esto es para casos operativos puntuales (ej. el vendedor mandó las fotos por WhatsApp y el admin publica manualmente mientras se completa la carga), no un atajo de uso normal.

```json
{
  "status": "ACTIVE",
  "force": true,
  "notes": "Cliente envió fotos por WhatsApp, se publica manualmente mientras el vendedor sube el resto"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PAUSED",
    "moderationNotes": null
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | Sin permiso para ese estado |
| 404 | NOT_FOUND | Vehículo no encontrado |
| 422 | — | Intento de poner ACTIVE sin las fotos obligatorias y sin `force` |
| 422 | — | `force: true` sin `notes` |

---

## DELETE /vehicles/:id

Marca el vehículo como DELETED (soft delete). Solo el dueño o un admin.

**Request**
```
DELETE /vehicles/uuid
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "DELETED" }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 403 | FORBIDDEN | No es el dueño ni admin |
| 404 | NOT_FOUND | Vehículo no encontrado |

---

## POST /vehicles/:id/images

Sube una o varias imágenes al vehículo, **categorizadas por tipo**. Máximo 20 imágenes en total por vehículo, con límites por categoría.

**Request**
```
POST /vehicles/uuid/images
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Cada foto va bajo un campo con el nombre de su categoría (no bajo un campo genérico `images`):

| Campo (categoría) | Máximo por request | Obligatoria para publicar |
|---|---|---|
| FRENTE | 3 | ✅ |
| LATERAL | 3 | ✅ |
| TRASERA | 3 | ✅ |
| INTERIOR | 5 | ✅ |
| TABLERO | 2 | ❌ |
| MOTOR | 2 | ❌ |
| DOCUMENTACION | 5 | ❌ |
| OTRA | 5 | ❌ |

Formato de archivo: JPG, PNG o WEBP. Máx 5MB cada una.

> La primera imagen subida (de cualquier categoría) se marca como principal automáticamente si no había ninguna antes. Se puede llamar a este endpoint varias veces para ir completando categorías — no hace falta mandar todo junto.

**Ejemplo de FormData (frontend)**
```javascript
const formData = new FormData()
formData.append('FRENTE', fileFrente)
formData.append('LATERAL', fileLateral1)
formData.append('LATERAL', fileLateral2)
formData.append('INTERIOR', fileInterior)
```

**Response 201**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://res.cloudinary.com/...",
      "externalId": "vehicles/uuid/abc123",
      "provider": "cloudinary",
      "type": "FRENTE",
      "isPrimary": true,
      "sortOrder": 0
    }
  ]
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 400 | UPLOAD_ERROR | Tipo de archivo no permitido o supera 5MB |
| 400 | UPLOAD_ERROR | Se supera el máximo por categoría, o se usó un nombre de campo que no es una categoría válida |
| 400 | — | Se superan las 20 imágenes totales permitidas |
| 401 | UNAUTHORIZED | Token no provisto |

---

## PATCH /vehicles/:id/images/:imageId/primary

Cambia la imagen principal del vehículo.

**Request**
```
PATCH /vehicles/uuid/images/image-uuid/primary
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": { "id": "uuid", "url": "https://res.cloudinary.com/...", "isPrimary": true }
}
```

---

## DELETE /vehicles/:id/images/:imageId

Elimina una imagen del vehículo y de Cloudinary.

**Request**
```
DELETE /vehicles/uuid/images/image-uuid
Authorization: Bearer <accessToken>
```

> Si se elimina la imagen principal, la siguiente en orden se convierte en principal automáticamente. Si la imagen eliminada era de una categoría obligatoria y el vehículo ya estaba ACTIVE, el vehículo **no** se pausa automáticamente — pero al intentar reactivarlo más adelante (tras una pausa), `publish` va a exigir que se reponga.

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

## PATCH /vehicles/:id/images/reorder

Reordena las imágenes del vehículo (dentro de su misma categoría o entre categorías, el orden es global por vehículo).

**Request**
```
PATCH /vehicles/uuid/images/reorder
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "order": [
    { "id": "uuid-imagen-1", "sortOrder": 0 },
    { "id": "uuid-imagen-2", "sortOrder": 1 },
    { "id": "uuid-imagen-3", "sortOrder": 2 }
  ]
}
```

**Response 200**
```json
{
  "success": true,
  "data": { "reordered": true }
}
```

---

## GET /vehicles/:id/videos

Devuelve los videos de un vehículo ordenados por sortOrder.

**Request**
```
GET /vehicles/uuid/videos
```

Sin body. Sin autenticación requerida.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://res.cloudinary.com/...",
      "sortOrder": 0,
      "createdAt": "2026-06-06T00:00:00.000Z"
    }
  ]
}
```

---

## POST /vehicles/:id/videos

Sube uno o varios videos al vehículo. Máximo 3 videos en total.

**Request**
```
POST /vehicles/uuid/videos
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

| Campo | Tipo | Descripción |
|---|---|---|
| videos | File[] | MP4, MOV o WEBM. Máx 50MB cada uno |

**Response 201**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://res.cloudinary.com/...",
      "externalId": "vehicles/uuid/videos/abc123",
      "provider": "cloudinary",
      "sortOrder": 0,
      "createdAt": "2026-06-06T00:00:00.000Z"
    }
  ]
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 400 | UPLOAD_ERROR | Tipo de archivo no permitido o supera 50MB |
| 400 | — | Se superan los 3 videos permitidos |
| 401 | UNAUTHORIZED | Token no provisto |

---

## DELETE /vehicles/:id/videos/:videoId

Elimina un video del vehículo y de Cloudinary.

**Request**
```
DELETE /vehicles/uuid/videos/video-uuid
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto |
| 404 | — | Video no encontrado |

---

## PATCH /vehicles/:id/videos/reorder

Reordena los videos del vehículo.

**Request**
```
PATCH /vehicles/uuid/videos/reorder
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "order": [
    { "id": "uuid-video-1", "sortOrder": 0 },
    { "id": "uuid-video-2", "sortOrder": 1 }
  ]
}
```

**Response 200**
```json
{
  "success": true,
  "data": { "reordered": true }
}
```

---

## GET /vehicles/:id/stats/views

Devuelve las estadísticas de vistas de un vehículo. Solo el dueño o admin.

**Request**
```
GET /vehicles/uuid/stats/views
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 142,
    "last7days": 38,
    "last30days": 97
  }
}
```

---

## GET /vehicles/:id/stats/whatsapp

Devuelve las estadísticas de clicks en WhatsApp. Solo el dueño o admin.

**Request**
```
GET /vehicles/uuid/stats/whatsapp
Authorization: Bearer <accessToken>
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "total": 24,
    "last7days": 8,
    "last30days": 19
  }
}
```

---

## Flujo completo de publicación

```
1. GET  /catalog/brands                     → cargar marcas
2. GET  /catalog/brands/:id/models          → cargar modelos
3. GET  /catalog/segments?category=AUTO     → cargar segmentos
4. GET  /catalog/attribute-definitions?category=AUTO → cargar atributos
5. GET  /catalog/features                   → cargar equipamiento
6. GET  /location/provinces                 → cargar departamentos
7. GET  /location/provinces/:id/cities      → cargar municipios
8. POST /vehicles                           → crear vehículo (status: DRAFT)
9. POST /vehicles/:id/images                → subir fotos por categoría (FRENTE, LATERAL, TRASERA, INTERIOR obligatorias)
10. GET  /vehicles/:id/images/missing-required → (opcional) chequear qué falta antes de publicar
11. POST /vehicles/:id/videos               → subir videos (opcional)
12. POST /vehicles/:id/publish              → publicar (status: ACTIVE) — falla si faltan fotos obligatorias
```

## Flujo de gestión desde el panel del vendedor

```
Ver mis publicaciones:
→ GET /profile/vehicles

Editar datos:
→ PATCH /vehicles/:id

Pausar:
→ PATCH /vehicles/:id/status  { "status": "PAUSED" }

Reactivar (requiere las 4 fotos obligatorias ya cargadas):
→ POST /vehicles/:id/publish

Marcar como vendido:
→ PATCH /vehicles/:id/status  { "status": "SOLD" }

Eliminar:
→ DELETE /vehicles/:id

Gestionar imágenes:
→ POST   /vehicles/:id/images        (por categoría: FRENTE, LATERAL, TRASERA, INTERIOR, TABLERO, MOTOR, DOCUMENTACION, OTRA)
→ GET    /vehicles/:id/images/missing-required
→ PATCH  /vehicles/:id/images/:imageId/primary
→ DELETE /vehicles/:id/images/:imageId
→ PATCH  /vehicles/:id/images/reorder

Gestionar videos:
→ POST   /vehicles/:id/videos
→ DELETE /vehicles/:id/videos/:videoId
→ PATCH  /vehicles/:id/videos/reorder

Ver métricas:
→ GET /vehicles/:id/stats/views
→ GET /vehicles/:id/stats/whatsapp
```

## Notas de implementación

- El vehículo se crea en estado `DRAFT` y no aparece en el listado público (`GET /vehicles`) ni en búsquedas hasta que se publica con `POST /vehicles/:id/publish`.
- Publicar (por primera vez o al reactivar tras una pausa) exige tener subidas las 4 fotos obligatorias: FRENTE, LATERAL, TRASERA e INTERIOR.
- El admin puede forzar la activación sin las fotos obligatorias con `force: true` + `notes` en `PATCH /vehicles/:id/status`, quedando el motivo registrado en `moderationNotes`. No es el camino normal — está pensado para excepciones operativas puntuales.
- El slug se genera automáticamente a partir del título y es único.
- El precio se guarda con 2 decimales. Al editar el precio, el historial se registra automáticamente.
- Las vistas no se cuentan si el mismo IP visitó en la última hora.
- Los clicks a WhatsApp están limitados a 20 cada 15 minutos por IP.
- Las imágenes y videos se eliminan de Cloudinary al borrarlos.
- El soft delete cambia el status a DELETED — el vehículo no se borra de la base de datos.
- Máximo 20 imágenes (repartidas entre las 8 categorías, con tope por categoría) y 3 videos por vehículo.
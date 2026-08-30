# Auth API — Documentación de endpoints

Base URL: `http://localhost:3000/api/v1`

---

## POST /auth/register

Crea un nuevo usuario en Supabase y su perfil en la base de datos.

**Request**
```
POST /auth/register
Content-Type: application/json
```

```json
{
  "email": "test@test.com",
  "password": "123456",
  "fullName": "Test User",
  "phone": "+50312345678"
}
```

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| email | string | ✅ | Email válido |
| password | string | ✅ | Mínimo 6 caracteres |
| fullName | string | ❌ | Mínimo 2 caracteres |
| phone | string | ❌ | — |

> **Confirmación de email según ambiente:** en `development`/`test`, el usuario queda confirmado automáticamente al registrarse (`email_confirm: true`), para poder probar sin revisar la casilla de correo. En `production`, el usuario **no** queda confirmado hasta que abre el mail de verificación que envía Supabase — hay que tener la plantilla de "Confirm signup" configurada en el dashboard de Supabase (Authentication → Email Templates) antes de salir a producción.

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "test@test.com",
    "fullName": "Test User",
    "phone": "+50312345678",
    "role": "USER",
    "type": "INDIVIDUAL",
    "createdAt": "2026-06-06T00:00:00.000Z"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 409 | EMAIL_TAKEN | El email ya está registrado |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## POST /auth/login

Inicia sesión y devuelve los tokens de acceso.

**Request**
```
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

| Campo | Tipo | Requerido |
|---|---|---|
| email | string | ✅ |
| password | string | ✅ |

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1700000000,
    "user": {
      "id": "uuid",
      "email": "test@test.com",
      "fullName": "Test User",
      "role": "USER",
      "type": "INDIVIDUAL"
    }
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | INVALID_CREDENTIALS | Email o contraseña incorrectos |
| 422 | VALIDATION_ERROR | Datos inválidos |

---

## POST /auth/refresh

Renueva el access token usando el refresh token.

**Request**
```
POST /auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1700000000
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | INVALID_REFRESH_TOKEN | Refresh token inválido o expirado |

---

## POST /auth/logout

Invalida el token en Supabase. Requiere autenticación. **Cierra sesión solo en el dispositivo actual** (`scope: 'local'`) — no afecta otras sesiones activas del mismo usuario en otros dispositivos.

**Request**
```
POST /auth/logout
Authorization: Bearer <accessToken>
```

Sin body.

**Response 200**
```json
{
  "success": true,
  "data": {
    "message": "Sesión cerrada correctamente"
  }
}
```

**Errores posibles**
| Status | Code | Descripción |
|---|---|---|
| 401 | UNAUTHORIZED | Token no provisto o inválido |

---

## GET /auth/me

Devuelve el perfil del usuario autenticado. Requiere autenticación.

**Request**
```
GET /auth/me
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
    "phone": "+50312345678",
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
| 404 | PROFILE_NOT_FOUND | Perfil no encontrado |

---

## Login con Google (OAuth)

El login con Google es manejado completamente por Supabase y el frontend.
**El backend no expone ningún endpoint para Google** — solo verifica el token resultante igual que con email/password.

### Flujo completo

```
1. Frontend llama:
   supabase.auth.signInWithOAuth({ provider: 'google' })

2. Supabase redirige al usuario a la pantalla de Google

3. El usuario autoriza el acceso en Google

4. Google redirige a Supabase:
   https://<proyecto>.supabase.co/auth/v1/callback

5. Supabase procesa el token y redirige al frontend:
   https://tu-frontend.com/auth/callback?access_token=...

6. El frontend extrae el accessToken de la sesión:
   const { data } = await supabase.auth.getSession()
   const accessToken = data.session.access_token

7. El frontend usa el accessToken igual que con email/password:
   Authorization: Bearer <accessToken>

8. El backend verifica el token con supabase.auth.getUser(token)
   → Si el perfil no existe en la DB (primer login), se crea automáticamente
   → Si ya existe, se retorna normalmente
```

### Creación automática de perfil en primer login

Cuando un usuario entra por primera vez con Google, no pasó por `/auth/register`,
por lo que no tiene perfil en la base de datos. El middleware lo maneja automáticamente:

```
Primera vez con Google:
→ supabase.auth.getUser(token) devuelve el usuario de Google
→ El middleware busca el perfil en la DB → no existe
→ El middleware lo crea automáticamente con:
   - id:       UUID generado por Supabase (vinculado a la cuenta de Google)
   - email:    email de la cuenta de Google
   - fullName: nombre de la cuenta de Google (si está disponible)
→ El request continúa normalmente
```

### Configuración necesaria (solo una vez)

**En Supabase:**
1. Ir a **Authentication → Providers → Google**
2. Habilitar el provider
3. Pegar el **Client ID** y **Client Secret** de Google Cloud

**En Google Cloud Console:**
1. Crear credencial OAuth → tipo **Web application**
2. Agregar en **Authorized redirect URIs**:
```
https://<proyecto>.supabase.co/auth/v1/callback
```
3. Copiar **Client ID** y **Client Secret** a Supabase

### Código en el frontend (React)

```typescript
// Iniciar login con Google
const handleGoogleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}

// Página /auth/callback — capturar la sesión después del redirect
const { data } = await supabase.auth.getSession()
const accessToken = data.session?.access_token

// Usar el token en tu API igual que siempre
const response = await fetch('/api/v1/auth/me', {
  headers: { Authorization: `Bearer ${accessToken}` }
})
```

---

## Flujo de uso recomendado

```
// Con email y password:
1. POST /auth/register  → crear cuenta
2. POST /auth/login     → obtener accessToken y refreshToken
3. GET  /auth/me        → verificar sesión con el accessToken
4. POST /auth/refresh   → cuando el accessToken expire, renovarlo con el refreshToken
5. POST /auth/logout    → cerrar sesión (solo en este dispositivo)

// Con Google:
1. Frontend: supabase.auth.signInWithOAuth({ provider: 'google' })
2. Frontend: captura el accessToken desde la sesión en /auth/callback
3. GET  /auth/me        → verificar sesión (perfil se crea automáticamente si es primera vez)
4. POST /auth/refresh   → renovar token igual que con email/password
5. POST /auth/logout    → cerrar sesión (solo en este dispositivo)
```

---

## Notas de implementación

- El `accessToken` tiene una duración corta (1 hora por defecto en Supabase).
- El `refreshToken` dura más tiempo (60 días por defecto en Supabase).
- Todos los endpoints protegidos requieren el header `Authorization: Bearer <accessToken>`.
- Los tokens son generados y verificados por Supabase — no por JWT propio.
- El login con Google no requiere endpoints adicionales en el backend.
- El perfil se crea automáticamente en el primer login con Google vía el middleware de autenticación.
- La confirmación de email al registrarse depende de `NODE_ENV`: automática en desarrollo/test, real (vía mail) en producción.
- `POST /auth/logout` cierra sesión solo en el dispositivo actual, no en todos los dispositivos donde el usuario esté logueado.
- `POST /auth/login` y `POST /auth/register` están limitados a 10 intentos cada 15 minutos por IP. `POST /auth/refresh` está limitado a 30 cada 15 minutos por IP.
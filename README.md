# 🧸 FazToys · Juguetería online

TP integrador de Diseño Backend 2026. E-commerce de juguetería hecho con
**Express + Supabase + front en JavaScript**, listo para desplegar en **Vercel**.

Todas las partes que la plantilla dejaba como `TODO` ya están implementadas
(ver la tabla de abajo).

## Estructura

    faztoys/
    ├── config/supabaseClient.js        la conexión a Supabase (clave secreta)
    ├── middlewares/verificarUsuario.js ¿quién compra?                  (hecho)
    ├── models/
    │   ├── productosModel.js           el catálogo                     (hecho)
    │   ├── authModel.js                registro y login con Auth       (hecho)
    │   └── pedidosModel.js             la compra                       (hecho)
    ├── controllers/                    validan y arman las respuestas  (listos)
    ├── routes/tiendaRoutes.js          el mapa de rutas                (listo)
    ├── utils/errores.js                errores con código              (listo)
    ├── public/
    │   ├── index.html                  la página                       (lista)
    │   ├── estilos.css                 los colores de la tienda        (listos)
    │   └── app.js                      el front con fetch              (hecho)
    ├── db/esquema.sql                  las tablas y datos de ejemplo
    ├── index.js                        el servidor (local y Vercel)
    ├── .env.example                    modelo de credenciales
    └── package.json

## Qué se implementó

| Archivo | Función | Estado |
|---|---|---|
| `models/productosModel.js` | `obtenerProductos` | ✅ hecho |
| `models/authModel.js` | `registrar` e `iniciarSesion` | ✅ hecho |
| `middlewares/verificarUsuario.js` | `verificarUsuario` | ✅ hecho |
| `models/pedidosModel.js` | `crearPedido` | ✅ hecho |
| `public/app.js` | `cargarProductos`, `registrar`, `iniciarSesion`, `comprar` | ✅ hecho |

Detalles de la implementación:

- **Registro:** Supabase Auth crea el usuario y se guarda su perfil (`perfiles`, rol `cliente`).
- **Login:** devuelve el token de Auth (o 401 si los datos no coinciden); el front lo manda como `Authorization: Bearer <token>`.
- **Compra (`crearPedido`):** el precio y el stock salen siempre de la base (nunca del front).
  Valida productos, cantidades y stock, calcula el total, guarda el pedido y sus items con el
  precio del momento, y descuenta el stock.

## Puesta en marcha

1. **Base.** Crear un proyecto nuevo en Supabase (región São Paulo) y correr
   `db/esquema.sql` en el **SQL Editor**.
2. **Imágenes.** Las imágenes de ejemplo están en `public/img/` y ya vienen cargadas en
   `imagen_url`, así que no hace falta nada más. (Opcional: usar un bucket público `productos`
   en **Storage** y reemplazar las URLs por las de las fotos reales.)
3. **Credenciales.** Copiar `.env.example` como `.env` y completar la URL
   y la **clave secreta** (Project Settings → API Keys).
4. **Instalar y levantar:**

        npm install
        npm start

5. Abrir http://localhost:3000

## Las rutas

| Método | Ruta | Qué hace | Protegida |
|---|---|---|---|
| POST | `/registro` | crea un usuario | no |
| POST | `/login` | devuelve el token | no |
| GET | `/categorias` | lista las categorías | no |
| GET | `/productos` | lista los productos (`?categoria=2` filtra) | no |
| POST | `/pedidos` | registra una compra | **sí** (token) |

## Deploy en Vercel

1. Subir el proyecto a un repositorio de GitHub (el `.gitignore` ya deja afuera
   `node_modules` y `.env`).
2. En Vercel: **Add New → Project**, elegir el repositorio. Vercel detecta Express solo.
3. En **Environment Variables**, cargar `SUPABASE_URL` y `SUPABASE_KEY`
   con los mismos valores del `.env`.
4. **Deploy.** Vercel sirve la carpeta `public/` y ejecuta la API.

## Personalización de FazToys

- Nombre de la tienda: `<title>` y `<h1>` en `public/index.html`.
- Colores (violeta / naranja / amarillo): variables del principio de `public/estilos.css`.
- 5 categorías y 10 productos de juguetería: los `insert` de `db/esquema.sql`.

## Mínimo obligatorio del TP

- [ ] Catálogo con imágenes y filtro por categoría
- [ ] Carrito
- [ ] Registro y login
- [ ] Compra que controla el stock y calcula el total en el backend
- [ ] Deploy en Vercel funcionando
- [ ] Este README actualizado con el link del deploy y los integrantes

## Extras para mejor nota

- Panel admin con rol (`perfiles.rol = 'admin'`, responde 403 a los clientes)
- Buscador por nombre
- "Mis pedidos"
- Página de detalle de producto

---
Integrantes: _completar_ · Link del deploy: _completar_

Prof. Julia Panei · UTN Neuquén · Diseño Backend 2026

## Endpoints de la API

| Método | Ruta | Protegida | Qué hace |
|---|---|---|---|
| GET | `/categorias` | no | categorías para el filtro |
| GET | `/productos` | no | catálogo con su categoría. Admite `?categoria=2` |
| GET | `/productos/:id` | no | detalle de un producto (404 si no existe) |
| POST | `/registro` | no | crea usuario + perfil |
| POST | `/login` | no | devuelve el token |
| POST | `/pedidos` | sí (Bearer) | registra la compra |
| GET | `/mis-pedidos` | sí (Bearer) | pedidos del usuario logueado, con sus ítems |

## Las siete pruebas (Thunder Client)

| # | Request | Body | Esperado |
|---|---|---|---|
| 1 | GET `/productos` | — | 200 con `categorias` |
| 2 | POST `/registro` | `{"email":"beto@mail.com","password":"123456","nombre":"Beto"}` | 201 |
| 3 | POST `/login` | `{"email":"beto@mail.com","password":"123456"}` | 200 y el token |
| 4 | POST `/pedidos` sin token | `{"items":[{"producto_id":1,"cantidad":2}]}` | 401 |
| 5 | POST `/pedidos` con token | `{"items":[{"producto_id":1,"cantidad":2}]}` | 201 y el pedido |
| 6 | POST `/pedidos` con token | `{"items":[{"producto_id":6,"cantidad":99}]}` | 400 sin stock |
| 7 | POST `/login` | `{"email":"beto@mail.com","password":"otra"}` | 401 |

Para las pruebas "con token": pestaña **Auth → Bearer** y pegar el token del login (dura una hora).
Después de la prueba 5, el stock del producto 1 baja en 2 y aparece el pedido en `pedidos` / `pedido_items`.

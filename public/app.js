// =========================================================
// FRONT DE LA TIENDA
// El front NUNCA habla con Supabase: todo se le pide a nuestra API con fetch.
// =========================================================

// ---------- ESTADO ----------
const catalogo = {};  // los productos que ya vinieron de la API, por id (para nombres y precios del carrito)
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];   // [ { producto_id, cantidad } ]
let token = localStorage.getItem('token');                         // lo guardamos al hacer login
let usuarioEmail = localStorage.getItem('email');
let categoriaActual = null;
let ultimaLista = [];   // lo ultimo que vino de la API: el buscador filtra sobre esto


// =========================================================
// CATALOGO
// =========================================================

// Pide los productos a la API y los dibuja.
// Si categoriaId tiene valor, pide solo los de esa categoria: /productos?categoria=2
async function cargarProductos(categoriaId) {
  categoriaActual = categoriaId || null;   // para marcar el boton activo
  let url = '/productos';
  if (categoriaId) url += '?categoria=' + categoriaId;
  const res = await fetch(url);
  if (!res.ok) return mostrarMensaje(await res.text(), 'error');
  const productos = await res.json();
  ultimaLista = productos;                 // para el buscador
  pintarProductos(productos);              // ya resuelta
  pintarCategoriaActiva();                 // ya resuelta
}

// Buscador: filtra por nombre dentro de los productos que ya llegaron (sin fetch)
function buscar(texto) {
  const t = texto.toLowerCase();
  const filtrados = ultimaLista.filter(
    p => p.nombre.toLowerCase().includes(t));
  pintarProductos(filtrados);
}

// Dibuja las tarjetas (ya resuelto)
function pintarProductos(lista) {
  const grilla = document.getElementById('productos');
  lista.forEach(p => { catalogo[p.id] = p; });   // los recordamos para el carrito
  pintarCarrito();
  if (lista.length === 0) {
    grilla.innerHTML = '<p class="vacio">No hay productos para mostrar.</p>';
    return;
  }
  grilla.innerHTML = '';
  lista.forEach(p => {
    const sinStock = p.stock < 1;
    grilla.innerHTML += `
      <article class="tarjeta">
        <img src="${p.imagen_url || ''}" alt="${p.nombre}">
        <div class="info">
          <span class="categoria">${p.categorias ? p.categorias.nombre : ''}</span>
          <h3>${p.nombre}</h3>
          <p class="descripcion">${p.descripcion || ''}</p>
          <span class="precio">$${p.precio}</span>
          <span class="stock">${sinStock ? 'Sin stock' : 'Quedan ' + p.stock}</span>
          <button class="btn btn-principal" onclick="agregar(${p.id})" ${sinStock ? 'disabled' : ''}>
            Agregar al carrito
          </button>
        </div>
      </article>`;
  });
}

// Pide las categorias y arma los botones del filtro (ya resuelto)
async function cargarCategorias() {
  const res = await fetch('/categorias');
  if (!res.ok) return;
  const categorias = await res.json();
  const nav = document.getElementById('categorias');
  nav.innerHTML = '<button data-id="" onclick="cargarProductos()">Todos</button>';
  categorias.forEach(c => {
    nav.innerHTML += `<button data-id="${c.id}" onclick="cargarProductos(${c.id})">${c.nombre}</button>`;
  });
  pintarCategoriaActiva();
}

function pintarCategoriaActiva() {
  document.querySelectorAll('#categorias button').forEach(b => {
    const id = b.dataset.id ? Number(b.dataset.id) : null;
    b.classList.toggle('activa', id === categoriaActual);
  });
}


// =========================================================
// CARRITO (vive en el navegador: no toca la base hasta comprar)
// =========================================================

function guardarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  pintarCarrito();
}

function agregar(id) {
  const item = carrito.find(i => i.producto_id === id);
  if (item) item.cantidad++;
  else carrito.push({ producto_id: id, cantidad: 1 });
  guardarCarrito();
  mostrarMensaje('Producto agregado al carrito', 'ok');
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.producto_id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad < 1) carrito = carrito.filter(i => i.producto_id !== id);
  guardarCarrito();
}

// Dibuja el carrito. El total es SOLO para mostrar:
// el total de verdad lo calcula el backend con los precios de la base.
function pintarCarrito() {
  const lista = document.getElementById('carrito-lista');
  let total = 0;
  let unidades = 0;
  lista.innerHTML = '';
  carrito.forEach(item => {
    const p = catalogo[item.producto_id];
    const nombre = p ? p.nombre : 'Producto ' + item.producto_id;
    const subtotal = p ? p.precio * item.cantidad : 0;
    total += subtotal;
    unidades += item.cantidad;
    lista.innerHTML += `
      <li>
        <span>${nombre}<br><small>$${subtotal}</small></span>
        <span class="cantidad">
          <button onclick="cambiarCantidad(${item.producto_id}, -1)">−</button>
          ${item.cantidad}
          <button onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
        </span>
      </li>`;
  });
  if (carrito.length === 0) lista.innerHTML = '<li>Tu carrito está vacío</li>';
  document.getElementById('carrito-total').textContent = '$' + total;
  document.getElementById('contador').textContent = unidades;
}

function alternarCarrito() {
  document.getElementById('carrito').classList.toggle('oculto');
}


// =========================================================
// USUARIOS: registro, login y salida
// =========================================================

// Manda nombre, email y contraseña a POST /registro.
// Si sale bien (201), avisa y muestra el formulario de login.
async function registrar(evento) {
  evento.preventDefault();      // que el formulario no recargue la pagina
  const nombre = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  try {
    const res = await fetch('/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    if (res.status === 201) {
      mostrarMensaje('¡Cuenta creada! Ahora ingresá con tu email', 'ok');
      document.getElementById('form-registro').reset();
      document.getElementById('login-email').value = email;
      mostrarRegistro(false);
    } else {
      mostrarMensaje(await res.text(), 'error');
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
  }
}

// Manda email y contraseña a POST /login.
// Si sale bien, guarda el token en localStorage y actualiza la barra.
async function iniciarSesion(evento) {
  evento.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      mostrarMensaje(await res.text(), 'error');
      return;
    }
    const datos = await res.json();
    token = datos.token;
    usuarioEmail = email;
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    document.getElementById('form-login').reset();
    cerrarModal();
    actualizarSesion();
    mostrarMensaje('¡Bienvenido/a a FazToys!', 'ok');
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
  }
}

function cerrarSesion() {
  token = null;
  usuarioEmail = null;
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  actualizarSesion();
  mostrarMensaje('Cerraste sesión', 'ok');
}

function actualizarSesion() {
  const logueado = Boolean(token);
  document.getElementById('saludo').textContent = logueado ? usuarioEmail : '';
  document.getElementById('btn-ingresar').classList.toggle('oculto', logueado);
  document.getElementById('btn-salir').classList.toggle('oculto', !logueado);
}


// =========================================================
// COMPRA
// =========================================================

// Manda el carrito a POST /pedidos con el token en el header Authorization.
// 201: compra hecha (vaciar carrito y recargar productos para ver el stock nuevo)
// 401: no hay sesion (abrir el login)
// 400: algo del carrito no sirve (mostrar el mensaje del servidor)
async function comprar() {
  if (carrito.length === 0) return mostrarMensaje('Tu carrito está vacío', 'error');
  if (!token) {
    mostrarMensaje('Ingresá o creá tu cuenta para comprar', 'error');
    abrirModal();
    return;
  }
  try {
    const res = await fetch('/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ items: carrito })
    });

    if (res.status === 201) {
      const pedido = await res.json();
      carrito = [];
      guardarCarrito();
      alternarCarrito();                    // cerramos el panel
      cargarProductos(categoriaActual);     // recargamos para ver el stock nuevo
      mostrarMensaje('¡Compra realizada! Pedido #' + pedido.id + ' · Total $' + pedido.total, 'ok');
    } else if (res.status === 401) {
      // Token vencido o invalido: limpiamos la sesion y pedimos login
      token = null;
      usuarioEmail = null;
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      actualizarSesion();
      mostrarMensaje('Tu sesión venció. Ingresá de nuevo para comprar', 'error');
      abrirModal();
    } else {
      mostrarMensaje(await res.text(), 'error');   // 400: stock, producto inexistente, etc.
    }
  } catch (error) {
    mostrarMensaje('No se pudo conectar con el servidor', 'error');
  }
}


// =========================================================
// AYUDANTES DE PANTALLA (ya resueltos)
// =========================================================

function mostrarMensaje(texto, tipo) {
  const caja = document.getElementById('mensaje');
  caja.textContent = texto;
  caja.className = 'mensaje ' + tipo;
  clearTimeout(caja.temporizador);
  caja.temporizador = setTimeout(() => caja.classList.add('oculto'), 4000);
}

function abrirModal() {
  document.getElementById('modal').classList.remove('oculto');
}

function cerrarModal() {
  document.getElementById('modal').classList.add('oculto');
}

function mostrarRegistro(mostrar) {
  document.getElementById('form-registro').classList.toggle('oculto', !mostrar);
  document.getElementById('form-login').classList.toggle('oculto', mostrar);
}


// ---------- AL ABRIR LA PAGINA ----------
cargarCategorias();
cargarProductos();
pintarCarrito();
actualizarSesion();

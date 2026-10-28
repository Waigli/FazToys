// RUTAS: el mapa de direcciones. Nada de logica aca.
const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const productos = require('../controllers/productosController');
const pedidos = require('../controllers/pedidosController');
const verificarUsuario = require('../middlewares/verificarUsuario');

router.post('/registro', auth.registro);
router.post('/login', auth.login);
router.get('/categorias', productos.verCategorias);
router.get('/productos', productos.verProductos);
router.get('/productos/:id', productos.verProducto);
router.post('/pedidos', verificarUsuario, pedidos.crearPedido);   // protegida
router.get('/mis-pedidos', verificarUsuario, pedidos.verMisPedidos);   // protegida

module.exports = router;

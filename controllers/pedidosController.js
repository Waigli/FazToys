// CONTROLLER DE PEDIDOS
const model = require('../models/pedidosModel');

// POST /pedidos  (protegida: el usuario sale del token, nunca del body)
async function crearPedido(req, res) {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send('El carrito esta vacio');
  }
  try {
    const pedido = await model.crearPedido(req.usuario.id, items);
    res.status(201).json(pedido);
  } catch (error) {
    if (error.status) return res.status(error.status).send(error.message);
    res.status(500).send('Error al crear el pedido');
  }
}

// GET /mis-pedidos  (protegida: solo ve los suyos, el id sale del token)
async function verMisPedidos(req, res) {
  try {
    const pedidos = await model.obtenerPedidosDeUsuario(req.usuario.id);
    res.status(200).json(pedidos);
  } catch (error) {
    res.status(500).send('Error al obtener tus pedidos');
  }
}

module.exports = { crearPedido, verMisPedidos };

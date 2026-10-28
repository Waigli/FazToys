// CONTROLLER DE PRODUCTOS
const model = require('../models/productosModel');

async function verCategorias(req, res) {
  try {
    const categorias = await model.obtenerCategorias();
    res.status(200).json(categorias);
  } catch (error) {
    res.status(500).send('Error al obtener las categorias');
  }
}

// GET /productos  o  GET /productos?categoria=2
async function verProductos(req, res) {
  const categoriaId = req.query.categoria ? Number(req.query.categoria) : null;
  try {
    const productos = await model.obtenerProductos(categoriaId);
    res.status(200).json(productos);
  } catch (error) {
    if (error.status) return res.status(error.status).send(error.message);
    res.status(500).send('Error al obtener los productos');
  }
}

// GET /productos/:id  (404 si no existe)
async function verProducto(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).send('El id no es valido');
  try {
    const producto = await model.obtenerProducto(id);
    if (!producto) return res.status(404).send('El producto no existe');
    res.status(200).json(producto);
  } catch (error) {
    if (error.status) return res.status(error.status).send(error.message);
    res.status(500).send('Error al obtener el producto');
  }
}

module.exports = { verCategorias, verProductos, verProducto };

// MODEL DE PRODUCTOS: el catalogo
const supabase = require('../config/supabaseClient');
const { faltaImplementar } = require('../utils/errores');

// Las categorias para el filtro del front (ya resuelto)
async function obtenerCategorias() {
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre')
    .order('nombre');
  if (error) throw error;
  return data;
}

// Clase 2 · Paso 1: los productos activos, con el nombre de su categoria.
// Si llega categoriaId, filtra por esa categoria.
async function obtenerProductos(categoriaId) {
  const columnas = 'id, nombre, descripcion, precio, stock,' +
    ' imagen_url, categorias(nombre)';
  let consulta = supabase
    .from('productos')
    .select(columnas)
    .eq('activo', true)
    .order('nombre');

  if (categoriaId) {
    consulta = consulta.eq('categoria_id', categoriaId);   // filtro opcional
  }

  const { data, error } = await consulta;
  if (error) throw error;
  return data;
}

// Extension opcional: un solo producto para la pagina de detalle
async function obtenerProducto(id) {
  const columnas = 'id, nombre, descripcion, precio, stock,' +
    ' imagen_url, categorias(nombre)';
  const { data, error } = await supabase
    .from('productos')
    .select(columnas)
    .eq('id', id)
    .eq('activo', true)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;   // no existe: el controller responde 404
    throw error;
  }
  return data;
}

module.exports = { obtenerCategorias, obtenerProductos, obtenerProducto };

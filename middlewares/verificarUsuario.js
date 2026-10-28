// MIDDLEWARE: controla quien compra
const supabase = require('../config/supabaseClient');

// Clase 2 · Paso 4: lee el token, le pregunta a Auth de quien es y deja el usuario en req.usuario
async function verificarUsuario(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).send('Tenes que iniciar sesion');

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return res.status(401).send('Sesion invalida');

  req.usuario = data.user;   // desde aca, el controller sabe quien compra
  next();
}

module.exports = verificarUsuario;

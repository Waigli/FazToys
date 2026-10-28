-- =========================================================
-- BASE DE FAZTOYS (jugueteria)
-- Pegalo en el SQL Editor de Supabase y apreta Run.
-- =========================================================

-- ===== TABLAS =====
create table categorias (
  id     bigint generated always as identity primary key,
  nombre text not null unique
);

create table productos (
  id           bigint generated always as identity primary key,
  nombre       text not null,
  descripcion  text,
  precio       numeric(10,2) not null check (precio >= 0),
  stock        int not null default 0 check (stock >= 0),
  imagen_url   text,
  categoria_id bigint references categorias(id),
  activo       boolean not null default true
);

-- Los usuarios los maneja Supabase Auth (auth.users).
-- Aca guardamos lo que Auth no guarda: el nombre y el rol.
create table perfiles (
  id     uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol    text not null default 'cliente' check (rol in ('cliente', 'admin'))
);

create table pedidos (
  id         bigint generated always as identity primary key,
  usuario_id uuid not null references auth.users(id),
  total      numeric(10,2) not null check (total >= 0),
  estado     text not null default 'pendiente'
             check (estado in ('pendiente', 'confirmado', 'cancelado')),
  creado     timestamptz not null default now()
);

create table pedido_items (
  id              bigint generated always as identity primary key,
  pedido_id       bigint not null references pedidos(id) on delete cascade,
  producto_id     bigint not null references productos(id),
  cantidad        int not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null check (precio_unitario >= 0)  -- la foto del precio
);

-- ===== SEGURIDAD: cerramos las tablas al publico =====
-- Con la clave publica no se puede leer ni escribir nada.
-- Nuestro backend entra igual porque usa la clave secreta.
alter table categorias   enable row level security;
alter table productos    enable row level security;
alter table perfiles     enable row level security;
alter table pedidos      enable row level security;
alter table pedido_items enable row level security;

-- ===== DATOS DE FAZTOYS =====
insert into categorias (nombre) values
  ('Peluches'), ('Muñecas y figuras'), ('Construcción y puzzles'),
  ('Juegos de mesa'), ('Vehículos y aire libre');

insert into productos (nombre, descripcion, precio, stock, imagen_url, categoria_id) values
  ('Osito de peluche gigante', '80 cm, suave y abrazable', 32000, 8, '/img/osito-peluche.svg', 1),
  ('Unicornio de peluche', 'Melena de colores, 40 cm', 18500, 14, '/img/unicornio.svg', 1),
  ('Muñeca articulada', 'Con vestido y accesorios', 24000, 10, '/img/muneca.svg', 2),
  ('Muñeco superhéroe', 'Articulado, 30 cm', 19000, 12, '/img/muneco-heroe.svg', 2),
  ('Set de bloques 500 piezas', 'Compatible con las marcas más usadas', 42000, 6, '/img/bloques.svg', 3),
  ('Rompecabezas 1000 piezas', 'Paisaje de montaña', 12500, 18, '/img/rompecabezas.svg', 3),
  ('Ajedrez de madera', 'Tablero plegable con fichas', 21000, 9, '/img/ajedrez.svg', 4),
  ('Mazo de cartas Truco', 'Naipes españoles plastificados', 4500, 40, '/img/juego-cartas.svg', 4),
  ('Auto a control remoto', 'Recargable, hasta 25 km/h', 36000, 7, '/img/auto-control.svg', 5),
  ('Pelota de fútbol N°5', 'Cosida a mano, uso recreativo', 15000, 25, '/img/pelota.svg', 5);

-- ===== IMAGENES =====
-- Las imagenes de ejemplo estan en public/img (se sirven solas, no hace falta Storage).
-- Si preferis usar Storage: subi las fotos al bucket publico "productos" y reemplaza la URL:
-- update productos
-- set imagen_url = 'https://xxxx.supabase.co/storage/v1/object/public/productos/osito.jpg'
-- where id = 1;

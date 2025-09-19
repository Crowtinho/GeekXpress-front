-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 12-09-2025 a las 20:20:51
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `geekxpress`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito`
--

DROP TABLE IF EXISTS `carrito`;
CREATE TABLE IF NOT EXISTS `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_carrito`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_detalle`
--

DROP TABLE IF EXISTS `carrito_detalle`;
CREATE TABLE IF NOT EXISTS `carrito_detalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_carrito` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_carrito` (`id_carrito`),
  KEY `id_producto` (`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`) VALUES
(1, 'Anime'),
(2, 'Videojuegos'),
(3, 'Cómics'),
(4, 'Cartas'),
(5, 'Accesorios');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

DROP TABLE IF EXISTS `pagos`;
CREATE TABLE IF NOT EXISTS `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `metodo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('pendiente','aprobado','rechazado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pendiente',
  PRIMARY KEY (`id_pago`),
  KEY `id_pedido` (`id_pedido`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha_pedido` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','enviado','entregado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pendiente',
  PRIMARY KEY (`id_pedido`),
  KEY `id_usuario` (`id_usuario`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalle`
--

DROP TABLE IF EXISTS `pedido_detalle`;
CREATE TABLE IF NOT EXISTS `pedido_detalle` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int DEFAULT NULL,
  `id_producto` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_pedido` (`id_pedido`),
  KEY `id_producto` (`id_producto`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

DROP TABLE IF EXISTS `productos`;
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `precio` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `id_categoria` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`)
) ENGINE=MyISAM AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `descripcion`, `precio`, `stock`, `id_categoria`, `fecha_creacion`) VALUES
(1, 'Manga JoJo\'s Bizarre Adventure N.° 1', 'Manga original en español', 80000.00, 10, 1, '2025-09-12 05:00:00'),
(2, 'Manga Fullmetal Alchemist', 'Aventuras de los hermanos alquimistas Edward y Alphonse', 60000.00, 15, 1, '2025-09-12 05:00:00'),
(3, 'Manga Naruto Vol. 1', 'La historia de un joven ninja que sueña con convertirse en Hokage', 49500.00, 12, 1, '2025-09-12 05:00:00'),
(4, 'Manga Tokyo Ghoul Vol. 1', 'Ken Kaneki se convierte en medio ghoul tras un encuentro que cambia su vida', 55000.00, 10, 1, '2025-09-12 05:00:00'),
(5, 'Manga Pokémon Red Vol. 1', 'Las aventuras de Red y sus amigos Pokémon contra el malvado Equipo Rocket', 42000.00, 18, 1, '2025-09-12 05:00:00'),
(6, 'Manga Doraemon Color Vol. 1', 'Historias inéditas del gato cósmico en su color original', 49000.00, 14, 1, '2025-09-12 05:00:00'),
(7, 'Manga Dragon Ball Vol. 1', 'Las aventuras de Goku y Bulma en la búsqueda de las esferas del Dragón', 100500.00, 8, 1, '2025-09-12 05:00:00'),
(8, 'Manga Death Note Vol. 1', 'Light Yagami encuentra un cuaderno con el poder de la vida y la muerte', 47200.00, 12, 1, '2025-09-12 05:00:00'),
(9, 'Manga Berserk Vol. 1', 'Guts, el Espadachín Negro, busca venganza en un mundo oscuro y demoníaco', 106000.00, 6, 1, '2025-09-12 05:00:00'),
(10, 'Manga One Piece Vol. 1', 'Monkey D. Luffy inicia su aventura para convertirse en el Rey de los Piratas', 50000.00, 15, 1, '2025-09-12 05:00:00'),
(11, 'Manga Slam Dunk Vol. 1', 'Hanamichi Sakuragi descubre el baloncesto para conquistar a una chica', 79500.00, 9, 1, '2025-09-12 05:00:00'),
(12, 'Elden Ring: Shadow of the Erdtree Edition', 'Edición física con expansión incluida', 200000.00, 15, 2, '2025-09-12 05:00:00'),
(13, 'The Legend of Zelda: Tears of the Kingdom', 'Aventura épica en mundo abierto para Nintendo Switch', 180000.00, 20, 2, '2025-09-12 05:00:00'),
(14, 'Final Fantasy VII Rebirth', 'Segunda parte del remake de FFVII para PS5', 195000.00, 12, 2, '2025-09-12 05:00:00'),
(15, 'Mario Kart 8 Deluxe', 'Juego de carreras multijugador para Nintendo Switch', 150000.00, 18, 2, '2025-09-12 05:00:00'),
(16, 'Hogwarts Legacy', 'RPG de mundo abierto en el universo de Harry Potter', 175000.00, 16, 2, '2025-09-12 05:00:00'),
(17, 'Spider-Man 2', 'Aventura de acción exclusiva para PS5', 190000.00, 10, 2, '2025-09-12 05:00:00'),
(18, 'Call of Duty: Modern Warfare III', 'Shooter en primera persona con campaña y multijugador', 185000.00, 14, 2, '2025-09-12 05:00:00'),
(19, 'Resident Evil 4 Remake', 'Versión renovada del clásico survival horror', 170000.00, 13, 2, '2025-09-12 05:00:00'),
(20, 'Super Smash Bros. Ultimate', 'Juego de lucha con personajes icónicos de Nintendo', 160000.00, 19, 2, '2025-09-12 05:00:00'),
(21, 'Gran Turismo 7', 'Simulador de conducción realista para PS5', 200000.00, 8, 2, '2025-09-12 05:00:00'),
(22, 'Mortal Kombat 1', 'Reinicio de la saga de lucha con nuevos modos y gráficos', 180000.00, 9, 2, '2025-09-12 05:00:00'),
(23, 'All-Star Superman Deluxe', 'Novela gráfica del Hombre de Acero por Grant Morrison y Frank Quitely', 188000.00, 5, 3, '2025-09-12 05:00:00'),
(24, 'Absolute Batman', 'Nueva versión de Bruce Wayne sin recursos que debe valerse de su ingenio', 105000.00, 6, 3, '2025-09-12 05:00:00'),
(25, 'Thor Vol. 1', 'Thor se enfrenta al Juggernaut y a los ejércitos de duendes de fuego', 110000.00, 7, 3, '2025-09-12 05:00:00'),
(26, 'Green Arrow Year One', 'Oliver Queen varado en una isla desierta se convierte en el héroe Green Arrow', 89900.00, 8, 3, '2025-09-12 05:00:00'),
(27, 'Hulk vs Man-Thing', 'Hulk debe impedir que la Madre de los Horrores sumerja al mundo en la oscuridad', 62000.00, 10, 3, '2025-09-12 05:00:00'),
(28, 'Iron Man Vol. 1', 'Tony Stark lo ha perdido todo pero los asesinos vienen por él', 70000.00, 9, 3, '2025-09-12 05:00:00'),
(29, 'Avengers vs Thanos Collection', 'Adaptación al cómic de la película con historias clave sobre Thanos', 100000.00, 8, 3, '2025-09-12 05:00:00'),
(30, 'Fantastic Four Omnibus', 'Colección completa de los momentos más icónicos de Los 4 Fantásticos por Lee y Kirby', 839000.00, 3, 3, '2025-09-12 05:00:00'),
(31, 'Sandman Vol. 1', 'Obra maestra de Neil Gaiman que combina mitos modernos y fantasía oscura', 115000.00, 7, 3, '2025-09-12 05:00:00'),
(32, 'Watchmen 5ta Edición', 'Obra maestra de Alan Moore y Dave Gibbons que cambió la historia de los cómics', 150000.00, 5, 3, '2025-09-12 05:00:00'),
(33, 'Ultimate Spider-Man Sinister Six', 'Spiderman se enfrenta a todos sus grandes enemigos reunidos en un grupo', 290000.00, 4, 3, '2025-09-12 05:00:00'),
(34, 'Magic: The Gathering Innistrad Remastered', 'Set de cartas con reproducciones favoritas de Innistrad y Edgar Markov serializado', 1649350.00, 2, 4, '2025-09-12 05:00:00'),
(35, 'Pokémon TCG Elite Trainer Box Scarlet & Violet', 'Caja con 9 paquetes de refuerzo, carta promocional de Thundurus y accesorios', 542000.00, 3, 4, '2025-09-12 05:00:00'),
(36, 'One Piece Card Game Booster Pack Anniversary', 'Cartas especiales del primer aniversario con arte de Eiichiro Oda y arco Skypiea', 1215000.00, 2, 4, '2025-09-12 05:00:00'),
(37, 'Dragon Ball Super Card Game Z-Leader Set', 'Set con nuevo gimmick Z-Leader incluyendo SS4 Goku, SS4 Vegeta y carta God Rare', 608000.00, 3, 4, '2025-09-12 05:00:00'),
(38, 'Pokémon TCG Elite Trainer Box Black Bolt', 'Caja completa con 9 paquetes, carta Thundurus, dados, fundas y accesorios', 504250.00, 4, 4, '2025-09-12 05:00:00'),
(39, 'Flesh and Blood Rosetta Collection', 'Mazos de Magic elemental con nuevos héroes magos y Runeblade', 485500.00, 3, 4, '2025-09-12 05:00:00'),
(40, 'Digimon TCG Extra Booster Versus Monsters', 'Set especial con cartas exclusivas para épicas confrontaciones entre Digimon', 450000.00, 4, 4, '2025-09-12 05:00:00'),
(41, 'One Piece Card Game Royal Bloodline Display', 'Display con 24 sobres de cartas exclusivas y personajes legendarios', 500000.00, 3, 4, '2025-09-12 05:00:00'),
(42, 'Yu-Gi-Oh Avance del Duelista Display', 'Display con 24 sobres con cartas de arquetipos Gaia, Dogmatika y más', 499900.00, 3, 4, '2025-09-12 05:00:00'),
(43, 'Pokémon TCG Escarlata y Púrpura 151', 'Expansión con más de 165 cartas incluyendo Charizard, Blastoise y Venusaur ex', 424200.00, 4, 4, '2025-09-12 05:00:00'),
(44, 'Magic The Gathering Zendikar Rising', 'Expansión con tierras full art y Expediciones premium del plano de Zendikar', 227900.00, 5, 4, '2025-09-12 05:00:00'),
(45, 'Llavero Pikachu Pokémon', 'Llavero metálico con diseño de Pikachu', 25000.00, 20, 5, '2025-09-12 05:00:00'),
(46, 'Gorra Super Mario', 'Gorra roja con el logo de Mario bordado', 45000.00, 15, 5, '2025-09-12 05:00:00'),
(47, 'Pulsera Naruto Konoha', 'Pulsera de silicona con símbolo de la Aldea de la Hoja', 15000.00, 18, 5, '2025-09-12 05:00:00'),
(48, 'Mouse Pad One Piece', 'Alfombrilla para mouse con diseño de Luffy y la tripulación', 30000.00, 12, 5, '2025-09-12 05:00:00'),
(49, 'Collar Shingeki no Kyojin', 'Collar con emblema de la Legión de Reconocimiento', 28000.00, 10, 5, '2025-09-12 05:00:00'),
(50, 'Billetera Zelda Trifuerza', 'Billetera de cuero sintético con logo dorado de la Trifuerza', 60000.00, 8, 5, '2025-09-12 05:00:00'),
(51, 'Set de Stickers Genshin Impact', 'Paquete de 20 stickers resistentes al agua', 12000.00, 25, 5, '2025-09-12 05:00:00'),
(52, 'Llavero Metal Gear Solid', 'Llavero metálico con logo de FOXHOUND', 20000.00, 14, 5, '2025-09-12 05:00:00'),
(53, 'Gorra Pokémon Trainer', 'Gorra blanca y roja estilo entrenador Pokémon', 50000.00, 9, 5, '2025-09-12 05:00:00'),
(54, 'Pulsera Kingdom Hearts', 'Pulsera trenzada con dije de la Llave Espada', 18000.00, 16, 5, '2025-09-12 05:00:00'),
(55, 'Alfombrilla Zelda Breath of the Wild', 'Mouse pad extendido con mapa de Hyrule', 95000.00, 7, 5, '2025-09-12 05:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'Cliente'),
(2, 'Administrador'),
(3, 'Moderador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `correo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `contrasenia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `id_rol` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_spanish_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

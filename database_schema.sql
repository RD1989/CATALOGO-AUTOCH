-- ==========================================================
-- ATACADO TECH - BANCO DE DADOS MYSQL PARA HOSPEDAGEM COMPARTILHADA
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Usu�rios e RBAC
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'EDITOR') NOT NULL DEFAULT 'EDITOR',
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Categorias
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Produtos
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `sku` VARCHAR(60) NOT NULL UNIQUE,
  `status` ENUM('AVAILABLE', 'LOW_STOCK', 'UNAVAILABLE', 'HIDDEN', 'DRAFT') NOT NULL DEFAULT 'AVAILABLE',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_new` TINYINT(1) NOT NULL DEFAULT 0,
  `is_bestseller` TINYINT(1) NOT NULL DEFAULT 0,
  `wholesale_price` DECIMAL(10,2) NOT NULL,
  `min_batch_qty` INT UNSIGNED NOT NULL DEFAULT 10,
  `current_stock` INT NOT NULL DEFAULT 100,
  `image_url` VARCHAR(255) NOT NULL,
  `network_tech` VARCHAR(50) NULL,
  `condition_type` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Varia��es de Cores
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `color_name` VARCHAR(100) NOT NULL,
  `color_hex` VARCHAR(10) NOT NULL,
  `stock_qty` INT NOT NULL DEFAULT 50,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Cota��es / Or�amentos
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `quote_code` VARCHAR(30) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(150) NULL,
  `cnpj_cpf` VARCHAR(30) NULL,
  `city_state` VARCHAR(100) NULL,
  `total_estimated` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('NEW', 'IN_SERVICE', 'FINISHED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
  `customer_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `quote_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `quote_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `color_name` VARCHAR(50) NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `subtotal` DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- CARGA INICIAL COM PRODUTOS EM ESTOQUE (COM PRE�O ATIVO)
-- ==========================================================
INSERT INTO `categories` (`id`, `name`, `slug`, `sort_order`) VALUES
(1, 'Tablets Infantis', 'tablets-infantis', 1),
(2, 'Tablets Profissionais', 'tablets-profissionais', 2),
(3, 'Power Banks', 'power-banks', 3);

INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `sku`, `wholesale_price`, `min_batch_qty`, `image_url`, `network_tech`, `condition_type`) VALUES
(1, 1, 'Q39 PRO - ATACADO', 'q39-pro-atacado', 'TB-Q39PRO-AT', 250.00, 20, '/images/products/q39-pro.png', 'Wi-Fi', 'Lan�amento'),
(2, 1, 'KT 10 - ATACADO', 'kt-10-atacado', 'TB-KT10-AT', 380.00, 10, '/images/products/kt-10.png', 'Wi-Fi', 'Mais vendidos'),
(3, 1, 'X19PRO - ATACADO', 'x19pro-atacado', 'TB-X19PRO-AT', 450.00, 10, '/images/products/x19pro.png', '4G / LTE', 'Lan�amento'),
(4, 2, 'A TAB8 - ATACADO', 'a-tab8-atacado', 'TB-ATAB8-AT', 540.00, 20, '/images/products/a-tab8.png', '4G / LTE', 'Mais vendidos'),
(5, 2, 'SE PRO - ATACADO', 'se-pro-atacado', 'TB-SEPRO-AT', 480.00, 10, '/images/products/se-pro.png', 'Wi-Fi', 'Promo��o'),
(6, 2, 'S-T2 - ATACADO', 's-t2-atacado', 'TB-ST2-AT', 560.00, 10, '/images/products/s-t2.png', '5G', 'Mais vendidos'),
(7, 2, 'STab 9 Pro - ATACADO', 'stab-9-pro-atacado', 'TB-STAB9PRO-AT', 550.00, 10, '/images/products/stab-9-pro.png', '5G', 'Lan�amento'),
(8, 2, 'STab-MAX - ATACADO', 'stab-max-atacado', 'TB-STABMAX-AT', 590.00, 10, '/images/products/stab-max.png', '5G', 'Mais vendidos'),
(9, 2, 'RealMax - ATACADO', 'realmax-atacado', 'TB-REALMAX-AT', 610.00, 10, '/images/products/realmax.png', '5G', 'Mais vendidos'),
(10, 3, 'Power Bank P100 � 20.000mAh', 'power-bank-p100', 'PB-P100-20K', 75.00, 20, '/images/products/powerbank-p100.png', 'Acess�rio', 'Mais vendidos'),
(11, 3, 'Power Bank P200 � 30.000mAh | 22.5W', 'power-bank-p200', 'PB-P200-30K', 100.00, 20, '/images/products/powerbank-p200.png', 'Acess�rio', 'Lan�amento');

SET FOREIGN_KEY_CHECKS = 1;

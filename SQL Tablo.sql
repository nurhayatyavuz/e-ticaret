CREATE DATABASE techmarket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techmarket;

-- 2. USER TABLOSU
CREATE TABLE user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    user_type ENUM('ALICI', 'SATICI', 'HER_IKISI') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORY TABLOSU
CREATE TABLE category (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCT TABLOSU
CREATE TABLE product (
    product_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES user(user_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- 5. CART TABLOSU
CREATE TABLE cart (
    cart_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    UNIQUE KEY unique_user_cart (user_id)
);

-- 6. CART_ITEM TABLOSU
CREATE TABLE cart_item (
    cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES cart(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

-- 7. ORDER TABLOSU
CREATE TABLE `order` (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('ONAYLANDI') DEFAULT 'ONAYLANDI',
    shipping_address TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- 8. ORDER_ITEM TABLOSU
CREATE TABLE order_item (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES `order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- 9. TEST KATEGORİLERİ
INSERT INTO category (name, description) VALUES
('Bilgisayar', 'Dizüstü ve masaüstü bilgisayarlar'),
('Telefon', 'Akıllı telefonlar ve cep telefonları'),
('Tablet', 'Tablet bilgisayarlar'),
('Aksesuar', 'Elektronik aksesuarlar'),
('Oyun Konsolu', 'PlayStation, Xbox, Nintendo'),
('Kulaklık', 'Kulak içi ve kulak üstü kulaklıklar');

-- 10. TEST KULLANICILARI
INSERT INTO user (first_name, last_name, email, password, phone, address, user_type) VALUES
('Test', 'Satıcı', 'satici@techmarket.com', 'test123', '05551234567', 'Ankara Merkez', 'SATICI'),
('Test', 'Alıcı', 'alici@techmarket.com', 'test123', '05551234568', 'İstanbul Merkez', 'ALICI'),
('Test', 'Admin', 'admin@techmarket.com', 'admin123', '05551234569', 'İzmir Merkez', 'HER_IKISI');

-- 11. TEST ÜRÜNLERİ
INSERT INTO product (seller_id, category_id, name, description, price, stock, image_url) VALUES
(1, 2, 'iPhone 15 Pro', '128GB Depolama, ProRAW Kamera', 45000.00, 20, ''),
(1, 1, 'MacBook Air M3', '13 inç, 8GB RAM, 256GB SSD', 35000.00, 15, ''),
(3, 3, 'iPad Pro', '11 inç, M2 Chip, 128GB', 25000.00, 10, ''),
(3, 4, 'AirPods Pro', 'Aktif Gürültü Engelleme', 8000.00, 50, '');
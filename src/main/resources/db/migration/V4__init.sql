-- Customer table
CREATE TABLE customer (
                          customer_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          last_name VARCHAR(100) NOT NULL,
                          first_name VARCHAR(100) NOT NULL,
                          delivery_address VARCHAR(255) NOT NULL,
                          contact_no VARCHAR(20) NOT NULL,
                          nic VARCHAR(20) NOT NULL,
                          age INT NOT NULL
);

-- DeliveryService table
CREATE TABLE delivery_service (
                                  delivery_service_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                  name VARCHAR(100) NOT NULL,
                                  type VARCHAR(20) NOT NULL, -- 'international' or 'local'
                                  status VARCHAR(20) NOT NULL
);


-- Orders table

ALTER TABLE orders
    CHANGE id order_id BIGINT AUTO_INCREMENT;
ALTER TABLE orders
    DROP COLUMN customer_name,
    DROP COLUMN customer_phone,
    DROP COLUMN delivery_address,
    DROP COLUMN customer_nic,
    DROP COLUMN customer_age;

ALTER TABLE orders
    DROP COLUMN order_code;

ALTER TABLE orders
    CHANGE status order_status VARCHAR(100) NOT NULL;

ALTER TABLE orders
    ADD COLUMN customer_id BIGINT NOT NULL,
    ADD COLUMN delivery_service_id BIGINT,
    ADD COLUMN delivery_fee DECIMAL(10,2) NOT NULL,
    ADD COLUMN insurance_fee DECIMAL(10,2) NOT NULL;

ALTER TABLE orders
    ADD CONSTRAINT fk_customer
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id),

    ADD CONSTRAINT fk_delivery_service
        FOREIGN KEY (delivery_service_id) REFERENCES delivery_service(delivery_service_id);

# CREATE TABLE orders (
#                        order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
#                        customer_id BIGINT NOT NULL,
#                        delivery_service_id BIGINT,
#                        delivery_fee DECIMAL(10,2) NOT NULL,
#                        insurance_fee DECIMAL(10,2) NOT NULL,
#                        total DECIMAL(14,2) NOT NULL,
#                        order_status VARCHAR(100) NOT NULL,
#                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#                        CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
#                        CONSTRAINT fk_delivery_service FOREIGN KEY (delivery_service_id) REFERENCES delivery_service(delivery_service_id)
# );

/* REFERENCE TABLE: Courier & Shipping Configuration */
CREATE TABLE courier_shipping_config (
                                         config_id          BIGINT PRIMARY KEY AUTO_INCREMENT,
                                         region_name        VARCHAR(60) NOT NULL UNIQUE, -- e.g., 'USA', 'UK', 'LOCAL'
                                         base_courier_fee   DECIMAL(14,2) NOT NULL,      -- Base cost to ship
                                         weight_unit_markup DECIMAL(14,2) NOT NULL,      -- Extra cost per Carat (ct)
                                         created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

/* REFERENCE TABLE: Insurance Risk Multipliers */
CREATE TABLE insurance_risk_config (
                                       risk_id            BIGINT PRIMARY KEY AUTO_INCREMENT,
                                       gem_type           VARCHAR(80) NOT NULL UNIQUE, -- Matches your 'inventory_item' table
                                       risk_multiplier    DECIMAL(10,4) NOT NULL,      -- e.g., 0.0200 for 2%, 0.0500 for 5%
                                       is_high_value      BOOLEAN DEFAULT FALSE,       -- For stones requiring extra security
                                       updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- INTERNATIONAL COURIERS
INSERT INTO delivery_service (name, type, status) VALUES
                                                      ('DHL Express', 'international', 'active'),
                                                      ('FedEx', 'international', 'active'),
                                                      ('UPS', 'international', 'active'),
                                                      ('Aramex', 'international', 'active'),
                                                      ('TNT Express', 'international', 'active');

-- LOCAL COURIERS (Sri Lanka examples)
INSERT INTO delivery_service (name, type, status) VALUES
                                                      ('PickMe Delivery', 'local', 'active'),
                                                      ('Aramex Sri Lanka', 'local', 'active'),
                                                      ('Domex Courier', 'local', 'active'),
                                                      ('SLAE Courier', 'local', 'active'),
                                                      ('City Express', 'local', 'active');
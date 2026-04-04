-- 1. Add the customer_id column to the cart table
ALTER TABLE cart
    ADD COLUMN customer_id BIGINT;

-- 2. Add the cart_id column to the orders table (if it's not already there)
ALTER TABLE orders
    ADD COLUMN cart_id BIGINT;

-- 3. Create the Foreign Key constraints
ALTER TABLE cart
    ADD CONSTRAINT fk_cart_customer
        FOREIGN KEY (customer_id) REFERENCES customer(customer_id);

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_cart
        FOREIGN KEY (cart_id) REFERENCES cart(cart_id);

-- 4. Create a unique constraint if an order should only have one cart
ALTER TABLE orders
    ADD CONSTRAINT uc_order_cart UNIQUE (cart_id);
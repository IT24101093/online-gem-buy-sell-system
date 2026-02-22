Install MySQL + Workbench
Create database + app user (recommended)
Set up application-mysql.properties from application-mysql.properties.example
Where to put Flyway SQL (V1__init.sql)
How to run in IntelliJ
How to connect IntelliJ Database tool
Sample data SQL
How to add 2 gem photos in repo for testing (draft/listing)

🗄️ Database Setup (MySQL + Flyway) — Team Guide

This project uses:
MySQL 8.x
Flyway migrations (auto create tables)
Spring profile: mysql
✅ Important: We do NOT commit real passwords to GitHub.
We commit only application-mysql.properties.example.

1) Install MySQL + Workbench

Install these:
MySQL Server 8.x
MySQL Workbench 8.x
During installation you set a root password.
➡️ Keep it safe (each person has their own root password).

2) Verify MySQL is running
Option A (Workbench)
Open Workbench → try connecting to Local instance MySQL80.
Option B (Terminal)
Go to the MySQL bin folder and login:

cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p

If login works, MySQL is running.

3) Create Database + App User (Recommended)
✅ Why app user?
Root is admin (too powerful)
App user is safer + consistent for everyone
You don’t need to login as root inside the app

Run this SQL once (Workbench SQL tab or MySQL CLI):
Choose ONE database name and keep it same as your app config
Example below uses: gemtrade

CREATE DATABASE IF NOT EXISTS gemtrade
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'gemtrade_user'@'localhost'
IDENTIFIED BY 'StrongPass123!';

GRANT ALL PRIVILEGES ON gemtrade.* TO 'gemtrade_user'@'localhost';
FLUSH PRIVILEGES;

       (What does IDENTIFIED BY 'StrongPass123!' mean?

        That is the password for the app user (gemtrade_user).
        ✅ It is different from your root password.

        Do teammates need to enter this every time?

        No. After creating the user once, it stays saved in MySQL.
        You only use it in your Spring Boot config file.)


4) Flyway Migration File Location (Tables Auto-Create)

Make sure this file exists in the repo:

✅ Correct path:src/main/resources/db/migration/V1__init.sql
Flyway runs automatically at app start and creates tables.

5) Configure application-mysql.properties
✅ Create:
src/main/resources/application-mysql.properties
Then copy from application-mysql.properties.example and fill in their own values.
Password here should be:
App user password (gemtrade_user) if you use app user

6) Activate MySQL profile
In src/main/resources/application.properties:
spring.profiles.active=mysql

7) Run the Application (IntelliJ)

even though IntelliJ auto runs, here’s the correct way:
IntelliJ
Open project
Let Maven download dependencies
Run: OnlineGemBuySellSystemApplication
What you should see in logs

Flyway messages like:
Successfully validated 1 migration
Migrating schema ...
Successfully applied 1 migration
If you see these, DB + tables are created ✅

8) (Optional) Connect IntelliJ Database Tool Window
IntelliJ → View → Tool Windows → Database
Add Data Source:
MySQL
Host: localhost
Port: 3306
Database: gemtrade
User: gemtrade_user
Password: your app user password
Click Test Connection → OK.


9) Sample Data for Testing (Run manually)
After Flyway creates tables, you can add sample data.
Run this in Workbench/IntelliJ DB console:

USE gemtrade;

-- Seller
INSERT INTO seller (name, nic, phone)
VALUES ('Test Seller', '200012345678', '0771234567');

-- Inventory Item (CERTIFIED)
INSERT INTO inventory_item (
  inventory_code, source, gem_type, category, weight_ct, estimated_value_lkr, seller_id, status
)
VALUES (
  'INV-0001', 'CERTIFIED', 'Blue Sapphire', 'Precious', 1.250, 250000.00, 1, 'IN_STOCK'
);

-- Inventory Images (one primary)
INSERT INTO inventory_image (inventory_item_id, image_url, image_path, is_primary, sort_order)
VALUES
(1, NULL, 'src/main/resources/static/gem-photos/sapphire1.jpg', TRUE, 1),
(1, NULL, 'src/main/resources/static/gem-photos/sapphire2.jpg', FALSE, 2);

-- Draft (for marketplace admin testing)
INSERT INTO marketplace_listing_draft (
  inventory_item_id, gemstone_name, category, description_snapshot, suggested_price_lkr, admin_price_lkr, status
)
VALUES (
  1, 'Blue Sapphire', 'Precious', 'Draft description...', 260000.00, 270000.00, 'PENDING'
);

10) Adding Gem Photos to the Repo (2 photos)
For testing marketplace draft/listing images, we will store 2 sample images in repo:
src/main/resources/static/gem-photos/ =image loction

Example files:

sapphire1.jpg
sapphire2.jpg


11) GitHub Notes
Add to .gitignore
We do NOT commit real passwords. Add this:
# Local MySQL credentials (DO NOT COMMIT)
src/main/resources/application-mysql.properties



Quick Checklist (For New Teammate)

Install MySQL + Workbench

Login to root once

Run DB + app user SQL (Step 3)

Copy application-mysql.properties.example → create application-mysql.properties

Set spring.profiles.active=mysql

Run Spring Boot app (Flyway auto creates tables)

Insert sample data SQL (optional)
-- 1. Tony Stark Insert
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2. Tony Stark Update
UPDATE account
SET account_type = 'Admin'::account_type
WHERE account_email = 'tony@starkent.com';

-- 3. Tony Stark Delete
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- 4. Description Update
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5. Select with JOIN
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6. inv_image and inv_thumbnail Update
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


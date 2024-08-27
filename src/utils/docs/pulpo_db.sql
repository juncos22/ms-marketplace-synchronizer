-- Active: 1720664336355@@localhost@10000@pulpo_db@public
DROP TABLE attribute_mk CASCADE;

DROP TABLE attribute_mk_option CASCADE;

DROP TABLE category_mk CASCADE;

DROP TABLE category_mk_attribute_mk CASCADE;

DROP TABLE category_pulpo CASCADE;

DROP TABLE category_pulpo_category_mk CASCADE;

DROP TABLE extra_value CASCADE;

DROP TABLE marketplace CASCADE;

DROP TABLE marketplace_config CASCADE;

DROP TABLE option CASCADE;

DROP TABLE product CASCADE;

DROP TABLE product_marketplace CASCADE;

DROP TABLE pulpo_user CASCADE;

SELECT
    id,
    name,
    array_to_json (meli_attributes)
FROM
    category_mk
GROUP BY
    id,
    name;

-- PRODUCT_VIEW
CREATE VIEW
    product_view AS
SELECT
    p.id,
    p.name,
    p.stock,
    p.status,
    c.name AS category,
    u.name AS usuario
FROM
    product p
    INNER JOIN category_pulpo c ON p.id_category_pulpo = c.id
    INNER JOIN pulpo_user u ON u.id = p.id_pulpo_user;

SELECT
    *
FROM
    product_view
WHERE
    id = 3;

-- CREDENCIALES DE USUARIO Y MARKETPLACE
SELECT
    pu.id,
    pu.name AS usuario,
    m.name AS marketplace,
    mc.param_name AS clave,
    mc.param_value AS valor
FROM
    pulpo_user pu
    INNER JOIN marketplace_config mc ON mc.id_pulpo_user = pu.id
    INNER JOIN marketplace m ON m.id = mc.id_marketplace
WHERE
    pu.name = 'Roberto';

DROP TABLE IF EXISTS dataset CASCADE;

-- Создаем таблицу с динамическими колонками
DO $$
DECLARE
    create_sql TEXT;
    i INTEGER;
BEGIN
    create_sql := 'CREATE TABLE dataset (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        region VARCHAR(50),
        city VARCHAR(100),
        product_category VARCHAR(50),
        sales_channel VARCHAR(30),
        year INTEGER,
        quarter VARCHAR(2),
        month INTEGER,
        sales_amount NUMERIC(12,2),
        profit NUMERIC(12,2),
        quantity INTEGER,
        discount NUMERIC(5,2),
        customer_rating NUMERIC(3,2),
        delivery_days INTEGER,
        is_promotion BOOLEAN';
    
    -- Добавляем 100 дополнительных атрибутов
    FOR i IN 1..100 LOOP
        create_sql := create_sql || ', feature_' || i || ' NUMERIC(10,4)';
    END LOOP;
    
    create_sql := create_sql || ')';
    EXECUTE create_sql;
    RAISE NOTICE 'Таблица создана с 100+ атрибутами';
END $$;

-- Создаем временные таблицы для значений
CREATE TEMP TABLE dim_regions AS
SELECT region, city FROM (VALUES 
    ('Москва', 'Москва'), ('Санкт-Петербург', 'СПб'), ('Новосибирск', 'Новосибирск'),
    ('Екатеринбург', 'Екатеринбург'), ('Казань', 'Казань'), ('Нижний Новгород', 'ННовгород'),
    ('Челябинск', 'Челябинск'), ('Омск', 'Омск'), ('Самара', 'Самара'), ('Ростов-на-Дону', 'Ростов'),
    ('Уфа', 'Уфа'), ('Красноярск', 'Красноярск'), ('Пермь', 'Пермь'), ('Воронеж', 'Воронеж'),
    ('Волгоград', 'Волгоград'), ('Краснодар', 'Краснодар'), ('Саратов', 'Саратов'), ('Тюмень', 'Тюмень')
) AS t(region, city);

CREATE TEMP TABLE dim_products AS
SELECT category FROM (VALUES 
    ('Электроника'), ('Одежда'), ('Дом и сад'), ('Спорт'), 
    ('Автотовары'), ('Книги'), ('Игрушки'), ('Косметика'), ('Продукты'), ('Мебель')
) AS t(category);

CREATE TEMP TABLE dim_channels AS
SELECT channel FROM (VALUES 
    ('Интернет-магазин'), ('Маркетплейс'), ('Розница'), ('Опт')
) AS t(channel);

-- =====================================================
-- Оптимизированная вставка данных
-- =====================================================

-- Вставляем данные одной операцией
INSERT INTO dataset (
    region, city, product_category, sales_channel,
    year, quarter, month,
    sales_amount, profit, quantity, discount, customer_rating, delivery_days, is_promotion
)
SELECT 
    r.region,
    r.city,
    p.category,
    c.channel,
    2020 + floor(random() * 5) as year,
    CASE floor(random() * 4) 
        WHEN 0 THEN 'Q1' WHEN 1 THEN 'Q2' WHEN 2 THEN 'Q3' ELSE 'Q4' 
    END as quarter,
    floor(random() * 12 + 1) as month,
    round((random() * 100000 + 500)::numeric, 2) as sales_amount,
    round((random() * 20000 + 50)::numeric, 2) as profit,
    floor(random() * 100 + 1) as quantity,
    round((random() * 30)::numeric, 2) as discount,
    round((random() * 3 + 2)::numeric, 2) as customer_rating,
    floor(random() * 14 + 1) as delivery_days,
    random() < 0.2 as is_promotion
FROM 
    dim_regions r,
    dim_products p,
    dim_channels c,
    generate_series(1, 10000) -- 10 000 комбинаций

UNION ALL

SELECT 
    r.region,
    r.city,
    p.category,
    c.channel,
    2020 + floor(random() * 5),
    CASE floor(random() * 4) WHEN 0 THEN 'Q1' WHEN 1 THEN 'Q2' WHEN 2 THEN 'Q3' ELSE 'Q4' END,
    floor(random() * 12 + 1),
    round((random() * 100000 + 500)::numeric, 2),
    round((random() * 20000 + 50)::numeric, 2),
    floor(random() * 100 + 1),
    round((random() * 30)::numeric, 2),
    round((random() * 3 + 2)::numeric, 2),
    floor(random() * 14 + 1),
    random() < 0.2
FROM 
    dim_regions r,
    dim_products p,
    dim_channels c,
    generate_series(1, 10000) -- еще 10 000
LIMIT 100000; -- Ограничиваем 100 000 строк

-- =====================================================
-- Заполняем feature атрибуты одной операцией
-- =====================================================

-- Генерируем строку с UPDATE для всех feature колонок
DO $$
DECLARE
    update_sql TEXT;
    i INTEGER;
BEGIN
    -- Собираем все SET части в один UPDATE
    update_sql := 'UPDATE dataset SET ';
    FOR i IN 1..100 LOOP
        update_sql := update_sql || 'feature_' || i || ' = random() * 1000';
        IF i < 100 THEN
            update_sql := update_sql || ', ';
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Обновляем 100 атрибутов...';
    EXECUTE update_sql;
    RAISE NOTICE 'Обновление завершено';
END $$;

-- =====================================================
-- Создаем индексы для оптимизации
-- =====================================================

CREATE INDEX idx_dataset_region ON dataset(region);
CREATE INDEX idx_dataset_year ON dataset(year);
CREATE INDEX idx_dataset_quarter ON dataset(quarter);
CREATE INDEX idx_dataset_category ON dataset(product_category);
CREATE INDEX idx_dataset_year_quarter ON dataset(year, quarter);
CREATE INDEX idx_dataset_sales ON dataset(sales_amount);

-- =====================================================
-- Статистика
-- =====================================================

SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT region) as regions,
    COUNT(DISTINCT product_category) as categories,
    MIN(sales_amount) as min_sales,
    MAX(sales_amount) as max_sales,
    ROUND(AVG(sales_amount)) as avg_sales,
    SUM(sales_amount) as total_sales
FROM dataset;

-- Показываем пример данных
SELECT 
    id, region, product_category, year, quarter, 
    sales_amount, profit, quantity,
    ROUND(feature_1::numeric, 2) as f1,
    ROUND(feature_2::numeric, 2) as f2
FROM dataset 
LIMIT 10;
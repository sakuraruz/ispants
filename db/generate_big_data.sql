-- =====================================================
-- Генерация данных с уникальным ID для каждой строки
-- =====================================================

-- Удаляем старую таблицу
DROP TABLE IF EXISTS dataset CASCADE;

-- Создаем таблицу с явным полем row_number
CREATE TABLE dataset (
    row_number INTEGER PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    region VARCHAR(50),
    product_category VARCHAR(50),
    year INTEGER,
    quarter VARCHAR(2),
    sales_amount NUMERIC(12,2),
    profit NUMERIC(12,2),
    quantity INTEGER
);

-- Добавляем 10 дополнительных атрибутов
ALTER TABLE dataset ADD COLUMN feature_1 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_2 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_3 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_4 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_5 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_6 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_7 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_8 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_9 NUMERIC(10,4);
ALTER TABLE dataset ADD COLUMN feature_10 NUMERIC(10,4);

-- Вставляем данные с уникальными ID от 1 до 100000
INSERT INTO dataset (row_number, region, product_category, year, quarter, sales_amount, profit, quantity)
SELECT 
    generate_series as row_number,
    (ARRAY['Москва','Санкт-Петербург','Новосибирск','Екатеринбург','Казань',
           'Нижний Новгород','Челябинск','Омск','Самара','Ростов-на-Дону',
           'Уфа','Красноярск','Пермь','Воронеж','Волгоград'])[floor(random() * 15 + 1)],
    (ARRAY['Электроника','Одежда','Дом и сад','Спорт','Автотовары',
           'Книги','Игрушки','Косметика','Продукты','Мебель'])[floor(random() * 10 + 1)],
    2020 + floor(random() * 5),
    (ARRAY['Q1','Q2','Q3','Q4'])[floor(random() * 4 + 1)],
    round((random() * 100000 + 500)::numeric, 2),
    round((random() * 20000 + 50)::numeric, 2),
    floor(random() * 100 + 1)
FROM generate_series(1, 100000);

-- Заполняем feature атрибуты
UPDATE dataset SET 
    feature_1 = random() * 1000,
    feature_2 = random() * 1000,
    feature_3 = random() * 1000,
    feature_4 = random() * 1000,
    feature_5 = random() * 1000,
    feature_6 = random() * 1000,
    feature_7 = random() * 1000,
    feature_8 = random() * 1000,
    feature_9 = random() * 1000,
    feature_10 = random() * 1000;

-- Создаем индексы
CREATE INDEX idx_dataset_region ON dataset(region);
CREATE INDEX idx_dataset_year ON dataset(year);
CREATE INDEX idx_dataset_category ON dataset(product_category);

-- Показываем статистику
SELECT 
    COUNT(*) as total_rows,
    MIN(row_number) as min_id,
    MAX(row_number) as max_id,
    COUNT(DISTINCT region) as regions,
    COUNT(DISTINCT product_category) as categories
FROM dataset;

-- Показываем пример данных
SELECT row_number, region, product_category, year, quarter, sales_amount 
FROM dataset 
LIMIT 10;
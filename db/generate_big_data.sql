-- =====================================================
-- Генерация данных с 100 осмысленными атрибутами
-- =====================================================

-- Удаляем старую таблицу
DROP TABLE IF EXISTS dataset CASCADE;

-- Создаем таблицу с основными полями
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

-- =====================================================
-- Добавляем 100 осмысленных атрибутов
-- =====================================================

-- Финансовые показатели (20 атрибутов)
ALTER TABLE dataset ADD COLUMN revenue_usd NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN revenue_eur NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN gross_margin NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN net_margin NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN ebitda NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN operating_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN marketing_spend NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN r_and_d_spend NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN tax_amount NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN discount_amount NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN refund_amount NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN shipping_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN payment_fee NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN commission_fee NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN bonus_paid NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN cashback_amount NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN credit_payment NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN installment_payment NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN prepayment_amount NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN deferred_payment NUMERIC(12,2);

-- Клиентские метрики (15 атрибутов)
ALTER TABLE dataset ADD COLUMN customer_age INTEGER;
ALTER TABLE dataset ADD COLUMN customer_tenure_months INTEGER;
ALTER TABLE dataset ADD COLUMN customer_lifetime_value NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN customer_satisfaction_score NUMERIC(3,2);
ALTER TABLE dataset ADD COLUMN nps_score INTEGER;
ALTER TABLE dataset ADD COLUMN review_rating NUMERIC(2,1);
ALTER TABLE dataset ADD COLUMN review_count INTEGER;
ALTER TABLE dataset ADD COLUMN complaint_count INTEGER;
ALTER TABLE dataset ADD COLUMN support_tickets INTEGER;
ALTER TABLE dataset ADD COLUMN support_resolution_time INTEGER;
ALTER TABLE dataset ADD COLUMN return_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN repeat_purchase_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN churn_risk_score NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN loyalty_points INTEGER;
ALTER TABLE dataset ADD COLUMN referral_count INTEGER;

-- Продуктовые метрики (15 атрибутов)
ALTER TABLE dataset ADD COLUMN product_weight NUMERIC(10,2);
ALTER TABLE dataset ADD COLUMN product_volume NUMERIC(10,2);
ALTER TABLE dataset ADD COLUMN stock_level INTEGER;
ALTER TABLE dataset ADD COLUMN reorder_point INTEGER;
ALTER TABLE dataset ADD COLUMN lead_time_days INTEGER;
ALTER TABLE dataset ADD COLUMN supplier_rating NUMERIC(3,2);
ALTER TABLE dataset ADD COLUMN quality_score NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN defect_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN warranty_period INTEGER;
ALTER TABLE dataset ADD COLUMN shelf_life_days INTEGER;
ALTER TABLE dataset ADD COLUMN production_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN packaging_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN storage_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN inventory_turnover NUMERIC(8,2);
ALTER TABLE dataset ADD COLUMN stockout_frequency INTEGER;

-- Логистические метрики (10 атрибутов)
ALTER TABLE dataset ADD COLUMN delivery_distance_km INTEGER;
ALTER TABLE dataset ADD COLUMN delivery_time_hours INTEGER;
ALTER TABLE dataset ADD COLUMN delivery_cost NUMERIC(10,2);
ALTER TABLE dataset ADD COLUMN courier_rating NUMERIC(3,2);
ALTER TABLE dataset ADD COLUMN warehouse_processing_time INTEGER;
ALTER TABLE dataset ADD COLUMN pickup_time INTEGER;
ALTER TABLE dataset ADD COLUMN tracking_updates INTEGER;
ALTER TABLE dataset ADD COLUMN delivery_attempts INTEGER;
ALTER TABLE dataset ADD COLUMN missed_delivery INTEGER;
ALTER TABLE dataset ADD COLUMN damaged_in_transit INTEGER;

-- Маркетинговые метрики (10 атрибутов)
ALTER TABLE dataset ADD COLUMN ad_impressions INTEGER;
ALTER TABLE dataset ADD COLUMN ad_clicks INTEGER;
ALTER TABLE dataset ADD COLUMN ad_spend NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN click_through_rate NUMERIC(8,4);
ALTER TABLE dataset ADD COLUMN conversion_rate NUMERIC(8,4);
ALTER TABLE dataset ADD COLUMN cost_per_acquisition NUMERIC(10,2);
ALTER TABLE dataset ADD COLUMN email_open_rate NUMERIC(8,4);
ALTER TABLE dataset ADD COLUMN email_click_rate NUMERIC(8,4);
ALTER TABLE dataset ADD COLUMN social_media_shares INTEGER;
ALTER TABLE dataset ADD COLUMN influencer_engagement INTEGER;

-- Операционные метрики (10 атрибутов)
ALTER TABLE dataset ADD COLUMN employee_count INTEGER;
ALTER TABLE dataset ADD COLUMN shift_hours INTEGER;
ALTER TABLE dataset ADD COLUMN productivity_score NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN overtime_hours INTEGER;
ALTER TABLE dataset ADD COLUMN training_hours INTEGER;
ALTER TABLE dataset ADD COLUMN error_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN equipment_downtime INTEGER;
ALTER TABLE dataset ADD COLUMN maintenance_cost NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN safety_incidents INTEGER;
ALTER TABLE dataset ADD COLUMN process_efficiency NUMERIC(5,2);

-- Цифровые метрики (10 атрибутов)
ALTER TABLE dataset ADD COLUMN website_visits INTEGER;
ALTER TABLE dataset ADD COLUMN page_views INTEGER;
ALTER TABLE dataset ADD COLUMN session_duration INTEGER;
ALTER TABLE dataset ADD COLUMN bounce_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN app_downloads INTEGER;
ALTER TABLE dataset ADD COLUMN app_ratings NUMERIC(2,1);
ALTER TABLE dataset ADD COLUMN feature_usage_count INTEGER;
ALTER TABLE dataset ADD COLUMN api_calls INTEGER;
ALTER TABLE dataset ADD COLUMN server_response_time INTEGER;
ALTER TABLE dataset ADD COLUMN error_404_count INTEGER;

-- Демографические метрики (10 атрибутов)
ALTER TABLE dataset ADD COLUMN population_density INTEGER;
ALTER TABLE dataset ADD COLUMN avg_income NUMERIC(12,2);
ALTER TABLE dataset ADD COLUMN unemployment_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN education_level INTEGER;
ALTER TABLE dataset ADD COLUMN internet_penetration NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN smartphone_penetration NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN avg_age NUMERIC(5,1);
ALTER TABLE dataset ADD COLUMN family_size NUMERIC(3,1);
ALTER TABLE dataset ADD COLUMN home_ownership_rate NUMERIC(5,2);
ALTER TABLE dataset ADD COLUMN car_ownership_rate NUMERIC(5,2);

-- =====================================================
-- Вставка данных с уникальными ID от 1 до 100000
-- =====================================================

INSERT INTO dataset (
    row_number, region, product_category, year, quarter, sales_amount, profit, quantity
)
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

-- =====================================================
-- Заполняем все 100 дополнительных атрибутов реалистичными значениями
-- =====================================================

UPDATE dataset SET 
    -- Финансовые показатели
    revenue_usd = round((random() * 100000 + 500)::numeric, 2),
    revenue_eur = round((random() * 90000 + 450)::numeric, 2),
    gross_margin = round((random() * 40 + 20)::numeric, 2),
    net_margin = round((random() * 25 + 5)::numeric, 2),
    ebitda = round((random() * 30000 + 1000)::numeric, 2),
    operating_cost = round((random() * 50000 + 1000)::numeric, 2),
    marketing_spend = round((random() * 15000 + 500)::numeric, 2),
    r_and_d_spend = round((random() * 10000 + 200)::numeric, 2),
    tax_amount = round((random() * 8000 + 100)::numeric, 2),
    discount_amount = round((random() * 5000 + 50)::numeric, 2),
    refund_amount = round((random() * 2000 + 10)::numeric, 2),
    shipping_cost = round((random() * 1000 + 50)::numeric, 2),
    payment_fee = round((random() * 500 + 10)::numeric, 2),
    commission_fee = round((random() * 3000 + 100)::numeric, 2),
    bonus_paid = round((random() * 1000 + 20)::numeric, 2),
    cashback_amount = round((random() * 500 + 5)::numeric, 2),
    credit_payment = round((random() * 20000 + 100)::numeric, 2),
    installment_payment = round((random() * 15000 + 50)::numeric, 2),
    prepayment_amount = round((random() * 10000 + 100)::numeric, 2),
    deferred_payment = round((random() * 8000 + 50)::numeric, 2),
    
    -- Клиентские метрики
    customer_age = 18 + floor(random() * 60),
    customer_tenure_months = floor(random() * 120),
    customer_lifetime_value = round((random() * 50000 + 500)::numeric, 2),
    customer_satisfaction_score = round((random() * 4 + 1)::numeric, 2),
    nps_score = floor(random() * 10) - 5,
    review_rating = round((random() * 4 + 1)::numeric, 1),
    review_count = floor(random() * 500),
    complaint_count = floor(random() * 10),
    support_tickets = floor(random() * 20),
    support_resolution_time = floor(random() * 48),
    return_rate = round((random() * 20)::numeric, 2),
    repeat_purchase_rate = round((random() * 80)::numeric, 2),
    churn_risk_score = round((random() * 100)::numeric, 2),
    loyalty_points = floor(random() * 10000),
    referral_count = floor(random() * 50),
    
    -- Продуктовые метрики
    product_weight = round((random() * 50)::numeric, 2),
    product_volume = round((random() * 100)::numeric, 2),
    stock_level = floor(random() * 1000),
    reorder_point = floor(random() * 100),
    lead_time_days = floor(random() * 30),
    supplier_rating = round((random() * 4 + 1)::numeric, 2),
    quality_score = round((random() * 100)::numeric, 2),
    defect_rate = round((random() * 5)::numeric, 2),
    warranty_period = floor(random() * 36),
    shelf_life_days = floor(random() * 365),
    production_cost = round((random() * 10000 + 100)::numeric, 2),
    packaging_cost = round((random() * 500 + 10)::numeric, 2),
    storage_cost = round((random() * 2000 + 50)::numeric, 2),
    inventory_turnover = round((random() * 20)::numeric, 2),
    stockout_frequency = floor(random() * 10),
    
    -- Логистические метрики
    delivery_distance_km = floor(random() * 5000),
    delivery_time_hours = floor(random() * 168),
    delivery_cost = round((random() * 1000 + 50)::numeric, 2),
    courier_rating = round((random() * 4 + 1)::numeric, 2),
    warehouse_processing_time = floor(random() * 48),
    pickup_time = floor(random() * 24),
    tracking_updates = floor(random() * 20),
    delivery_attempts = floor(random() * 5),
    missed_delivery = floor(random() * 3),
    damaged_in_transit = floor(random() * 5),
    
    -- Маркетинговые метрики
    ad_impressions = floor(random() * 1000000),
    ad_clicks = floor(random() * 50000),
    ad_spend = round((random() * 10000 + 100)::numeric, 2),
    click_through_rate = round((random() * 5)::numeric, 4),
    conversion_rate = round((random() * 10)::numeric, 4),
    cost_per_acquisition = round((random() * 200 + 5)::numeric, 2),
    email_open_rate = round((random() * 60)::numeric, 4),
    email_click_rate = round((random() * 20)::numeric, 4),
    social_media_shares = floor(random() * 10000),
    influencer_engagement = floor(random() * 5000),
    
    -- Операционные метрики
    employee_count = floor(random() * 500),
    shift_hours = floor(random() * 24),
    productivity_score = round((random() * 100)::numeric, 2),
    overtime_hours = floor(random() * 40),
    training_hours = floor(random() * 100),
    error_rate = round((random() * 10)::numeric, 2),
    equipment_downtime = floor(random() * 100),
    maintenance_cost = round((random() * 10000 + 500)::numeric, 2),
    safety_incidents = floor(random() * 10),
    process_efficiency = round((random() * 100)::numeric, 2),
    
    -- Цифровые метрики
    website_visits = floor(random() * 100000),
    page_views = floor(random() * 500000),
    session_duration = floor(random() * 600),
    bounce_rate = round((random() * 60)::numeric, 2),
    app_downloads = floor(random() * 10000),
    app_ratings = round((random() * 4 + 1)::numeric, 1),
    feature_usage_count = floor(random() * 1000),
    api_calls = floor(random() * 50000),
    server_response_time = floor(random() * 2000),
    error_404_count = floor(random() * 100),
    
    -- Демографические метрики
    population_density = floor(random() * 10000),
    avg_income = round((random() * 100000 + 20000)::numeric, 2),
    unemployment_rate = round((random() * 15)::numeric, 2),
    education_level = floor(random() * 5),
    internet_penetration = round((random() * 100)::numeric, 2),
    smartphone_penetration = round((random() * 100)::numeric, 2),
    avg_age = round((random() * 40 + 20)::numeric, 1),
    family_size = round((random() * 4 + 1)::numeric, 1),
    home_ownership_rate = round((random() * 100)::numeric, 2),
    car_ownership_rate = round((random() * 100)::numeric, 2);

-- =====================================================
-- Создаем индексы для оптимизации
-- =====================================================

CREATE INDEX idx_dataset_region ON dataset(region);
CREATE INDEX idx_dataset_year ON dataset(year);
CREATE INDEX idx_dataset_category ON dataset(product_category);
CREATE INDEX idx_dataset_quarter ON dataset(quarter);
CREATE INDEX idx_dataset_sales ON dataset(sales_amount);
CREATE INDEX idx_dataset_profit ON dataset(profit);
CREATE INDEX idx_dataset_quantity ON dataset(quantity);

-- =====================================================
-- Статистика
-- =====================================================

SELECT 
    COUNT(*) as total_rows,
    MIN(row_number) as min_id,
    MAX(row_number) as max_id,
    COUNT(DISTINCT region) as regions,
    COUNT(DISTINCT product_category) as categories,
    ROUND(AVG(sales_amount)) as avg_sales,
    ROUND(SUM(sales_amount)) as total_sales
FROM dataset;

-- Показываем пример данных
SELECT 
    row_number as id,
    region, 
    product_category, 
    year, 
    quarter, 
    sales_amount,
    revenue_usd,
    customer_satisfaction_score,
    delivery_time_hours,
    conversion_rate
FROM dataset 
LIMIT 10;
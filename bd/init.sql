-- Файл: ispants/db/init.sql
DO $$
DECLARE
create_sql TEXT;
    insert_sql TEXT;
    select_sql TEXT;
BEGIN
    create_sql := 'CREATE TABLE IF NOT EXISTS dataset (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
FOR i IN 1..150 LOOP
        create_sql := create_sql || ', feature_' || i || ' DOUBLE PRECISION';
END LOOP;
    create_sql := create_sql || ');';
EXECUTE create_sql;

insert_sql := 'INSERT INTO dataset (';
FOR i IN 1..150 LOOP
        insert_sql := insert_sql || 'feature_' || i || (CASE WHEN i < 150 THEN ', ' ELSE ') ' END);
END LOOP;

    select_sql := 'SELECT ';
FOR i IN 1..150 LOOP
        select_sql := select_sql || 'random() * 100' || (CASE WHEN i < 150 THEN ', ' ELSE ' ' END);
END LOOP;
    select_sql := select_sql || 'FROM generate_series(1, 50000);';

EXECUTE insert_sql || select_sql;
END $$;
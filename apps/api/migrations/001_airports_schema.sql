-- Миграция для создания схемы аэропортов с мультиязычным fuzzy search
-- PostgreSQL 16 + pg_trgm + unaccent

-- Включаем расширения для нечеткого поиска и нормализации текста
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Таблица аэропортов
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) NOT NULL UNIQUE,
    icao_code VARCHAR(4),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timezone VARCHAR(50),
    country_code VARCHAR(2),
    region_code VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица локализаций названий аэропортов
CREATE TABLE IF NOT EXISTS airport_localizations (
    id SERIAL PRIMARY KEY,
    airport_id INTEGER NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL, -- например: 'en', 'ru', 'de', 'zh-CN'
    city_name VARCHAR(255) NOT NULL,
    airport_name VARCHAR(255),
    search_normalized VARCHAR(255) NOT NULL, -- нормализованный текст для поиска
    is_primary BOOLEAN DEFAULT FALSE, -- основное название для локали
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(airport_id, locale)
);

-- Таблица алиасов для альтернативных написаний (транслитерации, исторические названия)
CREATE TABLE IF NOT EXISTS airport_aliases (
    id SERIAL PRIMARY KEY,
    airport_id INTEGER NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,
    alias_normalized VARCHAR(255) NOT NULL,
    alias_type VARCHAR(50) NOT NULL, -- 'transliteration', 'historical', 'alternative'
    locale VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска

-- GIN индекс для триграммного поиска по нормализованным названиям
CREATE INDEX idx_airport_localizations_search_trgm 
    ON airport_localizations USING GIN (search_normalized gin_trgm_ops);

-- GIN индекс для триграммного поиска по алиасам
CREATE INDEX idx_airport_aliases_trgm 
    ON airport_aliases USING GIN (alias_normalized gin_trgm_ops);

-- B-tree индекс для точного поиска по IATA коду
CREATE INDEX idx_airports_iata_code ON airports(iata_code);

-- Индекс для фильтрации по локали
CREATE INDEX idx_airport_localizations_locale 
    ON airport_localizations(locale);

-- Индекс для связи аэропорт-локализация
CREATE INDEX idx_airport_localizations_airport_id 
    ON airport_localizations(airport_id);

-- Частичный индекс для основных названий (оптимизация)
CREATE INDEX idx_airport_localizations_primary 
    ON airport_localizations(airport_id, locale) 
    WHERE is_primary = true;

-- Функция для нормализации текста (удаление диакритики + нижний регистр)
CREATE OR REPLACE FUNCTION normalize_search_text(text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(unaccent(text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Триггер для автоматического обновления search_normalized
CREATE OR REPLACE FUNCTION update_search_normalized()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_normalized = normalize_search_text(NEW.city_name || ' ' || COALESCE(NEW.airport_name, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления alias_normalized
CREATE OR REPLACE FUNCTION update_alias_normalized()
RETURNS TRIGGER AS $$
BEGIN
    NEW.alias_normalized = normalize_search_text(NEW.alias);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Применяем триггеры
CREATE TRIGGER trg_airport_localizations_search_normalized
    BEFORE INSERT OR UPDATE ON airport_localizations
    FOR EACH ROW EXECUTE FUNCTION update_search_normalized();

CREATE TRIGGER trg_airport_aliases_normalized
    BEFORE INSERT OR UPDATE ON airport_aliases
    FOR EACH ROW EXECUTE FUNCTION update_alias_normalized();

-- Оптимизированная функция для поиска аэропортов с ранжированием
CREATE OR REPLACE FUNCTION search_airports(
    search_query TEXT,
    locale_param VARCHAR DEFAULT 'en',
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    airport_id INTEGER,
    iata_code VARCHAR(3),
    city_name VARCHAR(255),
    airport_name VARCHAR(255),
    locale VARCHAR(10),
    match_type VARCHAR(20),
    similarity_score FLOAT
) AS $$
DECLARE
    normalized_query TEXT;
    query_length INTEGER;
BEGIN
    normalized_query := normalize_search_text(search_query);
    query_length := length(normalized_query);
    
    -- Оптимизация для коротких запросов (< 3 символов): только префиксный поиск
    IF query_length < 3 THEN
        RETURN QUERY
        WITH short_results AS (
            -- Точное совпадение IATA кода
            SELECT 
                a.id as airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'iata_exact' as match_type,
                1.0 as similarity_score
            FROM airports a
            JOIN airport_localizations al ON a.id = al.airport_id
            WHERE a.iata_code = upper(search_query)
            
            UNION ALL
            
            -- Частичное совпадение IATA кода
            SELECT 
                a.id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'iata_partial' as match_type,
                0.9 as similarity_score
            FROM airports a
            JOIN airport_localizations al ON a.id = al.airport_id
            WHERE a.iata_code LIKE upper(search_query || '%')
            
            UNION ALL
            
            -- Префиксный поиск по названиям (ILIKE)
            SELECT 
                al.airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'name_prefix' as match_type,
                0.8 as similarity_score
            FROM airport_localizations al
            JOIN airports a ON al.airport_id = a.id
            WHERE al.search_normalized ILIKE normalized_query || '%'
        ),
        deduplicated AS (
            SELECT DISTINCT ON (airport_id)
                airport_id,
                iata_code,
                city_name,
                airport_name,
                locale,
                match_type,
                similarity_score
            FROM short_results
            ORDER BY airport_id, similarity_score DESC, match_type
        )
        SELECT 
            d.airport_id,
            d.iata_code,
            COALESCE(
                (SELECT city_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = locale_param LIMIT 1),
                (SELECT city_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = 'en' LIMIT 1),
                d.city_name
            ) as city_name,
            COALESCE(
                (SELECT airport_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = locale_param LIMIT 1),
                (SELECT airport_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = 'en' LIMIT 1),
                d.airport_name
            ) as airport_name,
            locale_param as locale,
            d.match_type,
            d.similarity_score
        FROM deduplicated d
        ORDER BY d.similarity_score DESC, d.match_type
        LIMIT limit_count;
        
    ELSE
        -- Полный поиск с триграммами для запросов >= 3 символов
        RETURN QUERY
        WITH ranked_results AS (
            -- Приоритет 1: Точное совпадение IATA кода
            SELECT 
                a.id as airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'iata_exact' as match_type,
                1.0 as similarity_score
            FROM airports a
            JOIN airport_localizations al ON a.id = al.airport_id
            WHERE a.iata_code = upper(search_query)
            
            UNION ALL
            
            -- Приоритет 2: Частичное совпадение IATA кода
            SELECT 
                a.id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'iata_partial' as match_type,
                0.9 as similarity_score
            FROM airports a
            JOIN airport_localizations al ON a.id = al.airport_id
            WHERE a.iata_code LIKE upper(search_query || '%')
            
            UNION ALL
            
            -- Приоритет 3: Точное совпадение названия (триграммная схожесть = 1)
            SELECT 
                al.airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'name_exact' as match_type,
                1.0 as similarity_score
            FROM airport_localizations al
            JOIN airports a ON al.airport_id = a.id
            WHERE al.search_normalized = normalized_query
            
            UNION ALL
            
            -- Приоритет 4: Нечеткое совпадение названия (триграммный поиск)
            SELECT 
                al.airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'name_fuzzy' as match_type,
                similarity(al.search_normalized, normalized_query) as similarity_score
            FROM airport_localizations al
            JOIN airports a ON al.airport_id = a.id
            WHERE al.search_normalized % normalized_query
            AND similarity(al.search_normalized, normalized_query) > 0.3
            
            UNION ALL
            
            -- Приоритет 5: Поиск по алиасам
            SELECT 
                aa.airport_id,
                a.iata_code,
                al.city_name,
                al.airport_name,
                al.locale,
                'alias' as match_type,
                similarity(aa.alias_normalized, normalized_query) as similarity_score
            FROM airport_aliases aa
            JOIN airports a ON aa.airport_id = a.id
            JOIN airport_localizations al ON a.id = al.airport_id AND al.is_primary = true
            WHERE aa.alias_normalized % normalized_query
            AND similarity(aa.alias_normalized, normalized_query) > 0.3
        ),
        deduplicated AS (
            -- Удаление дубликатов с сохранением лучшего match_type и similarity_score
            SELECT DISTINCT ON (airport_id)
                airport_id,
                iata_code,
                city_name,
                airport_name,
                locale,
                match_type,
                similarity_score
            FROM ranked_results
            ORDER BY airport_id, similarity_score DESC, match_type
        )
        SELECT 
            d.airport_id,
            d.iata_code,
            COALESCE(
                (SELECT city_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = locale_param LIMIT 1),
                (SELECT city_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = 'en' LIMIT 1),
                d.city_name
            ) as city_name,
            COALESCE(
                (SELECT airport_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = locale_param LIMIT 1),
                (SELECT airport_name FROM airport_localizations WHERE airport_id = d.airport_id AND locale = 'en' LIMIT 1),
                d.airport_name
            ) as airport_name,
            locale_param as locale,
            d.match_type,
            d.similarity_score
        FROM deduplicated d
        ORDER BY d.similarity_score DESC, d.match_type
        LIMIT limit_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Пример данных для тестирования
INSERT INTO airports (iata_code, icao_code, latitude, longitude, timezone, country_code, region_code) VALUES
('SVO', 'UUEE', 55.9726, 37.4146, 'Europe/Moscow', 'RU', 'MOW'),
('DME', 'UUDD', 55.4088, 37.9063, 'Europe/Moscow', 'RU', 'MOW'),
('JFK', 'KJFK', 40.6413, -73.7781, 'America/New_York', 'US', 'NY'),
('LHR', 'EGLL', 51.4700, -0.4543, 'Europe/London', 'GB', 'ENG'),
('MUC', 'EDDM', 48.3537, 11.7750, 'Europe/Berlin', 'DE', 'BY'),
('DXB', 'OMDB', 25.2532, 55.3657, 'Asia/Dubai', 'AE', 'DU')
ON CONFLICT (iata_code) DO NOTHING;

-- Локализации
INSERT INTO airport_localizations (airport_id, locale, city_name, airport_name, is_primary) VALUES
-- SVO
((SELECT id FROM airports WHERE iata_code = 'SVO'), 'en', 'Moscow', 'Sheremetyevo International Airport', true),
((SELECT id FROM airports WHERE iata_code = 'SVO'), 'ru', 'Москва', 'Шереметьево', true),
((SELECT id FROM airports WHERE iata_code = 'SVO'), 'de', 'Moskau', 'Flughafen Sheremetyevo', false),
-- DME
((SELECT id FROM airports WHERE iata_code = 'DME'), 'en', 'Moscow', 'Domodedovo International Airport', true),
((SELECT id FROM airports WHERE iata_code = 'DME'), 'ru', 'Москва', 'Домодедово', true),
-- JFK
((SELECT id FROM airports WHERE iata_code = 'JFK'), 'en', 'New York', 'John F. Kennedy International Airport', true),
((SELECT id FROM airports WHERE iata_code = 'JFK'), 'ru', 'Нью-Йорк', 'Международный аэропорт имени Джона Кеннеди', true),
-- LHR
((SELECT id FROM airports WHERE iata_code = 'LHR'), 'en', 'London', 'Heathrow Airport', true),
((SELECT id FROM airports WHERE iata_code = 'LHR'), 'ru', 'Лондон', 'Хитроу', true),
-- MUC
((SELECT id FROM airports WHERE iata_code = 'MUC'), 'en', 'Munich', 'Munich Airport', true),
((SELECT id FROM airports WHERE iata_code = 'MUC'), 'de', 'München', 'Flughafen München', true),
((SELECT id FROM airports WHERE iata_code = 'MUC'), 'ru', 'Мюнхен', 'Аэропорт Мюнхен', true),
-- DXB
((SELECT id FROM airports WHERE iata_code = 'DXB'), 'en', 'Dubai', 'Dubai International Airport', true),
((SELECT id FROM airports WHERE iata_code = 'DXB'), 'ru', 'Дубай', 'Международный аэропорт Дубай', true)
ON CONFLICT (airport_id, locale) DO NOTHING;

-- Алиасы для транслитераций и альтернативных написаний
INSERT INTO airport_aliases (airport_id, alias, alias_type, locale) VALUES
-- MUC - различные написания
((SELECT id FROM airports WHERE iata_code = 'MUC'), 'Muenchen', 'transliteration', 'de'),
((SELECT id FROM airports WHERE iata_code = 'MUC'), 'Munchen', 'alternative', 'en'),
-- SVO
((SELECT id FROM airports WHERE iata_code = 'SVO'), 'Sheremetyevo', 'alternative', 'en'),
((SELECT id FROM airports WHERE iata_code = 'SVO'), 'Шереметьево', 'alternative', 'ru'),
-- JFK
((SELECT id FROM airports WHERE iata_code = 'JFK'), 'Kennedy', 'alternative', 'en'),
((SELECT id FROM airports WHERE iata_code = 'JFK'), 'Кеннеди', 'alternative', 'ru')
ON CONFLICT DO NOTHING;

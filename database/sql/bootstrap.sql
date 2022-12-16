CREATE DATABASE mydb;
\connect mydb;
CREATE SCHEMA pax; 


-- DO $$
-- BEGIN

--     -- pax schema
--     IF NOT EXISTS (
--         SELECT 1 
--         FROM pg_catalog.pg_namespace
--         WHERE nspname = 'pax'
--     )
--     THEN
--         EXECUTE('CREATE SCHEMA pax');
--     END IF;
-- END$$;





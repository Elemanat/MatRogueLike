-- PostgreSQL init script pro MatRogueLike

CREATE USER matrogulike_user WITH PASSWORD 'your-strong-password';
CREATE DATABASE matrogulike OWNER matrogulike_user;

\c matrogulike

-- Důležité pro Postgres 15+: Ujistíme se, že uživatel má práva na výchozí schéma
GRANT ALL ON SCHEMA public TO matrogulike_user;

-- Povolení postgis extensions (pokud chceš později)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
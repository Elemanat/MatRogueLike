CREATE USER matrogulike_user WITH PASSWORD 'your-strong-password';
CREATE DATABASE matrogulike OWNER matrogulike_user;

\c matrogulike

GRANT ALL ON SCHEMA public TO matrogulike_user;
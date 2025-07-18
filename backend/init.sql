-- Archivo de inicialización para PostgreSQL
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor

-- Crear extensiones útiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la base de datos si no existe
-- (Ya se crea automáticamente por la variable POSTGRES_DB)

-- Configurar zona horaria
SET timezone = 'America/Santiago';

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' as status;

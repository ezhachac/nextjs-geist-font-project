# 💰 Aplicación de Finanzas Personales

Una aplicación web completa para gestionar finanzas personales, construida con **Next.js** (frontend) y **Node.js + Express + PostgreSQL** (backend).

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **🔐 Autenticación**: Registro e inicio de sesión con JWT
- **💳 Gestión de Cuentas**: Múltiples cuentas (Banco, Efectivo, Ahorros, etc.)
- **📊 Transacciones**: Registro de ingresos y gastos con categorización
- **🎯 Metas de Ahorro**: Definir y seguir objetivos financieros
- **📈 Análisis Financiero**: Balance mensual, proyecciones y estadísticas
- **🎨 Diseño Moderno**: Interfaz limpia con colores pasteles diferenciados
- **📱 Responsive**: Funciona perfectamente en móviles y desktop

### 🎨 Paleta de Colores

- **Ingresos**: Verde pastel (#10B981, #D1FAE5)
- **Gastos**: Rojo pastel (#EF4444, #FEE2E2)
- **Ahorros**: Azul pastel (#3B82F6, #DBEAFE)
- **Metas**: Púrpura pastel (#8B5CF6, #EDE9FE)

## 🏗️ Arquitectura

```
finanzas-app/
├── backend/                 # API Server (Node.js + Express)
│   ├── controllers/         # Lógica de negocio
│   ├── models/             # Modelos de Sequelize
│   ├── routes/             # Rutas de la API
│   ├── middlewares/        # Middlewares (auth, errors)
│   ├── config/             # Configuración de DB
│   └── seeders/            # Datos iniciales
├── src/                    # Frontend (Next.js)
│   ├── app/                # App Router de Next.js
│   ├── components/         # Componentes UI (shadcn/ui)
│   └── lib/                # Utilidades y API client
├── docker-compose.yml      # PostgreSQL containerizado
└── README-FINANZAS.md     # Este archivo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Node.js** 18+ 
- **Docker** y **Docker Compose**
- **Git**

### 1. Clonar y Configurar el Proyecto

```bash
# El proyecto ya está en el directorio actual
cd /project/sandbox/user-workspace

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 2. Configurar Base de Datos

```bash
# Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Verificar que PostgreSQL esté corriendo
docker-compose ps
```

### 3. Configurar Variables de Entorno

El archivo `backend/.env` ya está configurado con:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=password
DB_NAME=finanzas_db

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=7d

# Server
PORT=8001
NODE_ENV=development
FRONTEND_URL=http://localhost:8000
```

### 4. Ejecutar la Aplicación

#### Opción A: Desarrollo Completo

```bash
# Terminal 1: Iniciar Backend
cd backend
npm run dev

# Terminal 2: Iniciar Frontend (en otra terminal)
npm run dev
```

#### Opción B: Solo Frontend (con datos mock)

```bash
# Solo el frontend con datos de ejemplo
npm run dev
```

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:8001
- **Base de Datos (Adminer)**: http://localhost:8080

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario

### Cuentas
- `GET /api/accounts` - Listar cuentas
- `POST /api/accounts` - Crear cuenta
- `PUT /api/accounts/:id` - Actualizar cuenta
- `DELETE /api/accounts/:id` - Eliminar cuenta

### Transacciones
- `GET /api/transactions` - Listar transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions/:id` - Actualizar transacción
- `DELETE /api/transactions/:id` - Eliminar transacción

### Metas
- `GET /api/goals` - Listar metas
- `POST /api/goals` - Crear meta
- `POST /api/goals/:id/add` - Agregar dinero a meta
- `PUT /api/goals/:id` - Actualizar meta
- `DELETE /api/goals/:id` - Eliminar meta

### Análisis
- `GET /api/analytics/dashboard` - Resumen del dashboard
- `GET /api/analytics/monthly` - Análisis mensual
- `GET /api/analytics/projections` - Proyecciones financieras

## 🗄️ Estructura de Base de Datos

### Tablas Principales

1. **users** - Usuarios del sistema
2. **accounts** - Cuentas bancarias/efectivo
3. **categories** - Categorías de ingresos/gastos
4. **transactions** - Transacciones financieras
5. **goals** - Metas de ahorro

### Relaciones

- Un usuario tiene múltiples cuentas
- Una cuenta tiene múltiples transacciones
- Una categoría puede tener múltiples transacciones
- Un usuario tiene múltiples metas

## 🎯 Funcionalidades Destacadas

### Dashboard Inteligente
- Balance total consolidado
- Resumen mensual de ingresos vs gastos
- Progreso de metas visualizado
- Transacciones recientes

### Análisis Financiero
- Distribución de gastos por categoría
- Proyecciones basadas en historial
- Alertas de presupuesto
- Porcentaje de ahorro mensual

### Gestión de Metas
- Definir objetivos con fecha límite
- Seguimiento visual del progreso
- Notificaciones de cumplimiento

## 🔧 Comandos Útiles

```bash
# Reiniciar base de datos
docker-compose down
docker-compose up -d postgres

# Ver logs del backend
cd backend && npm run dev

# Poblar categorías predeterminadas
cd backend && npx ts-node seeders/categories.ts

# Verificar salud de la API
curl http://localhost:8001/health
```

## 🚀 Despliegue en Producción

### Variables de Entorno para Producción

```env
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro_para_produccion
DB_HOST=tu_host_de_produccion
DB_PASS=tu_password_seguro
FRONTEND_URL=https://tu-dominio.com
```

### Comandos de Build

```bash
# Build del frontend
npm run build

# Build del backend
cd backend && npm run build
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si encuentras algún problema:

1. Verifica que PostgreSQL esté corriendo: `docker-compose ps`
2. Revisa los logs del backend: `cd backend && npm run dev`
3. Verifica las variables de entorno en `backend/.env`
4. Asegúrate de que los puertos 8000, 8001 y 5432 estén disponibles

---

**¡Disfruta gestionando tus finanzas de manera inteligente! 💰📊**

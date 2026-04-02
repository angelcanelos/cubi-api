# Documentación de Casos de Uso - Cubi-API

Esta documentación describe las funcionalidades y reglas de negocio del sistema **Cubi-API**, diseñado para la gestión de inventario de troncos (Trocería) y la producción de madera (Producción).

---

## 1. Autenticación y Seguridad

El sistema utiliza **JWT (JSON Web Token)** para la autenticación y **RBAC (Role-Based Access Control)** para la autorización.

### UC-00: Iniciar Sesión (Login)
*   **Actor**: Todos los usuarios.
*   **Descripción**: Proporcionar credenciales (email y password) para obtener un token de acceso.
*   **Endpoint**: `POST /auth/login`
*   **Resultado**: Un token JWT que debe incluirse en el header `Authorization: Bearer <token>` para peticiones protegidas.

### Roles Definidos
| Rol | Descripción | Permisos |
| :--- | :--- | :--- |
| **ADMIN** | Administrador del sistema | Acceso total (CRUD) en todos los módulos. |
| **JEFATURA** | Personal de supervisión | Solo lectura (GET) en inventarios y producción. |

---

## 2. Gestión de Usuarios (Solo ADMIN)

### UC-07: Administrar Usuarios
*   **Actor**: Administrador.
*   **Descripción**: El administrador puede crear, ver, actualizar y eliminar usuarios del sistema.
*   **Datos del Usuario**: Nombres, Apellidos, Email, Password (encriptado), Rol.
*   **Endpoints**: `POST /users`, `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`.

---

## 3. Módulo de Trocería (Inventario de Troncos)

### UC-01: Crear Entrada de Trocería
*   **Actor**: Administrador.
*   **Endpoint**: `POST /troceria`
*   **Nota**: El aserradero se asigna automáticamente por turno.

### UC-02: Registrar Trozas e Individuales
*   **Actor**: Administrador.
*   **Endpoint**: `POST /troceria/:id/trozas`

### UC-03: Consultar Trocería
*   **Actor**: Administrador / Jefatura.
*   **Endpoint**: `GET /troceria`

---

## 4. Módulo de Producción (Madera Aserrada)

### UC-04: Reportar Producción
*   **Actor**: Administrador.
*   **Endpoint**: `POST /produccion`

### UC-05: Consultar Producción
*   **Actor**: Administrador / Jefatura.
*   **Endpoint**: `GET /produccion`

---

## 5. Resumen de Fórmulas y Lógica

| Módulo | Campo calculado | Fórmula |
| :--- | :--- | :--- |
| **Trocería** | Volumen Troza | $$\pi \times r^2 \times L \times (1 - desc)$$ |
| **Producción** | Pies Tabla (PT) | $$(G \times A \times L) / 12$$ |
| **Producción** | Volumen Pieza | $$G \times A \times L \times (Cant. total)$$ |

> [!IMPORTANTE]
> Para el primer acceso, utilice las credenciales del seed:
> **Usuario**: `admin@cubi.com` | **Password**: `admin123`

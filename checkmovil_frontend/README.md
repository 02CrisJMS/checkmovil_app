# CheckMovil Frontend

Aplicación móvil desarrollada en Flutter para el sistema CheckMovil.

## 🚀 Características

- **Autenticación segura**: Login y registro de usuarios
- **Almacenamiento seguro**: Tokens JWT guardados de forma segura
- **Interfaz moderna**: Diseño Material 3 con tema personalizado
- **Conexión con backend**: Integración completa con la API REST

## 📁 Estructura del Proyecto

```
lib/
├── config/
│   └── api_config.dart          # Configuración de la API
├── screens/
│   └── login_screen.dart        # Pantalla de login
├── services/
│   └── auth_service.dart        # Servicio de autenticación
├── widgets/                     # Componentes reutilizables
└── main.dart                    # Punto de entrada de la app
```

## 🛠️ Configuración

### Requisitos

- Flutter SDK 3.8.1 o superior
- Dart SDK
- Android Studio / VS Code

### Instalación

1. **Clonar el proyecto**:
   ```bash
   git clone <repository-url>
   cd checkmovil_frontend
   ```

2. **Instalar dependencias**:
   ```bash
   flutter pub get
   ```

3. **Configurar la URL del backend**:
   Edita `lib/config/api_config.dart` y cambia la IP del servidor:
   ```dart
   static const String baseUrl = 'http://TU_IP:3000/api';
   ```

4. **Ejecutar la aplicación**:
   ```bash
   flutter run
   ```

## 📱 Pantallas

### Login Screen (`lib/screens/login_screen.dart`)

- **Campos**: Usuario y contraseña
- **Validación**: Campos requeridos y longitud mínima
- **Funcionalidades**:
  - Login con credenciales
  - Mostrar/ocultar contraseña
  - Manejo de errores
  - Indicador de carga
  - Navegación a registro

## 🔧 Servicios

### AuthService (`lib/services/auth_service.dart`)

**Métodos principales**:

- `login(username, password)`: Autenticación de usuarios
- `register(username, password, pin)`: Registro de nuevos usuarios
- `verifyToken()`: Verificación de token JWT
- `logout()`: Cerrar sesión y limpiar token
- `getProtectedData(endpoint)`: Acceso a rutas protegidas

**Características**:

- Almacenamiento seguro de tokens con `flutter_secure_storage`
- Manejo automático de headers de autenticación
- Timeout configurable para peticiones HTTP
- Manejo de errores de conexión

## ⚙️ Configuración de la API

### ApiConfig (`lib/config/api_config.dart`)

```dart
class ApiConfig {
  static const String baseUrl = 'http://192.168.1.100:3000/api';
  static const Duration timeout = Duration(seconds: 30);
  
  // Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String verifyEndpoint = '/auth/verify';
}
```

## 🎨 Tema de la Aplicación

- **Color primario**: Azul (#2196F3)
- **Material 3**: Diseño moderno con Material You
- **Campos de texto**: Bordes redondeados y relleno
- **Botones**: Estilo consistente con bordes redondeados

## 📦 Dependencias

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.1.0                    # Cliente HTTP para API
  flutter_secure_storage: ^9.0.0  # Almacenamiento seguro
```

## 🔐 Seguridad

- **Tokens JWT**: Almacenados de forma segura con `flutter_secure_storage`
- **Headers de autenticación**: Automáticos en peticiones protegidas
- **Validación de campos**: En el frontend antes de enviar al backend
- **Manejo de errores**: Respuestas de error del servidor

## 🚀 Comandos Útiles

```bash
# Ejecutar en modo debug
flutter run

# Ejecutar en modo release
flutter run --release

# Construir APK
flutter build apk

# Limpiar proyecto
flutter clean

# Obtener dependencias
flutter pub get

# Actualizar dependencias
flutter pub upgrade
```

## 📋 Próximas Funcionalidades

- [ ] Pantalla de registro
- [ ] Pantalla principal (Home)
- [ ] Navegación entre pantallas
- [ ] Gestión de estados con Provider/Riverpod
- [ ] Pantallas específicas por rol de usuario
- [ ] Funcionalidades de la aplicación principal

## 🔗 Conexión con Backend

El frontend se conecta al backend a través de la API REST:

- **Base URL**: `http://192.168.1.100:3000/api`
- **Autenticación**: JWT Bearer Token
- **Formato**: JSON
- **Timeout**: 30 segundos

### Endpoints Utilizados

- `POST /auth/login` - Login de usuarios
- `POST /auth/register` - Registro de usuarios
- `GET /auth/verify` - Verificación de token
- `GET /test` - Ruta protegida de prueba
- `GET /admin` - Ruta protegida por rol

## 📝 Notas de Desarrollo

1. **Cambiar IP del servidor**: Edita `lib/config/api_config.dart`
2. **Asegurar que el backend esté ejecutándose** en el puerto 3000
3. **Verificar conectividad de red** entre dispositivo y servidor
4. **Usar IP de red local** para desarrollo (no localhost)

## 🐛 Solución de Problemas

### Error de conexión
- Verificar que el backend esté ejecutándose
- Comprobar la IP en `api_config.dart`
- Verificar conectividad de red

### Error de dependencias
```bash
flutter clean
flutter pub get
```

### Error de compilación
- Verificar versión de Flutter: `flutter --version`
- Actualizar Flutter: `flutter upgrade`

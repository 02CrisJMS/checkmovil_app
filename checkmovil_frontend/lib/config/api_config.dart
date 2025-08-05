// Configuración de la API
class ApiConfig {
  // URL base del backend - IP del servidor
  static const String baseUrl = 'http://192.168.1.114:3000/api';

  // Log de configuración al inicializar
  static void printConfig() {
    print('🌐 Configuración de API:');
    print('   Base URL: $baseUrl');
    print('   Login Endpoint: $loginEndpoint');
    print('   Register Endpoint: $registerEndpoint');
    print('   Timeout: $timeout');
  }

  // Endpoints de autenticación
  static const String loginEndpoint = '/auth/login';
  static const String registerEndpoint = '/auth/register';
  static const String verifyEndpoint = '/auth/verify';

  // Endpoints protegidos
  static const String testEndpoint = '/test';
  static const String adminEndpoint = '/admin';

  // Headers por defecto
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Timeout para las peticiones HTTP
  static const Duration timeout = Duration(seconds: 30);
}

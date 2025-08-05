import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';

class AuthService {
  static const FlutterSecureStorage _storage = FlutterSecureStorage();

  // Token de autenticación
  static String? _authToken;

  // Getters
  static String? get authToken => _authToken;
  static bool get isAuthenticated => _authToken != null;

  // Inicializar el token desde el almacenamiento seguro
  static Future<void> initialize() async {
    _authToken = await _storage.read(key: 'auth_token');
  }

  // Guardar token en almacenamiento seguro
  static Future<void> _saveToken(String token) async {
    _authToken = token;
    await _storage.write(key: 'auth_token', value: token);
  }

  // Eliminar token del almacenamiento
  static Future<void> logout() async {
    _authToken = null;
    await _storage.delete(key: 'auth_token');
  }

  // Obtener token del almacenamiento
  static Future<String?> getToken() async {
    _authToken ??= await _storage.read(key: 'auth_token');
    return _authToken;
  }

  // Obtener headers con token de autenticación
  static Map<String, String> get _authHeaders {
    final headers = Map<String, String>.from(ApiConfig.defaultHeaders);
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  // Método de registro
  static Future<Map<String, dynamic>> register({
    required String username,
    required String password,
    String? pin,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('${ApiConfig.baseUrl}${ApiConfig.registerEndpoint}'),
            headers: ApiConfig.defaultHeaders,
            body: json.encode({
              'username': username,
              'password': password,
              'pin': pin,
            }),
          )
          .timeout(ApiConfig.timeout);

      final data = json.decode(response.body);

      if (response.statusCode == 201) {
        return {
          'success': true,
          'message': data['message'] ?? 'Usuario registrado exitosamente',
          'data': data['data'],
        };
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Error en el registro',
          'error': data['error'] ?? 'Error desconocido',
        };
      }
    } catch (e) {
      print('❌ Error de conexión en registro:');
      print('   Tipo de error: ${e.runtimeType}');
      print('   Mensaje: $e');
      return {
        'success': false,
        'message': 'Error de conexión',
        'error': e.toString(),
      };
    }
  }

  // Método de login
  static Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final url = '${ApiConfig.baseUrl}${ApiConfig.loginEndpoint}';
      print('🔗 Intentando conectar a: $url');
      print('📤 Enviando datos: username=$username, password=***');
      print('📋 Headers: ${ApiConfig.defaultHeaders}');

      final response = await http
          .post(
            Uri.parse(url),
            headers: ApiConfig.defaultHeaders,
            body: json.encode({'username': username, 'password': password}),
          )
          .timeout(ApiConfig.timeout);

      print('📥 Respuesta recibida:');
      print('   Status Code: ${response.statusCode}');
      print('   Headers: ${response.headers}');
      print('   Body: ${response.body}');

      final data = json.decode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // Guardar el token
        final token = data['data']['token'];
        await _saveToken(token);

        return {
          'success': true,
          'message': data['message'] ?? 'Login exitoso',
          'data': data['data'],
        };
      } else {
        print('❌ Login fallido:');
        print('   Status Code: ${response.statusCode}');
        print('   Respuesta: $data');
        return {
          'success': false,
          'message': data['message'] ?? 'Error en el login',
          'error': data['error'] ?? 'Credenciales inválidas',
        };
      }
    } catch (e) {
      print('❌ Error de conexión en login:');
      print('   Tipo de error: ${e.runtimeType}');
      print('   Mensaje: $e');
      return {
        'success': false,
        'message': 'Error de conexión',
        'error': e.toString(),
      };
    }
  }

  // Método para verificar token
  static Future<Map<String, dynamic>> verifyToken() async {
    if (_authToken == null) {
      return {'success': false, 'message': 'No hay token de autenticación'};
    }

    try {
      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}${ApiConfig.verifyEndpoint}'),
            headers: _authHeaders,
          )
          .timeout(ApiConfig.timeout);

      final data = json.decode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'message': data['message'] ?? 'Token válido',
          'data': data['data'],
        };
      } else {
        // Token inválido, eliminar del almacenamiento
        await logout();
        return {
          'success': false,
          'message': data['message'] ?? 'Token inválido',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión',
        'error': e.toString(),
      };
    }
  }

  // Método para hacer peticiones a rutas protegidas
  static Future<Map<String, dynamic>> getProtectedData(String endpoint) async {
    if (_authToken == null) {
      return {'success': false, 'message': 'No hay token de autenticación'};
    }

    try {
      final response = await http
          .get(
            Uri.parse('${ApiConfig.baseUrl}$endpoint'),
            headers: _authHeaders,
          )
          .timeout(ApiConfig.timeout);

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Error al obtener datos',
          'error': data['error'],
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error de conexión',
        'error': e.toString(),
      };
    }
  }
}

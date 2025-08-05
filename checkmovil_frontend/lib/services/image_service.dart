import 'dart:io';
import 'package:dio/dio.dart';
import 'package:path/path.dart' as path;
import '../config/api_config.dart';
import 'auth_service.dart';

class ImageService {
  static final Dio _dio = Dio();

  // Configurar interceptor para agregar token de autenticación
  static void _setupInterceptors() {
    _dio.interceptors.clear();
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Agregar token de autenticación
          final token = await AuthService.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) {
          print('❌ Error en ImageService: ${error.message}');
          handler.next(error);
        },
      ),
    );
  }

  /// Sube una imagen al backend
  ///
  /// [imageFile] - El archivo de imagen a subir
  /// Retorna un Map con la respuesta del servidor
  static Future<Map<String, dynamic>> uploadImage(File imageFile) async {
    try {
      print('📤 Iniciando subida de imagen...');
      print('   Archivo: ${imageFile.path}');
      print('   Tamaño: ${await imageFile.length()} bytes');

      _setupInterceptors();

      // Crear FormData para la subida
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          imageFile.path,
          filename: path.basename(imageFile.path),
        ),
      });

      print('   URL: ${ApiConfig.baseUrl}/payments/upload');

      // Realizar la petición
      final response = await _dio.post(
        '${ApiConfig.baseUrl}/payments/upload',
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
          sendTimeout: const Duration(seconds: 30),
          receiveTimeout: const Duration(seconds: 30),
        ),
      );

      print('✅ Imagen subida exitosamente');
      print('   Respuesta: ${response.data}');

      return {
        'success': true,
        'data': response.data['data'],
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      print('❌ Error de red: ${e.message}');
      print('   Tipo: ${e.type}');
      print('   Código: ${e.response?.statusCode}');
      print('   Respuesta: ${e.response?.data}');

      String errorMessage = 'Error al subir la imagen';

      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      } else if (e.type == DioExceptionType.connectionTimeout) {
        errorMessage = 'Tiempo de conexión agotado';
      } else if (e.type == DioExceptionType.receiveTimeout) {
        errorMessage = 'Tiempo de respuesta agotado';
      } else if (e.type == DioExceptionType.connectionError) {
        errorMessage = 'Error de conexión al servidor';
      }

      return {'success': false, 'message': errorMessage, 'error': e.message};
    } catch (e) {
      print('❌ Error inesperado: $e');
      return {
        'success': false,
        'message': 'Error inesperado al subir la imagen',
        'error': e.toString(),
      };
    }
  }

  /// Obtiene la lista de pagos del usuario
  static Future<Map<String, dynamic>> getPayments() async {
    try {
      print('📋 Obteniendo lista de pagos...');

      _setupInterceptors();

      final response = await _dio.get(
        '${ApiConfig.baseUrl}/payments/payments',
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );

      print('✅ Pagos obtenidos exitosamente');

      return {
        'success': true,
        'data': response.data['data'],
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      print('❌ Error al obtener pagos: ${e.message}');

      String errorMessage = 'Error al obtener los pagos';

      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }

      return {'success': false, 'message': errorMessage, 'error': e.message};
    } catch (e) {
      print('❌ Error inesperado al obtener pagos: $e');
      return {
        'success': false,
        'message': 'Error inesperado al obtener los pagos',
        'error': e.toString(),
      };
    }
  }

  /// Elimina un pago específico
  static Future<Map<String, dynamic>> deletePayment(String paymentId) async {
    try {
      print('🗑️ Eliminando pago: $paymentId');

      _setupInterceptors();

      final response = await _dio.delete(
        '${ApiConfig.baseUrl}/payments/payments/$paymentId',
        options: Options(
          sendTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        ),
      );

      print('✅ Pago eliminado exitosamente');

      return {'success': true, 'message': response.data['message']};
    } on DioException catch (e) {
      print('❌ Error al eliminar pago: ${e.message}');

      String errorMessage = 'Error al eliminar el pago';

      if (e.response?.data != null && e.response?.data['message'] != null) {
        errorMessage = e.response!.data['message'];
      }

      return {'success': false, 'message': errorMessage, 'error': e.message};
    } catch (e) {
      print('❌ Error inesperado al eliminar pago: $e');
      return {
        'success': false,
        'message': 'Error inesperado al eliminar el pago',
        'error': e.toString(),
      };
    }
  }
}

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/storage/secure_storage.dart';

// URL de l'API
// Pour Chrome (web) ou Windows desktop sur WAMP local :
const String baseUrl = 'http://localhost/Ecom_pro/backend/public/api/v1';
// Pour émulateur Android : 'http://10.0.2.2/Ecom_pro/backend/public/api/v1'
// Pour appareil physique : 'http://192.168.X.X/Ecom_pro/backend/public/api/v1'

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  ));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final tokenStorage = ref.read(tokenStorageProvider);
      final token = await tokenStorage.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (DioException e, handler) {
      // Handle global errors, like 401 Unauthorized here
      return handler.next(e);
    },
  ));

  return dio;
});

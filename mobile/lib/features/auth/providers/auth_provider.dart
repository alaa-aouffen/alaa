import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/storage/secure_storage.dart';

final authProvider = AsyncNotifierProvider<AuthNotifier, bool>(() {
  return AuthNotifier();
});

class AuthNotifier extends AsyncNotifier<bool> {
  late Dio _dio;
  late TokenStorage _tokenStorage;

  @override
  Future<bool> build() async {
    _dio = ref.read(dioProvider);
    _tokenStorage = ref.read(tokenStorageProvider);
    return _checkAuthStatus();
  }

  Future<bool> _checkAuthStatus() async {
    try {
      final token = await _tokenStorage.getToken();
      return token != null;
    } catch (e) {
      return false;
    }
  }

  Future<bool> login(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final token = response.data['access_token'];
      if (token != null) {
        await _tokenStorage.saveToken(token);
        state = const AsyncValue.data(true);
        return true;
      } else {
        state = const AsyncValue.data(false);
        return false;
      }
    } on DioException catch (e) {
      state = AsyncValue.error(e.response?.data['error'] ?? 'Login failed', e.stackTrace!);
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {
      // Ignore errors on logout
    } finally {
      await _tokenStorage.deleteToken();
      state = const AsyncValue.data(false);
    }
  }
}

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/api_client.dart';

final callLogRepositoryProvider = Provider<CallLogRepository>((ref) {
  return CallLogRepository(ref.read(dioProvider));
});

class CallLogRepository {
  final Dio _dio;

  CallLogRepository(this._dio);

  Future<void> addCallLog(int orderId, String notes, String result) async {
    await _dio.post('/orders/$orderId/call-logs', data: {
      'result': result,
      'notes': notes,
    });
  }
}

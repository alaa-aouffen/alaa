import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/features/orders/models/order.dart';

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  return OrderRepository(ref.read(dioProvider));
});

class OrderRepository {
  final Dio _dio;

  OrderRepository(this._dio);

  Future<List<Order>> getOrders({String? status, int page = 1}) async {
    final response = await _dio.get('/orders', queryParameters: {
      if (status != null) 'status': status,
      'page': page,
      'per_page': 20,
    });

    final data = response.data['data'] as List;
    return data.map((e) => Order.fromJson(e)).toList();
  }

  Future<Order> getOrderDetails(int orderId) async {
    final response = await _dio.get('/orders/$orderId');
    return Order.fromJson(response.data);
  }
}

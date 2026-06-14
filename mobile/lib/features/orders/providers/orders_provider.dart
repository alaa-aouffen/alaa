import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/orders/models/order.dart';
import 'package:mobile/features/orders/repositories/order_repository.dart';

// Provider that takes a status filter (e.g. 'new', 'confirmed', 'shipped') or null for all.
final ordersProvider = FutureProvider.autoDispose.family<List<Order>, String?>((ref, status) async {
  final repository = ref.watch(orderRepositoryProvider);
  return repository.getOrders(status: status);
});

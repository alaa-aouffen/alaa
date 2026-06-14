import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/dashboard/models/dashboard_stats.dart';
import 'package:mobile/features/dashboard/repositories/dashboard_repository.dart';

final dashboardStatsProvider = FutureProvider.autoDispose<DashboardStats>((ref) async {
  final repository = ref.watch(dashboardRepositoryProvider);
  return repository.getDashboardStats();
});

class DashboardStats {
  final int assignedOrders;
  final int confirmedOrders;
  final int cancelledOrders;
  final int pendingOrders;
  final int totalCalls;
  final double confirmationRate;

  // Admin stats
  final int? totalOrders;
  final int? newOrders;
  final int? deliveredOrders;

  DashboardStats({
    required this.assignedOrders,
    required this.confirmedOrders,
    required this.cancelledOrders,
    required this.pendingOrders,
    required this.totalCalls,
    required this.confirmationRate,
    this.totalOrders,
    this.newOrders,
    this.deliveredOrders,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      assignedOrders: json['assigned_orders'] ?? json['total_orders'] ?? 0,
      confirmedOrders: json['confirmed_orders'] ?? 0,
      cancelledOrders: json['cancelled_orders'] ?? 0,
      pendingOrders: json['pending_orders'] ?? json['new_orders'] ?? 0,
      totalCalls: json['total_calls'] ?? 0,
      confirmationRate: (json['confirmation_rate'] as num?)?.toDouble() ?? 0.0,
      totalOrders: json['total_orders'],
      newOrders: json['new_orders'],
      deliveredOrders: json['delivered_orders'],
    );
  }
}

class CallLog {
  final int id;
  final int orderId;
  final String? notes;
  final DateTime calledAt;

  CallLog({
    required this.id,
    required this.orderId,
    this.notes,
    required this.calledAt,
  });

  factory CallLog.fromJson(Map<String, dynamic> json) {
    return CallLog(
      id: json['id'],
      orderId: json['order_id'],
      notes: json['notes'],
      calledAt: DateTime.parse(json['called_at'] ?? json['created_at']),
    );
  }
}

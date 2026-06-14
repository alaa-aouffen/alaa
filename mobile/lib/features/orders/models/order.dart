class Order {
  final int id;
  final String customerName;
  final String customerPhone;
  final String wilaya;
  final String? commune;
  final String? address;
  final String productName;
  final int quantity;
  final double totalPrice;
  final String status;
  final String? trackingNumber;
  final String? notes;
  final DateTime createdAt;

  Order({
    required this.id,
    required this.customerName,
    required this.customerPhone,
    required this.wilaya,
    this.commune,
    this.address,
    required this.productName,
    required this.quantity,
    required this.totalPrice,
    required this.status,
    this.trackingNumber,
    this.notes,
    required this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      customerName: json['customer_name'] ?? 'Inconnu',
      customerPhone: json['customer_phone'] ?? '',
      wilaya: json['wilaya'] ?? '',
      commune: json['commune'],
      address: json['address'],
      productName: json['product_name'] ?? '',
      quantity: json['quantity'] ?? 1,
      totalPrice: double.tryParse(json['total_price']?.toString() ?? '0') ?? 0.0,
      status: json['status'] ?? 'new',
      trackingNumber: json['tracking_number'],
      notes: json['notes'],
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}

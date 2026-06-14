import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/orders/models/order.dart';
import 'package:mobile/features/orders/widgets/call_log_bottom_sheet.dart';
import 'package:url_launcher/url_launcher.dart';

class OrderDetailsScreen extends ConsumerWidget {
  final Order order;
  const OrderDetailsScreen({super.key, required this.order});

  Future<void> _callCustomer(String phone) async {
    final Uri url = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Commande #${order.id}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSection(
              context,
              title: 'Client',
              icon: Icons.person,
              children: [
                _buildInfoRow('Nom', order.customerName),
                const SizedBox(height: 8),
                _buildInfoRow('Téléphone', order.customerPhone),
                const SizedBox(height: 8),
                _buildInfoRow('Wilaya', order.wilaya),
                if (order.commune != null) ...[
                  const SizedBox(height: 8),
                  _buildInfoRow('Commune', order.commune!),
                ],
                if (order.address != null) ...[
                  const SizedBox(height: 8),
                  _buildInfoRow('Adresse', order.address!),
                ],
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Produit',
              icon: Icons.shopping_bag,
              children: [
                _buildInfoRow('Produit', order.productName),
                const SizedBox(height: 8),
                _buildInfoRow('Quantité', order.quantity.toString()),
                const SizedBox(height: 8),
                _buildInfoRow('Total', '${order.totalPrice} DZD', isBold: true),
              ],
            ),
            const SizedBox(height: 16),
            _buildSection(
              context,
              title: 'Statut',
              icon: Icons.info,
              children: [
                _buildInfoRow('Statut', order.status.toUpperCase()),
                if (order.trackingNumber != null) ...[
                  const SizedBox(height: 8),
                  _buildInfoRow('Tracking', order.trackingNumber!),
                ],
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            heroTag: 'log',
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                builder: (context) => CallLogBottomSheet(orderId: order.id),
              );
            },
            backgroundColor: Colors.blueAccent,
            foregroundColor: Colors.white,
            child: const Icon(Icons.note_add),
          ),
          const SizedBox(width: 16),
          FloatingActionButton.extended(
            heroTag: 'call',
            onPressed: () => _callCustomer(order.customerPhone),
            icon: const Icon(Icons.phone),
            label: const Text('Appeler'),
            backgroundColor: Colors.green,
            foregroundColor: Colors.white,
          ),
        ],
      ),
    );
  }

  Widget _buildSection(BuildContext context, {required String title, required IconData icon, required List<Widget> children}) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Theme.of(context).colorScheme.primary),
                const SizedBox(width: 8),
                Text(title, style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, {bool isBold = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 100,
          child: Text(
            label,
            style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              fontSize: isBold ? 16 : 14,
            ),
          ),
        ),
      ],
    );
  }
}

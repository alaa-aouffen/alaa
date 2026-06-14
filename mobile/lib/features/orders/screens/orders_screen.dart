import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/widgets/shimmer_loader.dart';
import 'package:mobile/features/orders/providers/orders_provider.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String?> _statuses = [null, 'new', 'confirmed', 'shipped'];
  final List<String> _tabTitles = ['Toutes', 'Nouvelles', 'Confirmées', 'Expédiées'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _statuses.length, vsync: this);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Commandes'),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: _tabTitles.map((t) => Tab(text: t)).toList(),
          indicatorColor: Colors.white,
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _statuses.map((status) => _OrderListTab(status: status)).toList(),
      ),
    );
  }
}

class _OrderListTab extends ConsumerWidget {
  final String? status;
  const _OrderListTab({required this.status});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(ordersProvider(status));

    return RefreshIndicator(
      onRefresh: () async => ref.refresh(ordersProvider(status)),
      child: ordersAsync.when(
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text('Aucune commande trouvée.'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: orders.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final order = orders[index];
              return Card(
                margin: EdgeInsets.zero,
                child: ListTile(
                  title: Text(order.customerName, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text('${order.wilaya} • ${order.productName}\n${order.totalPrice} DZD'),
                  trailing: _buildStatusBadge(order.status),
                  isThreeLine: true,
                  onTap: () {
                    context.push('/orders/details', extra: order);
                  },
                ),
              );
            },
          );
        },
        loading: () => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: 5,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (_, __) => const ShimmerLoader(width: double.infinity, height: 80),
        ),
        error: (err, stack) => Center(child: Text('Erreur: $err')),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.grey;
    if (status == 'new') color = Colors.blue;
    if (status == 'confirmed') color = Colors.green;
    if (status == 'cancelled') color = Colors.red;
    if (status == 'shipped') color = Colors.purple;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}

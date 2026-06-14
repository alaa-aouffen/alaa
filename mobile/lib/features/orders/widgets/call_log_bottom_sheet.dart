import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/features/orders/providers/orders_provider.dart';
import 'package:mobile/features/orders/repositories/call_log_repository.dart';

class CallLogBottomSheet extends ConsumerStatefulWidget {
  final int orderId;
  const CallLogBottomSheet({super.key, required this.orderId});

  @override
  ConsumerState<CallLogBottomSheet> createState() => _CallLogBottomSheetState();
}

class _CallLogBottomSheetState extends ConsumerState<CallLogBottomSheet> {
  final _notesController = TextEditingController();
  String? _selectedStatus;
  bool _isLoading = false;

  final Map<String, String> _statuses = {
    'answered': 'Répondu',
    'not_reachable': 'Injoignable',
    'confirmed': 'Confirmé',
    'cancelled': 'Annulé',
    'postponed': 'Reporté',
    'wrong_number': 'Faux numéro',
  };

  Future<void> _submit() async {
    if (_selectedStatus == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Veuillez sélectionner le résultat de l\'appel')),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      await ref.read(callLogRepositoryProvider).addCallLog(
            widget.orderId,
            _notesController.text.trim(),
            _selectedStatus!,
          );
      
      // Refresh orders list to reflect status changes
      ref.invalidate(ordersProvider);
      
      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Appel enregistré avec succès', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.only(bottom: bottomInset, left: 16, right: 16, top: 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Ajouter un journal d\'appel',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _notesController,
            decoration: const InputDecoration(
              labelText: 'Notes / Résultat de l\'appel',
              hintText: 'Ex: Le client confirme la commande...',
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _selectedStatus,
            decoration: const InputDecoration(labelText: 'Résultat de l\'appel (Requis)'),
            items: _statuses.entries.map((e) => DropdownMenuItem(value: e.key, child: Text(e.value))).toList(),
            onChanged: (val) => setState(() => _selectedStatus = val),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isLoading ? null : _submit,
            child: _isLoading ? const CircularProgressIndicator() : const Text('Enregistrer'),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

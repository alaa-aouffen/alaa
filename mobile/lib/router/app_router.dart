import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/main/screens/main_screen.dart';
import 'package:mobile/features/orders/models/order.dart';
import 'package:mobile/features/orders/screens/order_details_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    // On retire le redirect basé sur ref.watch car cela recrée l'instance de GoRouter 
    // et cause un rafraîchissement infini de la page.
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (context, state) => const MainScreen(),
      ),
      GoRoute(
        path: '/orders/details',
        builder: (context, state) {
          final order = state.extra as Order;
          return OrderDetailsScreen(order: order);
        },
      ),
    ],
  );
});

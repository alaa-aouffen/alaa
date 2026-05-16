import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  LogOut, 
  PhoneCall,
  ChevronRight,
  Tag,
  Truck,
  Navigation
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const menuItems = [
    { title: 'Tableau de bord', icon: LayoutDashboard, path: '/', roles: ['admin', 'agent'] },
    { title: 'Commandes', icon: ShoppingBag, path: '/orders', roles: ['admin', 'agent'] },
  ];

  if (isAdmin()) {
    menuItems.push({ title: 'Catégories', icon: Tag, path: '/categories', roles: ['admin'] });
    menuItems.push({ title: 'Comptes ZR', icon: Truck, path: '/zr-accounts', roles: ['admin'] });
    menuItems.push({ title: 'Tarifs Livraison', icon: Navigation, path: '/delivery-fees', roles: ['admin'] });
    menuItems.push({ title: 'Agents', icon: Users, path: '/agents', roles: ['admin'] });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-lg">
          <PhoneCall className="text-white" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">EcomPro</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={isActive(item.path) ? 'text-primary-600' : 'group-hover:text-slate-800'} />
              <span className="font-medium">{item.title}</span>
            </div>
            {isActive(item.path) && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 truncate w-32">{user?.name}</span>
            <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

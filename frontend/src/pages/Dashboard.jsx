import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Card, Badge } from '../components/ui';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  PhoneCall, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="relative overflow-hidden group border-none shadow-xl shadow-slate-200/50">
    <div className={`absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-125 ${color}`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-2xl shadow-inner ${color.replace('bg-', 'bg-opacity-10 text-').replace('-500', '-600')} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} strokeWidth={2.5} />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentsProductsDate, setAgentsProductsDate] = useState('');
  const [wilayaStart, setWilayaStart] = useState('');
  const [wilayaEnd, setWilayaEnd] = useState('');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/dashboard', {
          params: {
            date: agentsProductsDate || undefined,
            wilaya_start: wilayaStart || undefined,
            wilaya_end: wilayaEnd || undefined,
          }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [agentsProductsDate, wilayaStart, wilayaEnd]);

  if (loading && !stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
    </div>
  );

  if (isAdmin()) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panneau d'administration</h1>
          <p className="text-slate-500 font-medium">Consultez les performances globales en temps réel.</p>
        </div>

        {/* Admin Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Commandes (Aujourd'hui)" 
            value={stats.orders_today} 
            icon={ShoppingBag} 
            color="bg-blue-500" 
            subtitle={`Total global: ${stats.total_orders}`}
          />
          <StatCard 
            title="Confirmées (Aujourd'hui)" 
            value={stats.confirmed_today} 
            icon={CheckCircle} 
            color="bg-emerald-500" 
            subtitle={`${stats.confirmation_rate_today}% de taux (Total: ${stats.confirmed_orders})`} 
          />
          <StatCard 
            title="Appels (Aujourd'hui)" 
            value={stats.calls_today} 
            icon={PhoneCall} 
            color="bg-primary-500" 
            subtitle={`Total global: ${stats.total_calls}`}
          />
          <StatCard 
            title="Agents Actifs" 
            value={stats.total_agents} 
            icon={Users} 
            color="bg-indigo-500" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Wilayas */}
          <Card>
            <div className="flex flex-col mb-6 gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <MapPin className="text-primary-600" size={20} />
                  Top 10 Wilayas
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Du</p>
                  <input 
                    type="date" 
                    value={wilayaStart} 
                    onChange={(e) => setWilayaStart(e.target.value)} 
                    onClick={(e) => e.target.showPicker?.()}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-primary-500 w-full bg-white shadow-sm cursor-pointer hover:border-primary-300 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Au</p>
                  <input 
                    type="date" 
                    value={wilayaEnd} 
                    onChange={(e) => setWilayaEnd(e.target.value)} 
                    onClick={(e) => e.target.showPicker?.()}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-primary-500 w-full bg-white shadow-sm cursor-pointer hover:border-primary-300 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-5">
              {stats.by_wilaya?.map((item, idx) => {
                const confRate = item.count > 0 ? Math.round((item.confirmed_count / item.count) * 100) : 0;
                return (
                  <div key={item.wilaya} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                        <span className="font-bold text-slate-700 text-sm">{item.wilaya}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.count}</span>
                        <span className="text-[10px] font-bold text-slate-400">cmd</span>
                        <span className="mx-2 text-slate-200">|</span>
                        <span className="text-xs font-black text-emerald-600">{item.confirmed_count}</span>
                        <span className="text-[10px] font-bold text-slate-400">ok</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-primary-500" 
                        style={{ width: `${(item.count / (stats.total_orders || 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="h-full bg-emerald-400 opacity-50" 
                        style={{ width: `${confRate}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Agents */}
          <Card>
             <div className="flex flex-col mb-6 gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" size={20} />
                  Performance Agents
                </h4>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Choisir un jour</p>
                <input 
                  type="date" 
                  value={agentsProductsDate} 
                  onChange={(e) => setAgentsProductsDate(e.target.value)} 
                  onClick={(e) => e.target.showPicker?.()}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-emerald-500 w-full bg-white shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-6">
              {stats.top_agents?.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-700 font-bold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{agent.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{agent.calls_today} appels</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-center">
                      <span className="text-lg font-black text-emerald-600">{agent.confirmed_today}</span>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Ok</p>
                    </div>
                    <div className="text-center">
                      <span className="text-lg font-black text-blue-600">{agent.shipped_today}</span>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Exp</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Products Today */}
          <Card className="border-l-4 border-amber-400">
             <div className="flex flex-col mb-6 gap-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="text-amber-500" size={20} />
                  Ventes par produit
                </h4>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Choisir un jour</p>
                <input 
                  type="date" 
                  value={agentsProductsDate} 
                  onChange={(e) => setAgentsProductsDate(e.target.value)} 
                  onClick={(e) => e.target.showPicker?.()}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-2 outline-none focus:border-amber-500 w-full bg-white shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-4">
              {stats.by_product_today?.length > 0 ? (
                stats.by_product_today.map((item) => (
                  <div 
                    key={item.product_name} 
                    onClick={() => navigate(`/orders?product=${encodeURIComponent(item.product_name)}`)}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-amber-200 transition-colors cursor-pointer active:scale-95 transform duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={16} />
                      </div>
                      <span className="font-bold text-slate-700 text-sm truncate max-w-[150px]" title={item.product_name}>
                        {item.product_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black text-slate-900">{item.count}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">cmd</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-300 mb-3">
                    <ShoppingBag size={24} />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Aucune commande pour cette date</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Global Pending Orders for Admin */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-primary-600" size={20} />
              Commandes en attente (Global)
            </h2>
            <Badge variant="warning">{stats.pending_list?.length} à traiter</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-4 font-semibold text-slate-600">Client</th>
                  <th className="pb-4 font-semibold text-slate-600">Wilaya</th>
                  <th className="pb-4 font-semibold text-slate-600">Tentatives</th>
                  <th className="pb-4 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.pending_list?.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-slate-900">{order.customer_name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-slate-500 font-bold">{order.customer_phone}</p>
                        <span className="text-slate-200">|</span>
                        <p className="text-[10px] text-primary-600 font-black">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-slate-600">{order.wilaya}</td>
                    <td className="py-4 text-sm">
                      <span className="px-2 py-1 bg-slate-100 rounded-full font-medium">
                        {order.call_attempts}
                      </span>
                    </td>
                    <td className="py-4">
                      <a 
                        href={`/orders/${order.id}`}
                        className="text-primary-600 font-bold text-sm hover:underline"
                      >
                        Détails
                      </a>
                    </td>
                  </tr>
                ))}
                {stats.pending_list?.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400">
                      Aucune commande en attente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // Agent Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tableau de bord Agent</h1>
        <p className="text-slate-500">Suivez vos performances et vos commandes assignées.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
              <ShoppingBag size={20} />
            </div>
            <Badge variant="primary">Assignées</Badge>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.assigned_orders}</h3>
          <p className="text-sm text-slate-500">Total commandes</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle size={20} />
            </div>
            <Badge variant="success">{stats.confirmation_rate}%</Badge>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.confirmed_orders}</h3>
          <p className="text-sm text-slate-500">Confirmées</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <PhoneCall size={20} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{stats.total_calls}</h3>
          <p className="text-sm text-slate-500">Appels effectués</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-primary-600" size={20} />
            Nouvelles Commandes
          </h2>
          <Badge variant="warning">{stats.pending_list?.length} à traiter</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-semibold text-slate-600">Client</th>
                <th className="pb-4 font-semibold text-slate-600">Wilaya</th>
                <th className="pb-4 font-semibold text-slate-600">Tentatives</th>
                <th className="pb-4 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.pending_list?.map((order) => (
                <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-slate-900">{order.customer_name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 font-bold">{order.customer_phone}</p>
                      <span className="text-slate-200">|</span>
                      <p className="text-[10px] text-primary-600 font-black">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-600">{order.wilaya}</td>
                  <td className="py-4 text-sm">
                    <span className="px-2 py-1 bg-slate-100 rounded-full font-medium">
                      {order.call_attempts}
                    </span>
                  </td>
                  <td className="py-4">
                    <a 
                      href={`/orders/${order.id}`}
                      className="text-primary-600 font-bold text-sm hover:underline"
                    >
                      Détails
                    </a>
                  </td>
                </tr>
              ))}
              {stats.pending_list?.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    Aucune nouvelle commande en attente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

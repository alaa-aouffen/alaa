import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Input, Button } from '../../components/ui';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MapPin, 
  Phone,
  Trash2,
  Plus,
  X,
  User,
  Package,
  Truck
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrdersList = () => {
  console.log("OrdersList component rendering...");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [productName, setProductName] = useState('');
  const [dashboardCount, setDashboardCount] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', wilaya: 'Alger', commune: '',
    address: '', product_name: '', quantity: 1, unit_price: 0
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Sync URL params to state
    const p = searchParams.get('product');
    if (p) setProductName(p);
    const s = searchParams.get('status');
    if (s) setStatus(s);
    const c = searchParams.get('count');
    if (c !== null) {
      setDashboardCount(parseInt(c, 10));
    } else {
      setDashboardCount(null);
    }
    const start = searchParams.get('start_date');
    if (start) setStartDate(start);
    else setStartDate('');
    const end = searchParams.get('end_date');
    if (end) setEndDate(end);
    else setEndDate('');
  }, [searchParams]);

  const handleAddOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/orders', newOrder);
      setShowAddModal(false);
      setNewOrder({
        customer_name: '', customer_phone: '', wilaya: 'Alger', commune: '',
        address: '', product_name: '', quantity: 1, unit_price: 0
      });
      fetchOrders();
    } catch (err) {
      alert("Erreur lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: {
          page,
          search,
          status,
          wilaya,
          product_name: productName,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          per_page: 15
        }
      });
      setOrders(res.data.data);
      setMeta(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, search, status, wilaya, productName, startDate, endDate]);

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette commande ?')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) return;
    if (!window.confirm(`Voulez-vous vraiment supprimer ${selectedOrders.length} commandes ?`)) return;

    setBulkLoading(true);
    try {
      const res = await api.post('/orders/bulk-delete', {
        order_ids: selectedOrders
      });
      alert(res.data.message);
      setSelectedOrders([]);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la suppression groupée");
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oid => oid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const statusOptions = [
    { value: 'new', label: 'Nouveau' },
    { value: 'assigned', label: 'Assigné' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'confirmed', label: 'Confirmé' },
    { value: 'shipped', label: 'Expédié' },
    { value: 'delivered', label: 'Livré' },
    { value: 'returned', label: 'Retourné' },
    { value: 'cancelled', label: 'Annulé' },
    { value: 'postponed', label: 'Reporté' },
    { value: 'not_reachable', label: 'Injoignable' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Commandes</h1>
          <p className="text-slate-500 font-medium">Gérez et suivez l'état de toutes les expéditions.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin() && selectedOrders.length > 0 && (
            <Button 
              variant="secondary" 
              className="flex items-center gap-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              onClick={handleBulkDelete}
              loading={bulkLoading}
            >
              <Trash2 size={20} />
              <span>Supprimer ({selectedOrders.length})</span>
            </Button>
          )}
          {isAdmin() && (
            <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
              <Plus size={20} />
              <span>Nouvelle Commande</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input 
            placeholder="Nom, Téléphone ou N° de suivi..." 
            icon={Search} 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Filter size={18} />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
                setSearchParams(prev => {
                  if (e.target.value) {
                    prev.set('status', e.target.value);
                  } else {
                    prev.delete('status');
                  }
                  prev.delete('count');
                  prev.delete('start_date');
                  prev.delete('end_date');
                  return prev;
                });
              }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 appearance-none"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <MapPin size={18} />
            </div>
            <select
              value={wilaya}
              onChange={(e) => { setWilaya(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 appearance-none"
            >
              <option value="">Toutes les Wilayas</option>
              {['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou', 'Sétif', 'Béjaïa', 'Tlemcen', 'Batna'].map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" className="w-full" onClick={() => { setSearch(''); setStatus(''); setWilaya(''); setPage(1); setSearchParams({}); }}>
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {/* Active Filters Display */}
      {productName && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl mb-4">
          <Package size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-amber-900">Filtré par produit:</span>
          <Badge variant="amber" className="flex items-center gap-2">
            {productName}
            <X size={14} className="cursor-pointer hover:text-amber-950" onClick={() => {
              setProductName('');
              setSearchParams(prev => {
                prev.delete('product');
                return prev;
              });
            }} />
          </Badge>
        </div>
      )}

      {/* Active Status Filter Banner */}
      {status && (() => {
        const statusMeta = {
          new:          { label: 'Nouvelles',    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    badge: 'bg-blue-100 text-blue-700 border-blue-200' },
          assigned:     { label: 'Assignées',    bg: 'bg-sky-50',     border: 'border-sky-200',     text: 'text-sky-800',     badge: 'bg-sky-100 text-sky-700 border-sky-200' },
          in_progress:  { label: 'En cours',     bg: 'bg-violet-50',  border: 'border-violet-200',  text: 'text-violet-800',  badge: 'bg-violet-100 text-violet-700 border-violet-200' },
          confirmed:    { label: 'Confirmées',   bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
          shipped:      { label: 'Expédiées',    bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-800',  badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
          delivered:    { label: 'Livrées',      bg: 'bg-teal-50',    border: 'border-teal-200',    text: 'text-teal-800',    badge: 'bg-teal-100 text-teal-700 border-teal-200' },
          cancelled:    { label: 'Annulées',     bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     badge: 'bg-red-100 text-red-700 border-red-200' },
          postponed:    { label: 'Reportées',    bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   badge: 'bg-amber-100 text-amber-700 border-amber-200' },
          not_reachable:{ label: 'Injoignables', bg: 'bg-orange-50',  border: 'border-orange-200',  text: 'text-orange-800',  badge: 'bg-orange-100 text-orange-700 border-orange-200' },
          returned:     { label: 'Retournées',   bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-800',    badge: 'bg-rose-100 text-rose-700 border-rose-200' },
          wrong_number: { label: 'Faux N°',      bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     badge: 'bg-red-100 text-red-700 border-red-200' },
        };
        const sm = statusMeta[status] || { label: status, bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
        return (
          <div className={`flex items-center justify-between gap-3 px-4 py-3 ${sm.bg} border ${sm.border} rounded-xl`}>
            <div className="flex items-center gap-3">
              <Filter size={16} className={sm.text} />
              <span className={`text-sm font-bold ${sm.text}`}>Statut :</span>
              <span className={`text-sm font-extrabold px-3 py-1 rounded-full border ${sm.badge}`}>
                {sm.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {dashboardCount !== null ? (
                <span className={`text-xl font-black ${sm.text}`}>
                  {dashboardCount}
                  <span className="text-xs font-semibold ml-1 opacity-60">commande{dashboardCount !== 1 ? 's' : ''}</span>
                </span>
              ) : (
                !loading && meta?.total !== undefined && (
                  <span className={`text-xl font-black ${sm.text}`}>
                    {meta.total}
                    <span className="text-xs font-semibold ml-1 opacity-60">commande{meta.total !== 1 ? 's' : ''}</span>
                  </span>
                )
              )}
              <button
                onClick={() => {
                  setStatus('');
                  setStartDate('');
                  setEndDate('');
                  setPage(1);
                  setSearchParams(prev => {
                    prev.delete('status');
                    prev.delete('count');
                    prev.delete('start_date');
                    prev.delete('end_date');
                    return prev;
                  });
                }}
                className={`p-1.5 rounded-lg hover:bg-white/60 transition-colors ${sm.text}`}
                title="Effacer le filtre"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Orders Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-4 px-4 w-20">ID / Date & Heure</th>
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Produit</th>
                <th className="py-4 px-6">Wilaya</th>
                <th className="py-4 px-6 text-center">Appels</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="py-8 px-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-slate-400 font-medium italic">Aucune commande trouvée.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className={`group hover:bg-slate-50/50 transition-colors ${selectedOrders.includes(order.id) ? 'bg-indigo-50/30' : ''}`}>
                    <td className="py-4 px-6">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">#{order.id}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</span>
                        <span className="text-[10px] text-primary-600 font-black">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 font-medium">
                        <Phone size={12} />
                        <span>{order.customer_phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{order.product_name}</p>
                      <p className="text-xs text-primary-600 font-bold mb-1">{order.total_price} DZD</p>
                      {order.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100 mr-1">
                          {order.category.name}
                        </span>
                      ) : null}
                      {order.tracking_number && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Truck size={10} className="mr-1" />
                          {order.tracking_number}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs uppercase">
                        <MapPin size={10} />
                        {order.wilaya}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center p-1 px-3 bg-slate-100/50 border border-slate-200 rounded-full">
                        <span className="text-xs font-black text-slate-700">{order.call_attempts}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <Badge status={order.status}>{order.status}</Badge>
                        {order.status === 'postponed' && order.postponed_date && (
                          <span className={`text-[10px] font-black ${
                            new Date(order.postponed_date).toDateString() === new Date().toDateString() 
                              ? 'text-orange-600 animate-pulse' 
                              : 'text-slate-400'
                          }`}>
                            {new Date(order.postponed_date).toDateString() === new Date().toDateString() 
                              ? 'À traiter aujourd\'hui' 
                              : `Le ${new Date(order.postponed_date).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Détails"
                        >
                          <Eye size={20} />
                        </button>
                        {isAdmin() && (
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Affichage de <span className="text-slate-900 font-bold">{meta.from}-{meta.to}</span> sur <span className="text-slate-900 font-bold">{meta.total}</span> commandes
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Plus size={24} className="text-primary-600" />
                Nouvelle Commande
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-order-form" onSubmit={handleAddOrder} className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Informations Client
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Nom du client" 
                      required 
                      value={newOrder.customer_name} 
                      onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})} 
                    />
                    <Input 
                      label="Téléphone" 
                      required 
                      value={newOrder.customer_phone} 
                      onChange={(e) => setNewOrder({...newOrder, customer_phone: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Wilaya</label>
                      <select
                        required
                        value={newOrder.wilaya}
                        onChange={(e) => setNewOrder({...newOrder, wilaya: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800"
                      >
                        {['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou', 'Sétif', 'Béjaïa', 'Tlemcen', 'Batna'].map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <Input 
                      label="Commune" 
                      value={newOrder.commune} 
                      onChange={(e) => setNewOrder({...newOrder, commune: e.target.value})} 
                    />
                  </div>
                  <Input 
                    label="Adresse complète" 
                    value={newOrder.address} 
                    onChange={(e) => setNewOrder({...newOrder, address: e.target.value})} 
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14} /> Détails Produit
                  </h4>
                  <Input 
                    label="Nom du produit" 
                    required 
                    value={newOrder.product_name} 
                    onChange={(e) => setNewOrder({...newOrder, product_name: e.target.value})} 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Prix unitaire (DZD)" 
                      type="number" 
                      min="0" 
                      required 
                      value={newOrder.unit_price} 
                      onChange={(e) => setNewOrder({...newOrder, unit_price: e.target.value})} 
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.target.select()}
                    />
                    <Input 
                      label="Quantité" 
                      type="number" 
                      min="1" 
                      required 
                      value={newOrder.quantity} 
                      onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value})} 
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>
                Annuler
              </Button>
              <Button type="submit" form="add-order-form" loading={isSubmitting}>
                Créer la commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Card, Badge, Button } from '../../components/ui';
import { 
  ArrowLeft, 
  Phone, 
  User, 
  MapPin, 
  Package, 
  History,
  CheckCircle,
  XSquare,
  Clock,
  Calendar,
  Truck,
  ExternalLink,
  Copy,
  RefreshCw,
  Box,
  Home,
  Building2,
  Check,
  Navigation
} from 'lucide-react';

// ─── ZR Express Status Timeline Config ─────────────────────────────────────
// Maps ZR Express stateName values to display order in the timeline
const ZR_STATUS_STEPS = [
  { key: 'created',            label: 'COMMANDE REÇUE',         shortLabel: 'Créée' },
  { key: 'ready_to_ship',      label: 'PRÊT À EXPÉDIER',        shortLabel: 'Prêt' },
  { key: 'confirmed_at_hub',   label: 'CONFIRMÉE AU BUREAU',    shortLabel: 'Confirmée' },
  { key: 'dispatched',         label: 'DISPATCH',               shortLabel: 'Dispatch' },
  { key: 'confirmed_at_hub_2', label: 'CONFIRMÉE AU BUREAU',    shortLabel: 'En route' },
  { key: 'out_for_delivery',   label: 'EN LIVRAISON',           shortLabel: 'Livraison' },
  { key: 'delivered',          label: 'LIVRÉ',                  shortLabel: 'Livré' },
];

// All known ZR status names → mapped to our steps
const STATUS_NAME_MAP = {
  // Created / Received
  'Commande reçue': 'created', 'Order created': 'created', 'created': 'created',
  // Ready
  'Prêt à expédier': 'ready_to_ship', 'Ready to ship': 'ready_to_ship', 'Enlevé': 'ready_to_ship',
  // Confirmed at hub (first)
  'Confirmée au bureau': 'confirmed_at_hub', 'Confirmed at hub': 'confirmed_at_hub', 'Tri': 'confirmed_at_hub',
  // Dispatch
  'Dispatch dans une autre Wilaya': 'dispatched', 'Dispatched': 'dispatched', 'En transit': 'dispatched',
  'Scanné': 'dispatched', 'Scanned': 'dispatched', 'Transit': 'dispatched',
  // Confirmed at hub (destination)
  'Confirmée au bureau de destination': 'confirmed_at_hub_2', 'Confirmed at destination hub': 'confirmed_at_hub_2',
  'Sac de ramassage': 'confirmed_at_hub_2', 'Ramassage': 'confirmed_at_hub_2',
  // Out for delivery
  'En livraison': 'out_for_delivery', 'Out for delivery': 'out_for_delivery', 'Sortie en livraison': 'out_for_delivery',
  // Delivered
  'Livré': 'delivered', 'Delivered': 'delivered',
};

function mapStatusToStep(stateName) {
  if (!stateName) return null;
  // Exact match
  if (STATUS_NAME_MAP[stateName]) return STATUS_NAME_MAP[stateName];
  // Partial match (case-insensitive)
  const lower = stateName.toLowerCase();
  for (const [k, v] of Object.entries(STATUS_NAME_MAP)) {
    if (lower.includes(k.toLowerCase()) || k.toLowerCase().includes(lower)) return v;
  }
  return null;
}

// ─── ZR Timeline Component ─────────────────────────────────────────────────
const ZRTimeline = ({ history, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10 gap-3">
        <RefreshCw className="animate-spin text-yellow-500" size={24} />
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Chargement...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
          <Box className="text-slate-300" size={24} />
        </div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          Aucun historique disponible<br />pour le moment.
        </p>
      </div>
    );
  }

  // Build a map: stepKey → array of history events
  const stepEvents = {};
  const historyArray = Array.isArray(history) ? history : (history.history || []);
  
  historyArray.forEach(event => {
    const stateName = event.currentState?.stateName || event.stateName || '';
    const stepKey = mapStatusToStep(stateName);
    if (stepKey) {
      if (!stepEvents[stepKey]) stepEvents[stepKey] = [];
      stepEvents[stepKey].push(event);
    }
  });

  // Find the last reached step index
  let lastReachedIdx = -1;
  ZR_STATUS_STEPS.forEach((step, idx) => {
    if (stepEvents[step.key]?.length > 0) {
      lastReachedIdx = idx;
    }
  });

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[680px]">
        {/* Step labels row */}
        <div className="flex items-start justify-between mb-2 px-4">
          {ZR_STATUS_STEPS.map((step, idx) => (
            <div key={step.key} className="flex-1 text-center">
              <p className={`text-[10px] font-black uppercase tracking-wider leading-tight ${
                idx <= lastReachedIdx ? 'text-slate-700' : 'text-slate-300'
              }`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar + circles row */}
        <div className="relative flex items-center justify-between px-4 py-2">
          {/* Background line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0" />
          {/* Progress line */}
          {lastReachedIdx >= 0 && (
            <div
              className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-yellow-400 z-0 transition-all duration-700"
              style={{
                right: `calc(${(1 - lastReachedIdx / (ZR_STATUS_STEPS.length - 1)) * 100}% - ${lastReachedIdx === ZR_STATUS_STEPS.length - 1 ? '2rem' : '0px'})`
              }}
            />
          )}

          {ZR_STATUS_STEPS.map((step, idx) => {
            const isReached = idx <= lastReachedIdx;
            const isCurrent = idx === lastReachedIdx;
            const events = stepEvents[step.key] || [];
            const latestEvent = events[events.length - 1];

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center flex-1">
                {/* Circle */}
                <div className={`
                  h-8 w-8 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all duration-300
                  ${isReached
                    ? isCurrent
                      ? 'bg-yellow-400 scale-110 shadow-yellow-200/60 shadow-lg'
                      : 'bg-yellow-400'
                    : 'bg-slate-200'
                  }
                `}>
                  {isReached
                    ? <Check size={14} className="text-white font-black" strokeWidth={3} />
                    : <div className="h-2 w-2 rounded-full bg-slate-400" />
                  }
                </div>
              </div>
            );
          })}
        </div>

        {/* Dates + locations row */}
        <div className="flex items-start justify-between px-4 mt-1">
          {ZR_STATUS_STEPS.map((step, idx) => {
            const events = stepEvents[step.key] || [];
            const latestEvent = events[events.length - 1];
            const isReached = idx <= lastReachedIdx;

            return (
              <div key={step.key} className="flex-1 text-center px-1">
                {isReached && latestEvent ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-semibold text-slate-500 leading-tight">
                      {new Date(latestEvent.createdAt || latestEvent.created_at).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    {latestEvent.notes && (
                      <p className="text-[10px] text-blue-600 font-medium leading-tight break-words"
                         style={{ wordBreak: 'break-word' }}>
                        📍 {latestEvent.notes}
                      </p>
                    )}
                    {latestEvent.currentState?.hubName && (
                      <p className="text-[10px] text-blue-600 font-medium leading-tight">
                        📍 {latestEvent.currentState.hubName}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Unmapped events (as a fallback list) */}
        {historyArray.some(e => !mapStatusToStep(e.currentState?.stateName || e.stateName || '')) && (
          <div className="mt-6 border-t border-slate-100 pt-4 px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Événements supplémentaires</p>
            <div className="space-y-2">
              {historyArray
                .filter(e => !mapStatusToStep(e.currentState?.stateName || e.stateName || ''))
                .map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-600">
                        {e.currentState?.stateName || e.stateName || 'Statut inconnu'}
                      </span>
                      <span className="text-slate-400 ml-2">
                        {new Date(e.createdAt || e.created_at).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);
  const [logResult, setLogResult] = useState('answered');
  const [logNotes, setLogNotes] = useState('');
  const [postponedDate, setPostponedDate] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingHistory, setShippingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState('home');
  const [hubs, setHubs] = useState([]);
  const [selectedHubId, setSelectedHubId] = useState('');
  const [hubsLoading, setHubsLoading] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState(null);
  const [feesLoading, setFeesLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      if (res.data.wilaya) {
        fetchDeliveryFees(res.data.wilaya);
      }
    } catch (err) {
      console.error("Error fetching order", err);
      // Only redirect if the order truly doesn't exist (404)
      if (err.response?.status === 404) {
        navigate('/orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryFees = async (wilaya) => {
    setFeesLoading(true);
    try {
      const res = await api.get(`/delivery-fees/${encodeURIComponent(wilaya)}`);
      setDeliveryFees(res.data);
    } catch (err) {
      console.error("Error fetching delivery fees", err);
      setDeliveryFees(null);
    } finally {
      setFeesLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (order && order.delivery_type) {
      setSelectedDeliveryType(order.delivery_type);
    }
    if (order && order.stopdesk_id) {
      setSelectedHubId(order.stopdesk_id);
    }
    if (order && order.total_price) {
      setFinalPrice(order.total_price);
    }
  }, [order]);

  useEffect(() => {
    if (selectedDeliveryType === 'pickup-point' && !order?.tracking_number) {
      fetchHubs();
    }
  }, [selectedDeliveryType, order?.tracking_number]);

  const fetchHubs = async () => {
    setHubsLoading(true);
    try {
      const res = await api.get(`/orders/${id}/hubs`);
      setHubs(res.data);
      if (res.data.length > 0 && !selectedHubId) {
        setSelectedHubId(order?.stopdesk_id || res.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching hubs", err);
    } finally {
      setHubsLoading(false);
    }
  };

  useEffect(() => {
    if (order?.tracking_number) {
      fetchShippingHistory();
    }
  }, [order?.tracking_number]);

  const fetchShippingHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/orders/${id}/shipping-history`);
      // Backend returns { history: [...] }
      setShippingHistory(res.data?.history || []);
    } catch (err) {
      console.error("Error fetching shipping history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogCall = async (e) => {
    e.preventDefault();
    if (logResult === 'postponed' && !postponedDate) {
      alert("Veuillez sélectionner une date de report.");
      return;
    }
    setLogLoading(true);
    try {
      await api.post(`/orders/${id}/call-logs`, { 
        result: logResult, 
        notes: logNotes,
        postponed_date: logResult === 'postponed' ? postponedDate : null
      });
      setLogNotes('');
      setPostponedDate('');
      fetchOrder();
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'appel");
    } finally {
      setLogLoading(false);
    }
  };

  const handleSendToShipping = async () => {
    if (!window.confirm("Voulez-vous vraiment envoyer cette commande à ZR Express pour expédition ?")) return;
    
    if (selectedDeliveryType === 'pickup-point' && !selectedHubId) {
        alert("Veuillez sélectionner un bureau de retrait (Stopdesk).");
        return;
    }

    setShippingLoading(true);
    try {
      const payload = { 
        delivery_type: selectedDeliveryType,
        final_price: finalPrice 
      };
      if (selectedDeliveryType === 'pickup-point') {
          payload.stopdesk_id = selectedHubId;
      }
      const res = await api.post(`/orders/${id}/ship`, payload);
      alert(res.data.message);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi à la livraison");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setShippingLoading(true);
    try {
      await api.get(`/orders/${id}/sync-shipping`);
      await fetchOrder();
      await fetchShippingHistory();
    } catch (err) {
      console.error("Error syncing status", err);
    } finally {
      setShippingLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copié dans le presse-papier !");
  };

  if (loading) return (
    <div className="animate-pulse space-y-4 pt-10 px-8">
      <div className="h-10 bg-slate-200 rounded w-1/4" />
      <div className="h-64 bg-slate-200 rounded" />
    </div>
  );

  if (!order) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="text-5xl">⚠️</div>
      <p className="text-lg font-bold text-slate-700">Commande introuvable ou erreur de chargement</p>
      <p className="text-sm text-slate-400">La commande #{id} n&apos;a pas pu être chargée.</p>
      <div className="flex gap-3 mt-2">
        <button onClick={fetchOrder} className="px-5 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition">
          Réessayer
        </button>
        <button onClick={() => navigate('/orders')} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition">
          Retour aux commandes
        </button>
      </div>
    </div>
  );

  const resultOptions = [
    { value: 'answered',      label: 'En cours',    icon: Clock,        color: 'text-amber-600' },
    { value: 'confirmed',     label: 'Confirmé',    icon: CheckCircle,  color: 'text-emerald-600' },
    { value: 'cancelled',     label: 'Annulé',      icon: XSquare,      color: 'text-rose-600' },
    { value: 'not_reachable', label: 'Injoignable', icon: Phone,        color: 'text-slate-500' },
    { value: 'postponed',     label: 'Reporté',     icon: Calendar,     color: 'text-orange-600' },
    { value: 'wrong_number',  label: 'Faux N°',     icon: Phone,        color: 'text-red-500' },
  ];

  // Derive situation badge from latest call log
  const latestLog = order.call_logs?.[0];
  const situationLabel = latestLog
    ? resultOptions.find(r => r.value === latestLog.result)?.label || latestLog.result
    : null;

  const situationColors = {
    answered: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
    not_reachable: 'bg-slate-100 text-slate-600 border-slate-200',
    postponed: 'bg-orange-100 text-orange-700 border-orange-200',
    wrong_number: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Back button ── */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Retour aux commandes
      </button>

      {/* ── ZR-style Order Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top row: client info + tracking + situation */}
        <div className="flex flex-wrap items-center gap-4 px-6 pt-5 pb-3 border-b border-slate-100">
          {/* Back arrow + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Nom du client</p>
              <p className="text-2xl font-black text-slate-900">{order.customer_name}</p>
            </div>
          </div>

          {/* Tracking number */}
          {order.tracking_number && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Numéro de suivi</p>
              <button
                onClick={() => copyToClipboard(order.tracking_number)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full font-mono font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-400 shrink-0" />
                {order.tracking_number}
                <Copy size={12} className="opacity-60" />
              </button>
            </div>
          )}

          {/* Product */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Produit</p>
            <p className="font-bold text-slate-700">{order.product_name} x{order.quantity}</p>
          </div>

          {/* Situation (call result) */}
          {situationLabel && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Situation</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${situationColors[latestLog?.result] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {situationLabel}
                </span>
                {latestLog?.notes && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200 italic max-w-[180px] truncate">
                    {latestLog.notes}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions top-right */}
          <div className="ml-auto">
            {order.tracking_number && (
              <button
                onClick={handleRefreshStatus}
                disabled={shippingLoading || historyLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all"
              >
                <RefreshCw size={15} className={(shippingLoading || historyLoading) ? 'animate-spin' : ''} />
                Actualiser
              </button>
            )}
          </div>
        </div>

        {/* Bottom row: statut + destination + type livraison */}
        <div className="flex flex-wrap items-center gap-4 px-6 py-3">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Statut de la commande</p>
            <div className="flex items-center gap-2">
              <Badge status={order.status}>{order.status}</Badge>
              {order.status === 'postponed' && order.postponed_date && (
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  new Date(order.postponed_date).toDateString() === new Date().toDateString() 
                    ? 'bg-orange-100 text-orange-800 border border-orange-200 animate-pulse' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {new Date(order.postponed_date).toDateString() === new Date().toDateString() 
                    ? '⚠️ À traiter aujourd\'hui' 
                    : `Reporté au ${new Date(order.postponed_date).toLocaleDateString()}`}
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Destination</p>
            <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 shrink-0" />
              {order.wilaya}{order.commune ? `, ${order.commune}` : ''}
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Type de livraison</p>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
              {order.delivery_type === 'pickup-point' ? <Building2 size={12} /> : <Home size={12} />}
              {order.delivery_type === 'pickup-point' ? 'Point de retrait (Bureau)' : 'À domicile'}
            </span>
          </div>

          <div className="ml-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Prix total</p>
            <p className="text-lg font-black text-primary-700">{order.total_price} DZD</p>
          </div>
        </div>
      </div>

      {/* ── ZR Express Timeline Card ── */}
      {order.tracking_number && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Truck size={16} className="text-yellow-600" />
              </div>
              <div>
                <p className="font-black text-slate-800 uppercase tracking-tight">Suivi de livraison</p>
                <p className="text-xs text-slate-400 font-medium">ZR Express · {order.tracking_number}</p>
              </div>
            </div>
            <a
              href={`https://zrexpress.app/tracking/${order.tracking_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Voir en ligne <ExternalLink size={12} />
            </a>
          </div>

          {/* Timeline */}
          <div className="px-2 py-6">
            <ZRTimeline history={shippingHistory} loading={historyLoading} />
          </div>
        </div>
      )}

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: tabbed content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { key: 'details',   label: 'Détails' },
              { key: 'history',   label: `Historique (${order.call_logs?.length || 0})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Détails */}
          {activeTab === 'details' && (
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary-600 mb-2">
                    <User size={20} />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Informations Client</h4>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-800">{order.customer_name}</p>
                    <p className="text-lg font-bold text-primary-600 flex items-center gap-2 mt-1">
                      <Phone size={18} />
                      {order.customer_phone}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <MapPin size={16} />
                      Adresse de livraison
                    </p>
                    <p className="text-slate-800 font-semibold">{order.wilaya}, {order.commune}</p>
                    <p className="text-slate-600 text-sm mt-1">{order.address}</p>
                    
                    {/* Delivery Fees Enclosure */}
                    <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                      <div className="flex items-center gap-2 text-primary-700 font-bold text-xs uppercase tracking-wider mb-2">
                        <Truck size={14} />
                        Tarifs de livraison ZR Express
                      </div>
                      {feesLoading ? (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic animate-pulse">
                          <RefreshCw size={10} className="animate-spin" />
                          Calcul des tarifs pour {order.wilaya}...
                        </div>
                      ) : deliveryFees ? (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white p-2 rounded-lg border border-primary-100">
                            <p className="text-[8px] text-slate-400 font-bold uppercase">À Domicile</p>
                            <p className="text-sm font-black text-slate-900">{deliveryFees.home_fee} DZD</p>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-primary-100">
                            <p className="text-[8px] text-slate-400 font-bold uppercase">Au Bureau</p>
                            <p className="text-sm font-black text-slate-900">{deliveryFees.desk_fee} DZD</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-medium italic">Tarifs non disponibles pour cette wilaya.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-primary-600 mb-2">
                    <Package size={20} />
                    <h4 className="font-bold uppercase tracking-wider text-xs">Détails Panier</h4>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-black text-slate-800">{order.product_name}</p>
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200">
                      <span className="text-sm font-bold text-slate-500">Quantité: {order.quantity}</span>
                      <span className="text-xl font-black text-primary-700">{order.total_price} DZD</span>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="p-3 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium">
                      <p className="font-bold uppercase text-[10px] opacity-70 mb-1">Note:</p>
                      {order.notes}
                    </div>
                  )}
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-tight mt-4">
                    📅 Reçu le {new Date(order.created_at).toLocaleDateString('fr-FR')} à <span className="text-primary-600 font-black">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Tab: Historique des appels */}
          {activeTab === 'history' && (
            <Card>
              <div className="flex items-center gap-2 text-slate-800 mb-6 font-bold text-lg">
                <History size={20} className="text-primary-600" />
                Historique des appels ({order.call_logs?.length || 0})
              </div>
              <div className="space-y-6">
                {order.call_logs && order.call_logs.length > 0 ? (
                  order.call_logs.map((log) => (
                    <div key={log.id} className="relative pl-8 border-l-2 border-slate-100 pb-2 last:border-0 last:pb-0">
                      <div className="absolute top-0 left-[-9px] h-4 w-4 rounded-full bg-white border-4 border-primary-500 shadow-sm" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-slate-800 uppercase text-xs tracking-widest">
                            {resultOptions.find(r => r.value === log.result)?.label || log.result}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(log.called_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                          Par {log.agent?.name}
                        </span>
                      </div>
                      {log.notes && (
                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic leading-relaxed">
                          "{log.notes}"
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-30 grayscale italic">
                    Aucun appel enregistré pour le moment.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right sidebar: actions */}
        <div className="space-y-6">
          {/* Log Call Card */}
          <Card className="border-t-4 border-primary-600">
            <div className="flex items-center gap-2 mb-6 font-bold text-lg text-slate-800">
              <Phone size={20} className="text-primary-600" />
              Loguer un appel
            </div>
            <form onSubmit={handleLogCall} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Résultat de l'appel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {resultOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLogResult(opt.value)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                        logResult === opt.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-100 transform scale-[1.02]'
                          : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <opt.icon className={`mb-1 ${logResult === opt.value ? 'text-primary-600' : 'text-slate-400'}`} size={20} />
                      <span className={`text-[10px] font-black uppercase text-center ${logResult === opt.value ? 'text-primary-700' : 'text-slate-500'}`}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {logResult === 'postponed' && (
                <div className="animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold text-orange-800 uppercase tracking-widest mb-2">
                    Date de report *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={postponedDate}
                    onChange={(e) => setPostponedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-orange-300 rounded-xl outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Commentaires / Notes
                </label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Ex: Le client demande de livrer après 17h..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm text-slate-700 resize-none"
                />
              </div>

              <Button type="submit" className="w-full py-4 rounded-2xl" loading={logLoading}>
                Valider cet appel
              </Button>
            </form>
          </Card>

          {/* Shipping Card */}
          {(order.status === 'confirmed' || order.status === 'shipped' || order.status === 'shipping' || order.tracking_number) && (
            <Card className={`border-t-4 ${order.tracking_number ? 'border-yellow-400' : 'border-emerald-500'}`}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2 font-black text-lg text-slate-800 uppercase tracking-tighter">
                  <Truck size={22} className={order.tracking_number ? 'text-yellow-500' : 'text-emerald-500'} />
                  Expédition
                </div>
              </div>

              {!order.tracking_number ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-sm text-emerald-800 leading-relaxed">
                    La commande est confirmée. Vous pouvez maintenant l'envoyer à <strong>ZR Express</strong>.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                       Type de livraison
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedDeliveryType('home')}
                        disabled={shippingLoading}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          selectedDeliveryType === 'home'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                      >
                        <Home size={18} className={selectedDeliveryType === 'home' ? 'text-emerald-600' : 'text-slate-400'}/>
                        À domicile
                      </button>
                      
                      <button
                        onClick={() => setSelectedDeliveryType('pickup-point')}
                        disabled={shippingLoading}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          selectedDeliveryType === 'pickup-point'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                        }`}
                      >
                        <Building2 size={18} className={selectedDeliveryType === 'pickup-point' ? 'text-emerald-600' : 'text-slate-400'}/>
                        Point de retrait (Bureau)
                      </button>
                    </div>
                  </div>

                  {selectedDeliveryType === 'pickup-point' && (
                    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                            Choisissez le bureau (Stopdesk)
                        </label>
                        {hubsLoading ? (
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                <RefreshCw className="animate-spin" size={16} /> Chargement des bureaux...
                            </div>
                        ) : hubs.length > 0 ? (
                            <select
                                value={selectedHubId}
                                onChange={(e) => setSelectedHubId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {hubs.map(hub => (
                                    <option key={hub.id} value={hub.id}>
                                        {hub.name} ({hub.address?.district})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-red-500 font-medium">
                                Aucun bureau point de retrait trouvé pour cette destination ({order.wilaya}).
                            </div>
                        )}
                    </div>
                  )}

                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <label className="block text-xs font-bold text-yellow-800 uppercase tracking-widest mb-2">
                        Montant à collecter (DZD) *
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.target.select()}
                        className="w-full px-4 py-3 bg-white border border-yellow-300 rounded-xl outline-none focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-slate-800 font-black text-lg"
                        placeholder="Ex: 3000"
                    />
                    <p className="text-[10px] text-yellow-700 mt-2 italic">
                        Ce montant sera envoyé à ZR Express comme prix final incluant la livraison.
                    </p>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 h-14 rounded-2xl font-black text-base"
                    onClick={handleSendToShipping}
                    loading={shippingLoading}
                  >
                    <Truck size={20} className="mr-2" />
                    Envoyer à ZR Express
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tracking number */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Numéro de suivi</p>
                      <button
                        onClick={() => copyToClipboard(order.tracking_number)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-primary-500 transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="font-mono font-black text-slate-800 text-sm break-all">{order.tracking_number}</p>
                  </div>

                  {/* Last status */}
                  {order.shipping_status && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                        <Navigation size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dernier statut ZR</p>
                        <p className="font-black text-slate-800 text-sm">{order.shipping_status}</p>
                      </div>
                    </div>
                  )}

                  <a
                    href={`https://zrexpress.app/tracking/${order.tracking_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all text-sm uppercase tracking-widest shadow-xl shadow-slate-200"
                  >
                    Suivre en ligne <ExternalLink size={16} />
                  </a>
                </div>
              )}
            </Card>
          )}

          {/* Agent Tips Card */}
          <Card className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-0 shadow-lg shadow-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Phone size={20} className="text-white" />
              </div>
              <h4 className="font-bold uppercase tracking-wider text-xs">Conseils d'agent</h4>
            </div>
            <ul className="space-y-3 text-sm font-medium opacity-90">
              <li className="flex gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                Toujours confirmer l'adresse exacte et le prix total.
              </li>
              <li className="flex gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                Informer sur le délai de livraison estimé (24-72h).
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card, Button, Badge } from '../../components/ui';
import { Truck, Search, Edit2, Check, X, RefreshCw } from 'lucide-react';

const DeliveryFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ home_fee: 0, desk_fee: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/delivery-fees');
      setFees(res.data);
    } catch (err) {
      console.error("Error fetching fees", err);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (fee) => {
    setEditingId(fee.id);
    setEditForm({ home_fee: fee.home_fee, desk_fee: fee.desk_fee });
  };

  const handleSave = async (id) => {
    setSaving(true);
    try {
      await api.put(`/delivery-fees/${id}`, editForm);
      setFees(fees.map(f => f.id === id ? { ...f, ...editForm } : f));
      setEditingId(null);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const filteredFees = fees.filter(f => 
    f.wilaya_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tarifs de Livraison</h1>
          <p className="text-slate-500">Gérez les frais d'expédition par Wilaya pour ZR Express.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="primary">{fees.length} Wilayas</Badge>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher une wilaya..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <Button onClick={fetchFees} variant="secondary" className="flex items-center gap-2">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest px-4">Wilaya</th>
                <th className="pb-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest px-4 text-center">À Domicile (DZD)</th>
                <th className="pb-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest px-4 text-center">Au Bureau (DZD)</th>
                <th className="pb-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                        {fee.wilaya_code}
                      </div>
                      <span className="font-bold text-slate-700">{fee.wilaya_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {editingId === fee.id ? (
                      <input
                        type="number"
                        value={editForm.home_fee}
                        onChange={(e) => setEditForm({ ...editForm, home_fee: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-primary-300 rounded text-center outline-none focus:ring-2 focus:ring-primary-500/20"
                        autoFocus
                      />
                    ) : (
                      <span className="font-black text-slate-900">{fee.home_fee}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {editingId === fee.id ? (
                      <input
                        type="number"
                        value={editForm.desk_fee}
                        onChange={(e) => setEditForm({ ...editForm, desk_fee: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-primary-300 rounded text-center outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    ) : (
                      <span className="font-black text-slate-900">{fee.desk_fee}</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    {editingId === fee.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSave(fee.id)}
                          disabled={saving}
                          className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                          title="Sauvegarder"
                        >
                          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Annuler"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(fee)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Modifier les tarifs"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredFees.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Search size={40} className="opacity-20" />
                      <p className="font-medium">Aucune wilaya ne correspond à votre recherche.</p>
                    </div>
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

export default DeliveryFees;

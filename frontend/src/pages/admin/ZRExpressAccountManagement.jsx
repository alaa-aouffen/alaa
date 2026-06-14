import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Truck, Save, X, Settings, ShieldCheck } from 'lucide-react';

const ZRExpressAccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    tenant_id: '',
    token: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/zr-express-accounts');
      setAccounts(res.data);
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/zr-express-accounts/${editingId}`, formData);
      } else {
        await api.post('/zr-express-accounts', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', tenant_id: '', token: '', is_active: true });
      fetchData();
    } catch (err) {
      console.error('Action failed', err);
      alert('Erreur lors de la sauvegarde.');
    }
  };

  const handleEdit = (account) => {
    setFormData({
      name: account.name,
      tenant_id: account.tenant_id,
      token: account.token,
      is_active: account.is_active
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce compte ZR Express ?')) return;
    try {
      await api.delete(`/zr-express-accounts/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sous-comptes ZR Express</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos différents comptes ZR Express. Vous pourrez ensuite lier chaque catégorie (produit) à l'un de ces comptes.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', tenant_id: '', token: '', is_active: true });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
        >
          <Plus size={18} />
          Nouveau Sous-compte
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="text-primary-500" size={20} />
              {editingId ? 'Modifier le Sous-compte' : 'Ajouter un Sous-compte'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du compte (ex: Compte Raouf)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Nom pour identifier ce compte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenant ID</label>
                <input
                  type="text"
                  required
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="X-Tenant ID fourni par ZR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Token API (Clé Secrète)</label>
                <input
                  type="password"
                  required
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="X-Api-Key fournie par ZR"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
                <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 font-medium cursor-pointer">Compte actif</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition"
              >
                <Save size={18} />
                Sauvegarder
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement des comptes...</div>
        ) : accounts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Truck size={48} className="text-slate-300 mb-3" />
            <p>Aucun sous-compte ZR Express trouvé. Ajoutez-en un pour commencer !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-3 font-medium">Nom du compte</th>
                  <th className="px-6 py-3 font-medium">Tenant ID</th>
                  <th className="px-6 py-3 font-medium">Produits liés</th>
                  <th className="px-6 py-3 font-medium">Statut</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        {account.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{account.tenant_id}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {account.categories_count || 0} produits
                    </td>
                    <td className="px-6 py-4">
                        {account.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                Actif
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                Inactif
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZRExpressAccountManagement;

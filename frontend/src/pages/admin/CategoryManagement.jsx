import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Tag, Save, X, Settings } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [agents, setAgents] = useState([]);
  const [zrAccounts, setZrAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    keywords: '',
    user_id: '',
    zr_express_account_id: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, agRes, zrRes] = await Promise.all([
        api.get('/categories'),
        api.get('/agents'),
        api.get('/zr-express-accounts')
      ]);
      setCategories(catRes.data);
      // Depending on API structure, agents might be in data.data or just data
      setAgents(agRes.data.data || agRes.data);
      setZrAccounts(zrRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.user_id) payload.user_id = null;
      if (!payload.zr_express_account_id) payload.zr_express_account_id = null;

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', keywords: '', user_id: '', zr_express_account_id: '' });
      fetchData();
    } catch (err) {
      console.error('Action failed', err);
      alert('Erreur lors de la sauvegarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name,
      keywords: cat.keywords || '',
      user_id: cat.user_id || '',
      zr_express_account_id: cat.zr_express_account_id || ''
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette catégorie ?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Catégories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez les catégories de produits et affectez un agent. Le système routera automatiquement les commandes contenant ces mots-clés.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', keywords: '', user_id: '', zr_express_account_id: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={18} />
          Nouvelle Catégorie
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Settings className="text-primary-500" size={20} />
              {editingId ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la Catégorie</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="ex: Sitar & Hidjab"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agent Responsable</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">-- Aucun Agent (Automatique vers Admin) --</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name} (Agent)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compte ZR Express</label>
                <select
                  value={formData.zr_express_account_id}
                  onChange={(e) => setFormData({ ...formData, zr_express_account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">-- Compte par défaut --</option>
                  {zrAccounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Mots-Clés (séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="ex: sitar, hidjab, abaya, voile"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Si le nom du produit depuis Ayor contient l'un de ces mots, la commande sera assignée automatiquement ici.
                </p>
              </div>
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
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Save size={isSubmitting ? 0 : 18} />
                {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Chargement des catégories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Tag size={48} className="text-slate-300 mb-3" />
            <p>Aucune catégorie trouvée. Créez-en une pour organiser vos commandes !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-3 font-medium">Nom</th>
                  <th className="px-6 py-3 font-medium">Mots-Clés</th>
                  <th className="px-6 py-3 font-medium">Agent</th>
                  <th className="px-6 py-3 font-medium">Compte ZR</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.keywords ? cat.keywords.split(',').map((kw, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {kw.trim()}
                          </span>
                        )) : <span className="text-slate-400 text-xs italic">Aucun mot-clé</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {cat.user ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {cat.user.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">-- Admin --</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cat.zr_express_account ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {cat.zr_express_account.name}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-sm">-- Défaut --</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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

export default CategoryManagement;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card, Button, Input, Badge } from '../../components/ui';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Power, 
  Search,
  Mail,
  Lock,
  Loader2,
  Truck,
  XCircle,
  Clock,
  Settings
} from 'lucide-react';

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    name: '',
    email: '',
    password: ''
  });
  const [editingAgent, setEditingAgent] = useState(null);
  
  const [settings, setSettings] = useState({
    order_processing_delay_days: 1
  });
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const fetchAgents = async () => {
    try {
      const [agentRes, settingsRes] = await Promise.all([
        api.get('/agents'),
        api.get('/settings')
      ]);
      setAgents(agentRes.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleStatus = async (agent) => {
    try {
      await api.put(`/agents/${agent.id}`, { is_active: !agent.is_active });
      fetchAgents();
    } catch (err) {
      alert("Erreur lors de la modification du statut");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet agent ?")) {
      try {
        await api.delete(`/agents/${id}`);
        fetchAgents();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingAgent && !payload.password) delete payload.password;

      if (editingAgent) {
        await api.put(`/agents/${editingAgent.id}`, payload);
      } else {
        await api.post('/agents', payload);
      }
      setShowAddModal(false);
      setEditingAgent(null);
      setFormData({ name: '', email: '', password: '' });
      fetchAgents();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (agent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      password: '' // On ne pré-remplit pas le mot de passe
    });
    setShowAddModal(true);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      await api.post('/settings', settings);
      alert("Paramètres mis à jour avec succès");
    } catch (err) {
      alert("Erreur lors de la mise à jour des paramètres");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Agents</h1>
          <p className="text-slate-500 font-medium">Gérez vos opérateurs et suivez leurs performances.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <UserPlus size={20} />
          <span>Ajouter un agent</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
               <h4 className="font-bold text-slate-800 flex items-center gap-2">
                 <Users size={18} className="text-primary-600" />
                 Liste des agents
               </h4>
               <Badge status="default">{agents.length} Total</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6">Agent</th>
                    <th className="py-4 px-6">Commandes / Appels</th>
                    <th className="py-4 px-6">Statut</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="4" className="py-8 px-6"><div className="h-4 bg-slate-100 rounded"></div></td></tr>)
                  ) : (
                    agents.map((agent) => (
                      <tr key={agent.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                              {agent.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{agent.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500 font-medium">{agent.email}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs font-bold text-slate-700">{agent.assigned_orders_count} commandes assignées</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{agent.call_logs_count} appels logués</span>
                           </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${agent.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {agent.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => handleEditClick(agent)}
                              className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(agent)}
                              className={`p-2 rounded-lg transition-colors ${agent.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                              title={agent.is_active ? "Désactiver" : "Réactiver"}
                            >
                              <Power size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(agent.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Form / Quick View */}
        <div>
          {showAddModal && (
            <Card className="border-t-4 border-primary-600 animate-in slide-in-from-right-4 duration-300">
               <div className="flex items-center justify-between mb-6">
                 <h4 className="font-bold text-lg text-slate-800">
                    {editingAgent ? 'Modifier l\'agent' : 'Nouvel Agent'}
                 </h4>
                 <button onClick={() => { setShowAddModal(false); setEditingAgent(null); }} className="text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
               </div>
               <form onSubmit={handleAddAgent} className="space-y-4">
                  <Input 
                    label="Nom complet" 
                    icon={Users} 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <Input 
                    label="Email" 
                    icon={Mail} 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <Input 
                    label="Mot de passe (Laisser vide pour ne pas changer)" 
                    icon={Lock} 
                    type="password" 
                    required={!editingAgent} 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <Button type="submit" loading={isSubmitting} className="w-full">
                    {editingAgent ? 'Sauvegarder les modifications' : 'Créer le compte'}
                  </Button>
               </form>
            </Card>
          )}

          {/* Workflow Settings */}
          <Card className="mt-8 border-l-4 border-amber-500">
             <div className="flex items-center gap-2 mb-6">
                <Settings size={20} className="text-amber-500" />
                <h4 className="font-bold text-lg text-slate-800">Flux de travail</h4>
             </div>
             
             <form onSubmit={handleUpdateSettings} className="space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Clock size={16} className="text-slate-400" />
                      Délai de traitement (jours)
                   </label>
                   <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      Définit le nombre de jours avant qu'une commande soit visible par les agents. 
                      Ex: "1" signifie que les commandes reçues aujourd'hui ne seront visibles que demain.
                   </p>
                   <input 
                      type="number" 
                      min="0" 
                      max="30"
                      value={settings.order_processing_delay_days}
                      onChange={(e) => setSettings({...settings, order_processing_delay_days: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => e.target.select()}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-bold text-slate-800"
                   />
                </div>
                <Button 
                  type="submit" 
                  variant="warning" 
                  loading={isUpdatingSettings} 
                  className="w-full shadow-lg shadow-amber-200"
                >
                   Enregistrer le réglage
                </Button>
             </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;

import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TerritorySelect = ({ wilaya, setWilaya, commune, setCommune }) => {
  const [wilayas, setWilayas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loadingWilayas, setLoadingWilayas] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);

  // Fetch Wilayas on mount
  useEffect(() => {
    const fetchWilayas = async () => {
      setLoadingWilayas(true);
      try {
        const res = await api.get('/territories');
        // Sort alphabetically
        const sorted = (res.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setWilayas(sorted);
      } catch (err) {
        console.error("Erreur chargement wilayas", err);
      } finally {
        setLoadingWilayas(false);
      }
    };
    fetchWilayas();
  }, []);

  // Fetch Communes when Wilaya changes
  useEffect(() => {
    if (!wilaya || wilayas.length === 0) {
      setCommunes([]);
      return;
    }

    // Find the Wilaya ID
    const selectedWilayaObj = wilayas.find(w => w.name === wilaya);
    if (!selectedWilayaObj) {
      setCommunes([]);
      return;
    }

    const fetchCommunes = async () => {
      setLoadingCommunes(true);
      try {
        const res = await api.get(`/territories?parentId=${selectedWilayaObj.id}`);
        const sorted = (res.data || []).sort((a, b) => a.name.localeCompare(b.name));
        setCommunes(sorted);
      } catch (err) {
        console.error("Erreur chargement communes", err);
      } finally {
        setLoadingCommunes(false);
      }
    };

    fetchCommunes();
  }, [wilaya, wilayas]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          Wilaya {loadingWilayas && <span className="text-xs text-slate-400 italic font-normal">(Chargement...)</span>}
        </label>
        <select
          required
          value={wilaya}
          onChange={(e) => {
            setWilaya(e.target.value);
            setCommune(''); // Reset commune when wilaya changes
          }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 disabled:opacity-50"
          disabled={loadingWilayas}
        >
          <option value="">Sélectionnez une Wilaya</option>
          {wilayas.map(w => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          Commune {loadingCommunes && <span className="text-xs text-slate-400 italic font-normal">(Chargement...)</span>}
        </label>
        {communes.length > 0 ? (
          <select
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 disabled:opacity-50"
            disabled={loadingCommunes}
          >
            <option value="">Sélectionnez une Commune</option>
            {communes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder={wilaya ? "Entrez la commune" : "Sélectionnez d'abord une wilaya"}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800"
            disabled={!wilaya && wilayas.length > 0}
          />
        )}
      </div>
    </div>
  );
};

export default TerritorySelect;

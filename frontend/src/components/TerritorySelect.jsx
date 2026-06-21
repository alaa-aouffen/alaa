import React, { useState, useEffect, useMemo } from 'react';
import territoriesData from '../data/algeria_territories.json';

/**
 * TerritorySelect
 * 
 * Uses a locally-bundled JSON built from the ZR Express API, ensuring that:
 * - Wilaya names exactly match ZR Express spelling
 * - Commune names exactly match ZR Express spelling
 * - No network calls are needed → instant loading
 * 
 * Props:
 *   wilaya       {string}   - selected wilaya name (ZR exact spelling)
 *   setWilaya    {function} - setter for wilaya
 *   commune      {string}   - selected commune name
 *   setCommune   {function} - setter for commune
 */
const TerritorySelect = ({ wilaya, setWilaya, commune, setCommune }) => {
  // Static data — never changes after mount
  const wilayas = useMemo(() => territoriesData, []);

  // Communes for the currently selected wilaya
  const communes = useMemo(() => {
    if (!wilaya) return [];
    const found = wilayas.find(w => w.name === wilaya);
    return found ? found.communes : [];
  }, [wilaya, wilayas]);

  // When wilaya changes, reset commune only if current commune is not in the new list
  useEffect(() => {
    if (commune && communes.length > 0 && !communes.includes(commune)) {
      setCommune('');
    }
  }, [wilaya]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ── Wilaya ── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          Wilaya
        </label>
        <select
          required
          value={wilaya}
          onChange={(e) => {
            setWilaya(e.target.value);
            setCommune('');
          }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800"
        >
          <option value="">Sélectionnez une Wilaya</option>
          {wilayas.map(w => (
            <option key={w.id} value={w.name}>
              {w.id} - {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── Commune ── */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
          Commune
        </label>
        {communes.length > 0 ? (
          <select
            required
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800"
          >
            <option value="">Sélectionnez une Commune</option>
            {communes.map(cName => (
              <option key={cName} value={cName}>{cName}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            placeholder={wilaya ? 'Entrez la commune manuellement' : "Sélectionnez d'abord une wilaya"}
            disabled={!wilaya}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
          />
        )}
      </div>
    </div>
  );
};

export default TerritorySelect;

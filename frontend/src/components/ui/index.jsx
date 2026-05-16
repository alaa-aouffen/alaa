import React from 'react';

export const Card = ({ children, className = '', noPadding = false }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    <div className={noPadding ? '' : 'p-6'}>
      {children}
    </div>
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', loading = false, disabled = false, ...props }) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-100',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-100',
    outline: 'border-2 border-slate-200 hover:border-primary-500 hover:text-primary-600 text-slate-600',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
};

export const Badge = ({ children, status = 'default' }) => {
  const styles = {
    new: 'bg-blue-100 text-blue-700',
    assigned: 'bg-indigo-100 text-indigo-700',
    in_progress: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
    postponed: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    returned: 'bg-gray-100 text-gray-700',
    shipped: 'bg-purple-100 text-purple-700',
    not_reachable: 'bg-slate-100 text-slate-600',
    default: 'bg-slate-100 text-slate-600',
  };

  const labels = {
    new: 'Nouveau',
    assigned: 'Assigné',
    in_progress: 'En cours',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    postponed: 'Reporté',
    delivered: 'Livré',
    returned: 'Retourné',
    shipped: 'Expédié',
    not_reachable: 'Injoignable'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || styles.default}`}>
      {labels[children] || children}
    </span>
  );
};

export const Input = ({ label, icon: Icon, error, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{label}</label>}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full ${Icon ? 'pl-11' : 'px-4'} pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-800 ${error ? 'border-red-500 focus:ring-red-100' : ''}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

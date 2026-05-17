import React, { useEffect, useState } from 'react';
import { ShoppingBag, FolderOpen, AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { WCProduct, WCCategory } from '../lib/api';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, cRes] = await Promise.all([
          api.getProducts({ per_page: 100 }),
          api.getCategories(),
        ]);
        setProducts(pRes);
        setCategories(cRes);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const lowStockProducts = products.filter((p) => p.stock_status === 'outofstock');

  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: ShoppingBag,
      color: 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 shadow-2xs',
      iconBg: 'bg-slate-50 text-slate-700 border border-slate-200',
      action: 'products',
    },
    {
      label: 'Product Categories',
      value: totalCategories,
      icon: FolderOpen,
      color: 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 shadow-2xs',
      iconBg: 'bg-slate-50 text-slate-700 border border-slate-200',
      action: 'categories',
    },
    {
      label: 'Out of Stock Items',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: lowStockProducts.length > 0
        ? 'bg-rose-50/50 border-rose-200 text-rose-800 hover:border-rose-300 shadow-2xs'
        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400 shadow-2xs',
      iconBg: lowStockProducts.length > 0
        ? 'bg-rose-100/50 text-rose-700 border border-rose-200'
        : 'bg-slate-50 text-slate-700 border border-slate-200',
      action: 'products',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Dashboard Overview
          <Sparkles size={20} className="text-slate-800" />
        </h2>
        <p className="text-sm text-slate-550 mt-1">Real-time statistics of your WooCommerce cloud store catalog.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(stat.action)}
              className={`p-6 rounded-2xl ${stat.color} border cursor-pointer group hover:translate-y-[-2px] transition-all duration-300`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-450 tracking-wider uppercase">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-4 group-hover:text-slate-900 transition-colors duration-200">
                <span>Manage entries</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Out of Stock Alert panel */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200 bg-white">
          <h4 className="text-sm font-bold text-slate-850 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600" />
            Out of Stock Items ({lowStockProducts.length})
          </h4>

          {lowStockProducts.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3 shadow-inner">
                <ShieldCheck size={18} />
              </div>
              <p className="text-sm font-bold text-slate-700">All inventory items are in stock</p>
              <p className="text-xs text-slate-500 mt-1">Ready for storefront purchases.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl flex items-center justify-between text-xs transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {p.images[0] ? (
                        <img src={p.images[0].src} alt={p.name} className="object-cover w-full h-full" />
                      ) : (
                        <ShoppingBag size={14} className="text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate w-40">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">ID: {p.id}</p>
                    </div>
                  </div>
                  <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    OUT OF STOCK
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips or Guides */}
        <div className="glass rounded-2xl p-6 shadow-sm border border-slate-200 bg-white flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-850 mb-3 flex items-center gap-2">
              <ShieldCheck size={16} className="text-slate-800" />
              Connected Ecosystem
            </h4>
            <p className="text-xs text-slate-650 leading-relaxed">
              This dashboard is powered by your edge-native Cloudflare stack. Products are stored in high-performance
              D1 relational tables, and media files are stored on Cloudflare R2 bucket.
            </p>
            <p className="text-xs text-slate-650 leading-relaxed">
              The storefront connects to this same D1 data pipeline via standard WooCommerce endpoint URLs.
              Any modifications made here reflect globally in milliseconds!
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mt-4 lg:mt-0">
            <span className="text-slate-500 font-medium">Server Location: Cloudflare Edge (Global)</span>
            <button
              onClick={() => setActiveTab('product-form')}
              className="text-slate-900 hover:text-slate-700 font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Quick Upload</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

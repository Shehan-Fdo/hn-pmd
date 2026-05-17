import React, { useEffect, useState } from 'react';
import { Search, FolderOpen, Plus, Trash2, SlidersHorizontal, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import type { WCProduct, WCCategory } from '../lib/api';

interface ProductsListProps {
  setActiveTab: (tab: string) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ setActiveTab }) => {
  const [products, setProducts] = useState<WCProduct[]>([]);
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  // Modal confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        search: search.trim() || undefined,
        category: selectedCat || undefined,
        page,
        per_page: perPage,
      });
      setProducts(data);
      setHasMore(data.length === perPage);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes);
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, selectedCat]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const executeDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteId);
      setProducts(products.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed deleting product:', err);
      alert('Delete failed. Check backend credentials.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Store Catalog
            <ShoppingBag size={20} className="text-slate-800" />
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage and sync product items securely with D1/R2.</p>
        </div>

        <button
          onClick={() => setActiveTab('product-form')}
          className="btn-primary flex items-center justify-center gap-1.5 self-start sm:self-auto py-2.5"
        >
          <Plus size={16} />
          <span>Upload Product</span>
        </button>
      </div>

      {/* Filters bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="glass p-4 rounded-xl flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white border border-slate-200 shadow-xs"
      >
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 focus:border-slate-800 rounded-lg text-slate-900 placeholder-slate-400 text-sm outline-none transition-all shadow-xs"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-52 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <FolderOpen size={15} />
            </span>
            <select
              value={selectedCat}
              onChange={(e) => {
                setSelectedCat(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 focus:border-slate-800 rounded-lg text-slate-700 text-sm outline-none cursor-pointer appearance-none shadow-xs"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-secondary py-2 px-4 text-sm flex items-center justify-center gap-1.5 flex-1 md:flex-none"
          >
            <SlidersHorizontal size={14} />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Products list panel */}
      <div className="glass rounded-2xl overflow-hidden shadow-xs bg-white border border-slate-200">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-white">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
              <ShoppingBag size={20} />
            </div>
            <p className="text-sm font-bold text-slate-800">No products found</p>
            <p className="text-xs text-slate-500 mt-1">Try modifying your filters or create a new catalog item.</p>
          </div>
        ) : (
          <>
            {/* Mobile/Tablet Card Layout */}
            <div className="block md:hidden divide-y divide-slate-100 bg-white">
              {products.map((p) => (
                <div key={p.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      {p.images[0] ? (
                        <img src={p.images[0].src} alt={p.name} className="object-cover w-full h-full" />
                      ) : (
                        <ShoppingBag size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-600 bg-slate-50 border border-slate-150 px-1.5 py-0.5 rounded font-medium">
                          {p.categories[0]?.name || 'Uncategorized'}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.5 border rounded-full uppercase ${p.stock_status === 'outofstock'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}
                        >
                          {p.stock_status === 'outofstock' ? 'OUT' : 'IN'}
                        </span>
                      </div>
                      <div>
                        {p.sale_price ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">Rs. {p.sale_price}</span>
                            <span className="text-[10px] text-slate-400 line-through">Rs. {p.regular_price}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-900">Rs. {p.price || p.regular_price}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 inline-flex items-center justify-center shrink-0 shadow-2xs bg-white border border-slate-200"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="py-4 px-6">Product details</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Price</th>
                    <th className="py-4 px-6">Stock Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors duration-200">
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-150 shrink-0">
                            {p.images[0] ? (
                              <img src={p.images[0].src} alt={p.name} className="object-cover w-full h-full" />
                            ) : (
                              <ShoppingBag size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Slug: {p.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6">
                        <span className="text-xs text-slate-650 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md font-medium">
                          {p.categories[0]?.name || 'Uncategorized'}
                        </span>
                      </td>

                      <td className="py-4.5 px-6">
                        <div>
                          {p.sale_price ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900">Rs. {p.sale_price}</span>
                              <span className="text-[10px] text-slate-400 line-through">Rs. {p.regular_price}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-900">Rs. {p.price || p.regular_price}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4.5 px-6">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 border rounded-full ${p.stock_status === 'outofstock'
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}
                        >
                          {p.stock_status === 'outofstock' ? 'OUT OF STOCK' : 'IN STOCK'}
                        </span>
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="p-2 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all duration-200 inline-flex items-center justify-center shadow-2xs bg-white border border-slate-200"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && products.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium">Showing page {page}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1 disabled:opacity-30"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900">Delete catalog entry?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This action will permanently delete the product details, images link associations, and custom attributes. This action is irreversible.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 px-4 rounded-lg text-xs transition-colors duration-200 cursor-pointer shadow-xs"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

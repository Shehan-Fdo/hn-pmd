import React, { useEffect, useState } from 'react';
import { FolderOpen, Plus, Trash2, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { api } from '../lib/api';
import type { WCCategory } from '../lib/api';

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const img = await api.uploadImage(files[0]);
      setImgUrl(img.src);
    } catch (err) {
      console.error(err);
      alert('Category image upload failed. Check keys & CORS.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setCreating(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        image: imgUrl ? { src: imgUrl, alt: name.trim() } : null,
      };

      await api.createCategory(payload);
      setName('');
      setSlug('');
      setImgUrl('');
      loadCategories();
    } catch (err) {
      console.error(err);
      alert('Failed creating category.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert('Category deletion failed.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Category Manager
          <FolderOpen size={20} className="text-slate-800" />
        </h2>
        <p className="text-sm text-slate-550 mt-1">Manage and sync product categorization layouts securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Category Panel */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200 bg-white h-fit space-y-5 lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Plus size={16} className="text-slate-700" />
            Add Category
          </h3>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Activewear"
                className="glass-input text-sm"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Category Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. activewear"
                className="glass-input text-sm"
              />
            </div>

            {/* Category Image upload */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Category Banner/Image</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-550 bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-405 text-slate-400 overflow-hidden shadow-xs shrink-0">
                  {imgUrl ? (
                    <img src={imgUrl} alt={name} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    id="cat-img-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('cat-img-file')?.click()}
                    disabled={uploading}
                    className="btn-secondary py-2 px-3 text-xs w-full flex items-center justify-center gap-1.5"
                  >
                    <Upload size={13} />
                    <span>{uploading ? 'Uploading...' : 'Upload banner'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || uploading || !name.trim()}
              className="btn-primary py-2.5 px-4 text-xs font-bold w-full mt-3"
            >
              <span>{creating ? 'Syncing...' : 'Deploy Category'}</span>
            </button>
          </form>
        </div>

        {/* Categories List Panel */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-200 bg-white lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles size={16} className="text-slate-700" />
            Active Categories
          </h3>

          {loading ? (
            <div className="flex items-center justify-center min-h-[220px]">
              <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FolderOpen size={30} className="mx-auto mb-2 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">No categories configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between transition-colors duration-250"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400 border border-slate-200">
                      {c.image?.src ? (
                        <img src={c.image.src} alt={c.name} className="object-cover w-full h-full" />
                      ) : (
                        <FolderOpen size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">Slug: {c.slug}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase shadow-xs">
                      {c.count || 0} ITEMS
                    </span>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 rounded-lg text-rose-600 hover:text-rose-750 hover:bg-rose-50 transition-all duration-200 shadow-2xs bg-white border border-slate-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { api } from '../lib/api';
import type { WCCategory, WCImage, WCAttribute, WCProduct } from '../lib/api';
import { R2Uploader } from '../components/R2Uploader';
import { AttributeManager } from '../components/AttributeManager';

interface ProductFormProps {
  setActiveTab: (tab: string) => void;
  editingProductId?: number | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ setActiveTab, editingProductId }) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<WCCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockStatus, setStockStatus] = useState<'instock' | 'outofstock'>('instock');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  
  // Custom Relational State
  const [images, setImages] = useState<WCImage[]>([]);
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [attributes, setAttributes] = useState<WCAttribute[]>([]);
  const [isStep4Ready, setIsStep4Ready] = useState(false);

  const cleanHtmlForEditor = (html: string) => {
    if (!html) return '';
    let clean = html;
    if (clean.startsWith('<p>') && clean.endsWith('</p>')) {
      clean = clean.slice(3, -4);
    }
    clean = clean.replace(/<br\s*\/?>/gi, '\n');
    return clean;
  };

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setIsStep4Ready(true), 600);
      return () => clearTimeout(timer);
    } else {
      setIsStep4Ready(false);
    }
  }, [step]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const catRes = await api.getCategories();
        setCategories(catRes);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    if (editingProductId) {
      const prodId = editingProductId;
      async function loadProduct() {
        try {
          const p = await api.getProduct(prodId);
          setName(p.name);
          setSlug(p.slug || '');
          setRegularPrice(p.regular_price || '');
          setSalePrice(p.sale_price || '');
          setStockStatus(p.stock_status === 'outofstock' ? 'outofstock' : 'instock');
          setShortDesc(cleanHtmlForEditor(p.short_description || ''));
          setDesc(cleanHtmlForEditor(p.description || ''));
          setImages(p.images || []);
          setSelectedCats((p.categories || []).map((c) => c.id));
          setAttributes(p.attributes || []);
        } catch (err) {
          console.error('Failed to load product for editing:', err);
        }
      }
      loadProduct();
    }
  }, [editingProductId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProductId) {
      // Auto generate WooCommerce URL friendly slug
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleCategoryToggle = (catId: number) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter((id) => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4 || !isStep4Ready) return;
    if (!name.trim() || !regularPrice.trim()) {
      alert('Product name and regular price are required.');
      return;
    }

    setSubmitting(true);
    try {
      // Build WC payload structure
      // Real WooCommerce stores descriptions as HTML, wrap in p tags if plain text
      const htmlDescription = desc.startsWith('<') ? desc : `<p>${desc.replace(/\n/g, '<br />')}</p>`;
      const htmlShortDescription = shortDesc.startsWith('<') ? shortDesc : `<p>${shortDesc.replace(/\n/g, '<br />')}</p>`;

      const finalProduct: Omit<WCProduct, 'id'> = {
        name: name.trim(),
        slug: slug.trim() || undefined as any,
        price: salePrice.trim() || regularPrice.trim(),
        regular_price: regularPrice.trim(),
        sale_price: salePrice.trim() || '',
        stock_status: stockStatus,
        short_description: htmlShortDescription,
        description: htmlDescription,
        images: images,
        categories: selectedCats.map((id) => ({ id } as WCCategory)),
        attributes: attributes,
      };

      if (editingProductId) {
        await api.updateProduct(editingProductId, finalProduct);
        alert('Product updated successfully!');
      } else {
        await api.createProduct(finalProduct);
        alert('Product created successfully and synced to D1/R2!');
      }
      setActiveTab('products');
    } catch (err: any) {
      console.error(err);
      alert(`Operation failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('products')}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {editingProductId ? 'Edit Product' : 'Create Product'}
            <Sparkles size={18} className="text-slate-800" />
          </h2>
          <p className="text-sm text-slate-550 mt-1">
            {editingProductId ? 'Modify product parameters and sync changes.' : 'Configure details, images, and variables to sync.'}
          </p>
        </div>
      </div>

      {/* Steps indicator bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? 'bg-slate-900 shadow-xs' : 'bg-slate-200'
            }`}
          ></div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="glass p-6 rounded-2xl shadow-sm border border-slate-200 bg-white space-y-6"
      >
        {/* STEP 1: General Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-2">
              Step 1: General Specifications
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Premium Gym Hoodie"
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. premium-gym-hoodie"
                  className="glass-input text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Regular Price (LKR)</label>
                <input
                  type="number"
                  required
                  value={regularPrice}
                  onChange={(e) => setRegularPrice(e.target.value)}
                  placeholder="e.g. 5200"
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Sale Price (Optional)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="e.g. 4800"
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-xs text-slate-500 font-semibold">Inventory Status</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as any)}
                  className="glass-input text-sm h-10 appearance-none bg-white text-slate-900 cursor-pointer"
                >
                  <option value="instock">In Stock</option>
                  <option value="outofstock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Description */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-2">
              Step 2: HTML Descriptions
            </h3>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Short Description (Introductory summary)</label>
              <textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Write a brief, catchy summary of the product (visible near price)..."
                rows={3}
                className="glass-input text-sm resize-none"
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-500 font-semibold">Detailed Description (Full HTML details)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Write full HTML descriptions, details, specifications..."
                rows={6}
                className="glass-input text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Media & Categories */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-2">
                Step 3: Media Gallery & Categories
              </h3>
              <p className="text-xs text-slate-500">Upload multiple images to R2 and select product categories.</p>
            </div>

            {/* R2 Media drag sorter */}
            <R2Uploader images={images} onChange={setImages} />

            {/* Category checkboxes */}
            <div className="space-y-2 border-t border-slate-100 pt-5">
              <label className="text-xs text-slate-700 font-bold uppercase tracking-wider">Product Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                {categories.map((c) => (
                  <label
                    key={c.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer select-none transition-all duration-200 ${
                      selectedCats.includes(c.id)
                        ? 'bg-slate-100 border-slate-850 text-slate-900 shadow-2xs font-semibold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(c.id)}
                      onChange={() => handleCategoryToggle(c.id)}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-0 focus:ring-offset-0 bg-white border-slate-350 cursor-pointer"
                    />
                    <span className="text-xs font-semibold">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Attributes */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h3 className="text-sm font-bold text-slate-850 uppercase tracking-wider mb-2">
                Step 4: Custom Variations & Attributes
              </h3>
              <p className="text-xs text-slate-500">Add dynamic variable selectors (Sizes, Colors, Styles) to this product.</p>
            </div>

            <AttributeManager attributes={attributes} onChange={setAttributes} />

            {/* Success summary confirmation */}
            <div className="bg-emerald-50 border border-emerald-100 p-4.5 rounded-xl flex items-start gap-3 transition-all duration-500">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 shadow-inner">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Final check completed</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Ready to deploy to Cloudflare Worker edge database. Full relational entries will compile safely.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons inside form */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-5">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !isStep4Ready}
              className={`btn-primary py-2 px-6 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all duration-300 ${(!isStep4Ready || submitting) ? 'opacity-50 cursor-not-allowed scale-95' : 'cursor-pointer hover:scale-[1.02]'}`}
            >
              <ShoppingBag size={14} />
              <span>{submitting ? 'Syncing...' : editingProductId ? 'Save Changes' : 'Deploy Product'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

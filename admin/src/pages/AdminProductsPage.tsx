import React, { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Image, Upload, CheckCircle } from 'lucide-react';
import { adminFetch } from '../api/client';
import { getAdminToken } from '../api/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  size: string;
  color: string;
  colorHex: string;
  stockQuantity: number;
  price: number;
  compareAtPrice: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number;
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string; isFeatured: boolean }[];
  variants: Variant[];
  isActive: boolean;
  isFeatured: boolean;
}

const emptyVariant = (): Variant => ({
  size: 'M', color: 'Black', colorHex: '#000000', stockQuantity: 10, price: 0, compareAtPrice: 0, sku: ''
});

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '', slug: '', description: '', basePrice: '', compareAtPrice: '',
    categoryId: '', isActive: true, isFeatured: false
  });
  const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; altText: string; isFeatured: boolean }[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const fetchProducts = async (q?: string) => {
    const params = q ? `?search=${q}` : '';
    const data = await adminFetch<{ products: Product[] }>(`/admin/products${params}`);
    setProducts(data.products);
  };

  useEffect(() => {
    Promise.all([
      adminFetch<{ products: Product[] }>('/admin/products').then(d => setProducts(d.products)),
      adminFetch<{ categories: Category[] }>('/categories').then(d => setCategories(d.categories)),
    ]).finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', basePrice: '', compareAtPrice: '', categoryId: categories[0]?.id || '', isActive: true, isFeatured: false });
    setVariants([emptyVariant()]);
    setUploadedImages([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      basePrice: String(p.basePrice), compareAtPrice: String(p.compareAtPrice),
      categoryId: p.category?.id || '', isActive: p.isActive, isFeatured: p.isFeatured
    });
    setVariants(p.variants.length ? p.variants.map(v => ({ ...v })) : [emptyVariant()]);
    setUploadedImages(p.images.map(i => ({ url: i.url, altText: i.altText, isFeatured: i.isFeatured })));
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await adminFetch(`/admin/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAdminToken()}` },
      body: fd
    });
    const data = await res.json();
    setUploadedImages(prev => [
      ...prev,
      { url: data.url, altText: form.name || 'Product image', isFeatured: prev.length === 0 }
    ]);
    setUploadingImg(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        basePrice: parseFloat(form.basePrice),
        compareAtPrice: parseFloat(form.compareAtPrice) || null,
        variants,
        images: uploadedImages
      };
      if (editing) {
        await adminFetch(`/admin/products/${editing.id}`, {
          method: 'PUT', body: JSON.stringify(payload)
        });
      } else {
        await adminFetch('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      setSuccessMsg(editing ? 'Product updated!' : 'Product created!');
      setShowModal(false);
      await fetchProducts(search);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manage</p>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mt-1">Products</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-950/50 border border-green-800 text-green-400 text-xs">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-[#111111] border border-[#2a2a2a] text-white pl-10 pr-3 py-2 text-xs focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <p className="text-xs text-gray-500 animate-pulse">Loading products...</p>
      ) : (
        <div className="bg-[#111111] border border-[#1c1c1c] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1c1c1c] bg-[#0d0d0d]">
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-gray-400">Product</th>
                  <th className="text-left px-4 py-3 font-black uppercase tracking-widest text-gray-400">Category</th>
                  <th className="text-right px-4 py-3 font-black uppercase tracking-widest text-gray-400">Price</th>
                  <th className="text-center px-4 py-3 font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="text-center px-4 py-3 font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c1c1c]">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-[#1a1a1a] transition">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{p.name}</p>
                      <p className="text-gray-500 text-[10px]">/{p.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{p.category?.name}</td>
                    <td className="px-4 py-3 text-right font-black text-white">₹{p.basePrice?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${p.isActive ? 'text-green-400 bg-green-950/30 border-green-800' : 'text-gray-500 bg-[#1a1a1a] border-[#2a2a2a]'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-white transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-[#111111] border border-[#2a2a2a] w-full max-w-2xl my-auto animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                    className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Price (₹) *</label>
                  <input type="number" required value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                    className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Compare At (₹)</label>
                  <input type="number" value={form.compareAtPrice} onChange={e => setForm(f => ({ ...f, compareAtPrice: e.target.value }))}
                    className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Category *</label>
                  <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 text-xs focus:outline-none focus:border-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-white" />
                  <span className="text-xs text-gray-400">Active (visible in store)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))}
                    className="w-3.5 h-3.5 accent-white" />
                  <span className="text-xs text-gray-400">Featured product</span>
                </label>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Variants</label>
                  <button type="button" onClick={() => setVariants(v => [...v, emptyVariant()])}
                    className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
                <div className="space-y-2">
                  {variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 bg-[#1c1c1c] border border-[#2a2a2a] p-3">
                      <select value={v.size} onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, size: e.target.value } : x))}
                        className="bg-[#111] border border-[#3a3a3a] text-white px-2 py-1 text-xs col-span-1">
                        {SIZES.map(s => <option key={s}>{s}</option>)}
                      </select>
                      <input placeholder="Color" value={v.color} onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                        className="bg-[#111] border border-[#3a3a3a] text-white px-2 py-1 text-xs col-span-1" />
                      <input type="number" placeholder="Stock" value={v.stockQuantity} onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, stockQuantity: +e.target.value } : x))}
                        className="bg-[#111] border border-[#3a3a3a] text-white px-2 py-1 text-xs col-span-1" />
                      <input type="number" placeholder="Price" value={v.price || ''} onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, price: +e.target.value } : x))}
                        className="bg-[#111] border border-[#3a3a3a] text-white px-2 py-1 text-xs col-span-1" />
                      <input placeholder="SKU" value={v.sku} onChange={e => setVariants(vv => vv.map((x, j) => j === i ? { ...x, sku: e.target.value } : x))}
                        className="bg-[#111] border border-[#3a3a3a] text-white px-2 py-1 text-xs col-span-1" />
                      <button type="button" onClick={() => setVariants(vv => vv.filter((_, j) => j !== i))}
                        className="flex items-center justify-center text-red-500 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Product Images</label>
                  <label className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3 h-3" />
                    {uploadingImg ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImg} />
                  </label>
                </div>
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.url} alt={img.altText} className="w-20 h-20 object-cover border border-[#3a3a3a]" />
                        <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-0 right-0 bg-red-600 p-0.5 opacity-0 group-hover:opacity-100 transition">
                          <X className="w-3 h-3 text-white" />
                        </button>
                        {img.isFeatured && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] text-center text-white py-0.5">
                            Featured
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {uploadedImages.length === 0 && (
                  <div className="border border-dashed border-[#3a3a3a] p-8 text-center">
                    <Image className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                    <p className="text-[10px] text-gray-500">Upload product images above</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2 border-t border-[#2a2a2a]">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#3a3a3a] text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

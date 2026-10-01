import React, { useEffect, useState } from 'react';
import { Tag, Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react';
import { adminFetch } from '../api/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count?: {
    products: number;
  };
}

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '' });
  const [saving, setSaving] = useState(false);

  const fetchCats = async () => {
    try {
      const data = await adminFetch<{ categories: Category[] }>('/categories');
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', image: '' });
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminFetch(`/admin/categories/${id}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminFetch(`/admin/categories/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
      } else {
        await adminFetch('/admin/categories', {
          method: 'POST',
          body: JSON.stringify(form)
        });
      }
      setShowModal(false);
      await fetchCats();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Manage</p>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white mt-1">Categories</h1>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-500 animate-pulse">Loading categories...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-[#111111] border border-[#1c1c1c] p-5 space-y-3 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase text-white">{cat.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(cat)} className="text-gray-400 hover:text-white transition">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-gray-400 hover:text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{cat.description || 'No description provided.'}</p>
              <div className="pt-2 border-t border-[#1c1c1c] flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
                <span>Products Count</span>
                <span className="text-white font-mono">{cat._count?.products ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-[#2a2a2a] w-full max-w-md p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#2a2a2a] pb-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-white">
                {editing ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({
                    ...f,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                  }))}
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#1c1c1c] border border-[#3a3a3a] text-white px-3 py-2 focus:outline-none focus:border-white resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-[#3a3a3a] text-gray-400 hover:text-white uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 bg-white text-black uppercase font-black hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

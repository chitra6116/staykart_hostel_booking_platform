import React, { useState, useEffect } from 'react';
import { amenityApi } from '../../api/amenityApi';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import { Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminAmenitiesPage() {
  const toast = useToast();
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Comfort');
  const [iconName, setIconName] = useState('sparkles');
  const [saving, setSaving] = useState(false);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const data = await amenityApi.getAll();
      setAmenities(data || []);
    } catch (err) {
      console.error('Failed to load amenities', err);
      toast.error('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const openAdd = () => {
    setEditingAmenity(null);
    setName('');
    setCategory('Comfort');
    setIconName('sparkles');
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingAmenity(a);
    setName(a.name);
    setCategory(a.category || 'Comfort');
    setIconName(a.iconName || 'sparkles');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteAmenity(id);
      toast.success('Amenity removed');
      fetchAmenities();
    } catch (err) {
      toast.error('Failed to delete amenity');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAmenity) {
        await adminApi.updateAmenity(editingAmenity.id, {
          name: name.trim(),
          category: category.trim(),
          iconName: iconName.trim()
        });
        toast.success('Amenity updated');
      } else {
        await adminApi.createAmenity({
          name: name.trim(),
          category: category.trim(),
          iconName: iconName.trim()
        });
        toast.success('Amenity created');
      }
      setModalOpen(false);
      fetchAmenities();
    } catch (err) {
      toast.error('Failed to save amenity');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Amenities Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global catalog of hotel and room amenities tagged across properties and rooms.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-teal-500/25 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Amenity</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Amenity Name</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Icon Key</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {amenities.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-500" />
                      <span>{a.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {a.category}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {a.iconName}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAmenity ? 'Edit Amenity' : 'Add Amenity'}>
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amenity Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Complimentary Breakfast, Rooftop Infinity Pool"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Comfort">Comfort</option>
                <option value="Connectivity">Connectivity</option>
                <option value="Wellness">Wellness</option>
                <option value="Dining">Dining</option>
                <option value="Services">Services</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Icon Key
              </label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="wifi, pool, coffee"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-teal-500 text-white font-bold"
            >
              {saving ? 'Saving...' : editingAmenity ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

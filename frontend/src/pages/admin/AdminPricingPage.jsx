import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { propertyApi } from '../../api/propertyApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import {
  IndianRupee,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function AdminPricingPage() {
  const toast = useToast();
  const [rules, setRules] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Single Rule Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('FESTIVAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [multiplier, setMultiplier] = useState('1.25');
  const [discountPercentage, setDiscountPercentage] = useState('0');
  const [minNights, setMinNights] = useState('1');
  const [saving, setSaving] = useState(false);

  // Bulk Pricing Modal
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkName, setBulkName] = useState('');
  const [bulkMultiplier, setBulkMultiplier] = useState('1.30');
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [selectedPropIds, setSelectedPropIds] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPricingRules();
      setRules(data || []);
    } catch (err) {
      console.error('Failed to load pricing rules', err);
      toast.error('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    const loadProperties = async () => {
      try {
        const res = await propertyApi.search({ size: 100 });
        setProperties(res.content || []);
      } catch (err) {
        console.error('Failed to load properties', err);
      }
    };
    loadProperties();
  }, []);

  const handleDeleteRule = async (id) => {
    try {
      await adminApi.deletePricingRule(id);
      toast.success('Pricing rule removed');
      fetchRules();
    } catch (err) {
      toast.error('Failed to delete pricing rule');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.createPricingRule({
        name: ruleName.trim(),
        ruleType,
        startDate: startDate || null,
        endDate: endDate || null,
        multiplier: Number(multiplier) || 1.0,
        discountPercentage: Number(discountPercentage) || 0,
        minNights: Number(minNights) || 1
      });
      toast.success('Pricing rule created successfully');
      setModalOpen(false);
      setRuleName('');
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create rule');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkPricing = async (e) => {
    e.preventDefault();
    setBulkSaving(true);
    try {
      await adminApi.bulkPricing({
        name: bulkName.trim(),
        ruleType: 'FESTIVAL',
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        multiplier: Number(bulkMultiplier),
        discountPercentage: 0,
        minNights: 1,
        propertyIds: selectedPropIds
      });
      toast.success('Bulk surge pricing rules applied across destinations');
      setBulkOpen(false);
      setBulkName('');
      setSelectedPropIds([]);
      fetchRules();
    } catch (err) {
      toast.error('Failed to apply bulk pricing');
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pricing Rules &amp; Festival Multipliers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure Diwali, New Year, weekend surcharges (1.15x), and 7+ night stay discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-saffron-500" />
            <span>Bulk Seasonal Surge</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-teal-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rules.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No dynamic pricing rules configured.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Rule Name</th>
                  <th className="px-5 py-3.5">Rule Type</th>
                  <th className="px-5 py-3.5">Active Dates</th>
                  <th className="px-5 py-3.5">Multiplier / Discount</th>
                  <th className="px-5 py-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold text-[11px]">
                        {r.ruleType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                      {r.startDate && r.endDate ? `${r.startDate} to ${r.endDate}` : 'All Year'}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {Number(r.multiplier) > 1.0 && `${r.multiplier}x Surge`}
                      {Number(r.discountPercentage) > 0 && `-${r.discountPercentage}% Discount`}
                      {Number(r.multiplier) === 1.0 && Number(r.discountPercentage) === 0 && 'Base Rate'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Delete Rule"
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

      {/* Create Rule Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Dynamic Pricing Rule">
        <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              required
              placeholder="e.g. Diwali Peak Surge, Holi Weekend"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rule Type *
              </label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="FESTIVAL">Festival Surge</option>
                <option value="SEASONAL">Seasonal Tariff</option>
                <option value="WEEKEND">Weekend Rate</option>
                <option value="LENGTH_OF_STAY">Stay Discount</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Multiplier (e.g. 1.25 = +25%)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="3.0"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
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
              {saving ? 'Saving...' : 'Create Rule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Pricing Modal */}
      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Apply Festival Surge Across Hotels">
        <form onSubmit={handleBulkPricing} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Surge Title *
            </label>
            <input
              type="text"
              value={bulkName}
              onChange={(e) => setBulkName(e.target.value)}
              required
              placeholder="e.g. New Year 2027 Gala Surge"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Surge Multiplier (1.30 = 30% increase) *
            </label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="2.5"
              value={bulkMultiplier}
              onChange={(e) => setBulkMultiplier(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={bulkStartDate}
                onChange={(e) => setBulkStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={bulkEndDate}
                min={bulkStartDate}
                onChange={(e) => setBulkEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Properties:
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
              {properties.map((p) => (
                <label key={p.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPropIds.includes(p.id)}
                    onChange={() =>
                      setSelectedPropIds((prev) =>
                        prev.includes(p.id) ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                      )
                    }
                    className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setBulkOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkSaving}
              className="flex-1 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold"
            >
              {bulkSaving ? 'Applying...' : 'Apply Bulk Surge'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

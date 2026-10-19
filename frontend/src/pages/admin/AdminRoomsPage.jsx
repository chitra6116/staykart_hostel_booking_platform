import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { propertyApi } from '../../api/propertyApi';
import { amenityApi } from '../../api/amenityApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import {
  BedDouble,
  Plus,
  Wrench,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Layers,
  Building
} from 'lucide-react';

export default function AdminRoomsPage() {
  const toast = useToast();
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add Room Modal State
  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [roomTypeId, setRoomTypeId] = useState(1);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [savingRoom, setSavingRoom] = useState(false);

  // Maintenance Block Modal State
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [targetRoom, setTargetRoom] = useState(null);
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('Routine AC & plumbing maintenance');
  const [blocking, setBlocking] = useState(false);

  // Bulk Block Modal State
  const [bulkBlockOpen, setBulkBlockOpen] = useState(false);
  const [selectedRoomIdsForBulk, setSelectedRoomIdsForBulk] = useState([]);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkReason, setBulkReason] = useState('Off-season deep renovation');
  const [bulkBlocking, setBulkBlocking] = useState(false);

  const ROOM_TYPES = [
    { id: 1, name: 'Standard Room' },
    { id: 2, name: 'Deluxe Room' },
    { id: 3, name: 'Premium Room' },
    { id: 4, name: 'Heritage Suite' },
    { id: 5, name: 'Family Room' }
  ];

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await propertyApi.search({ size: 100 });
        const list = res.content || [];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load properties', err);
      }
    };
    const loadAmenities = async () => {
      try {
        const ams = await amenityApi.getAll();
        setAmenities(ams);
      } catch (err) {
        console.error('Failed to load amenities', err);
      }
    };
    loadProperties();
    loadAmenities();
  }, []);

  useEffect(() => {
    if (!selectedPropertyId) return;

    const fetchRooms = async () => {
      setLoading(true);
      try {
        const prop = await propertyApi.getById(selectedPropertyId);
        setRooms(prop.rooms || []);
      } catch (err) {
        console.error('Failed to load rooms for property', err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedPropertyId]);

  const handleToggleRoomStatus = async (r) => {
    try {
      await adminApi.toggleRoomStatus(r.id);
      toast.success(`Room #${r.roomNumber} status toggled`);
      const prop = await propertyApi.getById(selectedPropertyId);
      setRooms(prop.rooms || []);
    } catch (err) {
      toast.error('Failed to toggle room status');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setSavingRoom(true);
    try {
      await adminApi.createRoom({
        propertyId: Number(selectedPropertyId),
        roomTypeId: Number(roomTypeId),
        roomNumber: roomNumber.trim(),
        floor: Number(floor),
        amenityIds: selectedAmenityIds
      });
      toast.success('Room created successfully');
      setAddRoomOpen(false);
      setRoomNumber('');
      const prop = await propertyApi.getById(selectedPropertyId);
      setRooms(prop.rooms || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    if (!targetRoom || !blockStartDate || !blockEndDate) return;

    setBlocking(true);
    try {
      await adminApi.scheduleMaintenance({
        roomId: targetRoom.id,
        startDate: blockStartDate,
        endDate: blockEndDate,
        reason: blockReason.trim()
      });
      toast.success(`Maintenance scheduled for Room #${targetRoom.roomNumber}`);
      setMaintenanceOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot block: existing booking conflicts with dates');
    } finally {
      setBlocking(false);
    }
  };

  const handleBulkBlock = async (e) => {
    e.preventDefault();
    if (selectedRoomIdsForBulk.length === 0) {
      toast.error('Select at least one room');
      return;
    }

    setBulkBlocking(true);
    try {
      await adminApi.bulkBlockRooms({
        roomIds: selectedRoomIdsForBulk,
        startDate: bulkStartDate,
        endDate: bulkEndDate,
        reason: bulkReason.trim()
      });
      toast.success(`Bulk maintenance scheduled for ${selectedRoomIdsForBulk.length} rooms`);
      setBulkBlockOpen(false);
      setSelectedRoomIdsForBulk([]);
    } catch (err) {
      toast.error('Failed to bulk block rooms');
    } finally {
      setBulkBlocking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Rooms &amp; Maintenance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage inventory by hotel property, schedule maintenance blocks, or bulk disable rooms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkBlockOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-500" />
            <span>Bulk Block</span>
          </button>

          <button
            onClick={() => setAddRoomOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-teal-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Property Selector Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
        <Building className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
          Select Hotel Property:
        </label>
        <select
          value={selectedPropertyId}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.city})
            </option>
          ))}
        </select>
      </div>

      {/* Rooms Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No rooms registered for this property yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-3.5">Room Number</th>
                  <th className="px-5 py-3.5">Floor</th>
                  <th className="px-5 py-3.5">Room Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Maintenance / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      Room #{r.roomNumber}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      Floor {r.floor}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-teal-600 dark:text-teal-400">
                      {r.roomTypeName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                          r.active
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setTargetRoom(r);
                          setBlockStartDate('');
                          setBlockEndDate('');
                          setMaintenanceOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="Schedule Room Maintenance"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Block Dates</span>
                      </button>

                      <button
                        onClick={() => handleToggleRoomStatus(r)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-teal-600 dark:text-teal-400 align-middle"
                        title={r.active ? 'Deactivate Room' : 'Activate Room'}
                      >
                        {r.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={addRoomOpen} onClose={() => setAddRoomOpen(false)} title="Add New Room">
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Room Category *
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {ROOM_TYPES.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Room Number *
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
                placeholder="e.g. 101, 204"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Floor *
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={floor}
                onChange={(e) => setFloor(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAddRoomOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingRoom}
              className="flex-1 py-2 rounded-xl bg-teal-500 text-white font-bold"
            >
              {savingRoom ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Maintenance Modal */}
      <Modal
        isOpen={maintenanceOpen}
        onClose={() => setMaintenanceOpen(false)}
        title={`Schedule Maintenance: Room #${targetRoom?.roomNumber}`}
      >
        <form onSubmit={handleScheduleMaintenance} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Selected dates will be locked and cannot be booked by guests.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Date (Inclusive) *
              </label>
              <input
                type="date"
                value={blockStartDate}
                onChange={(e) => setBlockStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Date (Exclusive) *
              </label>
              <input
                type="date"
                value={blockEndDate}
                min={blockStartDate}
                onChange={(e) => setBlockEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Maintenance Reason *
            </label>
            <input
              type="text"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setMaintenanceOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={blocking}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {blocking ? 'Blocking...' : 'Block Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Block Modal */}
      <Modal
        isOpen={bulkBlockOpen}
        onClose={() => setBulkBlockOpen(false)}
        title="Bulk Block Rooms for Maintenance"
      >
        <form onSubmit={handleBulkBlock} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Rooms to Block:
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-700 p-2 rounded-xl">
              {rooms.map((r) => (
                <label key={r.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoomIdsForBulk.includes(r.id)}
                    onChange={() =>
                      setSelectedRoomIdsForBulk((prev) =>
                        prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                      )
                    }
                    className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Room #{r.roomNumber}</span>
                </label>
              ))}
            </div>
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
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason *
            </label>
            <input
              type="text"
              value={bulkReason}
              onChange={(e) => setBulkReason(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setBulkBlockOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bulkBlocking}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              {bulkBlocking ? 'Blocking...' : 'Apply Bulk Block'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

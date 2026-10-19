import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../api/adminApi';
import { formatINR, formatDate } from '../../utils/formatters';
import { CITIES } from '../../components/search/HeroSearchBar';
import Modal from '../../components/common/Modal';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Clock,
  User,
  Phone,
  ShieldAlert,
  Building,
  Wrench
} from 'lucide-react';

export default function AdminCalendarPage() {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState('');
  const [roomTypeId, setRoomTypeId] = useState('');
  const [viewDays, setViewDays] = useState(14); // 14 or 30 days
  const [startOffset, setStartOffset] = useState(0); // in days from today

  // Selected item detail modal
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setDate(today.getDate() + startOffset);
      const startStr = today.toISOString().split('T')[0];

      const end = new Date(today);
      end.setDate(end.getDate() + viewDays);
      const endStr = end.toISOString().split('T')[0];

      const data = await adminApi.getCalendar({
        startDate: startStr,
        endDate: endStr,
        city: city || undefined,
        roomTypeId: roomTypeId || undefined
      });
      setCalendarData(data);
    } catch (err) {
      console.error('Failed to load occupancy calendar', err);
    } finally {
      setLoading(false);
    }
  }, [city, roomTypeId, viewDays, startOffset]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Generate array of Date objects for columns
  const getDatesArray = () => {
    if (!calendarData?.startDate) return [];
    const dates = [];
    const cur = new Date(calendarData.startDate);
    const end = new Date(calendarData.endDate);

    while (cur < end) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const dates = getDatesArray();

  const handlePrev = () => setStartOffset((prev) => prev - 7);
  const handleNext = () => setStartOffset((prev) => prev + 7);
  const handleToday = () => setStartOffset(0);

  const getEventForDate = (room, dateStr) => {
    // Check maintenance blocks first
    if (room.maintenanceBlocks) {
      for (const m of room.maintenanceBlocks) {
        if (dateStr >= m.startDate && dateStr < m.endDate) {
          return { type: 'MAINTENANCE', data: m, room };
        }
      }
    }

    // Check bookings
    if (room.bookings) {
      for (const b of room.bookings) {
        if (dateStr >= b.checkIn && dateStr < b.checkOut) {
          return { type: 'BOOKING', data: b, room };
        }
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Room Occupancy Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual room inventory across dates. Colored bars represent booking statuses and maintenance blocks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-teal-500" />
            <span className="text-slate-600 dark:text-slate-300">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">Checked In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500" />
            <span className="text-slate-600 dark:text-slate-300">Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-700" />
            <span className="text-slate-600 dark:text-slate-300">Available</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Date Navigator */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* City filter */}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="">All Destination Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* View Days Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewDays(14)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewDays === 14 ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              2 Weeks
            </button>
            <button
              onClick={() => setViewDays(30)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewDays === 30 ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              1 Month
            </button>
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
            {calendarData && `${formatDate(calendarData.startDate)} – ${formatDate(calendarData.endDate)}`}
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !calendarData || calendarData.rooms.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No rooms found for the selected city or room type.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <th className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300 w-56 min-w-[220px] border-r border-slate-200 dark:border-slate-700">
                    Room / Property
                  </th>
                  {dates.map((d, i) => {
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    const dateStr = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                    const dayNum = d.getDate();

                    return (
                      <th
                        key={i}
                        className={`px-2 py-2 text-center min-w-[42px] border-r border-slate-100 dark:border-slate-800 ${
                          isWeekend ? 'bg-amber-50/60 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                          {dayName}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {dayNum}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {calendarData.rooms.map((room) => (
                  <tr key={room.roomId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    {/* Fixed Room Col */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-800 px-4 py-2.5 border-r border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        Room #{room.roomNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {room.propertyName} ({room.city})
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400">
                        {room.roomTypeName}
                      </div>
                    </td>

                    {/* Date Cells */}
                    {dates.map((d, i) => {
                      const dateStr = d.toISOString().split('T')[0];
                      const event = getEventForDate(room, dateStr);
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

                      let cellBg = isWeekend ? 'bg-slate-50/50 dark:bg-slate-900/30' : '';
                      let cellContent = null;

                      if (event) {
                        if (event.type === 'MAINTENANCE') {
                          cellContent = (
                            <div
                              onClick={() => setSelectedEvent(event)}
                              className="h-7 w-full rounded bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center cursor-pointer shadow-xs transition-colors"
                              title={`Maintenance: ${event.data.reason}`}
                            >
                              <Wrench className="w-3 h-3" />
                            </div>
                          );
                        } else if (event.type === 'BOOKING') {
                          const status = event.data.status;
                          let barColor = 'bg-teal-500 hover:bg-teal-600';
                          if (status === 'CHECKED_IN') barColor = 'bg-blue-500 hover:bg-blue-600';
                          else if (status === 'CHECKED_OUT') barColor = 'bg-slate-400 hover:bg-slate-500';

                          cellContent = (
                            <div
                              onClick={() => setSelectedEvent(event)}
                              className={`h-7 w-full rounded ${barColor} text-white text-[10px] font-bold flex items-center justify-center cursor-pointer shadow-xs transition-colors`}
                              title={`Booking ${event.data.bookingCode} - ${event.data.guestName}`}
                            >
                              {event.data.guestName?.split(' ')[0]?.substring(0, 3)}
                            </div>
                          );
                        }
                      }

                      return (
                        <td
                          key={i}
                          className={`p-1 border-r border-slate-100 dark:border-slate-800 ${cellBg}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.type === 'BOOKING' ? 'Booking Details' : 'Maintenance Block'}
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            {selectedEvent.type === 'BOOKING' ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                    {selectedEvent.data.bookingCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold">
                    {selectedEvent.data.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Property / Room:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.room.propertyName} &bull; Room #{selectedEvent.room.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guest Name:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.data.guestName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Guest Mobile:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.data.guestPhone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dates:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(selectedEvent.data.checkIn)} – {formatDate(selectedEvent.data.checkOut)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-sm">
                    <span className="text-slate-500">Total Tariff:</span>
                    <span className="font-extrabold text-teal-600 dark:text-teal-400">
                      {formatINR(selectedEvent.data.totalAmountInr)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700 text-amber-600">
                  <Wrench className="w-4 h-4" />
                  <span className="font-bold text-sm">Room Unavailable</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Room:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.room.propertyName} &bull; Room #{selectedEvent.room.roomNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Block Dates:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(selectedEvent.data.startDate)} – {formatDate(selectedEvent.data.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reason:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEvent.data.reason}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-semibold text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

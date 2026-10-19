import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

export const CITIES = [
  'Jaipur',
  'Goa',
  'Udaipur',
  'Manali',
  'Munnar',
  'Bengaluru',
  'Mumbai',
  'Delhi'
];

export default function HeroSearchBar({
  initialCity = '',
  initialCheckIn = '',
  initialCheckOut = '',
  initialGuests = 1,
  className = ''
}) {
  const navigate = useNavigate();

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn || getTodayString());
  const [checkOut, setCheckOut] = useState(initialCheckOut || getTomorrowString());
  const [guests, setGuests] = useState(initialGuests || 1);

  const handleCheckInChange = (e) => {
    const newIn = e.target.value;
    setCheckIn(newIn);
    if (newIn >= checkOut) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());

    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 transition-all ${className}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* City Select */}
        <div className="relative flex items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500">
          <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mr-3" />
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              City / Destination
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="">All Destinations</option>
              {CITIES.map((c) => (
                <option key={c} value={c} className="text-slate-900">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Check In Date */}
        <div className="relative flex items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500">
          <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mr-3" />
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Check-in Date
            </label>
            <input
              type="date"
              min={getTodayString()}
              value={checkIn}
              onChange={handleCheckInChange}
              required
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Check Out Date */}
        <div className="relative flex items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500">
          <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mr-3" />
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Check-out Date
            </label>
            <input
              type="date"
              min={checkIn || getTodayString()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Guests Select */}
        <div className="relative flex items-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-teal-500">
          <Users className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mr-3" />
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num} className="text-slate-900">
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Submit Button */}
        <button
          type="submit"
          className="w-full h-[52px] px-6 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/35 transition-all cursor-pointer sm:col-span-2 lg:col-span-1"
        >
          <Search className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
}

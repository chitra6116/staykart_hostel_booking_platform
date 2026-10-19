import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { amenityApi } from '../api/amenityApi';
import { formatINR } from '../utils/formatters';
import { CITIES } from '../components/search/HeroSearchBar';
import { RoomCardSkeleton } from '../components/common/Skeleton';
import {
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Check,
  Building,
  Sparkles
} from 'lucide-react';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const city = searchParams.get('city') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1', 10);
  const sortBy = searchParams.get('sortBy') || 'price_asc';

  const [rooms, setRooms] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const [selectedCity, setSelectedCity] = useState(city);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const ROOM_TYPES = [
    { id: 1, name: 'Standard Room' },
    { id: 2, name: 'Deluxe Room' },
    { id: 3, name: 'Premium Room' },
    { id: 4, name: 'Heritage Suite' },
    { id: 5, name: 'Family Room' }
  ];

  useEffect(() => {
    setSelectedCity(city);
  }, [city]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await amenityApi.getAll();
        setAmenitiesList(data);
      } catch (err) {
        console.error('Failed to load amenities', err);
      }
    };
    fetchAmenities();
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const params = {
          city: city || undefined,
          checkIn: checkIn || undefined,
          checkOut: checkOut || undefined,
          guests: guests || 1,
          maxPrice: maxPrice || undefined,
          sortBy
        };

        if (selectedAmenities.length > 0) {
          params.amenityIds = selectedAmenities.join(',');
        }

        const data = await roomApi.search(params);

        // Filter room types client-side if selected
        let filtered = data;
        if (selectedRoomTypes.length > 0) {
          filtered = filtered.filter((r) =>
            selectedRoomTypes.includes(r.roomTypeName)
          );
        }

        // Apply price slider
        filtered = filtered.filter((r) => {
          const price = Number(r.pricePerNightInr || r.basePriceInr);
          return price <= maxPrice;
        });

        setRooms(filtered);
      } catch (err) {
        console.error('Failed to search rooms', err);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [city, checkIn, checkOut, guests, sortBy, maxPrice, selectedRoomTypes, selectedAmenities]);

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    const newParams = new URLSearchParams(searchParams);
    if (newCity) {
      newParams.set('city', newCity);
    } else {
      newParams.delete('city');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSort);
    setSearchParams(newParams);
  };

  const toggleRoomType = (typeName) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(typeName)
        ? prev.filter((t) => t !== typeName)
        : [...prev, typeName]
    );
  };

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((a) => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const resetFilters = () => {
    setMaxPrice(25000);
    setSelectedRoomTypes([]);
    setSelectedAmenities([]);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('city');
    setSelectedCity('');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Stays in {city || 'All Destinations'}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {loading ? 'Searching...' : `${rooms.length} available`}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>{checkIn ? `${checkIn} to ${checkOut}` : 'Flexible dates'}</span>
            <span>&bull;</span>
            <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
          </p>
        </div>

        {/* Quick Filter & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-teal-500" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-teal-500" />
                Filter Stays
              </h3>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-saffron-600 dark:text-saffron-400 hover:underline"
              >
                Reset All
              </button>
            </div>

            {/* City Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Destination City
              </label>
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="">All Destinations</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Max Price / Night
                </label>
                <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                  {formatINR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹800</span>
                <span>₹12,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Room Types Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Room Category
              </label>
              <div className="space-y-1.5">
                {ROOM_TYPES.map((rt) => {
                  const isChecked = selectedRoomTypes.includes(rt.name);
                  return (
                    <label
                      key={rt.id}
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRoomType(rt.name)}
                        className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                      />
                      <span>{rt.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Amenities Filter */}
            {amenitiesList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Amenities
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                  {amenitiesList.map((amenity) => {
                    const isChecked = selectedAmenities.includes(amenity.id);
                    return (
                      <label
                        key={amenity.id}
                        className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAmenity(amenity.id)}
                          className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                        <span>{amenity.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results Column */}
        <main className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="space-y-4">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          ) : rooms.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                No rooms available for selected filters
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Selected dates may have an existing reservation or maintenance block. Try clearing filters or selecting different travel dates.
              </p>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-sm transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            rooms.map((room) => {
              const detailUrl = `/rooms/${room.roomId}${
                checkIn && checkOut
                  ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                  : `?guests=${guests}`
              }`;

              const nightlyPrice = room.pricePerNightInr || room.basePriceInr;

              return (
                <div
                  key={room.roomId}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row group"
                >
                  {/* Photo Frame */}
                  <div className="relative w-full sm:w-72 h-52 shrink-0 bg-slate-900 overflow-hidden">
                    <img
                      src={room.coverImageUrl || '/images/hero/hero-banner.webp'}
                      alt={`${room.propertyName} - ${room.roomTypeName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold">
                      {room.roomTypeName}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                            Room #{room.roomNumber} &bull; Floor {room.floor}
                          </p>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            {room.propertyName}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
                        <span>{room.addressLine}, {room.city}, {room.state}</span>
                      </p>

                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-teal-500" />
                          Up to {room.maxGuests} Guests
                        </span>
                      </div>

                      {/* Amenities Chips */}
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {room.amenities.slice(0, 4).map((a) => (
                            <span
                              key={a.id}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                            >
                              {a.name}
                            </span>
                          ))}
                          {room.amenities.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 text-[11px]">
                              +{room.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {formatINR(nightlyPrice)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">/ night</span>
                        </div>
                        {room.totalPriceInr && (
                          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                            Total: {formatINR(room.totalPriceInr)} (incl. GST)
                          </p>
                        )}
                        {!room.totalPriceInr && (
                          <p className="text-[10px] text-slate-400">
                            + applicable GST
                          </p>
                        )}
                      </div>

                      <Link
                        to={detailUrl}
                        className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold text-xs uppercase tracking-wider shadow-sm transition-all"
                      >
                        View &amp; Reserve
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}

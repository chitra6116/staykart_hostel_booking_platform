import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { pricingApi } from '../api/pricingApi';
import ImageGallery from '../components/gallery/ImageGallery';
import PriceBreakdownWidget from '../components/booking/PriceBreakdownWidget';
import { formatINR } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Users,
  Clock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const initialCheckIn = searchParams.get('checkIn') || getTodayString();
  const initialCheckOut = searchParams.get('checkOut') || getTomorrowString();
  const initialGuests = parseInt(searchParams.get('guests') || '1', 10);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [dateConflict, setDateConflict] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const data = await roomApi.getById(id);
        setRoom(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Room not found');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Check if dates conflict with disabledDates
  useEffect(() => {
    if (!room || !checkIn || !checkOut) return;

    const disabledSet = new Set(room.disabledDates || []);
    let current = new Date(checkIn);
    const end = new Date(checkOut);
    let conflict = false;

    // Check each night in [checkIn, checkOut)
    while (current < end) {
      const dateStr = current.toISOString().split('T')[0];
      if (disabledSet.has(dateStr)) {
        conflict = true;
        break;
      }
      current.setDate(current.getDate() + 1);
    }

    setDateConflict(conflict);

    if (!conflict && checkIn < checkOut) {
      const fetchQuote = async () => {
        setQuoteLoading(true);
        try {
          const q = await pricingApi.getQuoteByParams(id, checkIn, checkOut, guests);
          setQuote(q);
        } catch (err) {
          console.error('Failed to get price quote', err);
          setQuote(null);
        } finally {
          setQuoteLoading(false);
        }
      };
      fetchQuote();
    } else {
      setQuote(null);
    }
  }, [id, room, checkIn, checkOut, guests]);

  const handleCheckInChange = (e) => {
    const val = e.target.value;
    setCheckIn(val);
    if (val >= checkOut) {
      const d = new Date(val);
      d.setDate(d.getDate() + 1);
      setCheckOut(d.toISOString().split('T')[0]);
    }
  };

  const handleProceedToCheckout = () => {
    if (dateConflict) return;
    const checkoutUrl = `/checkout?roomId=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
    navigate(checkoutUrl);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stay Unavailable</h2>
        <p className="text-sm text-slate-500">{error || 'This room listing could not be found.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link to="/" className="hover:text-teal-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/search?city=${encodeURIComponent(room.city)}`} className="hover:text-teal-600">
          {room.city}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 dark:text-white font-medium truncate max-w-xs">
          {room.propertyName}
        </span>
      </nav>

      {/* Property & Room Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold">
            <span>{room.roomTypeName}</span>
            <span>&bull;</span>
            <span>Room #{room.roomNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {room.propertyName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-1">
            <MapPin className="w-4 h-4 text-saffron-500 shrink-0" />
            <span>
              {room.addressLine}, {room.city}, {room.state} - PIN {room.pincode}
            </span>
          </p>
        </div>

        <div className="text-left md:text-right">
          <div className="flex items-baseline md:justify-end gap-1">
            <span className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
              {formatINR(room.basePriceInr)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ night</span>
          </div>
          <p className="text-[11px] text-slate-400">+ applicable Indian GST</p>
        </div>
      </div>

      {/* Gallery Section */}
      <section>
        <ImageGallery images={room.images} title={`${room.propertyName} - ${room.roomTypeName}`} />
      </section>

      {/* Main Content Layout: Details + Sticky Reservation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Room info, Amenities, Rules */}
        <div className="lg:col-span-2 space-y-8">
          {/* Room Specs Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-[11px] text-slate-400">Capacity</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Up to {room.maxGuests} Guests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-[11px] text-slate-400">Check-in</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{room.checkInTime} IST</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-[11px] text-slate-400">Check-out</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{room.checkOutTime} IST</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <div>
                <p className="text-[11px] text-slate-400">Floor Level</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Floor {room.floor}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">About the Property</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {room.propertyDescription}
            </p>
            {room.roomTypeDescription && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Room details: </span>
                {room.roomTypeDescription}
              </p>
            )}
          </div>

          {/* Amenities Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Room &amp; Property Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities && room.amenities.map((amenity) => (
                <div
                  key={amenity.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules & Indian Identity Verification Notice */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">House Rules &amp; Guest Policies</h3>
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-start gap-2 font-semibold">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Mandatory Government ID Proof Required at Check-in</span>
              </div>
              <p className="pl-6 text-amber-800 dark:text-amber-300">
                All Indian guests above 18 years must present an original Aadhaar, Passport, Driving Licence, or Voter ID upon arrival.
              </p>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-1">
              <p>&bull; Check-in time: {room.checkInTime} IST. Early check-in subject to room availability.</p>
              <p>&bull; Check-out time: {room.checkOutTime} IST.</p>
              <p>&bull; {room.houseRules || 'Couples and families welcome. Non-smoking rooms.'}</p>
              <p>&bull; Quiet hours observed between 10:00 PM and 07:00 AM.</p>
            </div>
          </div>
        </div>

        {/* Right Sticky Column: Reservation & Live Price Quote */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-5">
            <div>
              <div className="flex items-baseline justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {formatINR(room.basePriceInr)}
                </span>
                <span className="text-xs text-slate-500">per night + GST</span>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <div className="p-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Check-in
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  value={checkIn}
                  onChange={handleCheckInChange}
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                />
              </div>
              <div className="p-2 border-l border-slate-200 dark:border-slate-700">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Check-out
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Guests Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {[...Array(room.maxGuests)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'Guest' : 'Guests'} (Max {room.maxGuests})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Conflict Error */}
            {dateConflict && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Selected dates are not available for this room.</span>
              </div>
            )}

            {/* Price Breakdown Widget */}
            <PriceBreakdownWidget quote={quote} loading={quoteLoading} />

            {/* Reservation Button */}
            {isAdmin ? (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs text-center">
                You are signed in as an admin. Log in with a guest account to book this room.
              </div>
            ) : (
              <>
                <button
                  onClick={handleProceedToCheckout}
                  disabled={dateConflict || quoteLoading || !quote}
                  className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-teal-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Reserve Room Now</span>
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                  You won&apos;t be charged yet. Room is held for 10 minutes upon proceeding.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

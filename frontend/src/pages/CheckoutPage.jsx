import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { roomApi } from '../api/roomApi';
import { pricingApi } from '../api/pricingApi';
import { bookingApi } from '../api/bookingApi';
import PriceBreakdownWidget from '../components/booking/PriceBreakdownWidget';
import MockPaymentModal from '../components/booking/MockPaymentModal';
import { formatINR } from '../utils/formatters';
import {
  ShieldCheck,
  Lock,
  Calendar,
  Users,
  MapPin,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests') || '1', 10);

  const [room, setRoom] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form inputs
  const [guestName, setGuestName] = useState(user?.fullName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState('AADHAAR');
  const [guestIdLast4, setGuestIdLast4] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Errors & submission state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heldBooking, setHeldBooking] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.fullName || '');
      if (!guestEmail) setGuestEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) {
      navigate('/search');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [roomData, quoteData] = await Promise.all([
          roomApi.getById(roomId),
          pricingApi.getQuoteByParams(roomId, checkIn, checkOut, guests)
        ]);
        setRoom(roomData);
        setQuote(quoteData);
      } catch (err) {
        console.error('Failed to load checkout data', err);
        toast.error('Unable to load checkout details. Please try again.');
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [roomId, checkIn, checkOut, guests, navigate, toast]);

  const validateForm = () => {
    const errors = {};
    if (!guestName.trim() || guestName.length < 2) {
      errors.guestName = 'Please enter guest full name';
    }
    if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) {
      errors.guestEmail = 'Please enter a valid email address';
    }
    const cleanPhone = guestPhone.replace(/[\s-]/g, '');
    const phoneValid = /^\+?[0-9]{7,15}$/.test(cleanPhone);
    if (!phoneValid) {
      errors.guestPhone = 'Please enter a valid phone number (7 to 15 digits, e.g. +91 9876543210 or 9876543210)';
    }
    if (!guestIdLast4 || !/^\d{4}$/.test(guestIdLast4)) {
      errors.guestIdLast4 = 'Please enter exactly the last 4 digits of ID proof';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const idempotencyKey = `sk_hold_${roomId}_${checkIn}_${Date.now()}`;
      const payload = {
        roomId: Number(roomId),
        checkIn,
        checkOut,
        guestsCount: guests,
        guestName: guestName.trim(),
        guestEmail: guestEmail.trim(),
        guestPhone: guestPhone.trim(),
        guestIdType,
        guestIdLast4: guestIdLast4.trim(),
        specialRequests: specialRequests.trim() || null,
        idempotencyKey
      };

      const booking = await bookingApi.create(payload);
      setHeldBooking(booking);
      setIsPaymentModalOpen(true);
    } catch (err) {
      const message = err.response?.data?.message || 'Selected dates are not available for this room.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async (paymentPayload) => {
    if (!heldBooking) return;

    setIsProcessingPayment(true);
    try {
      const confirmed = await bookingApi.pay(heldBooking.id, paymentPayload);
      setIsPaymentModalOpen(false);
      toast.success('Booking Confirmed! Your stay is booked.');
      navigate(`/confirmation/${confirmed.bookingCode}`);
    } catch (err) {
      const message = err.response?.data?.message || 'Payment processing failed. Please try again.';
      toast.error(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Checkout Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <Link
            to={`/rooms/${roomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to room details
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Confirm and Pay
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Lock className="w-4 h-4 text-teal-500" />
          <span>SSL Secured Booking</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Guest Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleCreateBooking} className="space-y-6">
            {/* Guest Personal Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs">
                  1
                </span>
                Primary Guest Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (as per Govt ID) *
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {formErrors.guestName && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.guestName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@example.in"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {formErrors.guestEmail && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.guestEmail}</p>
                  )}
                </div>

                {/* Mobile / Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210 or +1 202 555 0123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {formErrors.guestPhone && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.guestPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Indian Govt ID Verification */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Indian Government ID Verification
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Required by Indian hotel regulations. For your privacy, we only store the ID proof type and the last 4 digits.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    ID Proof Type *
                  </label>
                  <select
                    value={guestIdType}
                    onChange={(e) => setGuestIdType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="AADHAAR">Aadhaar Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENCE">Driving Licence</option>
                    <option value="VOTER_ID">Voter ID Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last 4 Digits of ID *
                  </label>
                  <input
                    type="text"
                    value={guestIdLast4}
                    onChange={(e) => setGuestIdLast4(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="•••• 1234"
                    maxLength={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono tracking-widest focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  {formErrors.guestIdLast4 && (
                    <p className="text-rose-500 text-[11px] mt-1">{formErrors.guestIdLast4}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-3 shadow-sm">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Special Requests (Optional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={2}
                placeholder="e.g. Quiet room preferred, late arrival around 8 PM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Special requests cannot be guaranteed but the property will do its best to accommodate.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-slate-400 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Locking Room...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Payment ({formatINR(quote?.totalAmountInr)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Reservation Summary & Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-100 dark:border-slate-700/60">
              Booking Summary
            </h3>

            {/* Room Info */}
            <div className="flex gap-4">
              <img
                src={room.coverImageUrl || '/images/hero/hero-banner.webp'}
                alt={room.propertyName}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div>
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  {room.roomTypeName}
                </p>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {room.propertyName}
                </h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-saffron-500" />
                  <span>{room.city}, {room.state}</span>
                </p>
              </div>
            </div>

            {/* Date Details */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  Check-in
                </span>
                <span className="font-semibold">{checkIn} ({room.checkInTime})</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-500" />
                  Check-out
                </span>
                <span className="font-semibold">{checkOut} ({room.checkOutTime})</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  Guests
                </span>
                <span className="font-semibold">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>

            {/* Live Price Widget */}
            <PriceBreakdownWidget quote={quote} />

            {/* Cancellation Policy Alert */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Cancellation &amp; Refund Policy:
              </p>
              <p>&bull; 100% refund if cancelled 48+ hours before check-in.</p>
              <p>&bull; 50% refund between 24-48 hours before check-in.</p>
              <p>&bull; No refund within 24 hours of check-in.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Payment Modal */}
      <MockPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={heldBooking?.totalAmountInr || quote?.totalAmountInr}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessingPayment}
      />
    </div>
  );
}

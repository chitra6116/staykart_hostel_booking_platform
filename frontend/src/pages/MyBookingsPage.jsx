import React, { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/bookingApi';
import { formatINR, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import Modal from '../components/common/Modal';
import {
  Calendar,
  MapPin,
  Download,
  XCircle,
  AlertCircle,
  Clock,
  CheckCircle2,
  Receipt,
  RotateCcw
} from 'lucide-react';

export default function MyBookingsPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, cancelled
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundPreview, setRefundPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings({ filter: activeTab });
      setBookings(res.content || []);
    } catch (err) {
      console.error('Failed to load bookings', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleDownloadInvoice = async (bookingCode) => {
    try {
      const blob = await bookingApi.downloadInvoice(bookingCode);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StayKart-Invoice-${bookingCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF invoice', err);
      toast.error('Failed to download invoice PDF');
    }
  };

  const openCancelModal = async (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setRefundPreview(null);
    setCancelModalOpen(true);
    setPreviewLoading(true);

    try {
      const preview = await bookingApi.getRefundPreview(booking.id);
      setRefundPreview(preview);
    } catch (err) {
      console.error('Failed to fetch refund preview', err);
      toast.error('Could not determine cancellation refund preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(selectedBooking.id, cancelReason || 'Guest requested cancellation');
      toast.success('Booking cancelled successfully. Refund initiated.');
      setCancelModalOpen(false);
      fetchBookings();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to cancel booking';
      toast.error(message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmed
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Checked In
          </span>
        );
      case 'CHECKED_OUT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          My Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          View your upcoming stays, download official GST invoices, or manage reservations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
        {[
          { id: 'upcoming', label: 'Upcoming Trips' },
          { id: 'past', label: 'Completed Stays' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Booking List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No {activeTab} bookings found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'upcoming'
              ? 'You do not have any active upcoming stays booked yet.'
              : `You have no ${activeTab} reservations on StayKart.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-start sm:items-center">
                <img
                  src={b.coverImageUrl || '/images/hero/hero-banner.webp'}
                  alt={b.propertyName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                      {b.bookingCode}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {b.propertyName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
                    <span>{b.propertyCity} &bull; Room #{b.roomNumber} ({b.roomTypeName})</span>
                  </p>
                  {(() => {
                    const cIn = b.checkIn || b.checkInDate;
                    const cOut = b.checkOut || b.checkOutDate;
                    let nights = b.nightsCount;
                    if (!nights && cIn && cOut) {
                      const d1 = new Date(cIn);
                      const d2 = new Date(cOut);
                      nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
                    }
                    return (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        <span>
                          {formatDate(cIn)} – {formatDate(cOut)} ({nights || 1} {nights === 1 ? 'night' : 'nights'})
                        </span>
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700/60 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-slate-400">Total Paid (INR)</span>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {formatINR(b.totalAmountInr)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadInvoice(b.bookingCode)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Download GST Tax Invoice PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>GST Invoice</span>
                  </button>

                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => openCancelModal(b)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Reservation Modal with Live Refund Preview */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to cancel your stay at <span className="font-bold text-slate-900 dark:text-white">{selectedBooking?.propertyName}</span>?
          </p>

          {/* Refund Preview Calculation */}
          {previewLoading ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-center text-xs text-slate-500">
              Calculating eligible refund under policy...
            </div>
          ) : refundPreview ? (
            <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-teal-900 dark:text-teal-100 font-bold">
                <span>Eligible Refund:</span>
                <span className="text-sm font-extrabold text-teal-700 dark:text-teal-300">
                  {formatINR(refundPreview.refundAmountInr)} ({refundPreview.refundPercentage}%)
                </span>
              </div>
              <p className="text-teal-800 dark:text-teal-300 text-[11px] leading-relaxed">
                {refundPreview.policyNote}
              </p>
            </div>
          ) : null}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Cancellation (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Change of travel plans"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Keep My Stay
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              {cancelling ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Cancellation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

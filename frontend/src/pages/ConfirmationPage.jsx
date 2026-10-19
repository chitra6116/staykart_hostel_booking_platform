import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi';
import { formatINR, formatDate } from '../utils/formatters';
import {
  CheckCircle2,
  Download,
  Calendar,
  Users,
  MapPin,
  Receipt,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function ConfirmationPage() {
  const { code } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const data = await bookingApi.getByCode(code);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load confirmed booking', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [code]);

  const handleDownloadInvoice = async () => {
    setDownloadingPdf(true);
    try {
      const blob = await bookingApi.downloadInvoice(code);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `StayKart-Invoice-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download PDF invoice', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking Not Found</h2>
        <p className="text-sm text-slate-500">We could not locate this reservation.</p>
        <Link to="/" className="text-teal-600 font-semibold text-sm hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-lg space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Payment Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Booking Confirmed! Your stay is booked.
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            A confirmation voucher and GST tax invoice have been generated for your reservation.
          </p>
        </div>

        {/* Booking Reference Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-sm font-mono font-bold text-slate-900 dark:text-white">
          <span>Booking ID:</span>
          <span className="text-teal-600 dark:text-teal-400">{booking.bookingCode}</span>
        </div>
      </div>

      {/* Reservation Details Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Hotel & Room Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-700/60 gap-4">
          <div>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {booking.roomTypeName} &bull; Room #{booking.roomNumber}
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {booking.propertyName}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
              <span>{booking.propertyCity}</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Total Paid (incl. GST)</span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
              {formatINR(booking.totalAmountInr)}
            </div>
          </div>
        </div>

        {/* Date & Guest Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Stay Dates
            </span>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Check-in:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatDate(booking.checkInDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Check-out:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatDate(booking.checkOutDate)}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Total Duration:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.nightsCount} {booking.nightsCount === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Guest Details
            </span>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Guest Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.guestName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Mobile:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.guestPhone}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">ID Verification:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {booking.guestIdType} (•••• {booking.guestIdLast4})
              </span>
            </div>
          </div>
        </div>

        {/* GST Invoicing Highlight */}
        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-teal-950 dark:text-teal-100">
                Official GST Tax Invoice Generated
              </p>
              <p className="text-teal-800 dark:text-teal-300">
                CGST &amp; SGST breakdown available in official PDF format for tax filing &amp; expense reimbursement.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingPdf}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
          >
            {downloadingPdf ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Invoice PDF</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/my-bookings"
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-800 dark:text-slate-200 text-xs font-bold text-center uppercase tracking-wider transition-colors"
          >
            View in My Bookings
          </Link>
          <Link
            to="/"
            className="flex-1 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold text-center uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Plan Another Trip
          </Link>
        </div>
      </div>
    </div>
  );
}

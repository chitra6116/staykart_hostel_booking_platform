import React, { useState } from 'react';
import Modal from '../common/Modal';
import { formatINR } from '../../utils/formatters';
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function MockPaymentModal({
  isOpen,
  onClose,
  totalAmount,
  onConfirmPayment,
  isProcessing = false
}) {
  const [paymentMode, setPaymentMode] = useState('UPI'); // UPI, CARD, NET_BANKING
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [formError, setFormError] = useState('');
  const INDIAN_BANKS = [
    'HDFC Bank',
    'State Bank of India (SBI)',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank (PNB)',
    'Kotak Mahindra Bank',
    'Bank of Baroda'
  ];

  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardExpiry(val);
  };

  const handleQuickUpi = (suffix) => {
    const prefix = upiId.split('@')[0] || 'guest';
    setUpiId(`${prefix}${suffix}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (paymentMode === 'UPI') {
      if (!upiId.includes('@') || upiId.length < 5) {
        setFormError('Please enter a valid UPI ID (e.g. yourname@okhdfcbank)');
        return;
      }
    } else if (paymentMode === 'CARD') {
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length < 16) {
        setFormError('Please enter a valid 16-digit card number');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setFormError('Please enter card expiry in MM/YY format');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setFormError('Please enter a valid 3-digit CVV');
        return;
      }
    }

    const payload = {
      paymentMode,
      upiId: paymentMode === 'UPI' ? upiId : null,
      cardNumber: paymentMode === 'CARD' ? cardNumber.replace(/\s/g, '') : null,
      cardExpiry: paymentMode === 'CARD' ? cardExpiry : null,
      cardCvv: paymentMode === 'CARD' ? cardCvv : null,
      bankName: paymentMode === 'NET_BANKING' ? bankName : null,
      simulateFailure: false
    };

    onConfirmPayment(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isProcessing ? () => {} : onClose}
      title="Complete Payment"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Header */}
        <div className="bg-teal-50 dark:bg-teal-950/50 p-4 rounded-xl border border-teal-200 dark:border-teal-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300 font-semibold">
              Total Payable (INR)
            </span>
            <div className="text-2xl font-black text-teal-900 dark:text-teal-100">
              {formatINR(totalAmount)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-300 bg-white/70 dark:bg-slate-900/60 px-2.5 py-1 rounded-full font-medium">
            <Lock className="w-3.5 h-3.5" />
            256-Bit Encrypted
          </div>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setPaymentMode('UPI')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
              paymentMode === 'UPI'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 mb-1" />
            UPI
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('CARD')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
              paymentMode === 'CARD'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentMode('NET_BANKING')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
              paymentMode === 'NET_BANKING'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 mb-1" />
            Net Banking
          </button>
        </div>

        {/* Error message */}
        {formError && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Payment fields according to mode */}
        {paymentMode === 'UPI' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. rahul@okhdfcbank"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Quick suffixes:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {['@okhdfcbank', '@okicici', '@paytm', '@ybl'].map((suf) => (
                  <button
                    key={suf}
                    type="button"
                    onClick={() => handleQuickUpi(suf)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    {suf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {paymentMode === 'CARD' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4532 •••• •••• 8890"
                maxLength={19}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Valid Thru (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="12/28"
                  maxLength={5}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CVV / CVC
                </label>
                <input
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {paymentMode === 'NET_BANKING' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Your Bank
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
              >
                {INDIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}


        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Contacting Payment Gateway...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Pay {formatINR(totalAmount)}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

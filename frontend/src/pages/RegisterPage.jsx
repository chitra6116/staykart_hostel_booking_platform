import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { setAuthToken } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Hotel, Lock, Mail, User, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanPhone || !/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      errors.phoneNumber = 'Enter a valid phone number (7 to 15 digits, e.g. +91 9876543210 or +1 202 555 0123)';
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number (e.g. Stay@2026)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        phoneNumber: cleanPhone,
        password
      });
      // Do not auto-login: user logs in on the login page with their new credentials
      setAuthToken(null);
      toast.success('Account created successfully! Please sign in with your credentials.');
      const loginUrl = `/login?email=${encodeURIComponent(email.trim().toLowerCase())}${
        redirect !== '/' ? `&redirect=${encodeURIComponent(redirect)}` : ''
      }`;
      navigate(loginUrl);
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.fieldErrors && resp.fieldErrors.length > 0) {
        const backendErrors = {};
        resp.fieldErrors.forEach((fe) => {
          const key = fe.field === 'phone' ? 'phoneNumber' : fe.field;
          backendErrors[key] = fe.message;
        });
        setFieldErrors(backendErrors);
        setError('Please check the highlighted fields below.');
      } else {
        const rawMsg = resp?.message;
        if (!rawMsg || rawMsg.toLowerCase().includes('date') || rawMsg.toLowerCase().includes('room')) {
          setError('An account with this email address or phone already exists. Please log in or try with different credentials.');
        } else {
          setError(rawMsg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Hotel className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Create an Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Join StayKart to book verified stays across India.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: null }));
                }}
                required
                placeholder="Pooja Sharma"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  fieldErrors.fullName
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-teal-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:outline-none`}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                required
                placeholder="pooja.sharma@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  fieldErrors.email
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-teal-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:outline-none`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mobile / Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (fieldErrors.phoneNumber) setFieldErrors((prev) => ({ ...prev, phoneNumber: null }));
                }}
                required
                placeholder="e.g. +91 9876543210 or +1 202 555 0123"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  fieldErrors.phoneNumber
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-teal-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:outline-none`}
              />
            </div>
            {fieldErrors.phoneNumber ? (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.phoneNumber}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Accepts Indian (+91) &amp; international phone numbers</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                }}
                required
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
                  fieldErrors.password
                    ? 'border-rose-400 focus:ring-rose-500'
                    : 'border-slate-300 dark:border-slate-600 focus:ring-teal-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:outline-none`}
              />
            </div>
            {fieldErrors.password ? (
              <p className="text-[11px] text-rose-500 mt-1">{fieldErrors.password}</p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                At least 8 characters with 1 uppercase letter and 1 number (e.g. Pooja@123)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:bg-teal-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

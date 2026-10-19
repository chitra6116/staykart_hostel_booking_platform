import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSearchBar from '../components/search/HeroSearchBar';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  Receipt,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  PenLine,
  MessageSquare
} from 'lucide-react';

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const destinations = [
    {
      city: 'Jaipur',
      title: 'Royal Haveli & Palaces',
      state: 'Rajasthan',
      image: '/images/destinations/jaipur.webp',
      startingPrice: 3500
    },
    {
      city: 'Goa',
      title: 'Beach Resorts & Palms',
      state: 'Goa',
      image: '/images/destinations/goa.webp',
      startingPrice: 2800
    },
    {
      city: 'Udaipur',
      title: 'Regal Lakefront Views',
      state: 'Rajasthan',
      image: '/images/destinations/udaipur.webp',
      startingPrice: 4200
    },
    {
      city: 'Manali',
      title: 'Pine Woods & Peaks',
      state: 'Himachal Pradesh',
      image: '/images/destinations/manali.webp',
      startingPrice: 1800
    },
    {
      city: 'Munnar',
      title: 'Misty Tea Gardens',
      state: 'Kerala',
      image: '/images/destinations/munnar.webp',
      startingPrice: 2200
    },
    {
      city: 'Bengaluru',
      title: 'Silicon Hub Stays',
      state: 'Karnataka',
      image: '/images/destinations/bengaluru.webp',
      startingPrice: 2900
    },
    {
      city: 'Mumbai',
      title: 'Marine Drive Luxury',
      state: 'Maharashtra',
      image: '/images/destinations/mumbai.webp',
      startingPrice: 4500
    },
    {
      city: 'Delhi',
      title: 'Capital Suites',
      state: 'National Capital Region',
      image: '/images/destinations/delhi.webp',
      startingPrice: 2400
    }
  ];

  const features = [
    {
      icon: Receipt,
      title: 'Transparent Indian GST Invoicing',
      desc: 'Accurate Government of India GST slabs (0%, 5%, 18%) calculated dynamically with an itemized CGST + SGST split on every invoice.'
    },
    {
      icon: ShieldCheck,
      title: '100% Guaranteed Check-in',
      desc: 'Direct real-time room confirmation with the hotel property, zero duplicate booking risk, and assured room availability upon arrival.'
    },
    {
      icon: RotateCcw,
      title: 'Instant UPI & Card Refunds',
      desc: 'Clear cancellation policy: 100% refund before 48 hours, 50% between 24-48 hours, processed seamlessly back to your original payment mode.'
    },
    {
      icon: Sparkles,
      title: '100% Authentic Indian Properties',
      desc: 'Every hotel features real high-resolution photographs, verified PIN codes, genuine amenities, and transparent Indian guest house rules.'
    }
  ];

  const DEFAULT_REVIEWS = [
    {
      name: 'Aarav Sharma',
      location: 'Delhi',
      stay: 'Rajputana Heritage Haveli, Jaipur',
      rating: 5,
      comment: 'The booking was seamless and the hotel looked exactly like the photos on StayKart. The GST invoice was provided immediately with a clear breakdown.'
    },
    {
      name: 'Ananya Deshmukh',
      location: 'Mumbai',
      stay: 'Sea Breeze Luxury Resort, Goa',
      rating: 5,
      comment: 'I had to reschedule my trip last minute and the cancellation refund arrived directly to my UPI within minutes as promised. Outstanding service!'
    },
    {
      name: 'Rohan Mehta',
      location: 'Bengaluru',
      stay: 'Himalayan Pine Retreat, Manali',
      rating: 5,
      comment: 'The wooden cottage had spectacular mountain views and fast WiFi. Clean, authentic, and completely transparent pricing without any surprise fees.'
    }
  ];

  const [reviews, setReviews] = useState(() => {
    try {
      const stored = localStorage.getItem('user-reviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_REVIEWS;
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerLocation, setReviewerLocation] = useState('');
  const [selectedStay, setSelectedStay] = useState('The Jaipur Heritage Haveli, Jaipur');
  const [reviewComment, setReviewComment] = useState('');
  const [formError, setFormError] = useState('');

  const handleOpenReviewModal = () => {
    if (!user) {
      toast.error('Only registered guests can post reviews. Please log in or sign up first.');
      navigate('/login?redirect=/');
      return;
    }
    setReviewerName(user.fullName || '');
    setFormError('');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('You must be logged in as a guest to post a review.');
      return;
    }
    if (!reviewerLocation.trim()) {
      setFormError('Please enter your city / location');
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 10) {
      setFormError('Please write a brief comment of at least 10 characters');
      return;
    }

    const newReview = {
      name: user.fullName || reviewerName.trim() || 'Verified Guest',
      location: reviewerLocation.trim(),
      stay: selectedStay,
      rating,
      comment: reviewComment.trim(),
      isVerifiedGuest: true
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem('user-reviews', JSON.stringify(updated));
    } catch {
      // ignore
    }

    toast.success('Thank you! Your guest review has been posted.');
    setReviewComment('');
    setIsReviewModalOpen(false);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[560px] sm:min-h-[620px] flex items-center justify-center">
        {/* Background Image with Dark Teal Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/images/hero/hero-banner.webp"
            alt="Scenic Indian heritage palace and luxury stay"
            className="w-full h-full object-cover object-center scale-105 animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-teal-950/70 to-slate-950/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-500/20 border border-saffron-500/40 text-saffron-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span>Discover India&apos;s Finest Hotels &amp; Heritage Stays</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight mb-4">
            Book Smart. <span className="text-saffron-400">Stay Easy.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-200 mb-10 leading-relaxed font-normal">
            From the royal havelis of Jaipur to the tranquil beaches of Goa and misty hills of Munnar, experience seamless booking with genuine Indian hospitality.
          </p>

          {/* Search Bar Container */}
          <div className="max-w-4xl mx-auto text-left">
            <HeroSearchBar />
          </div>
        </div>
      </section>

      {/* Featured Indian Destinations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-saffron-600 dark:text-saffron-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Handpicked Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Explore Popular Indian Gateways
            </h2>
          </div>
          <Link
            to="/search"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition-colors"
          >
            <span>View all 8 destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((d) => (
            <Link
              key={d.city}
              to={`/search?city=${encodeURIComponent(d.city)}`}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img
                  src={d.image}
                  alt={`${d.city} destination stay`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="text-lg font-bold leading-tight">{d.city}</p>
                  <p className="text-xs text-slate-300">{d.state}</p>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {d.title}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Starting from</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                    ₹{d.startingPrice.toLocaleString('en-IN')}/night
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why StayKart / Engineered Features */}
      <section className="bg-slate-50 dark:bg-slate-800/40 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Reliable Hospitality Platform
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Why Guests Trust StayKart
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Designed for modern travelers in India who demand authentic stays, honest pricing, and complete reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-300 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guest Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Loved by Travelers Across India &amp; Worldwide
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Read what our verified guests have to say about their stays.
            </p>
          </div>
          {!isAdmin && (
            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60 font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Write a Review (Optional)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-3">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-4 leading-relaxed">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.location} &bull; {t.stay}</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Verified Guest
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Optional Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Share Your Stay Experience"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your feedback is optional and helps other guests discover authentic stays across India.
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {formError}
              </div>
            )}

            {/* Star Rating Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Overall Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2 self-center">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Verified Guest Details */}
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Verified Guest
              </span>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your City / Country *
              </label>
              <input
                type="text"
                value={reviewerLocation}
                onChange={(e) => setReviewerLocation(e.target.value)}
                placeholder="e.g. Delhi, London, San Francisco"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Hotel / Stay */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stayed At *
              </label>
              <select
                value={selectedStay}
                onChange={(e) => setSelectedStay(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
              >
                <option value="The Jaipur Heritage Haveli, Jaipur">The Jaipur Heritage Haveli, Jaipur</option>
                <option value="Goa Palms Beach Resort, Goa">Goa Palms Beach Resort, Goa</option>
                <option value="Lake Palace View Stay, Udaipur">Lake Palace View Stay, Udaipur</option>
                <option value="Pine Crest Mountain Lodge, Manali">Pine Crest Mountain Lodge, Manali</option>
                <option value="Marine Drive Grandeur, Mumbai">Marine Drive Grandeur, Mumbai</option>
                <option value="Lutyens Heritage Manor, Delhi">Lutyens Heritage Manor, Delhi</option>
                <option value="Tech Corridor Executive Suites, Bengaluru">Tech Corridor Executive Suites, Bengaluru</option>
                <option value="Misty Cardamom Hills Resort, Munnar">Misty Cardamom Hills Resort, Munnar</option>
                <option value="Other StayKart Boutique Stay">Other StayKart Boutique Stay</option>
              </select>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Review *
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder="Share highlights about room comfort, service, views, or amenities..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                Post Review
              </button>
            </div>
          </form>
        </Modal>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Book Your Next Indian Getaway?
            </h3>
            <p className="text-teal-200 text-sm max-w-xl">
              Get real-time availability, guaranteed check-in, and official GST tax invoices on every reservation.
            </p>
          </div>
          <Link
            to="/search"
            className="px-8 py-4 rounded-xl bg-saffron-500 hover:bg-saffron-600 text-white font-bold shadow-lg shadow-saffron-500/25 transition-all text-sm uppercase tracking-wider shrink-0"
          >
            Explore Rooms Now
          </Link>
        </div>
      </section>
    </div>
  );
}

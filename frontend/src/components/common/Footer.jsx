import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Heart, ShieldCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  const destinations = [
    { name: 'Jaipur', desc: 'Heritage Haveli & Palaces' },
    { name: 'Goa', desc: 'Beach Resorts & Coastal Villas' },
    { name: 'Udaipur', desc: 'Lake View & Royal Suites' },
    { name: 'Manali', desc: 'Mountain Cottages & Pine Views' },
    { name: 'Munnar', desc: 'Tea Garden Estates' },
    { name: 'Bengaluru', desc: 'Tech Hub Premium Stays' },
    { name: 'Mumbai', desc: 'Seafront & City Luxury' },
    { name: 'Delhi', desc: 'Capital Comfort & Suites' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md">
                <Hotel className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Stay<span className="text-saffron-500">Kart</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Book Smart. Stay Easy. Discover verified authentic stays across India with transparent GST tariffs and instant UPI refunds.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Indian Properties</span>
            </div>
          </div>

          {/* Top Indian Destinations */}
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-saffron-500" />
              Popular Indian Destinations
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {destinations.map((d) => (
                <Link
                  key={d.name}
                  to={`/search?city=${encodeURIComponent(d.name)}`}
                  className="group block p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <p className="text-sm font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {d.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{d.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Platform & Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/search" className="hover:text-teal-400 transition-colors">
                  Search All Rooms
                </Link>
              </li>
              <li>
                {isAdmin ? (
                  <Link to="/admin" className="hover:text-teal-400 transition-colors">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/my-bookings" className="hover:text-teal-400 transition-colors">
                    My Bookings & Invoices
                  </Link>
                )}
              </li>
              <li>
                <Link to="/credits" className="text-teal-400 hover:text-teal-300 font-medium underline underline-offset-4 transition-colors">
                  Photo credits & Licences
                </Link>
              </li>
            </ul>
            <div className="pt-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Prices inclusive of Indian GST where applicable. CGST &amp; SGST invoiced per Government of India slabs (0%, 5%, 18%).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} StayKart Technologies Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-saffron-500 fill-saffron-500" />
            <span>for Indian hospitality</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

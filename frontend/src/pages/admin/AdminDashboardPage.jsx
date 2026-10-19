import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { formatINR } from '../../utils/formatters';
import {
  IndianRupee,
  TrendingUp,
  Ticket,
  UserCheck,
  LogOut,
  BedDouble,
  Building,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-500">
        Failed to load operational statistics.
      </div>
    );
  }

  const kpis = [
    {
      title: '30-Day Total Revenue',
      value: formatINR(stats.totalRevenueInr),
      subtitle: `Today: ${formatINR(stats.revenueTodayInr)}`,
      icon: IndianRupee,
      color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60 dark:text-teal-300'
    },
    {
      title: 'Current Occupancy',
      value: `${stats.currentOccupancyRate}%`,
      subtitle: `Across ${stats.totalActiveRooms} active rooms`,
      icon: TrendingUp,
      color: 'text-saffron-600 bg-saffron-50 dark:bg-saffron-950/60 dark:text-saffron-300'
    },
    {
      title: 'Bookings Today',
      value: stats.bookingsTodayCount,
      subtitle: 'Reservations created',
      icon: Ticket,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300'
    },
    {
      title: 'Check-ins / Check-outs Today',
      value: `${stats.checkInsTodayCount} / ${stats.checkOutsTodayCount}`,
      subtitle: 'Guest arrivals & departures',
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
    }
  ];

  // Format revenue data for charts
  const revenueChartData = (stats.revenueLast30Days || []).map((d) => ({
    date: d.date.substring(5), // MM-DD
    revenue: Number(d.amountInr)
  }));

  const occupancyChartData = (stats.occupancyLast30Days || []).map((d) => ({
    date: d.date.substring(5),
    occupancy: Number(d.occupancyPercentage)
  }));

  const cityChartData = (stats.cityWiseRevenue || []).map((c) => ({
    city: c.city,
    revenue: Number(c.revenueInr),
    bookings: c.bookingsCount
  }));

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time occupancy metrics, Indian GST revenue reporting, and destination performance.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {kpi.value}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 30-Day Revenue Trend (AreaChart) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                30-Day Revenue Trend (INR)
              </h3>
              <p className="text-xs text-slate-500">Gross booking revenue including GST</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              Last 30 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d5c75" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0d5c75" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0d5c75" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Occupancy Trend (LineChart) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Occupancy Rate (%)
              </h3>
              <p className="text-xs text-slate-500">Percentage of rooms occupied daily</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-saffron-50 dark:bg-saffron-950 text-saffron-600 dark:text-saffron-400">
              Occupancy %
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Occupancy']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="occupancy" stroke="#e06d14" strokeWidth={2.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* City-wise Revenue BarChart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            City-wise Revenue Distribution (INR)
          </h3>
          <p className="text-xs text-slate-500">Performance across Indian holiday destinations</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="city" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
              />
              <Tooltip
                formatter={(val, name, item) => [
                  `${formatINR(val)} (${item.payload.bookings} bookings)`,
                  'Revenue'
                ]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="revenue" fill="#0d5c75" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

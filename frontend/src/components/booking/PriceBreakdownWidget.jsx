import React, { useState } from 'react';
import { formatINR } from '../../utils/formatters';
import { Info, ChevronDown, ChevronUp, ShieldCheck, Tag } from 'lucide-react';

export default function PriceBreakdownWidget({ quote, loading = false }) {
  const [showDailyDetails, setShowDailyDetails] = useState(false);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 animate-pulse space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full mt-4"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
        Select check-in and check-out dates to calculate tariff and GST.
      </div>
    );
  }

  const {
    nightsCount,
    totalBaseInr,
    totalDiscountInr,
    taxableAmountInr,
    cgstInr,
    sgstInr,
    totalAmountInr,
    dailyBreakdown = []
  } = quote;

  const totalGstInr = (Number(cgstInr || 0) + Number(sgstInr || 0)).toFixed(2);
  const hasDiscount = Number(totalDiscountInr) > 0;

  // Determine effective GST rate from daily breakdown
  const rawGst = dailyBreakdown.length > 0 ? dailyBreakdown[0].gstPercentage : 18;
  const firstGstRate = Number(rawGst) || 18;

  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Price Breakdown
        </h4>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
          {nightsCount} {nightsCount === 1 ? 'Night' : 'Nights'}
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        {/* Base tariff */}
        <div className="flex justify-between text-slate-600 dark:text-slate-300">
          <span>Base Room Tariff</span>
          <span className="font-semibold">{formatINR(totalBaseInr)}</span>
        </div>

        {/* Discount if applicable */}
        {hasDiscount && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Length-of-Stay Savings (10%)
            </span>
            <span className="font-semibold">- {formatINR(totalDiscountInr)}</span>
          </div>
        )}

        {/* Taxable Amount */}
        <div className="flex justify-between text-slate-700 dark:text-slate-200 font-medium pt-1">
          <span>Net Tariff (Taxable)</span>
          <span>{formatINR(taxableAmountInr)}</span>
        </div>

        {/* GST Section */}
        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              GST Slab on per-night tariff
              <Info className="w-3 h-3 text-slate-400" />
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {firstGstRate}% GST
            </span>
          </div>

          <div className="flex justify-between text-slate-500 dark:text-slate-400 pl-2">
            <span>CGST (Central GST: {(firstGstRate / 2).toFixed(1)}%)</span>
            <span>{formatINR(cgstInr, true)}</span>
          </div>

          <div className="flex justify-between text-slate-500 dark:text-slate-400 pl-2">
            <span>SGST (State GST: {(firstGstRate / 2).toFixed(1)}%)</span>
            <span>{formatINR(sgstInr, true)}</span>
          </div>
        </div>

        {/* Toggle daily itemized view */}
        {dailyBreakdown.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDailyDetails(!showDailyDetails)}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1"
            >
              <span>{showDailyDetails ? 'Hide per-night breakdown' : 'View per-night breakdown'}</span>
              {showDailyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDailyDetails && (
              <div className="mt-2 space-y-1.5 bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                {dailyBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.date} ({item.dayOfWeek})
                      </span>
                      {item.isWeekend && (
                        <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Weekend
                        </span>
                      )}
                      {Number(item.seasonalMultiplier) > 1.0 && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Surge {item.seasonalMultiplier}x
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatINR(item.totalNightInr)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
          <div>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              Total Amount
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Includes {formatINR(totalGstInr, true)} taxes &amp; charges
            </p>
          </div>
          <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
            {formatINR(totalAmountInr)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
        <span>No hidden fees. Full GST invoice provided upon booking confirmation.</span>
      </div>
    </div>
  );
}

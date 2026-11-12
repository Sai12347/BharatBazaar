import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Percent, 
  ShieldAlert, 
  Scale, 
  HelpCircle, 
  DollarSign, 
  AlertOctagon, 
  Check, 
  X,
  PieChart,
  Tag
} from 'lucide-react';
import { Dataset, Dispute, ProductCategory, CommissionRule } from '../types/marketplace';

interface MerchandisingAnalystViewProps {
  dataset: Dataset;
  onUpdateCommissionRule: (ruleId: string, newRate: number) => void;
}

export const MerchandisingAnalystView: React.FC<MerchandisingAnalystViewProps> = ({
  dataset,
  onUpdateCommissionRule
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Category revenue & commission volume
  const categoryAnalytics = useMemo(() => {
    const stats: Record<ProductCategory, { sales: number; commission: number; units: number }> = {
      Electronics: { sales: 0, commission: 0, units: 0 },
      'Apparel & Fashion': { sales: 0, commission: 0, units: 0 },
      'Home & Living': { sales: 0, commission: 0, units: 0 },
      'Health & Beauty': { sales: 0, commission: 0, units: 0 },
      'Sports & Outdoors': { sales: 0, commission: 0, units: 0 },
      Automotive: { sales: 0, commission: 0, units: 0 },
      'Toys & Games': { sales: 0, commission: 0, units: 0 }
    };

    for (const ol of dataset.orderLines) {
      if (stats[ol.category]) {
        stats[ol.category].sales += ol.subtotal;
        stats[ol.category].commission += ol.commission_amount;
        stats[ol.category].units += ol.quantity;
      }
    }

    return stats;
  }, [dataset.orderLines]);

  // Dispute statistics
  const disputeStats = useMemo(() => {
    const totalDisputes = dataset.disputes.length;
    const customerWon = dataset.disputes.filter(d => d.customer_won).length;
    const merchantWon = dataset.disputes.filter(d => d.status === 'RESOLVED_MERCHANT_WON').length;
    const underReview = dataset.disputes.filter(d => d.status === 'OPEN' || d.status === 'UNDER_REVIEW' || d.status === 'SELLER_RESPONDED').length;
    const totalClaimAmount = dataset.disputes.reduce((acc, d) => acc + d.claim_amount, 0);

    const reasonCounts: Record<string, number> = {};
    for (const d of dataset.disputes) {
      reasonCounts[d.reason] = (reasonCounts[d.reason] || 0) + 1;
    }

    return {
      totalDisputes,
      customerWon,
      merchantWon,
      underReview,
      totalClaimAmount,
      reasonCounts,
      winRate: totalDisputes > 0 ? (customerWon / (customerWon + merchantWon || 1)) * 100 : 0
    };
  }, [dataset.disputes]);

  // Total commission collected across platform
  const totalPlatformCommission = dataset.orderLines.reduce((acc, ol) => acc + ol.commission_amount, 0);
  const totalGrossMerchandise = dataset.orderLines.reduce((acc, ol) => acc + ol.subtotal, 0);
  const blendedTakeRate = totalGrossMerchandise > 0 ? (totalPlatformCommission / totalGrossMerchandise) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Merchandising Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Marketplace Net Commission</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹{totalPlatformCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Blended Take Rate: <strong className="text-indigo-400">{blendedTakeRate.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Claims Filed</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {disputeStats.totalDisputes} <span className="text-sm font-normal text-slate-400">tickets</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Claim Value: <strong className="text-amber-400">₹{disputeStats.totalClaimAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Arbitration Ruling</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {disputeStats.winRate.toFixed(1)}% <span className="text-xs font-normal text-slate-400">Buyer Won</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex space-x-2">
            <span className="text-rose-400 font-medium">{disputeStats.customerWon} Clawed</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">{disputeStats.merchantWon} Seller Upheld</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Under Review</span>
            <AlertOctagon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {disputeStats.underReview} <span className="text-sm font-normal text-slate-400">Active Cases</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Covered by 10% Rolling Reserve Escrow
          </div>
        </div>
      </div>

      {/* Commission Rules & Category Margins Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-semibold text-white">Marketplace Commission Policy & Category Performance</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Contractual fee schedules with min/max caps and volume tier discount schedules.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Standard Take Rate</th>
                <th className="py-3 px-4 text-right">Enterprise Tier (15% off)</th>
                <th className="py-3 px-4 text-right">Min / Max Fee Cap</th>
                <th className="py-3 px-4 text-right">Gross GMV Sold</th>
                <th className="py-3 px-4 text-right">Total Commission Earned</th>
                <th className="py-3 px-4 text-center">Effective Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {dataset.commissionRules.map(rule => {
                const catStats = categoryAnalytics[rule.category] || { sales: 0, commission: 0, units: 0 };
                const effectivePct = catStats.sales > 0 ? (catStats.commission / catStats.sales) * 100 : rule.base_rate * 100;
                const entRate = rule.base_rate * 0.85;

                return (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{rule.category}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">{rule.id}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      {(rule.base_rate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-indigo-300">
                      {(entRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      ₹{rule.min_fee.toFixed(0)} - ₹{rule.max_fee.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-white font-medium">
                      ₹{catStats.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                      ₹{catStats.commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono font-medium border border-slate-700">
                        {effectivePct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disputes & Chargebacks Queue & Root-Cause Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Root Causes breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h4 className="text-sm font-semibold text-white flex items-center space-x-1.5">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Dispute Reasons Breakdown</span>
          </h4>

          <div className="space-y-3">
            {Object.entries(disputeStats.reasonCounts).map(([reason, count]) => {
              const pct = disputeStats.totalDisputes > 0 ? (count / disputeStats.totalDisputes) * 100 : 0;
              return (
                <div key={reason} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono text-[11px]">{reason.replace(/_/g, ' ')}</span>
                    <span className="text-slate-400 font-mono">{count} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        reason === 'LATE_DELIVERY' || reason === 'ITEM_NOT_RECEIVED' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-300 space-y-1 mt-4">
            <div className="font-semibold text-white">Chargeback & Payout Clawback Policy:</div>
            <p className="text-[11px] text-slate-400">
              When arbitration concludes <strong className="text-rose-400">RESOLVED_CUSTOMER_WON</strong>, the full claim amount is automatically debited as a <span className="font-mono text-rose-300">DISPUTE_CLAWBACK</span> line item on the seller's next payout cycle.
            </p>
          </div>
        </div>

        {/* Recent Disputes Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h4 className="text-sm font-semibold text-white">Dispute & Chargeback Arbitration Log</h4>
            <span className="text-xs text-slate-400">Showing 10 recent tickets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                  <th className="py-2.5 px-3">Dispute ID</th>
                  <th className="py-2.5 px-3">Order / Line</th>
                  <th className="py-2.5 px-3">Claim Reason</th>
                  <th className="py-2.5 px-3 text-right">Claim Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Clawback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {dataset.disputes.slice(0, 10).map(dsp => {
                  return (
                    <tr key={dsp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-300">
                        {dsp.id}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        <div>{dsp.order_id}</div>
                        <div className="text-[10px] text-slate-500">{dsp.seller_id}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {dsp.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                        ₹{dsp.claim_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          dsp.status === 'RESOLVED_CUSTOMER_WON'
                            ? 'bg-rose-950/40 text-rose-300 border-rose-700/50'
                            : dsp.status === 'RESOLVED_MERCHANT_WON'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                            : 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                        }`}>
                          {dsp.status.replace('RESOLVED_', '')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {dsp.deduction_applied ? (
                          <span className="inline-flex items-center text-rose-400 text-[11px] font-mono">
                            <Check className="w-3 h-3 mr-0.5" /> Clawed
                          </span>
                        ) : dsp.customer_won ? (
                          <span className="inline-flex items-center text-amber-400 font-bold text-[10px] bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800">
                            UNCLAWED
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

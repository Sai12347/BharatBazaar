import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ShieldAlert,
  ArrowUpRight,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { Dataset, Seller, SellerStatus, SellerTier, Payout } from '../types/marketplace';

interface OperationsManagerViewProps {
  dataset: Dataset;
  onUpdateSellerStatus: (sellerId: string, newStatus: SellerStatus) => void;
  onUpdateReserveRate: (sellerId: string, newRate: number) => void;
  onSelectSeller: (seller: Seller) => void;
  onSelectPayout: (payout: Payout) => void;
}

export const OperationsManagerView: React.FC<OperationsManagerViewProps> = ({
  dataset,
  onUpdateSellerStatus,
  onUpdateReserveRate,
  onSelectSeller,
  onSelectPayout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // KPI aggregates
  const metrics = useMemo(() => {
    const totalSellers = dataset.sellers.length;
    const activeSellers = dataset.sellers.filter(s => s.status === 'ACTIVE').length;
    const probationSellers = dataset.sellers.filter(s => s.status === 'PROBATION').length;
    const suspendedSellers = dataset.sellers.filter(s => s.status === 'SUSPENDED').length;

    const gmv = dataset.orders.reduce((acc, o) => acc + o.total_amount, 0);
    const avgLateShipRate = dataset.sellers.reduce((acc, s) => acc + s.late_shipment_rate, 0) / (totalSellers || 1);
    const avgCancelRate = dataset.sellers.reduce((acc, s) => acc + s.cancellation_rate, 0) / (totalSellers || 1);
    const avgRating = dataset.sellers.reduce((acc, s) => acc + s.rating_avg, 0) / (totalSellers || 1);

    const totalReserveHeld = dataset.payouts.reduce((acc, p) => acc + p.reserve_held, 0);
    const totalNetDisbursed = dataset.payouts.reduce((acc, p) => acc + p.net_amount, 0);
    const heldPayoutsCount = dataset.payouts.filter(p => p.status === 'HELD_VIOLATION' || p.status === 'BLOCKED_SUSPENDED').length;

    return {
      totalSellers,
      activeSellers,
      probationSellers,
      suspendedSellers,
      gmv,
      avgLateShipRate,
      avgCancelRate,
      avgRating,
      totalReserveHeld,
      totalNetDisbursed,
      heldPayoutsCount
    };
  }, [dataset]);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return dataset.sellers.filter(s => {
      const matchesSearch = s.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.legal_entity.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [dataset.sellers, searchQuery, statusFilter, tierFilter]);

  // Calculate active listings per seller map
  const listingsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of dataset.listings) {
      if (l.status === 'ACTIVE') {
        map.set(l.seller_id, (map.get(l.seller_id) || 0) + 1);
      }
    }
    return map;
  }, [dataset.listings]);

  return (
    <div className="space-y-6">
      {/* Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Merchandise Value</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">₹{metrics.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center">
            <span className="text-emerald-400 font-medium mr-1.5 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> {dataset.orders.length} orders
            </span>
            <span>across marketplace</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Seller Standing</span>
            <AlertCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {metrics.activeSellers} <span className="text-sm font-normal text-slate-400">/ {metrics.totalSellers} Active</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center space-x-2">
            <span className="text-amber-400 font-medium">{metrics.probationSellers} Probation</span>
            <span>•</span>
            <span className="text-rose-400 font-medium">{metrics.suspendedSellers} Suspended</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Late Dispatch SLA</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(metrics.avgLateShipRate * 100).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>SLA Limit: &lt; 4.00%</span>
            <span className={metrics.avgLateShipRate < 0.04 ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.avgLateShipRate < 0.04 ? 'Healthy' : 'At Risk'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Escrow Reserve Buffer</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹{metrics.totalReserveHeld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Disbursed: ₹{metrics.totalNetDisbursed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-amber-400">{metrics.heldPayoutsCount} Held Batches</span>
          </div>
        </div>
      </div>

      {/* Main Seller Health & Service Level Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Seller Health & Service Level Agreement (SLA) Monitor</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking of dispatch punctuality, cancellation quotas, customer satisfaction, and reserve mandates.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search seller, ID, entity..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PROBATION">PROBATION</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="ONBOARDING">ONBOARDING</option>
            </select>

            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="TIER_1_ENTERPRISE">Tier 1 Enterprise</option>
              <option value="TIER_2_PRO">Tier 2 Pro</option>
              <option value="TIER_3_STANDARD">Tier 3 Standard</option>
              <option value="TIER_4_MICRO">Tier 4 Micro</option>
            </select>
          </div>
        </div>

        {/* Table of Sellers */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">Seller ID & Business</th>
                <th className="py-3 px-4">Tier / Country</th>
                <th className="py-3 px-4">Standing Status</th>
                <th className="py-3 px-4 text-right">Late Ship (SLA &lt;4%)</th>
                <th className="py-3 px-4 text-right">Cancel Rate (&lt;2.5%)</th>
                <th className="py-3 px-4 text-right">Rating Avg</th>
                <th className="py-3 px-4 text-right">Reserve %</th>
                <th className="py-3 px-4 text-right">Active SKUs</th>
                <th className="py-3 px-4 text-center">Governance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredSellers.slice(0, 30).map(seller => {
                const isLateBreach = seller.late_shipment_rate > 0.04;
                const isCancelBreach = seller.cancellation_rate > 0.025;
                const isRatingLow = seller.rating_avg < 3.8;
                const activeCount = listingsCountMap.get(seller.id) || 0;

                return (
                  <tr key={seller.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center space-x-1.5">
                        <span>{seller.business_name}</span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">{seller.id} • {seller.legal_entity}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                        {seller.tier.replace('TIER_', 'T').replace('_', ' ')}
                      </span>
                      <span className="ml-1.5 text-slate-400 font-medium">{seller.country}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        seller.status === 'ACTIVE'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                          : seller.status === 'PROBATION'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                          : seller.status === 'SUSPENDED'
                          ? 'bg-rose-950/40 text-rose-300 border-rose-700/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {seller.status === 'ACTIVE' && <CheckCircle2 className="w-2.5 h-2.5 mr-1" />}
                        {seller.status === 'PROBATION' && <AlertCircle className="w-2.5 h-2.5 mr-1" />}
                        {seller.status === 'SUSPENDED' && <XCircle className="w-2.5 h-2.5 mr-1" />}
                        {seller.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={`font-medium ${isLateBreach ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {(seller.late_shipment_rate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={`font-medium ${isCancelBreach ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                        {(seller.cancellation_rate * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={isRatingLow ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        ★ {seller.rating_avg.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {(seller.reserve_rate * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {activeCount}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onSelectSeller(seller)}
                          className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                          title="View Full Seller Dossier"
                          aria-label={`View dossier for ${seller.business_name}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {seller.status !== 'SUSPENDED' ? (
                          <button
                            onClick={() => onUpdateSellerStatus(seller.id, 'SUSPENDED')}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/50 transition-colors"
                            title="Suspend Seller due to SLA breach"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateSellerStatus(seller.id, 'ACTIVE')}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors"
                            title="Reinstate Seller to ACTIVE"
                          >
                            Reinstate
                          </button>
                        )}

                        {seller.status === 'ACTIVE' && (
                          <button
                            onClick={() => onUpdateSellerStatus(seller.id, 'PROBATION')}
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-950/40 text-amber-300 border border-amber-800/50 hover:bg-amber-900/50 transition-colors"
                            title="Place on Probation"
                          >
                            Probation
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between items-center">
          <span>Showing {Math.min(30, filteredSellers.length)} of {filteredSellers.length} matched sellers</span>
          <span className="text-slate-500">SLA violations highlighted in red/amber</span>
        </div>
      </div>

      {/* Payout Clearance & Settlement Queue */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-md font-semibold text-white">Settlement Disbursement & Payout Eligibility Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconciles gross sales, marketplace take-rates, reserve collateral, and dispute deductions before wire execution.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Beneficiary Seller</th>
                <th className="py-3 px-4">Cycle Period</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Commission</th>
                <th className="py-3 px-4 text-right">Dispute Clawbacks</th>
                <th className="py-3 px-4 text-right">Reserve (Held / Rel)</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4 text-center">Clearance Status</th>
                <th className="py-3 px-4 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {dataset.payouts.slice(0, 15).map(payout => {
                const seller = dataset.sellers.find(s => s.id === payout.seller_id);
                return (
                  <tr key={payout.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-300">
                      {payout.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{seller?.business_name || payout.seller_id}</div>
                      <div className="text-[10px] font-mono text-slate-400">{payout.seller_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {payout.period_start} to {payout.period_end}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">
                      ₹{payout.gross_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-300">
                      -₹{payout.total_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-300">
                      {payout.dispute_deductions > 0 ? `-₹${payout.dispute_deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      <span className="text-amber-400">-₹{payout.reserve_held.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-emerald-400">+₹{payout.reserve_released.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      ₹{payout.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        payout.status === 'ELIGIBLE'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                          : payout.status === 'HELD_VIOLATION'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                          : payout.status === 'BLOCKED_SUSPENDED'
                          ? 'bg-rose-950/40 text-rose-300 border-rose-700/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onSelectPayout(payout)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center justify-center space-x-1 mx-auto"
                      >
                        <span>Ledger</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

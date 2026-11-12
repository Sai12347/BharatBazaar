import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Package, 
  ShoppingCart, 
  ShieldAlert, 
  Star, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Tag
} from 'lucide-react';
import { Seller, Dataset, SellerStatus } from '../types/marketplace';

interface SellerDetailModalProps {
  seller: Seller;
  dataset: Dataset;
  onClose: () => void;
  onUpdateStatus: (sellerId: string, newStatus: SellerStatus) => void;
}

export const SellerDetailModal: React.FC<SellerDetailModalProps> = ({
  seller,
  dataset,
  onClose,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'orders' | 'disputes' | 'reviews'>('listings');

  const sellerListings = dataset.listings.filter(l => l.seller_id === seller.id);
  const sellerLines = dataset.orderLines.filter(ol => ol.seller_id === seller.id);
  const sellerDisputes = dataset.disputes.filter(d => d.seller_id === seller.id);
  const sellerReviews = dataset.reviews.filter(r => r.seller_id === seller.id);
  const sellerPayouts = dataset.payouts.filter(p => p.seller_id === seller.id);

  const totalGross = sellerLines.reduce((acc, l) => acc + l.subtotal, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{seller.business_name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {seller.id}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  seller.status === 'ACTIVE' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' :
                  seller.status === 'PROBATION' ? 'bg-amber-950/40 text-amber-300 border-amber-800' :
                  seller.status === 'SUSPENDED' ? 'bg-rose-950/40 text-rose-300 border-rose-800' :
                  'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {seller.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Legal Entity: <span className="text-slate-200">{seller.legal_entity}</span> • Domicile: <span className="text-slate-200">{seller.country}</span> • Tier: <span className="text-indigo-300">{seller.tier.replace('TIER_', '')}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SLA Health Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Late Shipment Rate:</span>
            <span className={`text-base font-bold font-mono ${seller.late_shipment_rate > 0.04 ? 'text-rose-400' : 'text-slate-200'}`}>
              {(seller.late_shipment_rate * 100).toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500 block">SLA Target &lt; 4.0%</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Cancellation Rate:</span>
            <span className={`text-base font-bold font-mono ${seller.cancellation_rate > 0.025 ? 'text-rose-400' : 'text-slate-200'}`}>
              {(seller.cancellation_rate * 100).toFixed(2)}%
            </span>
            <span className="text-[10px] text-slate-500 block">SLA Target &lt; 2.5%</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Customer Rating:</span>
            <span className="text-base font-bold text-amber-400 font-mono">
              ★ {seller.rating_avg.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">{sellerReviews.length} Verified Reviews</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Rolling Reserve Hold:</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {(seller.reserve_rate * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500 block">{seller.hold_period_days} Day Escrow Window</span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 text-xs font-medium space-x-2 pt-2 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('listings')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'listings' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Catalog Listings ({sellerListings.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'orders' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Order Lines ({sellerLines.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'disputes' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Disputes & Claims ({sellerDisputes.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'reviews' ? 'border-indigo-500 text-indigo-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Customer Reviews ({sellerReviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {activeTab === 'listings' && (
            <div className="space-y-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-medium">
                    <th className="py-2 px-3">Listing ID / SKU</th>
                    <th className="py-2 px-3">Product Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Stock</th>
                    <th className="py-2 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sellerListings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-[11px] text-indigo-300">
                        <div>{l.id}</div>
                        <div className="text-slate-500 text-[10px]">{l.sku}</div>
                      </td>
                      <td className="py-2 px-3 font-medium text-white">{l.title}</td>
                      <td className="py-2 px-3 text-slate-300">{l.category}</td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-slate-200">₹{l.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-300">{l.stock_quantity}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          l.status === 'ACTIVE' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' :
                          l.status === 'DELISTED_SANCTION' ? 'bg-rose-950/40 text-rose-300 border-rose-800' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 font-medium">
                    <th className="py-2 px-3">Order Line ID</th>
                    <th className="py-2 px-3">Order Ref</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-3 text-right">Take-Rate Fee</th>
                    <th className="py-2 px-3 text-center">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {sellerLines.slice(0, 15).map(ol => {
                    const ful = dataset.fulfillments.find(f => f.order_line_id === ol.id);
                    return (
                      <tr key={ol.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono text-indigo-300">{ol.id}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{ol.order_id}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-300">{ol.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-white">₹{ol.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-right font-mono text-rose-300">-₹{ol.commission_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                            {ful?.status || 'N/A'} {ful?.is_late && '(LATE)'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="space-y-2">
              {sellerDisputes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No disputes or claims filed against this merchant.</div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-medium">
                      <th className="py-2 px-3">Dispute ID</th>
                      <th className="py-2 px-3">Reason</th>
                      <th className="py-2 px-3 text-right">Claim Amount</th>
                      <th className="py-2 px-3">Ruling Status</th>
                      <th className="py-2 px-3 text-center">Clawback Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {sellerDisputes.map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-mono text-amber-300">{d.id}</td>
                        <td className="py-2 px-3 text-slate-300">{d.reason.replace(/_/g, ' ')}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-white">₹{d.claim_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            d.customer_won ? 'bg-rose-950/40 text-rose-300 border-rose-800' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono">
                          {d.deduction_applied ? 'YES' : 'NO'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {sellerReviews.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No customer reviews yet.</div>
              ) : (
                sellerReviews.map(r => (
                  <div key={r.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-amber-400 font-bold">★ {r.rating} / 5</span>
                        <span className="font-mono text-slate-400 text-[10px]">{r.id}</span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 italic">"{r.comment}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Set Standing:</span>
            {seller.status !== 'ACTIVE' && (
              <button
                onClick={() => onUpdateStatus(seller.id, 'ACTIVE')}
                className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 hover:bg-emerald-900"
              >
                Set ACTIVE
              </button>
            )}
            {seller.status !== 'PROBATION' && (
              <button
                onClick={() => onUpdateStatus(seller.id, 'PROBATION')}
                className="px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800 hover:bg-amber-900"
              >
                Set PROBATION
              </button>
            )}
            {seller.status !== 'SUSPENDED' && (
              <button
                onClick={() => onUpdateStatus(seller.id, 'SUSPENDED')}
                className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800 hover:bg-rose-900"
              >
                Set SUSPENDED
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};

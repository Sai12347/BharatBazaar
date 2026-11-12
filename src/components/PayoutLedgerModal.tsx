import React from 'react';
import { X, DollarSign, ArrowDownRight, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Payout, Dataset } from '../types/marketplace';

interface PayoutLedgerModalProps {
  payout: Payout;
  dataset: Dataset;
  onClose: () => void;
}

export const PayoutLedgerModal: React.FC<PayoutLedgerModalProps> = ({
  payout,
  dataset,
  onClose
}) => {
  const seller = dataset.sellers.find(s => s.id === payout.seller_id);
  const lines = dataset.payoutLines.filter(pl => pl.payout_id === payout.id);
  const lineSum = Math.round(lines.reduce((acc, l) => acc + l.amount, 0) * 100) / 100;
  const isReconciled = Math.abs(payout.net_amount - lineSum) < 0.01;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Settlement Ledger & Double-Entry Lines</h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                {payout.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Seller: <strong className="text-white">{seller?.business_name}</strong> ({payout.seller_id}) • Cycle: {payout.period_start} to {payout.period_end}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payout Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-900 border-b border-slate-800 text-xs font-mono">
          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Gross Sales:</span>
            <span className="text-slate-200 font-bold">₹{payout.gross_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Commission Fee:</span>
            <span className="text-rose-300 font-bold">-₹{payout.total_commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Dispute Deductions:</span>
            <span className="text-amber-300 font-bold">-₹{payout.dispute_deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="p-2 bg-slate-800/60 rounded border border-slate-700">
            <span className="text-slate-400 block text-[10px]">Net Payable:</span>
            <span className="text-emerald-400 font-bold text-sm">₹{payout.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Reconciliation Alert */}
        <div className={`px-4 py-2 border-b text-xs flex items-center justify-between ${
          isReconciled 
            ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          <div className="flex items-center space-x-1.5 font-medium">
            {isReconciled ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>
              {isReconciled 
                ? 'Arithmetic Integrity Verified: Header net_amount equals exact sum of constituent line items.'
                : `Arithmetic Mismatch: Header net_amount (₹${payout.net_amount.toFixed(2)}) != sum of lines (₹${lineSum.toFixed(2)}).`}
            </span>
          </div>
          <span className="font-mono text-[11px]">Sum: ₹{lineSum.toFixed(2)}</span>
        </div>

        {/* Line Items Table */}
        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-2 px-3">Line ID</th>
                <th className="py-2 px-3">Order Line Ref</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {lines.map(line => {
                const isPositive = line.amount > 0;
                return (
                  <tr key={line.id} className="hover:bg-slate-800/40 font-mono text-[11px]">
                    <td className="py-2 px-3 text-slate-400">{line.id}</td>
                    <td className="py-2 px-3 text-indigo-300">{line.order_line_id || 'GENERAL'}</td>
                    <td className="py-2 px-3 font-sans">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                        line.type === 'MERCHANDISE_CREDIT' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' :
                        line.type === 'COMMISSION_FEE' ? 'bg-rose-950/40 text-rose-300 border-rose-800' :
                        line.type === 'DISPUTE_CLAWBACK' ? 'bg-amber-950/40 text-amber-300 border-amber-800' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {line.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-300">{line.description}</td>
                    <td className={`py-2 px-3 text-right font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? `+₹${line.amount.toFixed(2)}` : `-₹${Math.abs(line.amount).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

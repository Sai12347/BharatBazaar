import React, { useState, useMemo, useCallback } from 'react';
import { generateMarketplaceDataset } from './engine/generator';
import { validateDataset } from './engine/validator';
import { createExportZip } from './engine/exporter';
import { Dataset, ValidationReport, Seller, Payout, SellerStatus, GroundTruthItem } from './types/marketplace';
import { Header, ActiveTab } from './components/Header';
import { OperationsManagerView } from './components/OperationsManagerView';
import { WarehouseOperatorView } from './components/WarehouseOperatorView';
import { MerchandisingAnalystView } from './components/MerchandisingAnalystView';
import { AuditComplianceView } from './components/AuditComplianceView';
import { DataDictionaryView } from './components/DataDictionaryView';
import { SyntheticStudioView } from './components/SyntheticStudioView';
import { SellerDetailModal } from './components/SellerDetailModal';
import { PayoutLedgerModal } from './components/PayoutLedgerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('operations');
  const [dataset, setDataset] = useState<Dataset>(() => 
    generateMarketplaceDataset({ seed: 20261022, sellerCount: 50, orderCount: 1200, injectAnomalies: true })
  );
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Live validation report whenever dataset changes
  const validation = useMemo(() => {
    return validateDataset(dataset);
  }, [dataset]);

  // Handle seller status update
  const handleUpdateSellerStatus = useCallback((sellerId: string, newStatus: SellerStatus) => {
    setDataset(prev => {
      const updatedSellers = prev.sellers.map(s => {
        if (s.id === sellerId) {
          return { ...s, status: newStatus, updated_at: new Date().toISOString() };
        }
        return s;
      });

      // If suspended, also update listings if healthy
      let updatedListings = prev.listings;
      if (newStatus === 'SUSPENDED') {
        updatedListings = prev.listings.map(l => {
          if (l.seller_id === sellerId && l.status === 'ACTIVE') {
            return { ...l, status: 'DELISTED_SANCTION' };
          }
          return l;
        });
      }

      return {
        ...prev,
        sellers: updatedSellers,
        listings: updatedListings
      };
    });
  }, []);

  // Handle reserve rate adjustment
  const handleUpdateReserveRate = useCallback((sellerId: string, newRate: number) => {
    setDataset(prev => ({
      ...prev,
      sellers: prev.sellers.map(s => s.id === sellerId ? { ...s, reserve_rate: newRate } : s)
    }));
  }, []);

  // Handle commission rate change
  const handleUpdateCommissionRule = useCallback((ruleId: string, newRate: number) => {
    setDataset(prev => ({
      ...prev,
      commissionRules: prev.commissionRules.map(r => r.id === ruleId ? { ...r, base_rate: newRate } : r)
    }));
  }, []);

  // 1-Click Remediation Simulation
  const handleRemediateAnomaly = useCallback((groundTruthId: string) => {
    setDataset(prev => {
      const gt = prev.groundTruth.find(g => g.id === groundTruthId);
      if (!gt || gt.resolved) return prev;

      let updatedPayouts = [...prev.payouts];
      let updatedPayoutLines = [...prev.payoutLines];
      let updatedListings = [...prev.listings];
      let updatedDisputes = [...prev.disputes];

      if (gt.anomaly_type === 'PAYOUT_BEFORE_DELIVERY_OR_HOLD') {
        // Change payout status to HELD_VIOLATION
        updatedPayouts = updatedPayouts.map(p => {
          if (p.id === gt.entity_id) {
            return { ...p, status: 'HELD_VIOLATION' };
          }
          return p;
        });
      } else if (gt.anomaly_type === 'DUPLICATE_COMMISSION_APPLIED') {
        // Remove the duplicate commission fee line
        const dupLine = updatedPayoutLines.find(pl => pl.id === gt.entity_id);
        if (dupLine) {
          updatedPayoutLines = updatedPayoutLines.filter(pl => pl.id !== gt.entity_id);
          // Restore total_commission and net_amount on parent payout
          updatedPayouts = updatedPayouts.map(p => {
            if (p.id === dupLine.payout_id) {
              const feeAmount = Math.abs(dupLine.amount);
              return {
                ...p,
                total_commission: Math.round((p.total_commission - feeAmount) * 100) / 100,
                net_amount: Math.round((p.net_amount + feeAmount) * 100) / 100
              };
            }
            return p;
          });
        }
      } else if (gt.anomaly_type === 'SUSPENDED_SELLER_ACTIVE_LISTINGS') {
        // Sanction delist active listing
        updatedListings = updatedListings.map(l => {
          if (l.id === gt.entity_id) {
            return { ...l, status: 'DELISTED_SANCTION' };
          }
          return l;
        });
      } else if (gt.anomaly_type === 'DISPUTE_NOT_DEDUCTED') {
        // Post dispute clawback deduction line and mark deduction_applied = true
        const targetDsp = updatedDisputes.find(d => d.id === gt.entity_id);
        if (targetDsp) {
          targetDsp.deduction_applied = true;
          const parentPayout = updatedPayouts.find(p => p.id === gt.parent_id);
          if (parentPayout) {
            const clawbackLineId = `PLINE-${parentPayout.id}-CLAW99`;
            updatedPayoutLines.push({
              id: clawbackLineId,
              payout_id: parentPayout.id,
              order_line_id: targetDsp.order_line_id,
              type: 'DISPUTE_CLAWBACK',
              amount: -targetDsp.claim_amount,
              description: `Remediated Clawback: Dispute ${targetDsp.id}`,
              created_at: new Date().toISOString()
            });
            parentPayout.dispute_deductions = Math.round((parentPayout.dispute_deductions + targetDsp.claim_amount) * 100) / 100;
            parentPayout.net_amount = Math.round((parentPayout.net_amount - targetDsp.claim_amount) * 100) / 100;
          }
        }
      } else if (gt.anomaly_type === 'PAYOUT_SUM_MISMATCH') {
        // Recompute net_amount to exact sum of lines
        updatedPayouts = updatedPayouts.map(p => {
          if (p.id === gt.entity_id) {
            const lines = updatedPayoutLines.filter(pl => pl.payout_id === p.id);
            const lineSum = Math.round(lines.reduce((acc, l) => acc + l.amount, 0) * 100) / 100;
            return {
              ...p,
              net_amount: lineSum
            };
          }
          return p;
        });
      }

      // Mark ground truth as resolved
      const updatedGroundTruth = prev.groundTruth.map(g => {
        if (g.id === groundTruthId) {
          return { ...g, resolved: true };
        }
        return g;
      });

      return {
        ...prev,
        payouts: updatedPayouts,
        payoutLines: updatedPayoutLines,
        listings: updatedListings,
        disputes: updatedDisputes,
        groundTruth: updatedGroundTruth
      };
    });
  }, []);

  // Remediate all ground truth anomalies at once
  const handleRemediateAll = useCallback(() => {
    dataset.groundTruth.forEach(gt => {
      if (!gt.resolved) {
        handleRemediateAnomaly(gt.id);
      }
    });
  }, [dataset.groundTruth, handleRemediateAnomaly]);

  // Export full ZIP bundle
  const handleExportZip = useCallback(async () => {
    setIsExporting(true);
    try {
      const blob = await createExportZip(dataset, validation);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketplace_data_package_seed_${dataset.seed}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export zip failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [dataset, validation]);

  // Re-generate dataset with custom parameters
  const handleConfigureGenerator = useCallback((seed: number, scale: string, injectAnomalies: boolean) => {
    let sellerCount = 50;
    let orderCount = 1200;
    let scaleLabel = '50 Sellers / 1,200 Orders';

    if (scale === 'medium') {
      sellerCount = 200;
      orderCount = 4800;
      scaleLabel = '200 Sellers / 4,800 Orders';
    } else if (scale === 'benchmark_profile') {
      sellerCount = 350;
      orderCount = 8000;
      scaleLabel = 'Benchmark Target (Parameterized Engine)';
    }

    const newDataset = generateMarketplaceDataset({
      seed,
      sellerCount,
      orderCount,
      injectAnomalies,
      scaleLabel
    });

    setDataset(newDataset);
  }, []);

  const handleRegenerate = useCallback(() => {
    handleConfigureGenerator(dataset.seed, 'starter', true);
  }, [dataset.seed, handleConfigureGenerator]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Role Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataset={dataset}
        validation={validation}
        onExportZip={handleExportZip}
        isExporting={isExporting}
        onRegenerate={handleRegenerate}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'operations' && (
          <OperationsManagerView
            dataset={dataset}
            onUpdateSellerStatus={handleUpdateSellerStatus}
            onUpdateReserveRate={handleUpdateReserveRate}
            onSelectSeller={setSelectedSeller}
            onSelectPayout={setSelectedPayout}
          />
        )}

        {activeTab === 'warehouse' && (
          <WarehouseOperatorView dataset={dataset} />
        )}

        {activeTab === 'merchandising' && (
          <MerchandisingAnalystView
            dataset={dataset}
            onUpdateCommissionRule={handleUpdateCommissionRule}
          />
        )}

        {activeTab === 'compliance' && (
          <AuditComplianceView
            dataset={dataset}
            validation={validation}
            onRunAudit={() => setDataset(prev => ({ ...prev }))}
            onRemediateAnomaly={handleRemediateAnomaly}
            onRemediateAll={handleRemediateAll}
          />
        )}

        {activeTab === 'dictionary' && (
          <DataDictionaryView />
        )}

        {activeTab === 'studio' && (
          <SyntheticStudioView
            dataset={dataset}
            validation={validation}
            onConfigureGenerator={handleConfigureGenerator}
            onExportZip={handleExportZip}
            isExporting={isExporting}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Marketplace Seller SLA, Fulfillment & Payout Engine • PRNG Seed: <strong className="text-emerald-400 font-mono">{dataset.seed}</strong></span>
          <span className="text-slate-400">10 Relational Tables • Multi-Seller Split Shipments • Ground Truth Segregation</span>
        </div>
      </footer>

      {/* Modals */}
      {selectedSeller && (
        <SellerDetailModal
          seller={selectedSeller}
          dataset={dataset}
          onClose={() => setSelectedSeller(null)}
          onUpdateStatus={handleUpdateSellerStatus}
        />
      )}

      {selectedPayout && (
        <PayoutLedgerModal
          payout={selectedPayout}
          dataset={dataset}
          onClose={() => setSelectedPayout(null)}
        />
      )}
    </div>
  );
}

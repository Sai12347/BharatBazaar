import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Layers,
  Store,
  Package,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { Dataset, ValidationReport } from '../types/marketplace';

export type ActiveTab = 'operations' | 'warehouse' | 'merchandising' | 'compliance' | 'dictionary' | 'studio';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dataset: Dataset;
  validation: ValidationReport;
  onExportZip: () => void;
  isExporting: boolean;
  onRegenerate: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dataset,
  validation,
  onExportZip,
  isExporting,
  onRegenerate
}) => {
  const hasViolations = validation.total_violations > 0;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-emerald-500 p-2.5 rounded-xl shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Marketplace Sentinel
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                  Flipkart / Amazon IN SLA Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Seed <span className="font-mono text-emerald-400">{dataset.seed}</span> • {dataset.sellers.length} Sellers • {dataset.orders.length} Orders
              </p>
            </div>
          </div>

          {/* Quick Status Badges and Export Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('compliance')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                hasViolations 
                  ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/50' 
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/50'
              }`}
              title="Click to view Audit & Integrity report"
            >
              {hasViolations ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{validation.total_violations} Anomalies Flagged</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit Clean (100% Passed)</span>
                </>
              )}
            </button>

            <button
              onClick={onRegenerate}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Regenerate dataset with current seed"
              aria-label="Regenerate dataset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onExportZip}
              disabled={isExporting}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Packing Zip...' : 'Export Package'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs for Primary Actors & Core Modules */}
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80 text-sm">
          <button
            onClick={() => setActiveTab('operations')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'operations'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Operations Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('warehouse')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'warehouse'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Warehouse Operator (Split Orders)</span>
          </button>

          <button
            onClick={() => setActiveTab('merchandising')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'merchandising'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Merchandising & Disputes</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'compliance'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Integrity & Anomalies ({dataset.groundTruth.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'dictionary'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Data Dictionary (10 Entities)</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeTab === 'studio'
                ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Synthetic Studio & Benchmark</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

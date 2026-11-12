import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Layers, 
  Key, 
  Hash, 
  GitBranch, 
  ShieldCheck,
  Check,
  Copy
} from 'lucide-react';
import { DATA_DICTIONARY, EntityDictionary } from '../engine/dataDictionary';
import { generateDataDictionaryMarkdown } from '../engine/exporter';

export const DataDictionaryView: React.FC = () => {
  const [selectedEntityName, setSelectedEntityName] = useState<string>('Seller');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedEntity = DATA_DICTIONARY.find(e => e.entity_name === selectedEntityName) || DATA_DICTIONARY[0];

  const filteredFields = selectedEntity.fields.filter(f => {
    return f.field_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           f.validation_rule.toLowerCase().includes(searchQuery.toLowerCase()) ||
           f.data_type.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCopyMarkdown = () => {
    const md = generateDataDictionaryMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Download CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">Marketplace Relational Schema & Data Dictionary</h2>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              10 Core Entities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Granular specification of table schemas, data types, units, required constraints, allowed enum values, uniqueness guarantees, and business validation rules.
          </p>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Markdown!' : 'Copy Schema Specs'}</span>
        </button>
      </div>

      {/* Relational Cardinality & Architecture Map */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
          <GitBranch className="w-4 h-4 text-indigo-400" />
          <span>Entity-Relationship Architecture & Join Graph</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
            <div className="font-semibold text-indigo-300 mb-1">1. Master Catalog Layer</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-white">Seller (1:N) ProductListing</strong><br />
              Master merchant profiles maintain baseline credentials and SLA thresholds, parenting catalog listings with scoped keys (<span className="font-mono text-emerald-400">LIST-SELL-XXXXXX-YYYYYY</span>).
            </p>
          </div>

          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
            <div className="font-semibold text-emerald-300 mb-1">2. Transaction & Logistics Layer</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-white">Order (1:N) OrderLine (1:1) Fulfillment</strong><br />
              Orders split into granular lines across independent sellers, each spawning a dedicated shipment package (<span className="font-mono text-emerald-400">FUL-&lt;order-line-id&gt;</span>) with carrier SLAs.
            </p>
          </div>

          <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
            <div className="font-semibold text-amber-300 mb-1">3. Settlement & Risk Layer</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              <strong className="text-white">Payout (1:N) PayoutLine + Dispute</strong><br />
              Double-entry ledger tracks merchandise credits, commissions, reserve holds, and dispute clawbacks before clearance.
            </p>
          </div>
        </div>
      </div>

      {/* Entity Selector Tabs */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {DATA_DICTIONARY.map(ent => {
          const isSelected = ent.entity_name === selectedEntity.entity_name;
          return (
            <button
              key={ent.entity_name}
              onClick={() => setSelectedEntityName(ent.entity_name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {ent.entity_name} ({ent.fields.length} cols)
            </button>
          );
        })}
      </div>

      {/* Entity Metadata Card & Field Specification Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Entity Card Header */}
        <div className="p-5 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{selectedEntity.entity_name}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  table: {selectedEntity.table_name}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>PK: <strong className="text-indigo-400 font-mono">{selectedEntity.primary_key}</strong></span>
                <span>ID Pattern: <strong className="text-emerald-400 font-mono">{selectedEntity.id_nomenclature_pattern}</strong></span>
                <span>Cardinality: <strong className="text-slate-300">{selectedEntity.cardinality}</strong></span>
              </div>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter columns..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Lifecycle States:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedEntity.lifecycle_states.map(state => (
                <span key={state} className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono text-[10px] border border-slate-700">
                  {state}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Fields Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">Field Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-center">Required</th>
                <th className="py-3 px-4 text-center">Unique</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Allowed Values & Constraints</th>
                <th className="py-3 px-4">Validation Rule</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFields.map(f => (
                <tr key={f.field_name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-white">
                    {f.field_name}
                  </td>
                  <td className="py-3 px-4 font-mono text-indigo-300 text-[11px]">
                    {f.data_type}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {f.is_required ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/50">
                        YES
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">OPT</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {f.is_unique ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/50">
                        UNIQUE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {f.units}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                    {f.allowed_values}
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-300 text-[11px]">
                    {f.validation_rule}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                    {f.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Wrench, 
  FileText, 
  Layers, 
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Dataset, ValidationReport, GroundTruthItem } from '../types/marketplace';

interface AuditComplianceViewProps {
  dataset: Dataset;
  validation: ValidationReport;
  onRunAudit: () => void;
  onRemediateAnomaly: (groundTruthId: string) => void;
  onRemediateAll: () => void;
}

export const AuditComplianceView: React.FC<AuditComplianceViewProps> = ({
  dataset,
  validation,
  onRunAudit,
  onRemediateAnomaly,
  onRemediateAll
}) => {
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [selectedGroundTruth, setSelectedGroundTruth] = useState<GroundTruthItem | null>(
    dataset.groundTruth.length > 0 ? dataset.groundTruth[0] : null
  );

  const hasViolations = validation.total_violations > 0;
  const resolvedCount = dataset.groundTruth.filter(gt => gt.resolved).length;

  return (
    <div className="space-y-6">
      {/* Top Banner: Validation Audit Health */}
      <div className={`rounded-xl border p-5 shadow-sm transition-all ${
        hasViolations 
          ? 'bg-amber-950/20 border-amber-800/40 text-amber-100' 
          : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-xl border ${
              hasViolations 
                ? 'bg-amber-900/40 border-amber-700/50 text-amber-400' 
                : 'bg-emerald-900/40 border-emerald-700/50 text-emerald-400'
            }`}>
              {hasViolations ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">
                  {hasViolations 
                    ? `Integrity Audit Alert: ${validation.failed_rules} Rule Exceptions (${validation.total_violations} Violations)`
                    : 'Integrity Audit Passed: 100% Compliant & Reconciled'}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {validation.passed_rules} / {validation.total_rules} Rules Clean
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Automated continuous verification of Primary Key uniqueness, Foreign Key referential integrity, event chronological causality, double-entry payout balance, suspension sanctions, and dispute clawback completeness.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasViolations && (
              <button
                onClick={onRemediateAll}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Fix All ({dataset.groundTruth.filter(gt => !gt.resolved).length})</span>
              </button>
            )}

            <button
              onClick={onRunAudit}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Section: Step 5 & 7 Injected Edge Cases & Ground Truth Anomaly Inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-white">Step 5 & 7: Injected Anomaly Ground Truth Inspector</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Isolated Ground Truth Dataset
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              5 labelled negative edge cases are injected deterministically into the dataset while remaining segregated in <span className="font-mono text-emerald-400">ground_truth.json</span> to prevent leakage into input features.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Remediated: <span className="text-emerald-400 font-bold">{resolvedCount}</span> / {dataset.groundTruth.length}
          </div>
        </div>

        {/* List of 5 Edge Cases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dataset.groundTruth.map(item => {
            const isSelected = selectedGroundTruth?.id === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedGroundTruth(item)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  item.resolved
                    ? 'bg-emerald-950/20 border-emerald-800/40 hover:bg-emerald-950/30'
                    : isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-300">{item.id}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      item.severity === 'CRITICAL' ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-amber-950/60 text-amber-300 border-amber-800'
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  {item.resolved ? (
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Fixed
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 font-medium flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Injected
                    </span>
                  )}
                </div>

                <div className="font-semibold text-xs text-white mb-1">
                  {item.anomaly_type.replace(/_/g, ' ')}
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-2 mb-2.5">
                  {item.description}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-700/60 pt-2">
                  <span>Entity: <strong className="text-slate-300">{item.entity_id}</strong></span>
                  <span className="text-indigo-400">Inspect & Diff &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Anomaly Ground-Truth Diff & 1-Click Remediation Console */}
        {selectedGroundTruth && (
          <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {selectedGroundTruth.id}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedGroundTruth.anomaly_type.replace(/_/g, ' ')}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    (Target: {selectedGroundTruth.entity_type} {selectedGroundTruth.entity_id})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedGroundTruth.description}
                </p>
              </div>

              {!selectedGroundTruth.resolved && (
                <button
                  onClick={() => onRemediateAnomaly(selectedGroundTruth.id)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all whitespace-nowrap"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Execute 1-Click Remediation</span>
                </button>
              )}
            </div>

            {/* Side-by-side expected vs actual state */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900 border border-emerald-900/40 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ground Truth Expected State</span>
                </div>
                <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-2.5 rounded overflow-x-auto">
                  {JSON.stringify(selectedGroundTruth.expected_state, null, 2)}
                </pre>
              </div>

              <div className="p-3 bg-slate-900 border border-rose-900/40 rounded-lg space-y-2">
                <div className="text-xs font-semibold text-rose-400 flex items-center space-x-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Actual Injected Anomaly State</span>
                </div>
                <pre className="text-[11px] font-mono text-rose-300 bg-slate-950 p-2.5 rounded overflow-x-auto">
                  {JSON.stringify(selectedGroundTruth.actual_state, null, 2)}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-300">
              <div>
                <span className="text-slate-500 block font-mono text-[10px]">DETECTION RULE</span>
                <span className="font-mono text-indigo-300 font-medium">{selectedGroundTruth.detection_rule}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-mono text-[10px]">REMEDIATION ACTION</span>
                <span>{selectedGroundTruth.remediation}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8-Rule Comprehensive Audit Suite Results */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-base font-semibold text-white">Full 8-Rule Compliance Audit Suite</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Exhaustive verification of relational schemas, double-entry arithmetic reconciliations, and temporal life cycles.
          </p>
        </div>

        <div className="divide-y divide-slate-800">
          {validation.rule_results.map(rule => {
            const isExpanded = expandedRuleId === rule.rule_id;

            return (
              <div key={rule.rule_id} className="p-4 hover:bg-slate-800/30 transition-colors">
                <div 
                  onClick={() => setExpandedRuleId(isExpanded ? null : rule.rule_id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    {rule.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">{rule.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {rule.rule_id}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-950/40 text-indigo-300 border border-indigo-800/50">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {rule.passed ? 'All records passed integrity assertions with zero violations.' : `${rule.violations_count} violation(s) detected.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      rule.passed 
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' 
                        : 'bg-rose-950/40 text-rose-300 border-rose-800'
                    }`}>
                      {rule.passed ? 'PASSED' : `${rule.violations_count} VIOLATIONS`}
                    </span>
                    {rule.details.length > 0 && (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Violations Drawer */}
                {isExpanded && rule.details.length > 0 && (
                  <div className="mt-3 pl-8 pr-2 pt-2 border-t border-slate-800/60 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Violation Records Detail:</div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {rule.details.map((d, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs flex justify-between items-start">
                          <span className="text-slate-300 font-mono text-[11px]">{d.message}</span>
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-800/50">
                            {d.entity_id}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Split,
  MapPin,
  Calendar
} from 'lucide-react';
import { Dataset, Order, Fulfillment, FulfillmentStatus } from '../types/marketplace';

interface WarehouseOperatorViewProps {
  dataset: Dataset;
}

export const WarehouseOperatorView: React.FC<WarehouseOperatorViewProps> = ({ dataset }) => {
  const [carrierFilter, setCarrierFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Available unique carriers
  const availableCarriers = useMemo(() => {
    return Array.from(new Set(dataset.fulfillments.map(f => f.carrier))).sort();
  }, [dataset.fulfillments]);

  // Carrier performance breakdown
  const carrierMetrics = useMemo(() => {
    const stats: Record<string, { total: number; late: number; delivered: number }> = {};
    for (const f of dataset.fulfillments) {
      if (!stats[f.carrier]) {
        stats[f.carrier] = { total: 0, late: 0, delivered: 0 };
      }
      stats[f.carrier].total++;
      if (f.is_late) stats[f.carrier].late++;
      if (f.status === 'DELIVERED') stats[f.carrier].delivered++;
    }
    return stats;
  }, [dataset.fulfillments]);

  // Find multi-seller split orders (orders with > 1 distinct seller)
  const multiSellerOrders = useMemo(() => {
    const orderLinesByOrder = new Map<string, Set<string>>();
    for (const ol of dataset.orderLines) {
      if (!orderLinesByOrder.has(ol.order_id)) {
        orderLinesByOrder.set(ol.order_id, new Set());
      }
      orderLinesByOrder.get(ol.order_id)!.add(ol.seller_id);
    }

    const splitIds = new Set<string>();
    orderLinesByOrder.forEach((sellers, ordId) => {
      if (sellers.size > 1) {
        splitIds.add(ordId);
      }
    });

    return dataset.orders.filter(o => splitIds.has(o.id));
  }, [dataset.orders, dataset.orderLines]);

  // Filtered fulfillments list
  const filteredFulfillments = useMemo(() => {
    return dataset.fulfillments.filter(f => {
      const matchesCarrier = carrierFilter === 'ALL' || f.carrier === carrierFilter;
      const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
      const matchesSearch = f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.seller_id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCarrier && matchesStatus && matchesSearch;
    });
  }, [dataset.fulfillments, carrierFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Carrier Performance Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(carrierMetrics).map(([carrier, data]) => {
          const onTimeRate = data.total > 0 ? ((data.total - data.late) / data.total) * 100 : 100;
          return (
            <div key={carrier} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold text-white">{carrier}</span>
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-xl font-bold text-white">{data.total} <span className="text-xs font-normal text-slate-400">pkgs</span></div>
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>Punctuality:</span>
                <span className={onTimeRate >= 96 ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {onTimeRate.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Section: Split Multi-Seller Order Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Split Multi-Seller Order Dispatch Engine</h3>
              <p className="text-xs text-slate-400">
                Single customer checkouts automatically split into distinct merchant fulfillment orders with independent warehouse dispatch routing.
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
            {multiSellerOrders.length} Split Orders Active
          </span>
        </div>

        {/* List of sample split orders with expandable drawer */}
        <div className="space-y-3">
          {multiSellerOrders.slice(0, 5).map(order => {
            const isExpanded = expandedOrderId === order.id;
            const lines = dataset.orderLines.filter(ol => ol.order_id === order.id);
            const sellerIds = Array.from(new Set(lines.map(l => l.seller_id)));

            return (
              <div key={order.id} className="border border-slate-800 rounded-lg bg-slate-800/40 overflow-hidden">
                <div 
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-indigo-400">{order.id}</span>
                    <span className="text-xs text-slate-300">{order.customer_name}</span>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">{order.customer_email}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-amber-300 font-medium bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                      Splits into {sellerIds.length} Sellers ({lines.length} Shipments)
                    </span>
                    <span className="text-xs font-mono font-semibold text-white">₹{order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>Destination Address: <strong className="text-slate-300">{order.shipping_address}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {lines.map(line => {
                        const ful = dataset.fulfillments.find(f => f.order_line_id === line.id);
                        const seller = dataset.sellers.find(s => s.id === line.seller_id);
                        const listing = dataset.listings.find(l => l.id === line.listing_id);

                        return (
                          <div key={line.id} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-white block">{listing?.title || line.listing_id}</span>
                                <span className="text-slate-400 text-[11px]">Seller: <strong className="text-indigo-300">{seller?.business_name}</strong> ({seller?.id})</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                ful?.status === 'DELIVERED' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' :
                                ful?.status === 'SHIPPED' ? 'bg-blue-950/40 text-blue-300 border-blue-800/50' :
                                'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {ful?.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded">
                              <div>
                                <span>Package ID:</span>
                                <div className="text-slate-300 font-semibold">{ful?.id}</div>
                              </div>
                              <div>
                                <span>Warehouse:</span>
                                <div className="text-slate-300">{ful?.warehouse_id}</div>
                              </div>
                              <div>
                                <span>Carrier / Tracking:</span>
                                <div className="text-slate-300">{ful?.carrier} • {ful?.tracking_number}</div>
                              </div>
                              <div>
                                <span>SLA Cutoff:</span>
                                <div className={ful?.is_late ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                                  {ful?.ship_by_deadline ? new Date(ful.ship_by_deadline).toLocaleDateString() : 'N/A'} {ful?.is_late && '(LATE)'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fulfillment Master Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Warehouse Dispatch & Logistics Tracker</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live tracking of package pick, pack, carrier handoff, tracking waybills, and doorstep delivery SLA deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search package, tracking, seller..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={carrierFilter}
              onChange={e => setCarrierFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Logistics Providers</option>
              {availableCarriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Logistics States</option>
              <option value="CREATED">CREATED</option>
              <option value="PICKED">PICKED</option>
              <option value="PACKED">PACKED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-medium">
                <th className="py-3 px-4">Package ID</th>
                <th className="py-3 px-4">Order / Line</th>
                <th className="py-3 px-4">Seller ID</th>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Carrier & Waybill</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ship Cutoff</th>
                <th className="py-3 px-4 text-center">Punctuality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFulfillments.slice(0, 20).map(ful => {
                return (
                  <tr key={ful.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-300">
                      {ful.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      <div>{ful.order_id}</div>
                      <div className="text-[10px] text-slate-500">{ful.order_line_id}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {ful.seller_id}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        <span>{ful.warehouse_id}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{ful.carrier}</div>
                      <div className="text-[11px] font-mono text-slate-400">{ful.tracking_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        ful.status === 'DELIVERED'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                          : ful.status === 'SHIPPED'
                          ? 'bg-blue-950/40 text-blue-300 border-blue-700/50'
                          : ful.status === 'RETURNED'
                          ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {ful.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(ful.ship_by_deadline).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ful.is_late ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-950/40 text-rose-300 border border-rose-800/50">
                          <Clock className="w-3 h-3 mr-1" />
                          Late
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          On-Time
                        </span>
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
  );
};

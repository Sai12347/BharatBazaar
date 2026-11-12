/**
 * Marketplace Seller SLA, Fulfillment & Payout Engine
 * Core TypeScript Data Models and Schema Definitions
 */

export type SellerTier = 'TIER_1_ENTERPRISE' | 'TIER_2_PRO' | 'TIER_3_STANDARD' | 'TIER_4_MICRO';
export type SellerStatus = 'ACTIVE' | 'PROBATION' | 'SUSPENDED' | 'ONBOARDING';

export interface Seller {
  id: string; // e.g. SELL-000001
  business_name: string;
  legal_entity: string;
  country: string;
  tier: SellerTier;
  status: SellerStatus;
  rating_avg: number; // 1.00 - 5.00
  late_shipment_rate: number; // 0.0000 - 1.0000 (target < 0.04)
  cancellation_rate: number; // 0.0000 - 1.0000 (target < 0.025)
  return_dispute_rate: number; // 0.0000 - 1.0000
  reserve_rate: number; // Default 0.10 (10%)
  hold_period_days: number; // e.g. 14 days
  created_at: string;
  updated_at: string;
}

export type ListingStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED' | 'DELISTED_SANCTION';
export type ProductCategory = 
  | 'Electronics' 
  | 'Apparel & Fashion' 
  | 'Home & Living' 
  | 'Health & Beauty' 
  | 'Sports & Outdoors' 
  | 'Automotive' 
  | 'Toys & Games';

export interface ProductListing {
  id: string; // e.g. LIST-SELL-000001-000001
  seller_id: string;
  title: string;
  category: ProductCategory;
  sku: string;
  price: number;
  stock_quantity: number;
  status: ListingStatus;
  created_at: string;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'PARTIALLY_FULFILLED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export interface Order {
  id: string; // e.g. ORD-2026-000001
  customer_id: string; // e.g. CUST-000042
  customer_name: string;
  customer_email: string;
  order_status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  placed_at: string;
  currency: string; // e.g. 'USD'
}

export interface OrderLine {
  id: string; // e.g. OLINE-ORD-2026-000001-01
  order_id: string;
  listing_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  category: ProductCategory;
  commission_rate: number; // e.g. 0.08
  commission_amount: number;
  created_at: string;
}

export type FulfillmentStatus = 
  | 'CREATED' 
  | 'PICKED' 
  | 'PACKED' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'RETURNED' 
  | 'CANCELLED';

export interface Fulfillment {
  id: string; // e.g. FUL-OLINE-ORD-2026-000001-01
  order_line_id: string;
  order_id: string;
  seller_id: string;
  warehouse_id: string;
  carrier: 'Blue Dart' | 'Delhivery' | 'DTDC' | 'Ekart Logistics' | 'Shadowfax' | 'India Post' | 'Xpressbees' | 'FedEx' | 'DHL' | string;
  tracking_number: string;
  status: FulfillmentStatus;
  ship_by_deadline: string;
  shipped_at: string | null;
  delivered_at: string | null;
  is_late: boolean;
  delivery_sla_days: number;
}

export interface CustomerReview {
  id: string; // e.g. REV-2026-000001
  order_id: string;
  order_line_id: string;
  seller_id: string;
  customer_id: string;
  rating: number; // 1 - 5
  comment: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  verified_purchase: boolean;
  created_at: string;
}

export type DisputeReason = 
  | 'ITEM_NOT_RECEIVED' 
  | 'DAMAGED_GOODS' 
  | 'NOT_AS_DESCRIBED' 
  | 'UNAUTHORIZED_CHARGE' 
  | 'LATE_DELIVERY';

export type DisputeStatus = 
  | 'OPEN' 
  | 'UNDER_REVIEW' 
  | 'SELLER_RESPONDED' 
  | 'RESOLVED_MERCHANT_WON' 
  | 'RESOLVED_CUSTOMER_WON' 
  | 'ARBITRATED';

export interface Dispute {
  id: string; // e.g. DSP-2026-000001
  order_id: string;
  order_line_id: string;
  seller_id: string;
  reason: DisputeReason;
  claim_amount: number;
  status: DisputeStatus;
  customer_won: boolean;
  deduction_applied: boolean;
  filed_at: string;
  resolved_at: string | null;
}

export interface CommissionRule {
  id: string; // e.g. CRULE-000001
  category: ProductCategory;
  base_rate: number; // e.g. 0.08
  min_fee: number; // e.g. 0.50
  max_fee: number; // e.g. 150.00
  tier: SellerTier | 'ALL';
  effective_from: string;
  effective_to: string;
  is_active: boolean;
}

export type PayoutStatus = 
  | 'PENDING_AUDIT' 
  | 'ELIGIBLE' 
  | 'HELD_VIOLATION' 
  | 'PAID' 
  | 'BLOCKED_SUSPENDED';

export interface Payout {
  id: string; // e.g. PAYOUT-2026-000001
  seller_id: string;
  period_start: string;
  period_end: string;
  gross_sales: number;
  total_commission: number;
  dispute_deductions: number;
  reserve_held: number;
  reserve_released: number;
  net_amount: number;
  status: PayoutStatus;
  scheduled_payout_date: string;
  paid_at: string | null;
}

export type PayoutLineType = 
  | 'MERCHANDISE_CREDIT' 
  | 'COMMISSION_FEE' 
  | 'DISPUTE_CLAWBACK' 
  | 'RESERVE_HOLD' 
  | 'RESERVE_RELEASE' 
  | 'ADJUSTMENT';

export interface PayoutLine {
  id: string; // e.g. PLINE-PAYOUT-2026-000001-01
  payout_id: string;
  order_line_id: string | null;
  type: PayoutLineType;
  amount: number; // positive for credits, negative for debits/holds
  description: string;
  created_at: string;
}

// Injected Edge Cases and Ground Truth
export type AnomalyType = 
  | 'PAYOUT_BEFORE_DELIVERY_OR_HOLD' 
  | 'DUPLICATE_COMMISSION_APPLIED' 
  | 'SUSPENDED_SELLER_ACTIVE_LISTINGS' 
  | 'DISPUTE_NOT_DEDUCTED' 
  | 'PAYOUT_SUM_MISMATCH';

export interface GroundTruthItem {
  id: string; // e.g. GT-0001
  entity_type: 'Payout' | 'PayoutLine' | 'ProductListing' | 'Seller' | 'Dispute';
  entity_id: string;
  parent_id?: string;
  anomaly_type: AnomalyType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  expected_state: Record<string, any>;
  actual_state: Record<string, any>;
  detection_rule: string;
  remediation: string;
  resolved?: boolean;
}

export interface ValidationRuleResult {
  rule_id: string;
  name: string;
  category: 'INTEGRITY' | 'FINANCIAL' | 'SLA_COMPLIANCE' | 'TEMPORAL';
  passed: boolean;
  violations_count: number;
  details: {
    entity_id: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
  }[];
}

export interface ValidationReport {
  timestamp: string;
  total_rules: number;
  passed_rules: number;
  failed_rules: number;
  total_violations: number;
  rule_results: ValidationRuleResult[];
  dataset_summary: {
    sellers_count: number;
    listings_count: number;
    orders_count: number;
    order_lines_count: number;
    fulfillments_count: number;
    reviews_count: number;
    disputes_count: number;
    commission_rules_count: number;
    payouts_count: number;
    payout_lines_count: number;
    ground_truth_count: number;
  };
}

export interface Dataset {
  seed: number;
  scale_label: string;
  created_at: string;
  sellers: Seller[];
  listings: ProductListing[];
  orders: Order[];
  orderLines: OrderLine[];
  fulfillments: Fulfillment[];
  reviews: CustomerReview[];
  disputes: Dispute[];
  commissionRules: CommissionRule[];
  payouts: Payout[];
  payoutLines: PayoutLine[];
  groundTruth: GroundTruthItem[];
}

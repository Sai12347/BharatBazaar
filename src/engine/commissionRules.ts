import { CommissionRule, ProductCategory, SellerTier } from '../types/marketplace';

export const DEFAULT_COMMISSION_RULES: CommissionRule[] = [
  {
    id: 'CRULE-000001',
    category: 'Electronics',
    base_rate: 0.080, // 8%
    min_fee: 1.00,
    max_fee: 15000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000002',
    category: 'Apparel & Fashion',
    base_rate: 0.140, // 14%
    min_fee: 0.75,
    max_fee: 8000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000003',
    category: 'Home & Living',
    base_rate: 0.120, // 12%
    min_fee: 0.50,
    max_fee: 10000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000004',
    category: 'Health & Beauty',
    base_rate: 0.150, // 15%
    min_fee: 0.50,
    max_fee: 6000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000005',
    category: 'Sports & Outdoors',
    base_rate: 0.100, // 10%
    min_fee: 0.80,
    max_fee: 8000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000006',
    category: 'Automotive',
    base_rate: 0.090, // 9%
    min_fee: 1.50,
    max_fee: 12000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  },
  {
    id: 'CRULE-000007',
    category: 'Toys & Games',
    base_rate: 0.110, // 11%
    min_fee: 0.50,
    max_fee: 5000.00,
    tier: 'ALL',
    effective_from: '2026-01-01',
    effective_to: '2026-12-31',
    is_active: true
  }
];

/**
 * Calculates marketplace commission based on subtotal, category, and seller tier.
 */
export function calculateCommission(
  subtotal: number,
  category: ProductCategory,
  sellerTier: SellerTier,
  rules: CommissionRule[] = DEFAULT_COMMISSION_RULES
): { rate: number; fee: number } {
  // Find matching active rule
  const rule = rules.find(r => r.category === category && r.is_active && (r.tier === 'ALL' || r.tier === sellerTier))
    || rules.find(r => r.category === category && r.is_active)
    || { base_rate: 0.10, min_fee: 0.50, max_fee: 200.00 };

  // Tier 1 enterprise discount: 15% discount on base rate
  let effectiveRate = rule.base_rate;
  if (sellerTier === 'TIER_1_ENTERPRISE') {
    effectiveRate = Math.round(effectiveRate * 0.85 * 1000) / 1000;
  } else if (sellerTier === 'TIER_2_PRO') {
    effectiveRate = Math.round(effectiveRate * 0.95 * 1000) / 1000;
  }

  let calculatedFee = subtotal * effectiveRate;
  if (calculatedFee < rule.min_fee) {
    calculatedFee = rule.min_fee;
  } else if (calculatedFee > rule.max_fee) {
    calculatedFee = rule.max_fee;
  }

  return {
    rate: effectiveRate,
    fee: Math.round(calculatedFee * 100) / 100
  };
}

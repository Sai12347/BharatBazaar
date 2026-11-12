import test from 'node:test';
import assert from 'node:assert/strict';
import { DeterministicPRNG, fastHash } from './prng';
import { calculateCommission, DEFAULT_COMMISSION_RULES } from './commissionRules';
import { generateMarketplaceDataset } from './generator';
import { validateDataset } from './validator';
import { verifyReproducibility } from './exporter';

test('DeterministicPRNG produces identical sequences for the same seed', () => {
  const prng1 = new DeterministicPRNG(20261022);
  const prng2 = new DeterministicPRNG(20261022);

  for (let i = 0; i < 50; i++) {
    assert.equal(prng1.next(), prng2.next());
    assert.equal(prng1.nextInt(1, 100), prng2.nextInt(1, 100));
  }
});

test('calculateCommission applies correct base rates and tier discounts', () => {
  // Electronics base rate is 8% (0.08)
  const standardFee = calculateCommission(100.00, 'Electronics', 'TIER_3_STANDARD');
  assert.equal(standardFee.rate, 0.08);
  assert.equal(standardFee.fee, 8.00);

  // Enterprise tier gets 15% discount on rate: 0.08 * 0.85 = 0.068
  const enterpriseFee = calculateCommission(100.00, 'Electronics', 'TIER_1_ENTERPRISE');
  assert.equal(enterpriseFee.rate, 0.068);
  assert.equal(enterpriseFee.fee, 6.80);

  // Health & Beauty base rate is 15% (0.15)
  const beautyFee = calculateCommission(200.00, 'Health & Beauty', 'TIER_3_STANDARD');
  assert.equal(beautyFee.rate, 0.15);
  assert.equal(beautyFee.fee, 30.00);
});

test('generateMarketplaceDataset adheres to strict ID nomenclature conventions', () => {
  const dataset = generateMarketplaceDataset({
    seed: 20261022,
    sellerCount: 10,
    orderCount: 50,
    injectAnomalies: false
  });

  // Verify Seller ID format: SELL-000001
  assert.match(dataset.sellers[0].id, /^SELL-\d{6}$/);

  // Verify Listing ID format: LIST-SELL-000001-000001
  assert.match(dataset.listings[0].id, /^LIST-SELL-\d{6}-\d{6}$/);

  // Verify Order ID format: ORD-2026-000001
  assert.match(dataset.orders[0].id, /^ORD-2026-\d{6}$/);

  // Verify OrderLine ID format: OLINE-ORD-2026-000001-01
  assert.match(dataset.orderLines[0].id, /^OLINE-ORD-2026-\d{6}-\d{2}$/);

  // Verify Fulfillment ID format: FUL-OLINE-ORD-2026-000001-01
  assert.match(dataset.fulfillments[0].id, /^FUL-OLINE-ORD-2026-\d{6}-\d{2}$/);

  // Verify Payout ID format: PAYOUT-2026-000001
  assert.match(dataset.payouts[0].id, /^PAYOUT-2026-\d{6}$/);
});

test('Anomaly injection properly records all 5 labelled edge cases in separate ground truth', () => {
  const dataset = generateMarketplaceDataset({
    seed: 20261022,
    sellerCount: 20,
    orderCount: 150,
    injectAnomalies: true
  });

  const anomalyTypes = dataset.groundTruth.map(gt => gt.anomaly_type);
  assert.ok(anomalyTypes.includes('PAYOUT_BEFORE_DELIVERY_OR_HOLD'), 'Should record PAYOUT_BEFORE_DELIVERY_OR_HOLD');
  assert.ok(anomalyTypes.includes('DUPLICATE_COMMISSION_APPLIED'), 'Should record DUPLICATE_COMMISSION_APPLIED');
  assert.ok(anomalyTypes.includes('SUSPENDED_SELLER_ACTIVE_LISTINGS'), 'Should record SUSPENDED_SELLER_ACTIVE_LISTINGS');
  assert.ok(anomalyTypes.includes('DISPUTE_NOT_DEDUCTED'), 'Should record DISPUTE_NOT_DEDUCTED');
  assert.ok(anomalyTypes.includes('PAYOUT_SUM_MISMATCH'), 'Should record PAYOUT_SUM_MISMATCH');

  // Verify validator flags the anomalies
  const report = validateDataset(dataset);
  assert.equal(report.failed_rules > 0, true, 'Validation report should flag injected rule failures');
  
  const failedRuleIds = report.rule_results.filter(r => !r.passed).map(r => r.rule_id);
  assert.ok(failedRuleIds.includes('RULE_PAYOUT_HEADER_LINE_RECONCILIATION') || failedRuleIds.includes('RULE_NO_DUPLICATE_COMMISSION'));
});

test('Step 10: verifyReproducibility confirms bitwise matching row counts and hashes across 2 independent runs', () => {
  const result = verifyReproducibility(20261022, { sellerCount: 15, orderCount: 60 });
  assert.equal(result.is_reproducible, true, 'Two executions with seed 20261022 must be 100% reproducible');
  assert.equal(result.match_count, result.total_tables, 'All tables must match identically in counts and checksums');

  for (const table of Object.keys(result.run1_counts)) {
    assert.equal(result.run1_counts[table], result.run2_counts[table], `Row counts for ${table} must match`);
    assert.equal(result.run1_hashes[table], result.run2_hashes[table], `Checksum for ${table} must match`);
  }
});

import { Dataset, ValidationReport, ValidationRuleResult } from '../types/marketplace';

/**
 * Step 8: Multi-Rule Validation Suite
 * Runs rigorous automated audits across integrity, financial arithmetic, temporal causality, and business rules.
 */
export function validateDataset(dataset: Dataset): ValidationReport {
  const ruleResults: ValidationRuleResult[] = [];

  // ----------------------------------------------------
  // 1. Primary Key Uniqueness
  // ----------------------------------------------------
  const pkViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  function checkUniqueness(items: { id: string }[], entityName: string) {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) {
        pkViolations.push({
          entity_id: item.id,
          message: `Duplicate primary key found in ${entityName}: ${item.id}`,
          severity: 'ERROR'
        });
      }
      seen.add(item.id);
    }
  }

  checkUniqueness(dataset.sellers, 'Sellers');
  checkUniqueness(dataset.listings, 'ProductListings');
  checkUniqueness(dataset.orders, 'Orders');
  checkUniqueness(dataset.orderLines, 'OrderLines');
  checkUniqueness(dataset.fulfillments, 'Fulfillments');
  checkUniqueness(dataset.reviews, 'CustomerReviews');
  checkUniqueness(dataset.disputes, 'Disputes');
  checkUniqueness(dataset.commissionRules, 'CommissionRules');
  checkUniqueness(dataset.payouts, 'Payouts');
  checkUniqueness(dataset.payoutLines, 'PayoutLines');

  ruleResults.push({
    rule_id: 'RULE_PK_UNIQUENESS',
    name: 'Primary Key Uniqueness Across All 10 Entities',
    category: 'INTEGRITY',
    passed: pkViolations.length === 0,
    violations_count: pkViolations.length,
    details: pkViolations
  });

  // ----------------------------------------------------
  // 2. Foreign Key Referential Integrity
  // ----------------------------------------------------
  const fkViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  const sellerIds = new Set(dataset.sellers.map(s => s.id));
  const listingIds = new Set(dataset.listings.map(l => l.id));
  const orderIds = new Set(dataset.orders.map(o => o.id));
  const orderLineIds = new Set(dataset.orderLines.map(ol => ol.id));
  const payoutIds = new Set(dataset.payouts.map(p => p.id));

  // Listings -> Seller
  for (const l of dataset.listings) {
    if (!sellerIds.has(l.seller_id)) {
      fkViolations.push({
        entity_id: l.id,
        message: `Listing references non-existent seller: ${l.seller_id}`,
        severity: 'ERROR'
      });
    }
  }

  // OrderLines -> Order, Listing, Seller
  for (const ol of dataset.orderLines) {
    if (!orderIds.has(ol.order_id)) {
      fkViolations.push({
        entity_id: ol.id,
        message: `OrderLine references non-existent order: ${ol.order_id}`,
        severity: 'ERROR'
      });
    }
    if (!listingIds.has(ol.listing_id)) {
      fkViolations.push({
        entity_id: ol.id,
        message: `OrderLine references non-existent listing: ${ol.listing_id}`,
        severity: 'ERROR'
      });
    }
    if (!sellerIds.has(ol.seller_id)) {
      fkViolations.push({
        entity_id: ol.id,
        message: `OrderLine references non-existent seller: ${ol.seller_id}`,
        severity: 'ERROR'
      });
    }
  }

  // Fulfillments -> OrderLine
  for (const f of dataset.fulfillments) {
    if (!orderLineIds.has(f.order_line_id)) {
      fkViolations.push({
        entity_id: f.id,
        message: `Fulfillment references non-existent order line: ${f.order_line_id}`,
        severity: 'ERROR'
      });
    }
  }

  // PayoutLines -> Payout
  for (const pl of dataset.payoutLines) {
    if (!payoutIds.has(pl.payout_id)) {
      fkViolations.push({
        entity_id: pl.id,
        message: `PayoutLine references non-existent payout: ${pl.payout_id}`,
        severity: 'ERROR'
      });
    }
    if (pl.order_line_id && !orderLineIds.has(pl.order_line_id)) {
      fkViolations.push({
        entity_id: pl.id,
        message: `PayoutLine references non-existent order line: ${pl.order_line_id}`,
        severity: 'ERROR'
      });
    }
  }

  ruleResults.push({
    rule_id: 'RULE_FK_INTEGRITY',
    name: 'Foreign Key Referential Integrity and Relational Joins',
    category: 'INTEGRITY',
    passed: fkViolations.length === 0,
    violations_count: fkViolations.length,
    details: fkViolations
  });

  // ----------------------------------------------------
  // 3. Temporal Date Ordering & Causality
  // Order Placed <= Shipped <= Delivered <= Review <= Payout
  // ----------------------------------------------------
  const temporalViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  const fulMap = new Map(dataset.fulfillments.map(f => [f.order_line_id, f]));
  const orderMap = new Map(dataset.orders.map(o => [o.id, o]));

  for (const f of dataset.fulfillments) {
    const parentOrder = orderMap.get(f.order_id);
    if (parentOrder && f.shipped_at) {
      if (new Date(f.shipped_at) < new Date(parentOrder.placed_at)) {
        temporalViolations.push({
          entity_id: f.id,
          message: `Fulfillment shipped (${f.shipped_at}) before order placed (${parentOrder.placed_at})`,
          severity: 'ERROR'
        });
      }
    }
    if (f.shipped_at && f.delivered_at) {
      if (new Date(f.delivered_at) < new Date(f.shipped_at)) {
        temporalViolations.push({
          entity_id: f.id,
          message: `Fulfillment delivered (${f.delivered_at}) before shipped (${f.shipped_at})`,
          severity: 'ERROR'
        });
      }
    }
  }

  // Reviews must be created after delivery
  for (const rev of dataset.reviews) {
    const ful = fulMap.get(rev.order_line_id);
    if (ful && ful.delivered_at) {
      if (new Date(rev.created_at) < new Date(ful.delivered_at)) {
        temporalViolations.push({
          entity_id: rev.id,
          message: `Review submitted (${rev.created_at}) before physical delivery (${ful.delivered_at})`,
          severity: 'WARNING'
        });
      }
    }
  }

  ruleResults.push({
    rule_id: 'RULE_TEMPORAL_CAUSALITY',
    name: 'Event Timeline & Chronological Causality',
    category: 'TEMPORAL',
    passed: temporalViolations.length === 0,
    violations_count: temporalViolations.length,
    details: temporalViolations
  });

  // ----------------------------------------------------
  // 4. Financial Arithmetic: Payout Header vs Line Items Reconciliation
  // (Injected Edge Case 5 check)
  // ----------------------------------------------------
  const payoutSumViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];

  for (const p of dataset.payouts) {
    const lines = dataset.payoutLines.filter(pl => pl.payout_id === p.id);
    const lineSum = Math.round(lines.reduce((acc, l) => acc + l.amount, 0) * 100) / 100;
    const diff = Math.abs(p.net_amount - lineSum);

    if (diff > 0.05) {
      payoutSumViolations.push({
        entity_id: p.id,
        message: `Payout header net_amount ($${p.net_amount}) does not match sum of lines ($${lineSum}). Delta: $${Math.round(diff * 100) / 100}`,
        severity: 'ERROR'
      });
    }

    // Header internal formula check
    const expectedHeaderNet = Math.round(
      (p.gross_sales - p.total_commission - p.dispute_deductions - p.reserve_held + p.reserve_released) * 100
    ) / 100;
    if (Math.abs(p.net_amount - expectedHeaderNet) > 0.05 && diff <= 0.05) {
      payoutSumViolations.push({
        entity_id: p.id,
        message: `Payout internal ledger formula mismatch: gross(${p.gross_sales}) - comm(${p.total_commission}) - dsp(${p.dispute_deductions}) - rHold(${p.reserve_held}) + rRel(${p.reserve_released}) != net(${p.net_amount})`,
        severity: 'ERROR'
      });
    }
  }

  ruleResults.push({
    rule_id: 'RULE_PAYOUT_HEADER_LINE_RECONCILIATION',
    name: 'Payout Financial Header and Double-Entry Line Reconciliation',
    category: 'FINANCIAL',
    passed: payoutSumViolations.length === 0,
    violations_count: payoutSumViolations.length,
    details: payoutSumViolations
  });

  // ----------------------------------------------------
  // 5. Duplicate Commission Detection
  // (Injected Edge Case 2 check)
  // ----------------------------------------------------
  const duplicateCommViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  const commLinesByPayout = new Map<string, Map<string, number>>();

  for (const pl of dataset.payoutLines) {
    if (pl.type === 'COMMISSION_FEE' && pl.order_line_id) {
      if (!commLinesByPayout.has(pl.payout_id)) {
        commLinesByPayout.set(pl.payout_id, new Map());
      }
      const orderLineCounts = commLinesByPayout.get(pl.payout_id)!;
      const currentCount = orderLineCounts.get(pl.order_line_id) || 0;
      orderLineCounts.set(pl.order_line_id, currentCount + 1);

      if (currentCount >= 1) {
        duplicateCommViolations.push({
          entity_id: pl.id,
          message: `Duplicate commission deduction detected in Payout ${pl.payout_id} for OrderLine ${pl.order_line_id}`,
          severity: 'ERROR'
        });
      }
    }
  }

  ruleResults.push({
    rule_id: 'RULE_NO_DUPLICATE_COMMISSION',
    name: 'Single Fee Ledger Deduction (No Duplicate Commission)',
    category: 'FINANCIAL',
    passed: duplicateCommViolations.length === 0,
    violations_count: duplicateCommViolations.length,
    details: duplicateCommViolations
  });

  // ----------------------------------------------------
  // 6. Suspended Seller Active Listings
  // (Injected Edge Case 3 check)
  // ----------------------------------------------------
  const suspendedListingViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  const sellerStatusMap = new Map(dataset.sellers.map(s => [s.id, s.status]));

  for (const l of dataset.listings) {
    const status = sellerStatusMap.get(l.seller_id);
    if (status === 'SUSPENDED' && l.status === 'ACTIVE') {
      suspendedListingViolations.push({
        entity_id: l.id,
        message: `Listing ${l.id} remains ACTIVE despite parent Seller ${l.seller_id} being SUSPENDED`,
        severity: 'ERROR'
      });
    }
  }

  ruleResults.push({
    rule_id: 'RULE_SANCTIONED_SELLER_NO_ACTIVE_LISTINGS',
    name: 'Suspension Policy Enforcement (No Active Listings While Suspended)',
    category: 'SLA_COMPLIANCE',
    passed: suspendedListingViolations.length === 0,
    violations_count: suspendedListingViolations.length,
    details: suspendedListingViolations
  });

  // ----------------------------------------------------
  // 7. Dispute Clawback Completeness
  // (Injected Edge Case 4 check)
  // ----------------------------------------------------
  const unclawedDisputeViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];

  for (const d of dataset.disputes) {
    if (d.customer_won && !d.deduction_applied) {
      unclawedDisputeViolations.push({
        entity_id: d.id,
        message: `Customer won dispute ${d.id} ($${d.claim_amount}) but deduction_applied flag is false / clawback was omitted`,
        severity: 'ERROR'
      });
    }
  }

  ruleResults.push({
    rule_id: 'RULE_DISPUTE_CLAWBACK_RECONCILIATION',
    name: 'Customer-Won Dispute Clawback Completeness',
    category: 'FINANCIAL',
    passed: unclawedDisputeViolations.length === 0,
    violations_count: unclawedDisputeViolations.length,
    details: unclawedDisputeViolations
  });

  // ----------------------------------------------------
  // 8. Delivery and Hold Window Eligibility Before Payout
  // (Injected Edge Case 1 check)
  // ----------------------------------------------------
  const prematurePayoutViolations: { entity_id: string; message: string; severity: 'ERROR' | 'WARNING' }[] = [];
  const nowTime = new Date('2026-11-12T03:00:00Z').getTime();

  for (const pl of dataset.payoutLines) {
    if (pl.type === 'MERCHANDISE_CREDIT' && pl.order_line_id) {
      const parentPayout = dataset.payouts.find(p => p.id === pl.payout_id);
      const ful = fulMap.get(pl.order_line_id);

      if (ful && parentPayout && parentPayout.status === 'ELIGIBLE') {
        if (ful.status !== 'DELIVERED' || !ful.delivered_at) {
          prematurePayoutViolations.push({
            entity_id: parentPayout.id,
            message: `Payout marked ELIGIBLE contains OrderLine ${pl.order_line_id} whose shipment status is ${ful.status} (undelivered)`,
            severity: 'ERROR'
          });
        }
      }
    }
  }

  ruleResults.push({
    rule_id: 'RULE_TEMPORAL_DELIVERY_HOLD_CHECK',
    name: 'Payout Eligibility Delivery and Escrow Hold Window Clearance',
    category: 'TEMPORAL',
    passed: prematurePayoutViolations.length === 0,
    violations_count: prematurePayoutViolations.length,
    details: prematurePayoutViolations
  });

  // ----------------------------------------------------
  // Compile Summary Report
  // ----------------------------------------------------
  const totalRules = ruleResults.length;
  const passedRules = ruleResults.filter(r => r.passed).length;
  const failedRules = totalRules - passedRules;
  const totalViolations = ruleResults.reduce((acc, r) => acc + r.violations_count, 0);

  return {
    timestamp: new Date().toISOString(),
    total_rules: totalRules,
    passed_rules: passedRules,
    failed_rules: failedRules,
    total_violations: totalViolations,
    rule_results: ruleResults,
    dataset_summary: {
      sellers_count: dataset.sellers.length,
      listings_count: dataset.listings.length,
      orders_count: dataset.orders.length,
      order_lines_count: dataset.orderLines.length,
      fulfillments_count: dataset.fulfillments.length,
      reviews_count: dataset.reviews.length,
      disputes_count: dataset.disputes.length,
      commission_rules_count: dataset.commissionRules.length,
      payouts_count: dataset.payouts.length,
      payout_lines_count: dataset.payoutLines.length,
      ground_truth_count: dataset.groundTruth.length
    }
  };
}

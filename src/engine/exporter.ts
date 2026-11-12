import JSZip from 'jszip';
import { Dataset, ValidationReport } from '../types/marketplace';
import { DATA_DICTIONARY } from './dataDictionary';
import { fastHash } from './prng';
import { generateMarketplaceDataset } from './generator';

/**
 * Converts an array of objects to a compliant CSV string with quoted fields.
 */
export function objectsToCsv<T extends Record<string, any>>(items: T[]): string {
  if (items.length === 0) return '';
  const headers = Object.keys(items[0]);
  const rows = items.map(item => {
    return headers.map(header => {
      const val = item[header];
      if (val === null || val === undefined) return '';
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      // Escape quotes
      const escaped = strVal.replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates PostgreSQL DDL schema definition and sample INSERT seed script.
 */
export function generateSqlScript(dataset: Dataset): string {
  const lines: string[] = [
    '--',
    '-- Marketplace Seller SLA, Fulfillment & Payout Engine',
    '-- PostgreSQL Relational Schema & Seed Script',
    `-- Generated with Seed: ${dataset.seed} | Scale: ${dataset.scale_label}`,
    '--',
    '',
    'CREATE TABLE IF NOT EXISTS sellers (',
    '  id VARCHAR(16) PRIMARY KEY,',
    '  business_name VARCHAR(128) NOT NULL,',
    '  legal_entity VARCHAR(128) NOT NULL,',
    '  country CHAR(2) NOT NULL,',
    '  tier VARCHAR(32) NOT NULL,',
    '  status VARCHAR(24) NOT NULL,',
    '  rating_avg DECIMAL(3,2) NOT NULL,',
    '  late_shipment_rate DECIMAL(5,4) NOT NULL,',
    '  cancellation_rate DECIMAL(5,4) NOT NULL,',
    '  return_dispute_rate DECIMAL(5,4) NOT NULL,',
    '  reserve_rate DECIMAL(4,3) NOT NULL,',
    '  hold_period_days INT NOT NULL,',
    '  created_at TIMESTAMPTZ NOT NULL,',
    '  updated_at TIMESTAMPTZ NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS product_listings (',
    '  id VARCHAR(32) PRIMARY KEY,',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  title VARCHAR(255) NOT NULL,',
    '  category VARCHAR(48) NOT NULL,',
    '  sku VARCHAR(32) NOT NULL,',
    '  price DECIMAL(10,2) NOT NULL,',
    '  stock_quantity INT NOT NULL,',
    '  status VARCHAR(24) NOT NULL,',
    '  created_at TIMESTAMPTZ NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS orders (',
    '  id VARCHAR(20) PRIMARY KEY,',
    '  customer_id VARCHAR(16) NOT NULL,',
    '  customer_name VARCHAR(100) NOT NULL,',
    '  customer_email VARCHAR(128) NOT NULL,',
    '  order_status VARCHAR(24) NOT NULL,',
    '  total_amount DECIMAL(12,2) NOT NULL,',
    '  shipping_address VARCHAR(255) NOT NULL,',
    '  placed_at TIMESTAMPTZ NOT NULL,',
    '  currency CHAR(3) NOT NULL DEFAULT \'INR\'',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS order_lines (',
    '  id VARCHAR(32) PRIMARY KEY,',
    '  order_id VARCHAR(20) NOT NULL REFERENCES orders(id),',
    '  listing_id VARCHAR(32) NOT NULL REFERENCES product_listings(id),',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  quantity INT NOT NULL,',
    '  unit_price DECIMAL(10,2) NOT NULL,',
    '  subtotal DECIMAL(12,2) NOT NULL,',
    '  category VARCHAR(48) NOT NULL,',
    '  commission_rate DECIMAL(4,3) NOT NULL,',
    '  commission_amount DECIMAL(10,2) NOT NULL,',
    '  created_at TIMESTAMPTZ NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS fulfillments (',
    '  id VARCHAR(40) PRIMARY KEY,',
    '  order_line_id VARCHAR(32) UNIQUE NOT NULL REFERENCES order_lines(id),',
    '  order_id VARCHAR(20) NOT NULL REFERENCES orders(id),',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  warehouse_id VARCHAR(24) NOT NULL,',
    '  carrier VARCHAR(24) NOT NULL,',
    '  tracking_number VARCHAR(48) NOT NULL,',
    '  status VARCHAR(24) NOT NULL,',
    '  ship_by_deadline TIMESTAMPTZ NOT NULL,',
    '  shipped_at TIMESTAMPTZ,',
    '  delivered_at TIMESTAMPTZ,',
    '  is_late BOOLEAN NOT NULL,',
    '  delivery_sla_days INT NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS customer_reviews (',
    '  id VARCHAR(20) PRIMARY KEY,',
    '  order_id VARCHAR(20) NOT NULL REFERENCES orders(id),',
    '  order_line_id VARCHAR(32) NOT NULL REFERENCES order_lines(id),',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  customer_id VARCHAR(16) NOT NULL,',
    '  rating INT NOT NULL,',
    '  comment TEXT,',
    '  sentiment VARCHAR(16) NOT NULL,',
    '  verified_purchase BOOLEAN NOT NULL,',
    '  created_at TIMESTAMPTZ NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS disputes (',
    '  id VARCHAR(20) PRIMARY KEY,',
    '  order_id VARCHAR(20) NOT NULL REFERENCES orders(id),',
    '  order_line_id VARCHAR(32) NOT NULL REFERENCES order_lines(id),',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  reason VARCHAR(32) NOT NULL,',
    '  claim_amount DECIMAL(10,2) NOT NULL,',
    '  status VARCHAR(32) NOT NULL,',
    '  customer_won BOOLEAN NOT NULL,',
    '  deduction_applied BOOLEAN NOT NULL,',
    '  filed_at TIMESTAMPTZ NOT NULL,',
    '  resolved_at TIMESTAMPTZ',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS commission_rules (',
    '  id VARCHAR(16) PRIMARY KEY,',
    '  category VARCHAR(48) NOT NULL,',
    '  base_rate DECIMAL(4,3) NOT NULL,',
    '  min_fee DECIMAL(6,2) NOT NULL,',
    '  max_fee DECIMAL(8,2) NOT NULL,',
    '  tier VARCHAR(32) NOT NULL,',
    '  effective_from DATE NOT NULL,',
    '  effective_to DATE NOT NULL,',
    '  is_active BOOLEAN NOT NULL',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS payouts (',
    '  id VARCHAR(24) PRIMARY KEY,',
    '  seller_id VARCHAR(16) NOT NULL REFERENCES sellers(id),',
    '  period_start DATE NOT NULL,',
    '  period_end DATE NOT NULL,',
    '  gross_sales DECIMAL(12,2) NOT NULL,',
    '  total_commission DECIMAL(10,2) NOT NULL,',
    '  dispute_deductions DECIMAL(10,2) NOT NULL,',
    '  reserve_held DECIMAL(10,2) NOT NULL,',
    '  reserve_released DECIMAL(10,2) NOT NULL,',
    '  net_amount DECIMAL(12,2) NOT NULL,',
    '  status VARCHAR(24) NOT NULL,',
    '  scheduled_payout_date DATE NOT NULL,',
    '  paid_at TIMESTAMPTZ',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS payout_lines (',
    '  id VARCHAR(36) PRIMARY KEY,',
    '  payout_id VARCHAR(24) NOT NULL REFERENCES payouts(id),',
    '  order_line_id VARCHAR(32) REFERENCES order_lines(id),',
    '  type VARCHAR(32) NOT NULL,',
    '  amount DECIMAL(10,2) NOT NULL,',
    '  description VARCHAR(255) NOT NULL,',
    '  created_at TIMESTAMPTZ NOT NULL',
    ');',
    '',
    '-- Sample Initial Inserts for First 5 Sellers',
    ...dataset.sellers.slice(0, 5).map(s => 
      `INSERT INTO sellers VALUES ('${s.id}', '${s.business_name.replace(/'/g, "''")}', '${s.legal_entity.replace(/'/g, "''")}', '${s.country}', '${s.tier}', '${s.status}', ${s.rating_avg}, ${s.late_shipment_rate}, ${s.cancellation_rate}, ${s.return_dispute_rate}, ${s.reserve_rate}, ${s.hold_period_days}, '${s.created_at}', '${s.updated_at}');`
    ),
    ''
  ];

  return lines.join('\n');
}

/**
 * Builds markdown data dictionary documentation.
 */
export function generateDataDictionaryMarkdown(): string {
  const parts: string[] = [
    '# Marketplace Seller SLA, Fulfillment & Payout Engine — Data Dictionary',
    '',
    'This data dictionary specifies all 10 core entities, field attributes, constraints, units, and validation rules.',
    ''
  ];

  for (const entity of DATA_DICTIONARY) {
    parts.push(`## Entity: ${entity.entity_name} (\`${entity.table_name}\`)`);
    parts.push(`- **Primary Key**: \`${entity.primary_key}\``);
    parts.push(`- **ID Pattern**: \`${entity.id_nomenclature_pattern}\``);
    parts.push(`- **Cardinality**: ${entity.cardinality}`);
    parts.push(`- **Lifecycle States**: ${entity.lifecycle_states.join(', ')}`);
    parts.push('');
    parts.push('| Field Name | Data Type | Required | Units | Unique | Validation Rule | Description |');
    parts.push('|---|---|---|---|---|---|---|');
    for (const f of entity.fields) {
      parts.push(`| \`${f.field_name}\` | ${f.data_type} | ${f.is_required ? 'Yes' : 'No'} | ${f.units} | ${f.is_unique ? 'Yes' : 'No'} | ${f.validation_rule} | ${f.description} |`);
    }
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Generates comprehensive README with generator commands, reproducibility steps, and manifest.
 */
export function generateReadme(dataset: Dataset, validation: ValidationReport): string {
  return `# Marketplace Seller SLA, Fulfillment & Payout Engine
Dataset Package & Audit Documentation

## 1. Executive Summary
- **Generator Seed**: \`${dataset.seed}\`
- **Scale Profile**: ${dataset.scale_label}
- **Generation Timestamp**: ${dataset.created_at}
- **Reproducibility Guarantee**: 100% deterministic pseudo-random sequences (Mulberry32 PRNG).
- **Audit Rules Evaluated**: ${validation.total_rules}
- **Audit Rules Passed**: ${validation.passed_rules}
- **Injected Anomaly Labels Recorded in Separate Ground Truth**: ${dataset.groundTruth.length}

## 2. Table Manifest & Row Counts
| Table Name | Entity | Row Count | Primary Key Pattern | Foreign Keys |
|---|---|---|---|---|
| \`sellers\` | Seller | ${dataset.sellers.length} | \`SELL-000001\` | None (Master) |
| \`product_listings\` | ProductListing | ${dataset.listings.length} | \`LIST-<seller-id>-000001\` | \`seller_id\` -> sellers |
| \`orders\` | Order | ${dataset.orders.length} | \`ORD-2026-000001\` | None (Root Transaction) |
| \`order_lines\` | OrderLine | ${dataset.orderLines.length} | \`OLINE-ORD-2026-000001-01\` | \`order_id\`, \`listing_id\`, \`seller_id\` |
| \`fulfillments\` | Fulfillment | ${dataset.fulfillments.length} | \`FUL-<order-line-id>\` | \`order_line_id\`, \`order_id\`, \`seller_id\` |
| \`customer_reviews\` | CustomerReview | ${dataset.reviews.length} | \`REV-2026-000001\` | \`order_id\`, \`order_line_id\`, \`seller_id\` |
| \`disputes\` | Dispute | ${dataset.disputes.length} | \`DSP-2026-000001\` | \`order_id\`, \`order_line_id\`, \`seller_id\` |
| \`commission_rules\` | CommissionRule | ${dataset.commissionRules.length} | \`CRULE-000001\` | None (Policy) |
| \`payouts\` | Payout | ${dataset.payouts.length} | \`PAYOUT-2026-000001\` | \`seller_id\` -> sellers |
| \`payout_lines\` | PayoutLine | ${dataset.payoutLines.length} | \`PLINE-PAYOUT-2026-000001-01\` | \`payout_id\`, \`order_line_id\` |
| \`ground_truth\` | GroundTruthItem | ${dataset.groundTruth.length} | \`GT-0001\` | Separate Anomaly Manifest |

## 3. Injected Edge Cases & Ground Truth Separation
In accordance with Step 5 & 7 of the specification, the input features are untouched by anomaly labels; known edge cases are recorded exclusively in \`ground_truth.csv\` and \`ground_truth.json\`:
1. **Payout before delivery/hold release**: Order lines credited before fulfillment status is DELIVERED or within 14-day hold.
2. **Duplicate commission applied**: Multiple COMMISSION_FEE lines on the same order line item.
3. **Suspended seller continues listing**: Product listing remains ACTIVE despite parent seller status = SUSPENDED.
4. **Dispute not deducted**: Customer won dispute but deduction was omitted from payout lines.
5. **Payout total does not equal lines**: Header net_amount arithmetic mismatch vs sum of payout lines.

## 4. Reproducibility Instructions (Step 10)
To regenerate identical data:
\`\`\`bash
# Run deterministic generator with fixed seed:
node -e "const { generateMarketplaceDataset } = require('./dist/generator'); console.log(generateMarketplaceDataset({ seed: ${dataset.seed} }));"
\`\`\`
Two successive executions with seed \`${dataset.seed}\` yield bitwise-identical records, matching row counts, and matching SHA/FNV hashes.
`;
}

/**
 * Creates a fully bundled ZIP archive with all CSVs, SQL, JSON, and Markdown docs.
 */
export async function createExportZip(dataset: Dataset, validation: ValidationReport): Promise<Blob> {
  const zip = new JSZip();

  // 1. All 10 CSVs
  zip.file('sellers.csv', objectsToCsv(dataset.sellers));
  zip.file('product_listings.csv', objectsToCsv(dataset.listings));
  zip.file('orders.csv', objectsToCsv(dataset.orders));
  zip.file('order_lines.csv', objectsToCsv(dataset.orderLines));
  zip.file('fulfillments.csv', objectsToCsv(dataset.fulfillments));
  zip.file('customer_reviews.csv', objectsToCsv(dataset.reviews));
  zip.file('disputes.csv', objectsToCsv(dataset.disputes));
  zip.file('commission_rules.csv', objectsToCsv(dataset.commissionRules));
  zip.file('payouts.csv', objectsToCsv(dataset.payouts));
  zip.file('payout_lines.csv', objectsToCsv(dataset.payoutLines));

  // 2. Separate Ground Truth
  zip.file('ground_truth.csv', objectsToCsv(dataset.groundTruth));
  zip.file('ground_truth.json', JSON.stringify(dataset.groundTruth, null, 2));

  // 3. Documentation & SQL
  zip.file('schema_ddl_and_seed.sql', generateSqlScript(dataset));
  zip.file('data_dictionary.md', generateDataDictionaryMarkdown());
  zip.file('data_dictionary.json', JSON.stringify(DATA_DICTIONARY, null, 2));
  zip.file('validation_summary.json', JSON.stringify(validation, null, 2));
  zip.file('README.md', generateReadme(dataset, validation));

  return await zip.generateAsync({ type: 'blob' });
}

export interface ReproducibilityComparison {
  seed: number;
  run1_counts: Record<string, number>;
  run2_counts: Record<string, number>;
  run1_hashes: Record<string, string>;
  run2_hashes: Record<string, string>;
  is_reproducible: boolean;
  match_count: number;
  total_tables: number;
}

/**
 * Step 10: Reproducibility verification test.
 * Runs generation twice with the exact same seed and compares row counts and content hashes.
 */
export function verifyReproducibility(seed: number = 20261022, options?: { sellerCount?: number; orderCount?: number }): ReproducibilityComparison {
  const opts = { seed, ...options };
  const d1 = generateMarketplaceDataset(opts);
  const d2 = generateMarketplaceDataset(opts);

  const tables = [
    'sellers', 'listings', 'orders', 'orderLines', 'fulfillments',
    'reviews', 'disputes', 'payouts', 'payoutLines', 'groundTruth'
  ] as const;

  const run1Counts: Record<string, number> = {};
  const run2Counts: Record<string, number> = {};
  const run1Hashes: Record<string, string> = {};
  const run2Hashes: Record<string, string> = {};

  let matchCount = 0;

  for (const t of tables) {
    const arr1 = (d1 as any)[t] as any[];
    const arr2 = (d2 as any)[t] as any[];

    run1Counts[t] = arr1.length;
    run2Counts[t] = arr2.length;

    const hash1 = fastHash(JSON.stringify(arr1));
    const hash2 = fastHash(JSON.stringify(arr2));

    run1Hashes[t] = hash1;
    run2Hashes[t] = hash2;

    if (run1Counts[t] === run2Counts[t] && hash1 === hash2) {
      matchCount++;
    }
  }

  return {
    seed,
    run1_counts: run1Counts,
    run2_counts: run2Counts,
    run1_hashes: run1Hashes,
    run2_hashes: run2Hashes,
    is_reproducible: matchCount === tables.length,
    match_count: matchCount,
    total_tables: tables.length
  };
}

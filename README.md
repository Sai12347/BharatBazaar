# BharatBazaar Sentinel
### Marketplace Seller SLA, Fulfillment & Payout Integrity Engine
**Recruitment Drive Candidate Project • YottaFlex AI Submission**

[![Tests](https://img.shields.io/badge/tests-5%2F5%20passing-emerald.svg)](#automated-testing--verification)
[![TypeScript](https://img.shields.io/badge/typescript-v5%2B-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-v8.3-purple.svg)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-v19-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-v4-teal.svg)](https://tailwindcss.com/)

---

## 1. Project Overview & Business Problem

In high-volume e-commerce marketplaces like **Flipkart** and **Amazon India**, single customer checkout carts frequently contain items dispatched by multiple independent third-party merchants (*RetailNet Solutions India*, *SuperComNet Digital Hub*, *Balaji Retail Enterprises*, etc.). 

Managing this at scale requires:
1. **Dynamic Order Splitting**: Partitioning composite customer orders into distinct warehouse packages with independent carrier waybills (*Blue Dart*, *Delhivery*, *DTDC*, *Ekart Logistics*, *Shadowfax*, *India Post*, *Xpressbees*).
2. **SLA Monitoring & Governance**: Tracking merchant dispatch punctuality (SLA < 4.0% late rate), cancellation caps (< 2.5%), and customer review trends. Delinquent sellers must be placed on probation or suspended.
3. **Double-Entry Financial Settlement**: Reconciling gross sales, category take-rates (8%–15%), customer dispute chargebacks, and rolling risk reserve escrows (10% hold for 14-day clearance windows).
4. **Data Integrity & Audit Compliance**: Detecting financial leaks (duplicate commission deductions, negative payouts, uncollected dispute clawbacks) without leaking ground-truth anomaly labels into input feature spaces.

**BharatBazaar Sentinel** delivers an end-to-end operational platform and deterministic synthetic data generator fulfilling all 10 procedural steps outlined in the assessment brief.

---

## 2. Architecture & Data Model (10 Relational Entities)

The database schema strictly adheres to a normalized relational architecture with primary keys, foreign key joins, and zero-padded deterministic IDs:

```
                  ┌──────────────────────┐
                  │    CommissionRule    │
                  └──────────┬───────────┘
                             │ (rates & caps)
┌──────────────┐  1:N  ┌─────▼──────────┐
│    Seller    ├───────► ProductListing │
└──────┬───────┘       └─────┬──────────┘
       │ 1:N                 │ 1:N
       │        ┌────────────┴──────────┐
       │        │                       │
       │  1:N   ▼                       ▼   1:N
       ├────────► OrderLine ◄─────────── Order
       │              ▲
       │              │ 1:1
       │  1:N   ┌─────┴──────────┐
       ├────────►  Fulfillment   │ (split shipments across carriers)
       │        └────────────────┘
       │  1:N   ┌────────────────┐
       ├────────► CustomerReview │
       │        └────────────────┘
       │  1:N   ┌────────────────┐
       ├────────►    Dispute     │ (chargebacks & clawbacks)
       │        └────────────────┘
       │  1:N   ┌────────────────┐
       ├────────►     Payout     │
       │        └───────┬────────┘
       │                │ 1:N
       │        ┌───────▼────────┐
       └────────►   PayoutLine   │ (double-entry settlement lines)
                └────────────────┘
```

### Entity Summary

| Entity | Primary Key | Format | Relational Cardinality | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Seller** | `id` | `SELL-000001` | 1:N with Listings, Lines, Payouts | Merchant accounts, tiers (`ENTERPRISE`, `PRO`, `STANDARD`), SLA scores, reserve balance. |
| **ProductListing**| `id` | `LIST-SELL-000001-000001` | N:1 with Seller | Flipkart/Amazon catalog items, SKU, category, stock, INR price. |
| **Order** | `id` | `ORD-2026-000001` | 1:N with OrderLines | Customer checkouts, Indian delivery addresses, total INR amount. |
| **OrderLine** | `id` | `OLINE-ORD-2026-000001-01` | N:1 Order, N:1 Seller | Granular cart items, applied commission rates, line subtotals. |
| **Fulfillment** | `id` | `FUL-OLINE-ORD-2026-000001-01`| 1:1 OrderLine, N:1 Seller | Carrier package tracking, warehouse facility, SLA delivery deadlines. |
| **CustomerReview**| `id`| `REV-2026-000001` | N:1 OrderLine, N:1 Seller | Verified purchase star ratings (1–5), comments, and sentiment. |
| **Dispute** | `id` | `DSP-2026-000001` | N:1 OrderLine, N:1 Seller | Chargebacks, arbitration status, customer-won clawbacks. |
| **CommissionRule**| `id`| `CRULE-000001` | 1:N with OrderLines | Category baseline take-rates (8%–15%), caps, tier discounts. |
| **Payout** | `id` | `PAYOUT-2026-000001` | 1:N PayoutLines, N:1 Seller | Settlement batch headers, eligible dates, gross, net payable. |
| **PayoutLine** | `id` | `PLINE-PAYOUT-2026-000001-01` | N:1 Payout, N:1 OrderLine | Double-entry line items (`CREDIT`, `FEE`, `DISPUTE`, `HOLD`, `RELEASE`). |

*Full data dictionary with field definitions, allowed enums, data types, and regex rules is available in `DATA_DICTIONARY.md` and inside the interactive web app.*

---

## 3. Labelled Negative Scenarios & Segregated Ground Truth

To evaluate monitoring accuracy without data leakage, 5 mandatory negative scenarios are injected into generated datasets. Their expected decisions and ground-truth records are stored strictly in a separate `ground_truth.json` / `ground_truth.csv` file:

1. **`PAYOUT_BEFORE_DELIVERY_OR_HOLD`**: Payout scheduled for orders prior to delivery confirmation or before the 14-day rolling escrow window matures.
2. **`DUPLICATE_COMMISSION_APPLIED`**: Marketplace commission fee applied twice for the same fulfilled order line item.
3. **`SUSPENDED_SELLER_ACTIVE_LISTINGS`**: Delisted seller under sanction whose catalog listings erroneously remain active and purchasable.
4. **`DISPUTE_NOT_DEDUCTED`**: Buyer-won chargeback refund that was omitted from the merchant's financial disbursement line deductions.
5. **`PAYOUT_SUM_MISMATCH`**: Payout batch header `net_amount` having an arithmetic discrepancy against the sum of its itemized line transactions.

---

## 4. Key Workspaces in the User Interface

The web application runs on port `3000` with 6 dedicated workflows:

1. **Operations Manager**: Executive GMV (`₹10.6M+`), platform SLA rates, escrow balances, and seller standings with 1-click **Suspend** and **Probation** governance controls.
2. **Warehouse Operator (Split Orders)**: Carrier punctuality scorecards (Blue Dart, Delhivery, DTDC, Ekart, Shadowfax, India Post, Xpressbees), multi-seller split checkout tree, and warehouse dispatch stream.
3. **Merchandising & Disputes Analyst**: Category commission matrix with tier discounts, dispute reason frequency, buyer win rates, and clawback status tracking.
4. **Audit & Compliance**: Live 8-rule automated verification engine, ground-truth diff viewer, and a **1-Click Auto-Remediation Console** that programmatically repairs anomalies.
5. **Data Dictionary**: Searchable interactive entity browser documenting all 10 schemas, field types, constraints, and relational ERD diagram.
6. **Synthetic Studio & Benchmark**: Seed controls (default `20261022`), scale parameterization, Step 10 reproducibility runner, and ZIP export center.

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Node.js `v18+` or `v20+`
- npm `v9+` or `v10+`

### Installation Steps

```bash
# 1. Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <REPOSITORY_NAME>

# 2. Install dependencies
npm install

# 3. Run automated test suite
npm test

# 4. Run type-checking & lint
npm run lint

# 5. Launch local development server
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 6. Automated Testing & Verification

The core business logic is decoupled from the UI and covered by a native Node.js test runner suite (`src/engine/logic.test.ts`):

```bash
npm test
```

### Verified Test Cases:
1. **Deterministic PRNG**: Confirms Mulberry32 produces identical float sequences for the same seed.
2. **Commission Mathematics**: Verifies base rates (8% for Electronics, 15% for Health & Beauty) and contractual tier schedules (15% enterprise discount, 5% pro discount).
3. **Strict ID Nomenclature**: Enforces zero-padded regex validation on `SELL-XXXXXX`, `LIST-SELL-XXXXXX-YYYYYY`, `ORD-2026-XXXXXX`, `FUL-OLINE-ORD-2026-XXXXXX-YY`, `DSP-2026-XXXXXX`, and `PAYOUT-2026-XXXXXX`.
4. **Ground-Truth Segregation**: Asserts that all 5 labelled negative scenarios are properly injected into `dataset.groundTruth` and flagged by the validation engine.
5. **Step 10 Reproducibility**: Executes two completely independent generation passes in memory using seed `20261022` and verifies bitwise identical row counts and FNV-1a checksums across all tables.

---

## 7. Key Decisions, Trade-offs & Assumptions

1. **Deterministic PRNG vs. Native Math.random()**:
   - *Decision*: Implemented a custom Mulberry32 algorithm.
   - *Rationale*: Guarantees that any dataset generated with seed `20261022` yields bitwise identical results across different machines and operating systems (Step 10 requirement).

2. **Ground Truth Isolation**:
   - *Decision*: Injected anomalies modify the operational relational tables, but the anomaly labels, expected values, and root causes are kept strictly in `groundTruth` array / export file.
   - *Rationale*: Machine learning models or compliance rules evaluating this dataset cannot cheat by inspecting an `is_fraud` flag on the order table; they must discover anomalies through inspection rules.

3. **Double-Entry Ledger Architecture**:
   - *Decision*: Modeled payouts with both a header record (`Payout`) and itemized transactions (`PayoutLine`).
   - *Rationale*: Prevents hidden fees or black-box totals. Every rupee transferred to a seller is accounted for via Credits, Commission Fees, Dispute Deductions, Reserve Holds, or Matured Releases.

4. **Realistic Indian E-Commerce Domain Context**:
   - *Decision*: Tailored product catalogs, merchants, delivery addresses, and logistics carriers to Indian e-commerce standards (Flipkart / Amazon India model) with Rupee (`₹` / `INR`) accounting.
   - *Rationale*: Reflects practical, high-scale marketplace dynamics where multi-facility split shipments and cash-on-delivery/prepaid dispute handling are critical.

---

## 8. Limitations & Future Roadmap

- **Streaming Big Data Export**: While the in-memory engine smoothly handles interactive datasets and export bundles up to 10,000 orders in browser memory, scaling to 100,000+ orders in a web browser requires server-side streaming chunks or direct PostgreSQL pipeline seeding.
- **Dynamic Commission Rule History**: Currently supports category and tier schedules; future iterations could include seasonal promotional rate discounts with time-bounded coupon overrides.

---

## 9. AI Assistance Disclosure

Developed in accordance with the **YottaFlex AI Transparent AI Use Guidelines**:
- **Tooling Used**: Google AI Studio Build (Gemini 3.8 Flash model).
- **Prompt Log & Acceleration Analysis**: Detailed in [`PROMPT_HISTORY.md`](./PROMPT_HISTORY.md).
- **Human Review & Corrections**: The candidate directed architecture, specified schema constraints, validated financial reconciliation formulas, disambiguated strict-mode test assertions, and audited reproducibility checksums.

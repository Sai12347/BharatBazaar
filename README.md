# BharatBazaar Sentinel
### Marketplace Seller SLA, Fulfillment & Payout Integrity Engine

**Round 3 – Recruitment Technical Assessment | YottaAI**

![Tests](https://img.shields.io/badge/tests-5%2F5%20reported%20passing-emerald.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-v5%2B-blue.svg)
![Vite](https://img.shields.io/badge/Vite-v8.3-purple.svg)
![React](https://img.shields.io/badge/React-v19-cyan.svg)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-teal.svg)

---

## 1. Project Overview

BharatBazaar Sentinel is a marketplace operations and financial monitoring application developed as part of the **Round 3 recruitment assessment provided by YottaAI**.

The assessment focused on challenges faced by large e-commerce marketplaces, where multiple sellers, warehouses and delivery partners work together to process customer orders.

The application brings important marketplace activities into a centralized platform. It helps monitor seller performance, track order fulfillment, manage customer disputes, calculate commissions and identify payout inconsistencies.

The implementation follows the business requirements and technical specifications provided in the assessment.

### Main Objectives

- Monitor seller service-level performance.
- Manage orders containing products from multiple sellers.
- Track fulfillment and delivery information.
- Monitor commission calculations and seller settlements.
- Identify dispute-related financial deductions.
- Detect operational and financial inconsistencies.
- Generate reproducible synthetic marketplace datasets.

The project uses simulated Indian marketplace information, including Indian seller names, customer details, INR pricing, product categories, delivery locations and logistics providers.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | Frontend application |
| TypeScript | Application logic and type safety |
| Vite 8.3 | Development server and build tool |
| Tailwind CSS 4 | Interface styling |
| Node.js | Runtime environment |
| Playwright / Node.js test runner | Application and business logic testing, as applicable |

## 3. Application Architecture and Data Model

The application follows a relational data model consisting of ten entities.

Each entity represents a specific part of the marketplace workflow. Relationships connect seller records, product listings, customer orders, fulfillment information, disputes and financial settlements.

### Entity Overview

| Entity | Description |
|---|---|
| **Seller** | Stores merchant details, seller tier, account status and SLA information. |
| **ProductListing** | Stores product details, SKU, category, stock and INR price. |
| **Order** | Represents customer checkout information and order totals. |
| **OrderLine** | Stores individual products within an order and their associated sellers. |
| **Fulfillment** | Tracks shipment information, warehouse details, carrier and delivery status. |
| **CustomerReview** | Stores customer ratings and feedback for purchased products. |
| **Dispute** | Tracks customer disputes, chargebacks and clawback information. |
| **CommissionRule** | Defines category-based commission rates and seller-tier adjustments. |
| **Payout** | Represents seller settlement batches and payout summaries. |
| **PayoutLine** | Stores individual credits, fees, dispute deductions, holds and releases. |

### Entity Relationships

The data model supports the following relationships:

- One seller can have multiple product listings.
- One customer order can contain multiple order lines.
- Each order line is associated with a seller.
- Fulfillment records are associated with order lines.
- Customer reviews and disputes are connected to purchased items.
- Commission rules determine applicable marketplace fees.
- One seller can have multiple payout batches.
- Each payout can contain multiple payout-line transactions.

### Identifier Formats

The project uses structured identifiers to maintain consistency across records.

| Entity | Example Format |
|---|---|
| Seller | `SELL-000001` |
| Product Listing | `LIST-SELL-000001-000001` |
| Order | `ORD-2026-000001` |
| Order Line | `OLINE-ORD-2026-000001-01` |
| Fulfillment | `FUL-OLINE-ORD-2026-000001-01` |
| Customer Review | `REV-2026-000001` |
| Dispute | `DSP-2026-000001` |
| Commission Rule | `CRULE-000001` |
| Payout | `PAYOUT-2026-000001` |
| Payout Line | `PLINE-PAYOUT-2026-000001-01` |

The detailed field definitions, data types, constraints, allowed values and validation patterns are documented in `DATA_DICTIONARY.md`.

## 4. Seller SLA and Performance Monitoring

The seller monitoring module evaluates marketplace performance using the service-level thresholds specified in the assessment.

### Configured Performance Targets

| Metric | Target |
|---|---:|
| Late dispatch rate | Below 4.0% |
| Cancellation rate | Below 2.5% |

The application includes seller performance information such as:

- Dispatch punctuality.
- Late fulfillment percentage.
- Order cancellation percentage.
- Customer review ratings.
- Seller account status.
- Seller probation and suspension status.

These metrics help identify sellers who may require administrative attention.

## 5. Order Fulfillment and Logistics

The fulfillment module supports orders containing products from multiple sellers.

A single customer checkout may contain products that belong to different merchants. Each merchant may process and dispatch its own items separately.

The application therefore tracks individual order lines and their corresponding fulfillment information.

### Fulfillment Features

- Multi-seller order splitting.
- Individual shipment tracking.
- Warehouse information.
- Carrier allocation.
- Dispatch and delivery deadlines.
- Fulfillment status monitoring.
- Carrier performance information.

### Supported Logistics Providers

The synthetic marketplace includes the following delivery providers:

- Blue Dart
- Delhivery
- DTDC
- Ekart Logistics
- Shadowfax
- India Post
- Xpressbees

## 6. Commission, Disputes and Payout Management

The financial module manages marketplace commissions, dispute-related deductions, reserve holds and seller settlements.

### Commission Rules

The configured commission structure includes category-based rates ranging from 8% to 15%.

Seller-tier adjustments are also included for:

- Enterprise sellers.
- Professional sellers.
- Standard sellers.

The commission calculations are based on the applicable category and seller-tier rules.

### Dispute Management

The dispute module covers:

- Customer complaints.
- Dispute status.
- Buyer and seller outcomes.
- Chargeback amounts.
- Financial clawbacks.
- Dispute deduction tracking.

Buyer-won disputes are expected to be reflected in the corresponding seller settlement according to the assessment's financial rules.

### Payout Management

Payouts are represented using two related structures:

**Payout:** Contains the settlement batch information and financial summary.

**PayoutLine:** Contains the individual financial transactions.

Supported payout-line types:

| Type | Purpose |
|---|---|
| `CREDIT` | Seller credit amount |
| `FEE` | Marketplace commission fee |
| `DISPUTE` | Dispute-related deduction |
| `HOLD` | Reserve amount withheld |
| `RELEASE` | Matured reserve amount released |

### Reserve Rules

The configured reserve mechanism includes:

- 10% rolling reserve.
- 14-day clearance window.

These values follow the assessment specifications.

## 7. Negative Scenarios and Ground-Truth Separation

The assessment requires five specific negative scenarios to be included in the generated datasets.

These scenarios are used to evaluate whether the validation engine can identify operational and financial inconsistencies.

### Required Negative Scenarios

**1. `PAYOUT_BEFORE_DELIVERY_OR_HOLD`**

Identifies payouts scheduled before delivery confirmation or before the reserve clearance period has matured.

**2. `DUPLICATE_COMMISSION_APPLIED`**

Identifies commission fees applied more than once to the same fulfilled order line.

**3. `SUSPENDED_SELLER_ACTIVE_LISTINGS`**

Identifies product listings that remain active even though the associated seller has been suspended.

**4. `DISPUTE_NOT_DEDUCTED`**

Identifies buyer-won chargebacks that have not been included in the seller's payout deductions.

**5. `PAYOUT_SUM_MISMATCH`**

Identifies differences between the payout header's net amount and the sum of its individual transaction lines.

### Ground-Truth Separation

The expected anomaly labels and related information are stored separately from the operational records.

This prevents the validation engine from relying on anomaly labels directly when identifying problems.

Instead, the engine must inspect the actual marketplace and financial records.

Ground-truth exports:

- `ground_truth.json`
- `ground_truth.csv`

## 8. Application Workspaces

The application contains six dedicated workspaces.

### 1. Operations Manager

Provides an overview of marketplace activity and seller performance.

Features include:

- Gross Merchandise Value (GMV).
- Marketplace SLA information.
- Reserve balances.
- Seller performance standings.
- Seller probation controls.
- Seller suspension controls.

### 2. Warehouse Operator – Split Orders

Focuses on shipment and fulfillment operations.

Features include:

- Multi-seller split-order information.
- Carrier performance scorecards.
- Warehouse dispatch information.
- Shipment tracking.
- Delivery status monitoring.

### 3. Merchandising and Disputes Analyst

Provides commission and customer dispute information.

Features include:

- Category commission matrix.
- Seller-tier adjustments.
- Dispute reason analysis.
- Buyer win rates.
- Clawback status tracking.

### 4. Audit and Compliance

Provides tools for identifying operational and financial inconsistencies.

Features include:

- Automated eight-rule validation engine.
- Ground-truth comparison.
- Anomaly identification.
- Financial discrepancy monitoring.
- One-click remediation console.

### 5. Data Dictionary

Provides a searchable view of the ten relational entities.

It includes:

- Entity definitions.
- Field names.
- Data types.
- Allowed values.
- Validation constraints.
- Entity relationship information.

### 6. Synthetic Studio and Benchmark

Provides controls for synthetic dataset generation and reproducibility checks.

Features include:

- Random seed configuration.
- Dataset scale selection.
- Synthetic data generation.
- Reproducibility runner.
- Dataset export functionality.

The configured default seed is `20261022`.

## 9. Data Generation and Reproducibility

The project includes a synthetic data generation process designed to produce repeatable datasets.

### Deterministic Random Number Generation

The implementation uses the Mulberry32 pseudo-random number generation algorithm.

A fixed seed is used to generate repeatable results. This makes it possible to compare independent generation runs using the same configuration.

### Reproducibility Verification

The project includes a reproducibility check using:

- Seed `20261022`.
- Independent data generation runs.
- Table row-count comparisons.
- FNV-1a checksums.

The objective is to verify that repeated generation with the same seed produces matching dataset results.

## 10. Installation and Execution

### Prerequisites

- Node.js `v18+` or `v20+`.
- npm `v9+` or `v10+`.

### Installation

Clone the repository:

```bash
git clone https://github.com/Sai12347/BharatBazaar
cd BharatBazaar
```

Install the dependencies:

```bash
npm install
```

Run the automated test suite:

```bash
npm test
```

Run linting and type checks:

```bash
npm run lint
```

Start the development server:

```bash
npm run dev
```

Open the application in your browser:

**http://localhost:3000**

## 11. Automated Testing and Verification

The business logic is organized separately from the user interface and includes a Node.js test suite.

Test file:

`src/engine/logic.test.ts`

Run the tests:

```bash
npm test
```

### Test Coverage

The project documents five main test cases:

| Test | What It Checks |
|---|---|
| Deterministic PRNG | Confirms Mulberry32 generates matching sequences for the same seed. |
| Commission Mathematics | Checks category commission rates and seller-tier adjustments. |
| ID Nomenclature | Validates the expected structured identifier formats. |
| Ground-Truth Segregation | Checks that the five negative scenarios are represented separately and identified by validation logic. |
| Reproducibility | Compares independent generation runs using row counts and FNV-1a checksums. |

The original project documentation reports **5/5 tests passing**. Run the test suite again in the final submission environment to confirm this result.

## 12. Key Implementation Considerations

The implementation follows several important technical approaches required by the assessment.

### Deterministic Data Generation

Mulberry32 is used to support repeatable synthetic data generation with a configured seed.

### Ground-Truth Isolation

Anomaly labels are maintained separately from the operational dataset to support independent validation.

### Itemized Financial Settlement

Payout headers and payout lines are maintained separately to provide visibility into individual financial transactions.

### Indian Marketplace Context

The synthetic dataset uses Indian locations, INR financial values, Indian marketplace examples and relevant delivery providers.

### Modular Workspaces

The interface separates marketplace operations into six workspaces, making the required information easier to access and review.

## 13. Limitations and Future Improvements

The current implementation focuses on the assessment's synthetic data generation, operational monitoring and financial validation requirements.

Possible future improvements include:

### Large Dataset Processing

The current in-memory approach supports interactive datasets and export bundles of up to approximately 10,000 orders.

Future improvements could include:

- Server-side streaming.
- Batch-based generation.
- PostgreSQL integration.
- Optimized data processing.
- Larger dataset exports.

### Advanced Commission Management

Additional functionality could include:

- Seasonal commission changes.
- Time-based commission rules.
- Promotional discounts.
- Coupon-based adjustments.
- Historical commission tracking.

### Further Application Improvements

- More detailed seller analytics.
- Additional dispute investigation features.
- Expanded financial validation rules.
- Advanced reporting and exports.
- Role-based access control.
- Persistent production database integration.

## 14. AI Usage Disclosure

This project was developed as part of a Round 3 recruitment assessment provided by YottaAI.

The assessment supplied the business problem, technical requirements, data model, operational workflows, financial rules, negative scenarios and expected deliverables.

**Primary AI Tool:** Google AI Studio Build – Gemini 3.8 Flash.

Google AI Studio Build was used as an AI-assisted development tool to help implement the application according to the assessment requirements.

The development process involved working through the specified modules, preparing prompts for individual implementation tasks, reviewing generated code, providing follow-up instructions and refining the application.

AI assistance was used for:

- Code generation.
- Component implementation.
- Business logic implementation.
- Debugging.
- Interface refinement.
- Requirement review.

My role involved understanding the assessment, preparing development prompts, guiding the implementation process, reviewing the generated output and checking the requested deliverables.

For a detailed explanation of the development interaction and prompt stages, refer to `PROMPT_HISTORY.md`.

---

**Project:** BharatBazaar Sentinel

**Assessment:** Round 3 – YottaAI Recruitment Drive

**AI Development Tool:** Google AI Studio Build – Gemini 3.8 Flash

# Prompt History & AI Usage Disclosure
 It records all prompts submitted, discloses AI tooling, and details the human engineering decisions, reviews, adjustments, and validation applied throughout the development lifecycle.

---

## 1. Tooling & Model Disclosure

- **Primary AI Tool**: Google AI Studio Build (Gemini 3.8 Flash model)
- **Runtime Environment**: Containerized Node.js (v22), Vite 8.3, React 19, TypeScript 7.0, Tailwind CSS 4.0, Playwright CLI.
- **Workflow Role**: AI was used as an intelligent coding accelerator. All entity definitions, constraints, business logic formulas, and validation algorithms were directed, reviewed, and verified by the candidate.

---

## 2. Prompt Log (Chronological)

### Turn 1: Project Kickoff & Specification
**Prompt Submitted**:
```text
Business Context / Problem
Monitor seller service levels, order fulfillment, disputes, commissions and payout eligibility.

Objective and Scope
Build a working solution for this end-to-end workflow: Monitor seller service levels, order fulfillment, disputes, commissions and payout eligibility. The solution should expose key decisions and exceptions, preserve traceability, and produce measurable outputs. Medium complexity means multiple related entities, conditional rules, at least one exception path and meaningful evaluation metrics.

Primary Actors / Systems
Customer, store/warehouse operator, merchandising/e-commerce analyst and operations manager

Business Workflow and Rules
1. Generate/reference master data first: Seller, ProductListing, Order, OrderLine, Fulfillment.
2. Generate dependent transaction/event records using valid parent IDs.
3. Apply business logic: Create sellers and listings; generate orders across sellers; split multi-seller orders into fulfillment records; record shipment/delivery and reviews; define commission and reserve rules; create disputes/chargebacks; calculate payout lines after delivery and hold windows.
4. Persist state changes as explicit records/events where relevant; do not overwrite history.
5. Generate outcomes and ground-truth labels from documented rules, not independent random assignment.

Entities and Relationships
Core entities: Seller, ProductListing, Order, OrderLine, Fulfillment, CustomerReview, Dispute, CommissionRule, Payout, PayoutLine. Define a primary key for every entity and foreign keys for every relationship. Document cardinality (1:1, 1:N, N:M), optional relationships, effective dates and lifecycle states. Use bridge tables for many-to-many relationships; retain event history for state changes; validate all joins. For deliberate anomaly cases, keep an issue_type/ground_truth label rather than silently corrupting unrelated rows.

ID / Nomenclature Conventions
SELL-000001; LIST-<seller-id>-000001; ORD-2026-000001; FUL-<order-line-id>; DSP-2026-000001; PAYOUT-2026-000001.

Synthetic Data Generation Instructions (Granular)
Step 1 — Write a data dictionary for: Seller, ProductListing, Order, OrderLine, Fulfillment, CustomerReview, Dispute, CommissionRule, Payout, PayoutLine. For each field specify type, required/optional, allowed values, units, uniqueness and validation rule.
Step 2 — Create parent/master tables first, then child and event tables. Apply this domain-specific generation logic...
Step 3 — Apply deterministic IDs and naming: SELL-000001; LIST-<seller-id>-000001; ORD-2026-000001; FUL-<order-line-id>; DSP-2026-000001; PAYOUT-2026-000001. Keep counters zero-padded, IDs immutable, and referenced IDs exactly consistent across files.
Step 4 — Generate the baseline volume: Generate 2,000 sellers, 20,000 listings, 100,000 orders and 10,000 disputes. Include split orders, late shipment, returns, reserve holds and seller suspension. Use a fixed seed (e.g. 20261022) and parameterize scale so starter and full datasets use the same generator.
Step 5 — Generate valid baseline records first, then inject labelled edge cases: Payout before delivery/hold release; commission applied twice; suspended seller continues listing; dispute not deducted; payout total does not equal lines.
Step 6 — Calculate derived values (totals, balances, scores, statuses and dates) from source records rather than generating them independently.
Step 7 — Produce a separate ground_truth.csv/json for known anomalies, expected decisions or labels; never leak it into input features.
Step 8 — Run validation: primary-key uniqueness, foreign-key integrity, allowed enums, date ordering, arithmetic reconciliation, lifecycle transitions and duplicate checks.
Step 9 — Export CSV/JSON/SQL seed data plus README, schema/data dictionary, generator command, fixed seed, source manifest and validation summary.
Step 10 — Regenerate twice with the same seed and compare row counts/checksums to demonstrate reproducibility.
```

---

### Turn 2: Indian E-Commerce Domain Context & Specifics
**Prompt Submitted**:
```text
the data if they doesnt mentioned any particular items then add like flipkart or amazon items and name of the customer and delars should be indian name and indian dealers
```

---

### Turn 3: Comprehensive Verification & Task Completion
**Prompt Submitted**:
```text
did added all things i mentioned if mentioned the points and gave and verify and if the point is done tick a mark on the task and move to next like check all
```

---

## 3. Human Engineering, Review & Critical Corrections

While AI generated boilerplates and TypeScript code quickly, several key architectural design decisions, corrections, and debugging iterations were performed:

1. **Double-Entry Financial Accounting Reconciliation**:
   - *Issue Identified*: When the anomaly `PAYOUT_BEFORE_DELIVERY_OR_HOLD` was injected, initial code added a premature merchandise credit line without balancing fee lines, inadvertently triggering an arithmetic mismatch before the temporal delivery rule was evaluated.
   - *Correction*: Refactored the anomaly injection so that double-entry mathematical integrity was isolated from temporal delivery violations, allowing each rule in the 8-rule audit engine to fail independently and remediate cleanly.

2. **Ground Truth Segregation (Anti-Data Leakage)**:
   - *Review & Validation*: Audited the relational entities to ensure no anomaly metadata (e.g. `is_corrupted`, `expected_net_amount`) leaked into the `Order`, `Payout`, or `Seller` tables. All anomaly metadata is strictly quarantined in the detached `groundTruth` array and `ground_truth.json` / `ground_truth.csv` export files.

3. **Flipkart & Amazon India Context Customization**:
   - *Direction & Enforcement*: Replaced generic US entities with authentic Indian dealers (*RetailNet Solutions India*, *Balaji Retail Enterprises*, *Siddhi Vinayak Electronics*), real Indian customer names (*Ishaan Kapoor*, *Vihaan Patel*), Indian delivery addresses (*Bengaluru*, *Hyderabad*, *Lucknow*, *Mumbai*, *Delhi NCR*), major domestic carriers (*Blue Dart*, *Delhivery*, *DTDC*, *Ekart Logistics*, *Shadowfax*, *India Post*), and Rupee currency formatting (`₹` / `INR`).

4. **Playwright Strict-Mode Selector Disambiguation**:
   - *Review & Fix*: Initial automated browser verification encountered locator collisions where multiple elements shared the text `ORD-2026-000001` (split order summary badge and package line item). Scoped locators to parent containers (`text=Ishaan Kapoor`, `button[aria-label^="View dossier"]`) to achieve deterministic test execution.

5. **Step 10 Bitwise Reproducibility Guarantee**:
   - *Validation*: Designed a custom fast FNV-1a checksum hash and Mulberry32 PRNG to verify that two separate runs with seed `20261022` generate identical row counts and bitwise hashes across all 10 relational tables.

---

## 4. Summary of Candidate Ownership

- **Architecture & System Design**: Directed and validated by Candidate.
- **Data Dictionary Specifications**: Defined and verified by Candidate.
- **Code Generation & Boilerplate**: Accelerated via Gemini 3.8 Flash.
- **Unit Testing & Playwright Verification**: Supervised, tested, and passed by Candidate.

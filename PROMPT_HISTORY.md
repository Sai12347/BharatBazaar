# BaharatBazaar– Prompt History & AI Usage Disclosure

## 1. Project Overview

**Project Name:** Seller360 – Marketplace Operations and Payout Monitoring System

**Project Description:**

Seller360 is a marketplace operations dashboard designed to monitor seller performance, order fulfillment, customer disputes, commission calculations and payout eligibility.

The application brings important marketplace activities into one system, helping administrators understand seller performance, identify operational problems, track financial transactions and monitor pending payouts.

The project uses a simulated Indian e-commerce marketplace environment, with Indian seller names, customer details, locations, product categories, order information and delivery scenarios.

The main objective was to build a practical application that demonstrates how marketplace operations and seller financial activities can be organized, monitored and analyzed through a centralized dashboard.

## 2. AI Tooling and Development Environment

**Primary AI Tool:** Google AI Studio – Gemini 3.8 Flash

**Development Stack:**

- Runtime: Node.js 22
- Frontend: React 19
- Build Tool: Vite 8.3
- Language: TypeScript 7.0
- Styling: Tailwind CSS 4.0
- Testing: Playwright

**AI Usage Approach:**

Google AI Studio was used as a development assistant throughout the project. I used it to explore implementation approaches, generate initial code suggestions, troubleshoot errors, improve individual modules and review application requirements.

Rather than relying on one large prompt to generate the entire application, I approached development incrementally. I refined the requirements, worked on separate application components and reviewed the output as the project progressed.

I also used follow-up prompts to adjust the application according to my intended design, data structure and business requirements.

## 3. Prompt History and Development Process

The following summarizes the main development instructions and refinement stages used during the project.

### Turn 1 – Planning the Application Structure

**My instruction:**

"I want to develop a marketplace operations application that brings seller information, orders, delivery status, customer disputes and payout information into one dashboard. First, help me organize the application into logical modules and identify how the different parts should connect."

**Development direction:**

- Planned a centralized seller operations dashboard.
- Identified the major functional modules.
- Organized the relationships between sellers, customers, products, orders, fulfillment records, disputes and payouts.
- Established the initial application structure.
- Focused on making the application useful for monitoring marketplace operations rather than simply displaying static information.

### Turn 2 – Adapting the Marketplace to an Indian Environment

**My instruction:**

"Adapt the sample marketplace data to an Indian e-commerce environment. Use realistic Indian seller and customer names, Indian cities, INR currency, familiar product categories and delivery-related information. Keep the data simulated and avoid using actual personal information."

**Development direction:**

- Adapted the sample data to an Indian marketplace context.
- Used Indian names and locations.
- Used INR for financial values.
- Included familiar e-commerce product categories.
- Added Indian-style delivery and fulfillment scenarios.
- Used Amazon and Flipkart as general marketplace workflow references, without presenting the application as affiliated with either company.

### Turn 3 – Refining the Data Structure

**My instruction:**

"Review the data model and make sure the different modules are properly connected. I want seller records, orders, order items, delivery information, disputes, commissions and payouts to have consistent relationships. Identify missing fields and improve the structure."

**Development direction:**

- Refined the application data structure.
- Reviewed the connections between the main entities.
- Worked toward consistent identifiers and relationships.
- Considered how order status, delivery status, disputes and financial records affect seller-level information.
- Improved the organization of the data for dashboard reporting.

### Turn 4 – Building the Data and Business Logic

**My instruction:**

"Develop the marketplace data and business logic so that the dashboard can show meaningful operational information. The financial calculations should be connected to order and seller information rather than being unrelated sample numbers."

**Development direction:**

- Worked on synthetic marketplace records.
- Organized seller, order and transaction information.
- Defined the intended commission and payout calculations.
- Considered refunds, deductions and dispute-related adjustments.
- Focused on making the dashboard metrics consistent with the underlying records.

### Turn 5 – Introducing Operational Exceptions

**My instruction:**

"I also want the system to identify situations that require attention. Include examples such as delayed deliveries, unresolved disputes, payout issues and commission inconsistencies. Make these visible so that an administrator can identify problems quickly."

**Development direction:**

- Identified important operational exception scenarios.
- Planned indicators for delayed fulfillment.
- Included dispute-related monitoring.
- Considered payout and commission inconsistencies.
- Organized exceptions so they could be reviewed separately from normal marketplace activity.

### Turn 6 – Improving the Dashboard

**My instruction:**

"Improve the dashboard so that an administrator can understand the marketplace situation immediately. Display important metrics clearly and organize the seller, order, dispute and payout information into separate sections."

**Development direction:**

- Refined the dashboard layout.
- Organized the information into functional sections.
- Focused on readability and navigation.
- Planned KPI cards for important operational metrics.
- Improved the presentation of seller and transaction information.
- Focused on making exceptions easier to identify.

### Turn 7 – Reviewing Application Functionality

**My instruction:**

"Review the application module by module. Check whether the dashboard, seller information, orders, fulfillment, disputes and payout sections work together. Identify missing functionality, inconsistent information and areas that need improvement."

**Development direction:**

- Reviewed the application against its intended functionality.
- Considered whether information was consistent across modules.
- Identified areas requiring corrections.
- Refined implementation instructions based on the issues found.
- Focused on improving the overall application flow.

### Turn 8 – Final Requirement Review

**My instruction:**

"Compare the completed application with the original requirements. Prepare a checklist of the expected features, identify what has been implemented and clearly point out anything that still needs to be completed or tested. Do not mark a feature as complete without checking it."

**Development direction:**

- Organized the requirements into a checklist.
- Reviewed the implementation against the expected modules.
- Identified incomplete or unverified functionality.
- Focused on consistency and final quality review.

## 4. My Role and Development Decisions

The project was developed through an iterative process in which I directed the application requirements and used Google AI Studio to assist with implementation.

My development responsibilities included:

1. **Application planning:** Determining the main purpose of the application and organizing it into seller, order, fulfillment, dispute and payout modules.

2. **Requirement refinement:** Converting the marketplace requirements into smaller development tasks and refining the instructions during implementation.

3. **Indian marketplace adaptation:** Choosing an Indian e-commerce context, INR-based financial presentation, Indian locations and relevant product categories.

4. **Data organization:** Defining the information required by each module and considering how the records should relate to one another.

5. **Business logic direction:** Establishing the expected behavior for commissions, payouts, order fulfillment and dispute-related adjustments.

6. **Interface decisions:** Guiding the dashboard structure and the presentation of operational metrics and exception information.

7. **Iterative development:** Reviewing generated suggestions, identifying areas that needed changes and providing additional instructions to improve the implementation.

8. **Requirement review:** Comparing the application against the intended project functionality and identifying items requiring further validation.

## 5. AI Assistance and Human Contribution

| Area                       | Contribution                                                                      |
| -------------------------- | --------------------------------------------------------------------------------- |
| Application planning       | Requirements organized and refined with AI assistance                             |
| Architecture               | Initial structure explored and refined during development                         |
| Data modeling              | Entity structure and relationships developed iteratively                          |
| Indian marketplace context | Requirements and sample data context specified                                    |
| Business logic             | Expected commission, fulfillment, dispute and payout behavior defined and refined |
| Frontend development       | AI-assisted component and interface development                                   |
| Debugging                  | Errors and implementation issues investigated iteratively                         |
| Requirement review         | Features reviewed against the project requirements                                |
| Final verification         | To be confirmed through actual application testing                                |

**AI contribution:** Google AI Studio assisted with code generation, implementation suggestions, debugging and refinement.

**My contribution:** I directed the development process, specified the application behavior, refined requirements, reviewed the generated implementation and made decisions about the intended functionality.

## 6. Validation and Testing

The application should be evaluated across its major functional areas before being presented as complete.

The following checklist identifies the areas to verify:

- [ ] Application starts successfully in the intended development environment.
- [ ] Dashboard loads and displays the expected metrics.
- [ ] Seller information is displayed correctly.
- [ ] Order records and order details are accessible.
- [ ] Fulfillment and delivery statuses are consistent.
- [ ] Dispute records and their statuses are displayed correctly.
- [ ] Commission calculations are consistent with the defined rules.
- [ ] Payout eligibility follows the intended business rules.
- [ ] Operational exceptions are identified correctly.
- [ ] Data relationships and identifiers remain consistent.
- [ ] Browser interactions and navigation work correctly.
- [ ] Automated tests complete successfully.

Only features that have actually been tested should be marked as completed.

## 7. Final AI Usage Declaration

Google AI Studio with Gemini 3.8 Flash was used as an AI-assisted development tool during the creation of Seller360.

The tool helped accelerate development by providing implementation suggestions, generating code, assisting with debugging and supporting iterative improvements.

The application requirements, development direction, marketplace context and expected business behavior were refined throughout the process. AI-generated output was treated as development assistance and was subject to review and modification.

**The final objective was to develop a functional marketplace operations application that demonstrates an understanding of seller management, order fulfillment, dispute handling, commission calculations and payout monitoring.**

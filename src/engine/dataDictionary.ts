/**
 * Step 1: Comprehensive Data Dictionary for all 10 Entities
 * Specification: type, required/optional, allowed values, units, uniqueness, validation rule
 */

export interface FieldDefinition {
  field_name: string;
  data_type: string;
  is_required: boolean;
  allowed_values: string;
  units: string;
  is_unique: boolean;
  validation_rule: string;
  description: string;
}

export interface EntityDictionary {
  entity_name: string;
  table_name: string;
  primary_key: string;
  id_nomenclature_pattern: string;
  cardinality: string;
  lifecycle_states: string[];
  fields: FieldDefinition[];
}

export const DATA_DICTIONARY: EntityDictionary[] = [
  {
    entity_name: 'Seller',
    table_name: 'sellers',
    primary_key: 'id',
    id_nomenclature_pattern: 'SELL-000001',
    cardinality: '1:N with ProductListing, OrderLine, Fulfillment, Dispute, CustomerReview, Payout',
    lifecycle_states: ['ONBOARDING', 'ACTIVE', 'PROBATION', 'SUSPENDED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'SELL- followed by 6 digits (000001 - 999999)',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches regex /^SELL-\\d{6}$/',
        description: 'Primary unique immutable identifier for a marketplace merchant.'
      },
      {
        field_name: 'business_name',
        data_type: 'VARCHAR(128)',
        is_required: true,
        allowed_values: 'Alphanumeric string 2-128 chars',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Non-empty, trimmed, no control characters',
        description: 'Brand or storefront trading name displayed to customers.'
      },
      {
        field_name: 'legal_entity',
        data_type: 'VARCHAR(128)',
        is_required: true,
        allowed_values: 'Registered corporate or LLC name',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Non-empty corporate title',
        description: 'Legally registered enterprise or sole proprietor name for tax and payouts.'
      },
      {
        field_name: 'country',
        data_type: 'CHAR(2)',
        is_required: true,
        allowed_values: 'ISO-3166-1 alpha-2 codes (US, CA, GB, DE, JP, AU, etc.)',
        units: 'Country Code',
        is_unique: false,
        validation_rule: 'Valid ISO alpha-2 country code',
        description: 'Domiciled country for cross-border tax and compliance.'
      },
      {
        field_name: 'tier',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'TIER_1_ENTERPRISE, TIER_2_PRO, TIER_3_STANDARD, TIER_4_MICRO',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must belong to SellerTier enum',
        description: 'Volume and service level classification determining SLA thresholds.'
      },
      {
        field_name: 'status',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'ACTIVE, PROBATION, SUSPENDED, ONBOARDING',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must belong to SellerStatus enum; if SUSPENDED, listings must not be active',
        description: 'Current operational standing; drives listing availability and payout freezes.'
      },
      {
        field_name: 'rating_avg',
        data_type: 'DECIMAL(3,2)',
        is_required: true,
        allowed_values: '1.00 to 5.00',
        units: 'Stars / Score',
        is_unique: false,
        validation_rule: '1.00 <= rating_avg <= 5.00; probation triggered if < 3.80',
        description: 'Rolling 90-day mean of verified customer review star scores.'
      },
      {
        field_name: 'late_shipment_rate',
        data_type: 'DECIMAL(5,4)',
        is_required: true,
        allowed_values: '0.0000 to 1.0000 (0% to 100%)',
        units: 'Ratio',
        is_unique: false,
        validation_rule: '0.0000 <= late_shipment_rate <= 1.0000; SLA threshold is 0.0400 (4%)',
        description: 'Orders shipped after ship_by_deadline divided by total fulfilled orders.'
      },
      {
        field_name: 'cancellation_rate',
        data_type: 'DECIMAL(5,4)',
        is_required: true,
        allowed_values: '0.0000 to 1.0000 (0% to 100%)',
        units: 'Ratio',
        is_unique: false,
        validation_rule: '0.0000 <= cancellation_rate <= 1.0000; SLA threshold is 0.0250 (2.5%)',
        description: 'Seller-initiated pre-fulfillment cancellations over total orders.'
      },
      {
        field_name: 'return_dispute_rate',
        data_type: 'DECIMAL(5,4)',
        is_required: true,
        allowed_values: '0.0000 to 1.0000 (0% to 100%)',
        units: 'Ratio',
        is_unique: false,
        validation_rule: '0.0000 <= return_dispute_rate <= 1.0000; threshold is 0.0150 (1.5%)',
        description: 'Customer claims and chargebacks over delivered units.'
      },
      {
        field_name: 'reserve_rate',
        data_type: 'DECIMAL(4,3)',
        is_required: true,
        allowed_values: '0.050 to 0.300',
        units: 'Ratio',
        is_unique: false,
        validation_rule: '0.05 <= reserve_rate <= 0.30; baseline is 0.100 (10%)',
        description: 'Mandatory rolling reserve percentage withheld to cushion disputes.'
      },
      {
        field_name: 'hold_period_days',
        data_type: 'INT',
        is_required: true,
        allowed_values: '7, 14, 21, 30',
        units: 'Days',
        is_unique: false,
        validation_rule: 'Must be positive integer between 7 and 60 days',
        description: 'Holding buffer window from order delivery before funds unlock.'
      },
      {
        field_name: 'created_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'created_at <= updated_at',
        description: 'UTC date and time merchant completed initial onboarding.'
      },
      {
        field_name: 'updated_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'updated_at >= created_at',
        description: 'Timestamp of latest seller metric or status change.'
      }
    ]
  },
  {
    entity_name: 'ProductListing',
    table_name: 'product_listings',
    primary_key: 'id',
    id_nomenclature_pattern: 'LIST-<seller-id>-000001',
    cardinality: 'N:1 with Seller, 1:N with OrderLine',
    lifecycle_states: ['ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED', 'DELISTED_SANCTION'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'LIST-SELL-XXXXXX-YYYYYY (6 digits each)',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^LIST-SELL-\\d{6}-\\d{6}$/',
        description: 'Deterministic listing ID scoped to the owning seller.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'Valid FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in sellers table; seller status must not be SUSPENDED if listing is ACTIVE',
        description: 'Parent merchant owning this catalog item.'
      },
      {
        field_name: 'title',
        data_type: 'VARCHAR(255)',
        is_required: true,
        allowed_values: 'Item title 5-255 characters',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Length between 5 and 255 chars',
        description: 'Customer facing product title.'
      },
      {
        field_name: 'category',
        data_type: 'VARCHAR(48)',
        is_required: true,
        allowed_values: 'Electronics, Apparel & Fashion, Home & Living, Health & Beauty, Sports & Outdoors, Automotive, Toys & Games',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must match recognized marketplace category for commission calculation',
        description: 'Merchandise taxonomy node driving commission rates.'
      },
      {
        field_name: 'sku',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'Alphanumeric barcode / SKU format',
        units: 'Stock Code',
        is_unique: false,
        validation_rule: 'Alphanumeric with dashes/underscores',
        description: 'Merchant internal stock keeping unit code.'
      },
      {
        field_name: 'price',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.01 to 99999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'price > 0.00',
        description: 'Current unit selling price in marketplace base currency.'
      },
      {
        field_name: 'stock_quantity',
        data_type: 'INT',
        is_required: true,
        allowed_values: '0 to 1,000,000',
        units: 'Units',
        is_unique: false,
        validation_rule: 'stock_quantity >= 0; if 0 then status cannot be ACTIVE',
        description: 'Current physical inventory count in seller warehouse.'
      },
      {
        field_name: 'status',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'ACTIVE, OUT_OF_STOCK, ARCHIVED, DELISTED_SANCTION',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must be DELISTED_SANCTION if parent seller is SUSPENDED',
        description: 'Listing lifecycle state governing buy-box availability.'
      },
      {
        field_name: 'created_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'created_at >= seller.created_at',
        description: 'Timestamp when listing was first indexed in catalog.'
      }
    ]
  },
  {
    entity_name: 'Order',
    table_name: 'orders',
    primary_key: 'id',
    id_nomenclature_pattern: 'ORD-2026-000001',
    cardinality: '1:N with OrderLine, CustomerReview, Dispute',
    lifecycle_states: ['PENDING', 'PROCESSING', 'PARTIALLY_FULFILLED', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'ORD-2026- followed by 6 digits (000001 - 999999)',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^ORD-2026-\\d{6}$/',
        description: 'Global immutable checkout order reference.'
      },
      {
        field_name: 'customer_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'CUST- followed by 6 digits',
        units: 'Identifier',
        is_unique: false,
        validation_rule: 'Matches /^CUST-\\d{6}$/',
        description: 'Buyer customer account identifier.'
      },
      {
        field_name: 'customer_name',
        data_type: 'VARCHAR(100)',
        is_required: true,
        allowed_values: 'Full name 2-100 chars',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Non-empty',
        description: 'Shipping recipient contact name.'
      },
      {
        field_name: 'customer_email',
        data_type: 'VARCHAR(128)',
        is_required: true,
        allowed_values: 'Valid RFC 5322 email string',
        units: 'Email',
        is_unique: false,
        validation_rule: 'Valid email format',
        description: 'Buyer communication address for invoices and tracking.'
      },
      {
        field_name: 'order_status',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'PENDING, PROCESSING, PARTIALLY_FULFILLED, COMPLETED, CANCELLED, DISPUTED',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Derived roll-up of child OrderLine / Fulfillment states',
        description: 'Macro aggregate order fulfillment status.'
      },
      {
        field_name: 'total_amount',
        data_type: 'DECIMAL(12,2)',
        is_required: true,
        allowed_values: '0.01 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'total_amount == SUM(order_lines.subtotal)',
        description: 'Gross sum of all child line items in order.'
      },
      {
        field_name: 'shipping_address',
        data_type: 'VARCHAR(255)',
        is_required: true,
        allowed_values: 'Street, City, State ZIP',
        units: 'Address Text',
        is_unique: false,
        validation_rule: 'Non-empty destination address',
        description: 'Physical postal destination for dispatch.'
      },
      {
        field_name: 'placed_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'placed_at <= fulfillment.shipped_at',
        description: 'Time when customer payment authorized and order committed.'
      },
      {
        field_name: 'currency',
        data_type: 'CHAR(3)',
        is_required: true,
        allowed_values: 'INR, USD, EUR, GBP',
        units: 'Currency Code',
        is_unique: false,
        validation_rule: 'Default INR in Indian marketplace model',
        description: 'Three-letter currency symbol for billing.'
      }
    ]
  },
  {
    entity_name: 'OrderLine',
    table_name: 'order_lines',
    primary_key: 'id',
    id_nomenclature_pattern: 'OLINE-ORD-2026-000001-01',
    cardinality: 'N:1 with Order, N:1 with Seller, N:1 with ProductListing, 1:1 with Fulfillment',
    lifecycle_states: ['ORDERED', 'FULFILLED', 'REFUNDED', 'DISPUTED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'OLINE-ORD-2026-XXXXXX-YY',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^OLINE-ORD-2026-\\d{6}-\\d{2}$/',
        description: 'Unique granular line item within parent order.'
      },
      {
        field_name: 'order_id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'FK referencing orders.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in orders',
        description: 'Parent order reference.'
      },
      {
        field_name: 'listing_id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'FK referencing product_listings.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in product_listings',
        description: 'Listing snapshot purchased by customer.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must match product_listings.seller_id',
        description: 'Merchant fulfilling this individual line item (enables split orders).'
      },
      {
        field_name: 'quantity',
        data_type: 'INT',
        is_required: true,
        allowed_values: '1 to 500',
        units: 'Units',
        is_unique: false,
        validation_rule: 'quantity >= 1',
        description: 'Number of units ordered.'
      },
      {
        field_name: 'unit_price',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.01 to 99999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'unit_price > 0.00',
        description: 'Price per unit locked at transaction time.'
      },
      {
        field_name: 'subtotal',
        data_type: 'DECIMAL(12,2)',
        is_required: true,
        allowed_values: '0.01 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'subtotal == quantity * unit_price',
        description: 'Gross line value before fees or deductions.'
      },
      {
        field_name: 'category',
        data_type: 'VARCHAR(48)',
        is_required: true,
        allowed_values: 'Matches listing.category',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Inherited from product_listings',
        description: 'Taxonomy category determining commission schedule.'
      },
      {
        field_name: 'commission_rate',
        data_type: 'DECIMAL(4,3)',
        is_required: true,
        allowed_values: '0.050 to 0.250',
        units: 'Ratio',
        is_unique: false,
        validation_rule: 'Derived from active CommissionRule for category and tier',
        description: 'Contractual marketplace take rate.'
      },
      {
        field_name: 'commission_amount',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.00 to 99999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'commission_amount == ROUND(subtotal * commission_rate, 2)',
        description: 'Platform fee retained by marketplace operator.'
      },
      {
        field_name: 'created_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'created_at == order.placed_at',
        description: 'Timestamp synchronous with parent checkout.'
      }
    ]
  },
  {
    entity_name: 'Fulfillment',
    table_name: 'fulfillments',
    primary_key: 'id',
    id_nomenclature_pattern: 'FUL-<order-line-id>',
    cardinality: '1:1 with OrderLine, N:1 with Order, N:1 with Seller',
    lifecycle_states: ['CREATED', 'PICKED', 'PACKED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(40)',
        is_required: true,
        allowed_values: 'FUL- followed by order_line_id',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^FUL-OLINE-ORD-2026-\\d{6}-\\d{2}$/',
        description: 'Deterministic warehouse shipment package tracking ID.'
      },
      {
        field_name: 'order_line_id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'FK referencing order_lines.id',
        units: 'Foreign Key',
        is_unique: true,
        validation_rule: 'Must exist in order_lines and be unique',
        description: 'Specific goods item package tracked in this shipment.'
      },
      {
        field_name: 'order_id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'FK referencing orders.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Matches order_lines.order_id',
        description: 'Parent order reference.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Matches order_lines.seller_id',
        description: 'Dispatching warehouse merchant.'
      },
      {
        field_name: 'warehouse_id',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'WH-EAST-01, WH-WEST-02, WH-CENTRAL-03, WH-EUR-01',
        units: 'Facility Code',
        is_unique: false,
        validation_rule: 'Recognized facility string',
        description: 'Physical fulfillment origin point.'
      },
      {
        field_name: 'carrier',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'Blue Dart, Delhivery, DTDC, Ekart Logistics, Shadowfax, India Post, Xpressbees, FedEx, DHL',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must be approved logistics carrier',
        description: 'Logistics provider handling last-mile transit.'
      },
      {
        field_name: 'tracking_number',
        data_type: 'VARCHAR(48)',
        is_required: true,
        allowed_values: 'Alphanumeric tracking code 12-24 chars',
        units: 'Tracking Code',
        is_unique: false,
        validation_rule: 'Alphanumeric uppercase string',
        description: 'Carrier master waybill / tracking identifier.'
      },
      {
        field_name: 'status',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'CREATED, PICKED, PACKED, SHIPPED, DELIVERED, RETURNED, CANCELLED',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Lifecycle transitions must follow linear order',
        description: 'Real-time logistics progression state.'
      },
      {
        field_name: 'ship_by_deadline',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'ship_by_deadline >= order.placed_at (typically +48 hours)',
        description: 'SLA target dispatch cutoff before late shipment penalty.'
      },
      {
        field_name: 'shipped_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: false,
        allowed_values: 'ISO-8601 UTC timestamp or null if unfulfilled',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'shipped_at >= order.placed_at; if null, status cannot be SHIPPED/DELIVERED',
        description: 'Actual timestamp carrier scanned first package departure.'
      },
      {
        field_name: 'delivered_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: false,
        allowed_values: 'ISO-8601 UTC timestamp or null if in transit',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'delivered_at >= shipped_at; required if status == DELIVERED',
        description: 'Timestamp package marked received at doorstep.'
      },
      {
        field_name: 'is_late',
        data_type: 'BOOLEAN',
        is_required: true,
        allowed_values: 'true, false',
        units: 'Flag',
        is_unique: false,
        validation_rule: 'is_late == (shipped_at > ship_by_deadline)',
        description: 'Deterministic flag calculating SLA breach for seller score.'
      },
      {
        field_name: 'delivery_sla_days',
        data_type: 'INT',
        is_required: true,
        allowed_values: '2 to 7',
        units: 'Days',
        is_unique: false,
        validation_rule: 'Standard transit window promise',
        description: 'Expected customer delivery SLA timeframe.'
      }
    ]
  },
  {
    entity_name: 'CustomerReview',
    table_name: 'customer_reviews',
    primary_key: 'id',
    id_nomenclature_pattern: 'REV-2026-000001',
    cardinality: 'N:1 with Seller, N:1 with Order, N:1 with OrderLine',
    lifecycle_states: ['SUBMITTED', 'VERIFIED', 'FLAGGED', 'HIDDEN'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'REV-2026- followed by 6 digits',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^REV-2026-\\d{6}$/',
        description: 'Unique rating and feedback entry ID.'
      },
      {
        field_name: 'order_id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'FK referencing orders.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in orders',
        description: 'Associated purchase transaction.'
      },
      {
        field_name: 'order_line_id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'FK referencing order_lines.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in order_lines',
        description: 'Specific merchandise item evaluated.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must match order_lines.seller_id',
        description: 'Merchant receiving the rating.'
      },
      {
        field_name: 'customer_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing customer_id in orders',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Matches orders.customer_id',
        description: 'Verified buyer submitting review.'
      },
      {
        field_name: 'rating',
        data_type: 'INT',
        is_required: true,
        allowed_values: '1, 2, 3, 4, 5',
        units: 'Stars (1-5)',
        is_unique: false,
        validation_rule: '1 <= rating <= 5',
        description: 'Quantitative customer satisfaction score.'
      },
      {
        field_name: 'comment',
        data_type: 'TEXT',
        is_required: false,
        allowed_values: 'Customer textual feedback',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Up to 2000 chars',
        description: 'Unstructured customer commentary on item & delivery.'
      },
      {
        field_name: 'sentiment',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'POSITIVE, NEUTRAL, NEGATIVE',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Deterministic mapping: rating >= 4 => POSITIVE, rating == 3 => NEUTRAL, <= 2 => NEGATIVE',
        description: 'Categorized sentiment derived from star rating.'
      },
      {
        field_name: 'verified_purchase',
        data_type: 'BOOLEAN',
        is_required: true,
        allowed_values: 'true, false',
        units: 'Flag',
        is_unique: false,
        validation_rule: 'Must be true when linked to delivered order line',
        description: 'Security confirmation of physical fulfillment before review.'
      },
      {
        field_name: 'created_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'created_at >= fulfillment.delivered_at',
        description: 'Timestamp customer submitted review (must be after delivery).'
      }
    ]
  },
  {
    entity_name: 'Dispute',
    table_name: 'disputes',
    primary_key: 'id',
    id_nomenclature_pattern: 'DSP-2026-000001',
    cardinality: 'N:1 with Order, N:1 with OrderLine, N:1 with Seller',
    lifecycle_states: ['OPEN', 'UNDER_REVIEW', 'SELLER_RESPONDED', 'RESOLVED_MERCHANT_WON', 'RESOLVED_CUSTOMER_WON', 'ARBITRATED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'DSP-2026- followed by 6 digits',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^DSP-2026-\\d{6}$/',
        description: 'Unique dispute / chargeback ticket number.'
      },
      {
        field_name: 'order_id',
        data_type: 'VARCHAR(20)',
        is_required: true,
        allowed_values: 'FK referencing orders.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in orders',
        description: 'Contested order transaction.'
      },
      {
        field_name: 'order_line_id',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'FK referencing order_lines.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in order_lines',
        description: 'Specific line item contested.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must match order_lines.seller_id',
        description: 'Respondent seller responsible for resolution.'
      },
      {
        field_name: 'reason',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'ITEM_NOT_RECEIVED, DAMAGED_GOODS, NOT_AS_DESCRIBED, UNAUTHORIZED_CHARGE, LATE_DELIVERY',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must belong to DisputeReason enum',
        description: 'Customer specified claim reason.'
      },
      {
        field_name: 'claim_amount',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.01 to order_lines.subtotal',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: '0.01 <= claim_amount <= order_lines.subtotal',
        description: 'Total financial refund demanded by buyer.'
      },
      {
        field_name: 'status',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'OPEN, UNDER_REVIEW, SELLER_RESPONDED, RESOLVED_MERCHANT_WON, RESOLVED_CUSTOMER_WON, ARBITRATED',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Dispute lifecycle progression',
        description: 'Current arbitration state.'
      },
      {
        field_name: 'customer_won',
        data_type: 'BOOLEAN',
        is_required: true,
        allowed_values: 'true, false',
        units: 'Flag',
        is_unique: false,
        validation_rule: 'true if status == RESOLVED_CUSTOMER_WON',
        description: 'Final verdict flag determining if seller payout must be clawed back.'
      },
      {
        field_name: 'deduction_applied',
        data_type: 'BOOLEAN',
        is_required: true,
        allowed_values: 'true, false',
        units: 'Flag',
        is_unique: false,
        validation_rule: 'If customer_won == true, deduction_applied must be true in healthy reconciliations (anomaly if false)',
        description: 'Indicates whether clawback has been deducted from seller settlement.'
      },
      {
        field_name: 'filed_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'filed_at >= order.placed_at',
        description: 'Timestamp when dispute ticket was initiated.'
      },
      {
        field_name: 'resolved_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: false,
        allowed_values: 'ISO-8601 UTC timestamp or null',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'resolved_at >= filed_at when status is RESOLVED_*',
        description: 'Closing timestamp of arbitration ruling.'
      }
    ]
  },
  {
    entity_name: 'CommissionRule',
    table_name: 'commission_rules',
    primary_key: 'id',
    id_nomenclature_pattern: 'CRULE-000001',
    cardinality: '1:N with OrderLine calculation',
    lifecycle_states: ['DRAFT', 'ACTIVE', 'EXPIRED', 'DEPRECATED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'CRULE- followed by 6 digits',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^CRULE-\\d{6}$/',
        description: 'Unique commission policy identifier.'
      },
      {
        field_name: 'category',
        data_type: 'VARCHAR(48)',
        is_required: true,
        allowed_values: 'Matches ProductCategory enum',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Valid category string',
        description: 'Target merchandise classification.'
      },
      {
        field_name: 'base_rate',
        data_type: 'DECIMAL(4,3)',
        is_required: true,
        allowed_values: '0.040 to 0.250 (4% to 25%)',
        units: 'Ratio',
        is_unique: false,
        validation_rule: '0.01 <= base_rate <= 0.50',
        description: 'Standard percentage fee levied on gross item subtotal.'
      },
      {
        field_name: 'min_fee',
        data_type: 'DECIMAL(6,2)',
        is_required: true,
        allowed_values: '0.00 to 5.00',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'min_fee >= 0.00',
        description: 'Floor dollar fee per unit sold.'
      },
      {
        field_name: 'max_fee',
        data_type: 'DECIMAL(8,2)',
        is_required: true,
        allowed_values: '50.00 to 500.00',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'max_fee >= min_fee',
        description: 'Ceiling cap fee to protect high-ticket sellers.'
      },
      {
        field_name: 'tier',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'ALL, TIER_1_ENTERPRISE, TIER_2_PRO, TIER_3_STANDARD, TIER_4_MICRO',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must belong to SellerTier or ALL',
        description: 'Applicable merchant tier volume discount.'
      },
      {
        field_name: 'effective_from',
        data_type: 'DATE',
        is_required: true,
        allowed_values: 'YYYY-MM-DD',
        units: 'Calendar Date',
        is_unique: false,
        validation_rule: 'effective_from <= effective_to',
        description: 'Start date of schedule activation.'
      },
      {
        field_name: 'effective_to',
        data_type: 'DATE',
        is_required: true,
        allowed_values: 'YYYY-MM-DD',
        units: 'Calendar Date',
        is_unique: false,
        validation_rule: 'effective_to >= effective_from',
        description: 'Expiry date of rate schedule.'
      },
      {
        field_name: 'is_active',
        data_type: 'BOOLEAN',
        is_required: true,
        allowed_values: 'true, false',
        units: 'Flag',
        is_unique: false,
        validation_rule: 'Only 1 active rule per category and tier combination at any date',
        description: 'Current activation switch.'
      }
    ]
  },
  {
    entity_name: 'Payout',
    table_name: 'payouts',
    primary_key: 'id',
    id_nomenclature_pattern: 'PAYOUT-2026-000001',
    cardinality: 'N:1 with Seller, 1:N with PayoutLine',
    lifecycle_states: ['PENDING_AUDIT', 'ELIGIBLE', 'HELD_VIOLATION', 'PAID', 'BLOCKED_SUSPENDED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'PAYOUT-2026- followed by 6 digits',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^PAYOUT-2026-\\d{6}$/',
        description: 'Settlement disbursement batch identifier.'
      },
      {
        field_name: 'seller_id',
        data_type: 'VARCHAR(16)',
        is_required: true,
        allowed_values: 'FK referencing sellers.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in sellers',
        description: 'Beneficiary merchant account.'
      },
      {
        field_name: 'period_start',
        data_type: 'DATE',
        is_required: true,
        allowed_values: 'YYYY-MM-DD',
        units: 'Calendar Date',
        is_unique: false,
        validation_rule: 'period_start <= period_end',
        description: 'Billing cycle start date.'
      },
      {
        field_name: 'period_end',
        data_type: 'DATE',
        is_required: true,
        allowed_values: 'YYYY-MM-DD',
        units: 'Calendar Date',
        is_unique: false,
        validation_rule: 'period_end >= period_start',
        description: 'Billing cycle cut-off date.'
      },
      {
        field_name: 'gross_sales',
        data_type: 'DECIMAL(12,2)',
        is_required: true,
        allowed_values: '0.00 to 9999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'gross_sales == SUM(credit payout lines)',
        description: 'Total eligible merchandise sales credited in period.'
      },
      {
        field_name: 'total_commission',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.00 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'total_commission == SUM(commission fee lines)',
        description: 'Platform commissions deducted.'
      },
      {
        field_name: 'dispute_deductions',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.00 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'dispute_deductions == SUM(dispute clawback lines)',
        description: 'Customer refund and chargeback amounts deducted.'
      },
      {
        field_name: 'reserve_held',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.00 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'reserve_held == ROUND(gross_sales * seller.reserve_rate, 2)',
        description: 'New collateral reserve held in escrow this cycle.'
      },
      {
        field_name: 'reserve_released',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '0.00 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'reserve_released <= historic reserve held',
        description: 'Matured reserve funds released from prior hold cycles.'
      },
      {
        field_name: 'net_amount',
        data_type: 'DECIMAL(12,2)',
        is_required: true,
        allowed_values: '-999999.99 to 9999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'net_amount == (gross_sales - total_commission - dispute_deductions - reserve_held + reserve_released)',
        description: 'Final wire disbursement figure payable to merchant.'
      },
      {
        field_name: 'status',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'PENDING_AUDIT, ELIGIBLE, HELD_VIOLATION, PAID, BLOCKED_SUSPENDED',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'If seller is SUSPENDED, status must be BLOCKED_SUSPENDED; if delivery hold not met, HELD_VIOLATION',
        description: 'Compliance payout clearance state.'
      },
      {
        field_name: 'scheduled_payout_date',
        data_type: 'DATE',
        is_required: true,
        allowed_values: 'YYYY-MM-DD',
        units: 'Calendar Date',
        is_unique: false,
        validation_rule: 'scheduled_payout_date >= period_end + seller.hold_period_days',
        description: 'Projected bank disbursement date.'
      },
      {
        field_name: 'paid_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: false,
        allowed_values: 'ISO-8601 UTC timestamp or null',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'paid_at != null if status == PAID',
        description: 'Automated Clearing House (ACH) confirmation timestamp.'
      }
    ]
  },
  {
    entity_name: 'PayoutLine',
    table_name: 'payout_lines',
    primary_key: 'id',
    id_nomenclature_pattern: 'PLINE-PAYOUT-2026-000001-01',
    cardinality: 'N:1 with Payout, N:1 with OrderLine (optional)',
    lifecycle_states: ['POSTED', 'REVERSED', 'ADJUSTED'],
    fields: [
      {
        field_name: 'id',
        data_type: 'VARCHAR(36)',
        is_required: true,
        allowed_values: 'PLINE-PAYOUT-2026-XXXXXX-YY',
        units: 'Identifier',
        is_unique: true,
        validation_rule: 'Matches /^PLINE-PAYOUT-2026-\\d{6}-\\d{2}$/',
        description: 'Granular double-entry settlement line ledger item.'
      },
      {
        field_name: 'payout_id',
        data_type: 'VARCHAR(24)',
        is_required: true,
        allowed_values: 'FK referencing payouts.id',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in payouts',
        description: 'Parent disbursement batch.'
      },
      {
        field_name: 'order_line_id',
        data_type: 'VARCHAR(32)',
        is_required: false,
        allowed_values: 'FK referencing order_lines.id or null for general reserve adjustments',
        units: 'Foreign Key',
        is_unique: false,
        validation_rule: 'Must exist in order_lines if provided',
        description: 'Associated transaction item backing this credit or fee.'
      },
      {
        field_name: 'type',
        data_type: 'VARCHAR(32)',
        is_required: true,
        allowed_values: 'MERCHANDISE_CREDIT, COMMISSION_FEE, DISPUTE_CLAWBACK, RESERVE_HOLD, RESERVE_RELEASE, ADJUSTMENT',
        units: 'Enum',
        is_unique: false,
        validation_rule: 'Must belong to PayoutLineType enum',
        description: 'Accounting ledger classification.'
      },
      {
        field_name: 'amount',
        data_type: 'DECIMAL(10,2)',
        is_required: true,
        allowed_values: '-999999.99 to 999999.99',
        units: 'Currency Amount (INR ₹)',
        is_unique: false,
        validation_rule: 'Credits > 0, Debits/Holds < 0; SUM(amount) == payout.net_amount',
        description: 'Signed monetary quantity affecting net disbursement.'
      },
      {
        field_name: 'description',
        data_type: 'VARCHAR(255)',
        is_required: true,
        allowed_values: 'Descriptive explanation',
        units: 'Text',
        is_unique: false,
        validation_rule: 'Non-empty',
        description: 'Audit explanation appearing on seller statement.'
      },
      {
        field_name: 'created_at',
        data_type: 'TIMESTAMP WITH TIME ZONE',
        is_required: true,
        allowed_values: 'ISO-8601 UTC timestamp',
        units: 'Timestamp',
        is_unique: false,
        validation_rule: 'created_at <= payout.scheduled_payout_date',
        description: 'Posting timestamp into merchant ledger.'
      }
    ]
  }
];

import {
  Seller,
  ProductListing,
  Order,
  OrderLine,
  Fulfillment,
  CustomerReview,
  Dispute,
  Payout,
  PayoutLine,
  GroundTruthItem,
  Dataset,
  SellerTier,
  SellerStatus,
  ProductCategory,
  DisputeReason,
  DisputeStatus,
  FulfillmentStatus
} from '../types/marketplace';
import { DeterministicPRNG } from './prng';
import { DEFAULT_COMMISSION_RULES, calculateCommission } from './commissionRules';

export interface GeneratorOptions {
  seed?: number;
  sellerCount?: number;
  listingsPerSellerAvg?: number;
  orderCount?: number;
  disputeRate?: number; // e.g. 0.08
  injectAnomalies?: boolean;
  scaleLabel?: string;
}

const BUSINESS_NAMES = [
  'RetailNet Solutions India',
  'SuperComNet Digital Hub',
  'Balaji Retail Enterprises',
  'OmniTech Digital India',
  'Siddhi Vinayak Electronics',
  'Jaipur Crafts & Handlooms',
  'Shree Ganesh Traders',
  'Tata Croma Marketplace Hub',
  'Reliance Digital Direct',
  'Kalyan Silks & Apparels',
  'Bengaluru Tech Distro',
  'Mahalaxmi E-Commerce Corp',
  'Himalayan Organics India',
  'Deccan Retail Partners',
  'Patel Brothers Trade Hub',
  'Varanasi Silk Weavers Co-op',
  'Godrej Living Appliances',
  'Anand Sweets & Spices',
  'Delhi Digital Bazaar',
  'Surat Diamond & Textiles',
  'Pune Precision Auto Spares',
  'Chennai Gadget World',
  'Hyderabad Gems & Pearls',
  'Ludhiana Woollen Works',
  'Kochi Herbal & Wellness',
  'Gurugram Smart Devices',
  'Ahmedabad Cotton Mart',
  'Kolkata Heritage Goods',
  'Nandi Agro Organics',
  'Indore Namkeen & Tech Store'
];

const CATEGORIES: ProductCategory[] = [
  'Electronics',
  'Apparel & Fashion',
  'Home & Living',
  'Health & Beauty',
  'Sports & Outdoors',
  'Automotive',
  'Toys & Games'
];

const PRODUCT_TITLES: Record<ProductCategory, string[]> = {
  Electronics: [
    'boAt Airdopes 141 True Wireless Earbuds (42H Playtime, Quad Mics)',
    'Noise ColorFit Pulse 2 Max 1.85" Display Smartwatch',
    'OnePlus Bullets Z2 Bluetooth Wireless in-Ear Earphones',
    'Realme 10000mAh 18W Fast Charging Power Bank',
    'Portronics Toad 23 Wireless Optical Mouse (2.4GHz)',
    'Zebronics Zeb-Warrior 2.0 Multimedia Gaming Speaker RGB',
    'SanDisk Ultra Dual Drive 64GB USB 3.0 Type-C OTG Flash Drive',
    'Mi 360° Home Security Camera 2K Pro with AI Human Detection',
    'Boult Audio Z40 with 60H Playtime and Zen Quad ENC Mics',
    'Fire-Boltt Ninja Call Pro Plus 1.83" Bluetooth Calling Smartwatch'
  ],
  'Apparel & Fashion': [
    'FabIndia Pure Cotton Printed Long Kurta',
    'Peter England Men Slim Fit Cotton Formal Shirt',
    'Biba Women Printed Anarkali Kurta with Dupatta Set',
    'Levi\'s Men 511 Mid Rise Slim Fit Stretch Jeans',
    'Puma Men Smashic Casual Sneakers',
    'W for Woman Rayon Straight Fit Embroidered Kurta',
    'Allen Solly Casual Cotton Solid Polo T-Shirt',
    'Kanjivaram Silk Blend Zari Woven Saree with Blouse Piece',
    'Fastrack Reflex Beat Casual Water Resistant Backpack 25L',
    'Janasya Women Poly Silk Kurta with Pant and Dupatta'
  ],
  'Home & Living': [
    'Prestige Iris 750W Mixer Grinder with 3 Stainless Steel Jars',
    'Pigeon by Stovekraft Cruise 1800W Induction Cooktop',
    'Milton Thermosteel Flip Lid Insulated Water Flask 1000ml',
    'Wakefit Orthopedic Memory Foam Mattress Bed Pillow',
    'Hawkins Contura Hard Anodised Aluminium Pressure Cooker 3L',
    'Solimo Microfibre Reversible Double Bed Comforter',
    'Bajaj New Shakti Neo 15L Vertical Water Geyser Heater',
    'Crompton Hill Briz 1200mm High Speed Ceiling Fan',
    'Story@Home Ultra Soft 100% Cotton King Size Double Bedsheet',
    'Kuber Industries 12-Piece Multipurpose Kitchen Storage Jar Set'
  ],
  'Health & Beauty': [
    'Mamaearth Onion Hair Oil with Redensyl for Hair Fall Control',
    'The Derma Co 10% Niacinamide Face Serum with Zinc',
    'Himalaya Purifying Neem Face Wash (300ml Pump Pack)',
    'Biotique Bio Kelp Protein Shampoo for Falling Hair',
    'WOW Skin Science Apple Cider Vinegar Foaming Face Wash with Brush',
    'Forest Essentials Ayurvedic Hand Pounded Soundarya Facial Scrub',
    'mCaffeine Naked & Raw Coffee Body Scrub with Coconut Oil',
    'Dettol Original Germ Protection Hand Sanitizer Pump 500ml',
    'Minimalist 2% Salicylic Acid Face Serum for Acne & Blackheads',
    'Parachute Advansed Aloe Vera Enriched Coconut Hair Oil'
  ],
  'Sports & Outdoors': [
    'Nivia Storm Football Size 5 with High Grip Rubberized Texture',
    'Yonex Nanoray Light 18i Graphite Badminton Racquet',
    'Cosco Light Cricket Tennis Ball Pack of 6 Heavy Duty',
    'Boldfit Yoga Mat 6mm with Extra Cushioning for Men & Women',
    'Strauss Pro Resistance Loop Bands Set for Home Workout',
    'Vector X Anti-Burst Gym Ball with Foot Pump',
    'Kore PVC 20 Kg Home Gym Dumbbells & Fitness Combo',
    'SG Club Cricket Bat Premium Kashmir Willow with Cover',
    'Spalding NBA Highlight Outdoor Basketball Size 7'
  ],
  'Automotive': [
    'Bosch 12V High-Pressure Digital Auto Car Tyre Inflator',
    '70mai Smart Dash Cam 1S 1080p Car Security Camera',
    'Godrej aer Twist Car Air Freshener Gel (Cool Surf Blue)',
    '3M Car Wash Shampoo 500ml Concentrated Cleaning Liquid',
    'Woscher 578 2-in-1 Car Vacuum Cleaner with Air Compressor',
    'Vega Crux Open Face Helmet with ISI Certification',
    'Formula 1 Carnauba Car Paste Wax Deep Gloss Shine',
    'TVS Eurogrip 2-Wheeler Tubeless Motorcycle Tyre'
  ],
  'Toys & Games': [
    'Funskool Monopoly India Edition Classic Family Board Game',
    'Skillmatics Educational Brain Games & Puzzles (Ages 6-12)',
    'Hot Wheels 5-Car Gift Pack Die-Cast Assortment',
    'Shumee Wooden Activity Walker & Geometric Shape Sorter',
    'Frank Animal Kingdom 108-Piece Jigsaw Puzzle for Kids',
    'Smartivity Hydraulic Crane STEM Educational DIY Toy Kit',
    'Barbie Rainbow Sparkle Hair Doll with Fashion Accessories',
    'Ludo & Snakes & Ladders 2-in-1 Wooden Magnetic Board Game'
  ]
};

const CATEGORY_PRICE_RANGES: Record<ProductCategory, [number, number]> = {
  Electronics: [499.00, 14999.00],
  'Apparel & Fashion': [399.00, 4499.00],
  'Home & Living': [299.00, 5999.00],
  'Health & Beauty': [199.00, 2499.00],
  'Sports & Outdoors': [299.00, 4999.00],
  Automotive: [249.00, 4999.00],
  'Toys & Games': [299.00, 3499.00]
};

const CARRIERS = ['Blue Dart', 'Delhivery', 'DTDC', 'Ekart Logistics', 'Shadowfax', 'India Post', 'Xpressbees'] as const;
const WAREHOUSES = [
  'WH-BOM-BHIWANDI-01',
  'WH-DEL-GURGAON-02',
  'WH-BLR-HOSKOTE-03',
  'WH-HYD-MEDCHAL-04',
  'WH-CCU-DANKUNI-05'
];

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Vivaan', 'Advik', 'Kabir', 'Sai', 'Ishaan', 'Reyansh',
  'Aryan', 'Dhruv', 'Arjun', 'Rohan', 'Rahul', 'Vikram', 'Aditya', 'Rajesh',
  'Suresh', 'Deepak', 'Karthik', 'Amit', 'Nikhil', 'Ananya', 'Diya', 'Aadhya',
  'Pari', 'Saanvi', 'Riya', 'Priya', 'Tanvi', 'Shreya', 'Neha', 'Pooja',
  'Sneha', 'Meera', 'Sunita', 'Kavita', 'Divya', 'Swati', 'Anjali', 'Priyanka'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Iyer', 'Rao', 'Mukherjee', 'Gupta', 'Reddy',
  'Nair', 'Singh', 'Joshi', 'Mehta', 'Kulkarni', 'Chatterjee', 'Agarwal', 'Desai',
  'Pillai', 'Choudhury', 'Bhatt', 'Malhotra', 'Nambiar', 'Goswami', 'Das', 'Ghosh',
  'Menon', 'Kapoor', 'Saxena'
];

const INDIAN_ADDRESSES = [
  'Flat 402, Shanti Kunj Apartments, Indiranagar, Bengaluru, KA 560038',
  'Plot 18, Road No. 12, Banjara Hills, Hyderabad, TS 500034',
  'B-204, Lodha Bellissimo, Lower Parel, Mumbai, MH 400013',
  'House 52, Sector 15, Noida, UP 201301',
  '45/A, Park Street, Near St. Xavier\'s, Kolkata, WB 700016',
  '12, Anna Salai, T. Nagar, Chennai, TN 600017',
  'C-8, Model Town Phase 2, New Delhi, DL 110009',
  '77, Lane 5, Koregaon Park, Pune, MH 411001',
  '23, Navrangpura, Near Gujarat University, Ahmedabad, GJ 380009',
  'Flat 101, Civil Lines, Near Raj Bhavan, Jaipur, RJ 302006',
  'House 14, Sector 22-B, Chandigarh, CH 160022',
  'Flat 3B, Gomti Nagar Phase 1, Lucknow, UP 226010',
  'Plot 88, Kaloor-Kadavanthra Road, Kochi, KL 682017',
  '102, Vijay Nagar Main Road, Indore, MP 452010',
  'B-12, Alkapuri Society, Vadodara, GJ 390007'
];

/**
 * Core Synthetic Data Generator
 * Builds realistic, fully interconnected relational datasets with strict integrity and labelled edge cases.
 */
export function generateMarketplaceDataset(options: GeneratorOptions = {}): Dataset {
  const seed = options.seed ?? 20261022;
  const prng = new DeterministicPRNG(seed);
  const sellerCount = options.sellerCount ?? 50;
  const listingsPerSellerAvg = options.listingsPerSellerAvg ?? 6;
  const orderCount = options.orderCount ?? 1200;
  const disputeRate = options.disputeRate ?? 0.08;
  const injectAnomalies = options.injectAnomalies ?? true;
  const scaleLabel = options.scaleLabel ?? `${sellerCount} Sellers / ${orderCount} Orders`;

  const now = new Date('2026-11-12T03:00:00Z');
  const baseDate = new Date('2026-08-01T00:00:00Z');
  const totalDaysSpan = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)); // ~103 days

  const sellers: Seller[] = [];
  const listings: ProductListing[] = [];
  const orders: Order[] = [];
  const orderLines: OrderLine[] = [];
  const fulfillments: Fulfillment[] = [];
  const reviews: CustomerReview[] = [];
  const disputes: Dispute[] = [];
  const payouts: Payout[] = [];
  const payoutLines: PayoutLine[] = [];
  const groundTruth: GroundTruthItem[] = [];

  // Helper date utility
  function randomDate(startDaysAgo: number, endDaysAgo: number): string {
    const days = prng.nextInt(Math.min(startDaysAgo, endDaysAgo), Math.max(startDaysAgo, endDaysAgo));
    const d = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    d.setHours(prng.nextInt(8, 20), prng.nextInt(0, 59), prng.nextInt(0, 59), 0);
    return d.toISOString();
  }

  function addHours(isoDate: string, hours: number): string {
    const d = new Date(isoDate);
    d.setHours(d.getHours() + hours);
    return d.toISOString();
  }

  // ==========================================
  // Step 2 & 3: Master Table - SELLERS
  // ==========================================
  for (let i = 1; i <= sellerCount; i++) {
    const sellerId = `SELL-${String(i).padStart(6, '0')}`;
    const baseName = BUSINESS_NAMES[(i - 1) % BUSINESS_NAMES.length];
    const nameSuffix = Math.floor((i - 1) / BUSINESS_NAMES.length) > 0 ? ` ${Math.floor((i - 1) / BUSINESS_NAMES.length) + 1}` : '';
    const businessName = `${baseName}${nameSuffix}`;
    const legalEntity = `${businessName} (India) Pvt Ltd`;
    
    // Tiers distribution
    const tierRoll = prng.next();
    const tier: SellerTier = tierRoll < 0.10 ? 'TIER_1_ENTERPRISE' :
                            tierRoll < 0.35 ? 'TIER_2_PRO' :
                            tierRoll < 0.80 ? 'TIER_3_STANDARD' : 'TIER_4_MICRO';

    // Status: Most active, some probation/suspended
    const statusRoll = prng.next();
    const status: SellerStatus = statusRoll < 0.85 ? 'ACTIVE' :
                                statusRoll < 0.94 ? 'PROBATION' :
                                statusRoll < 0.98 ? 'SUSPENDED' : 'ONBOARDING';

    // SLA performance metrics
    // Baseline compliant values
    let lateShipRate = prng.nextFloat(0.005, 0.035, 4);
    let cancelRate = prng.nextFloat(0.002, 0.020, 4);
    let disputeRateMetric = prng.nextFloat(0.003, 0.012, 4);
    let ratingAvg = prng.nextFloat(4.20, 4.95, 2);

    // If probation or suspended, reflect in metrics
    if (status === 'PROBATION') {
      lateShipRate = prng.nextFloat(0.045, 0.075, 4); // breaches 4%
      cancelRate = prng.nextFloat(0.028, 0.045, 4); // breaches 2.5%
      ratingAvg = prng.nextFloat(3.40, 3.85, 2);
    } else if (status === 'SUSPENDED') {
      lateShipRate = prng.nextFloat(0.080, 0.160, 4);
      cancelRate = prng.nextFloat(0.050, 0.110, 4);
      disputeRateMetric = prng.nextFloat(0.030, 0.080, 4);
      ratingAvg = prng.nextFloat(2.50, 3.30, 2);
    }

    const createdDaysAgo = prng.nextInt(60, 365);
    const createdAt = new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = randomDate(0, 15);

    sellers.push({
      id: sellerId,
      business_name: businessName,
      legal_entity: legalEntity,
      country: 'IN',
      tier,
      status,
      rating_avg: ratingAvg,
      late_shipment_rate: lateShipRate,
      cancellation_rate: cancelRate,
      return_dispute_rate: disputeRateMetric,
      reserve_rate: tier === 'TIER_1_ENTERPRISE' ? 0.08 : 0.10,
      hold_period_days: 14,
      created_at: createdAt,
      updated_at: updatedAt
    });
  }

  // ==========================================
  // Step 2 & 3: Master Table - PRODUCT LISTINGS
  // ==========================================
  let globalListingCount = 0;
  for (const seller of sellers) {
    const listingCount = prng.nextInt(Math.max(2, listingsPerSellerAvg - 2), listingsPerSellerAvg + 3);
    for (let j = 1; j <= listingCount; j++) {
      globalListingCount++;
      const listingId = `LIST-${seller.id}-${String(j).padStart(6, '0')}`;
      const category = prng.pick(CATEGORIES);
      const titlePool = PRODUCT_TITLES[category];
      const title = `${prng.pick(titlePool)} [${seller.business_name.substring(0, 4).toUpperCase()}]`;
      const sku = `SKU-${category.substring(0, 3).toUpperCase()}-${String(globalListingCount).padStart(5, '0')}`;
      const priceRange = CATEGORY_PRICE_RANGES[category] || [499.00, 4999.00];
      const price = prng.nextFloat(priceRange[0], priceRange[1], 2);
      const stock = prng.nextInt(10, 500);

      // Status: if seller is suspended, listing should normally be DELISTED_SANCTION unless edge case injected
      let listingStatus: any = 'ACTIVE';
      if (seller.status === 'SUSPENDED') {
        listingStatus = 'DELISTED_SANCTION';
      } else if (stock === 0) {
        listingStatus = 'OUT_OF_STOCK';
      } else if (prng.chance(0.05)) {
        listingStatus = 'ARCHIVED';
      }

      listings.push({
        id: listingId,
        seller_id: seller.id,
        title,
        category,
        sku,
        price,
        stock_quantity: stock,
        status: listingStatus,
        created_at: addHours(seller.created_at, prng.nextInt(2, 72))
      });
    }
  }

  // ==========================================
  // Step 2 & 3: ORDERS, ORDER LINES & FULFILLMENTS
  // Multi-seller orders splitting + fulfillment lifecycle
  // ==========================================
  let globalOrderLineCount = 0;
  let globalDisputeCount = 0;
  let globalReviewCount = 0;

  for (let i = 1; i <= orderCount; i++) {
    const orderId = `ORD-2026-${String(i).padStart(6, '0')}`;
    const custNum = prng.nextInt(1, Math.floor(orderCount * 0.4));
    const customerId = `CUST-${String(custNum).padStart(6, '0')}`;
    const custFirstName = prng.pick(FIRST_NAMES);
    const custLastName = prng.pick(LAST_NAMES);
    const customerName = `${custFirstName} ${custLastName}`;
    const customerEmail = `${custFirstName.toLowerCase()}.${custLastName.toLowerCase()}${custNum % 99}@gmail.com`;
    const shippingAddress = prng.pick(INDIAN_ADDRESSES);

    // Order placed between 90 days ago and today
    const placedAt = randomDate(1, Math.min(90, totalDaysSpan));

    // Multi-seller lines: 65% single line, 25% 2 lines (often multi-seller), 10% 3 lines
    const lineCountRoll = prng.next();
    const linesToGenerate = lineCountRoll < 0.65 ? 1 : lineCountRoll < 0.90 ? 2 : 3;

    let orderTotal = 0;
    const thisOrderLines: OrderLine[] = [];
    const thisFulfillments: Fulfillment[] = [];

    // Choose eligible listings from non-suspended sellers (mostly)
    const availableListings = listings.filter(l => l.status === 'ACTIVE' || l.status === 'OUT_OF_STOCK');
    const selectedListings: ProductListing[] = [];
    for (let l = 0; l < linesToGenerate; l++) {
      const chosen = prng.pick(availableListings.length > 0 ? availableListings : listings);
      selectedListings.push(chosen);
    }

    for (let lIdx = 0; lIdx < selectedListings.length; lIdx++) {
      globalOrderLineCount++;
      const listing = selectedListings[lIdx];
      const lineId = `OLINE-${orderId}-${String(lIdx + 1).padStart(2, '0')}`;
      const quantity = prng.nextInt(1, 3);
      const subtotal = Math.round(quantity * listing.price * 100) / 100;
      orderTotal = Math.round((orderTotal + subtotal) * 100) / 100;

      const seller = sellers.find(s => s.id === listing.seller_id)!;
      const { rate: commRate, fee: commFee } = calculateCommission(
        subtotal,
        listing.category,
        seller.tier,
        DEFAULT_COMMISSION_RULES
      );

      const orderLine: OrderLine = {
        id: lineId,
        order_id: orderId,
        listing_id: listing.id,
        seller_id: listing.seller_id,
        quantity,
        unit_price: listing.price,
        subtotal,
        category: listing.category,
        commission_rate: commRate,
        commission_amount: commFee,
        created_at: placedAt
      };
      orderLines.push(orderLine);
      thisOrderLines.push(orderLine);

      // Fulfillment record (1:1 with OrderLine)
      const fulId = `FUL-${lineId}`;
      const shipByDeadline = addHours(placedAt, 48); // 48 hr SLA deadline
      const orderAgeHours = (now.getTime() - new Date(placedAt).getTime()) / (1000 * 60 * 60);

      let fulStatus: FulfillmentStatus = 'DELIVERED';
      let shippedAt: string | null = null;
      let deliveredAt: string | null = null;
      let isLate = false;

      if (orderAgeHours < 24) {
        fulStatus = prng.pick(['CREATED', 'PICKED', 'PACKED']);
      } else if (orderAgeHours < 72) {
        // May be shipped or still packing
        if (prng.chance(0.3)) {
          fulStatus = 'PACKED';
        } else {
          fulStatus = 'SHIPPED';
          const dispatchHours = prng.nextInt(12, 60);
          shippedAt = addHours(placedAt, dispatchHours);
          isLate = dispatchHours > 48;
        }
      } else {
        // Older than 72 hours
        const dispatchHours = prng.chance(seller.late_shipment_rate) 
          ? prng.nextInt(50, 96) // Late shipment
          : prng.nextInt(12, 44); // On time shipment
        shippedAt = addHours(placedAt, dispatchHours);
        isLate = dispatchHours > 48;

        const transitHours = prng.nextInt(48, 120);
        deliveredAt = addHours(shippedAt, transitHours);

        if (new Date(deliveredAt) > now) {
          fulStatus = 'SHIPPED';
          deliveredAt = null;
        } else {
          // If return occurs
          if (prng.chance(0.03)) {
            fulStatus = 'RETURNED';
          } else {
            fulStatus = 'DELIVERED';
          }
        }
      }

      const fulfillment: Fulfillment = {
        id: fulId,
        order_line_id: lineId,
        order_id: orderId,
        seller_id: listing.seller_id,
        warehouse_id: prng.pick(WAREHOUSES),
        carrier: prng.pick(CARRIERS),
        tracking_number: `TRK${prng.nextInt(10000000, 99999999)}${seller.country}`,
        status: fulStatus,
        ship_by_deadline: shipByDeadline,
        shipped_at: shippedAt,
        delivered_at: deliveredAt,
        is_late: isLate,
        delivery_sla_days: prng.nextInt(3, 5)
      };
      fulfillments.push(fulfillment);
      thisFulfillments.push(fulfillment);

      // Reviews for delivered lines
      if (fulStatus === 'DELIVERED' && deliveredAt && prng.chance(0.25)) {
        globalReviewCount++;
        const revId = `REV-2026-${String(globalReviewCount).padStart(6, '0')}`;
        // Realistic distribution skewed positive, with negative reviews on late items
        let rating = prng.chance(0.70) ? prng.pick([4, 5]) : prng.chance(0.60) ? 3 : prng.pick([1, 2]);
        if (isLate && prng.chance(0.60)) {
          rating = prng.pick([1, 2, 3]);
        }

        const sentiment = rating >= 4 ? 'POSITIVE' : rating === 3 ? 'NEUTRAL' : 'NEGATIVE';
        const reviewDate = addHours(deliveredAt, prng.nextInt(6, 72));

        reviews.push({
          id: revId,
          order_id: orderId,
          order_line_id: lineId,
          seller_id: listing.seller_id,
          customer_id: customerId,
          rating,
          comment: rating >= 4 
            ? 'Item arrived as expected, great build quality and speedy packaging.'
            : rating === 3 
            ? 'Adequate product. Delivery took a little longer than expected.'
            : 'Poor experience. Disappointed with the condition or delayed transit.',
          sentiment,
          verified_purchase: true,
          created_at: reviewDate
        });
      }

      // Disputes & Chargebacks
      const eligibleForDispute = fulStatus === 'DELIVERED' || (fulStatus === 'SHIPPED' && orderAgeHours > 120);
      if (eligibleForDispute && prng.chance(disputeRate)) {
        globalDisputeCount++;
        const dspId = `DSP-2026-${String(globalDisputeCount).padStart(6, '0')}`;
        const reasons: DisputeReason[] = isLate 
          ? ['LATE_DELIVERY', 'ITEM_NOT_RECEIVED']
          : ['DAMAGED_GOODS', 'NOT_AS_DESCRIBED', 'ITEM_NOT_RECEIVED', 'UNAUTHORIZED_CHARGE'];
        const reason = prng.pick(reasons);
        const claimAmount = subtotal; // full refund claim
        
        // Arbitration status
        const dspRoll = prng.next();
        const dspStatus: DisputeStatus = dspRoll < 0.40 ? 'RESOLVED_CUSTOMER_WON' :
                                         dspRoll < 0.70 ? 'RESOLVED_MERCHANT_WON' :
                                         dspRoll < 0.85 ? 'SELLER_RESPONDED' : 'UNDER_REVIEW';

        const customerWon = dspStatus === 'RESOLVED_CUSTOMER_WON';
        const filedAt = addHours(deliveredAt || placedAt, prng.nextInt(24, 168));
        const resolvedAt = (dspStatus.startsWith('RESOLVED')) ? addHours(filedAt, prng.nextInt(48, 120)) : null;

        disputes.push({
          id: dspId,
          order_id: orderId,
          order_line_id: lineId,
          seller_id: listing.seller_id,
          reason,
          claim_amount: claimAmount,
          status: dspStatus,
          customer_won: customerWon,
          deduction_applied: customerWon, // default true when won, unless injected anomaly
          filed_at: filedAt,
          resolved_at: resolvedAt
        });
      }
    }

    // Determine aggregate order status
    let aggStatus: Order['order_status'] = 'COMPLETED';
    const allDelivered = thisFulfillments.every(f => f.status === 'DELIVERED');
    const anyShipped = thisFulfillments.some(f => f.status === 'SHIPPED');
    const anyCreated = thisFulfillments.some(f => ['CREATED', 'PICKED', 'PACKED'].includes(f.status));
    
    if (allDelivered) {
      aggStatus = 'COMPLETED';
    } else if (anyShipped) {
      aggStatus = 'PARTIALLY_FULFILLED';
    } else if (anyCreated) {
      aggStatus = 'PROCESSING';
    }

    orders.push({
      id: orderId,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      order_status: aggStatus,
      total_amount: orderTotal,
      shipping_address: shippingAddress,
      placed_at: placedAt,
      currency: 'INR'
    });
  }

  // ==========================================
  // Step 2 & 3: PAYOUTS & PAYOUT LINES
  // Calculated derived values: Gross, Commission, Disputes, Reserve Holds
  // ==========================================
  let globalPayoutCount = 0;
  let globalPayoutLineCount = 0;

  for (const seller of sellers) {
    // Collect all order lines for this seller
    const sellerLines = orderLines.filter(ol => ol.seller_id === seller.id);
    if (sellerLines.length === 0) continue;

    // Filter to order lines that are DELIVERED and passed 14-day hold period
    const eligibleLines: { line: OrderLine; ful: Fulfillment }[] = [];
    const pendingHoldLines: { line: OrderLine; ful: Fulfillment }[] = [];

    for (const line of sellerLines) {
      const ful = fulfillments.find(f => f.order_line_id === line.id);
      if (ful && ful.status === 'DELIVERED' && ful.delivered_at) {
        const daysSinceDelivery = (now.getTime() - new Date(ful.delivered_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery >= seller.hold_period_days) {
          eligibleLines.push({ line, ful });
        } else {
          pendingHoldLines.push({ line, ful });
        }
      }
    }

    // Generate at least 1 payout batch per seller with activity
    globalPayoutCount++;
    const payoutId = `PAYOUT-2026-${String(globalPayoutCount).padStart(6, '0')}`;
    const periodStart = '2026-10-01';
    const periodEnd = '2026-10-31';
    const scheduledPayoutDate = '2026-11-14';

    // Lines to include in this settlement batch
    // Baseline: include eligible lines
    const batchLines = eligibleLines.slice(0, Math.min(eligibleLines.length, 15));
    
    let grossSales = 0;
    let totalCommission = 0;
    const thisBatchPayoutLines: PayoutLine[] = [];

    // 1. Merchandise Credits & Commission Deductions
    for (const item of batchLines) {
      grossSales += item.line.subtotal;
      totalCommission += item.line.commission_amount;

      globalPayoutLineCount++;
      thisBatchPayoutLines.push({
        id: `PLINE-${payoutId}-${String(thisBatchPayoutLines.length + 1).padStart(2, '0')}`,
        payout_id: payoutId,
        order_line_id: item.line.id,
        type: 'MERCHANDISE_CREDIT',
        amount: item.line.subtotal,
        description: `Credit: Order ${item.line.order_id} Item ${item.line.id}`,
        created_at: now.toISOString()
      });

      thisBatchPayoutLines.push({
        id: `PLINE-${payoutId}-${String(thisBatchPayoutLines.length + 1).padStart(2, '0')}`,
        payout_id: payoutId,
        order_line_id: item.line.id,
        type: 'COMMISSION_FEE',
        amount: -item.line.commission_amount,
        description: `Marketplace Fee (${Math.round(item.line.commission_rate * 100)}%): ${item.line.id}`,
        created_at: now.toISOString()
      });
    }

    grossSales = Math.round(grossSales * 100) / 100;
    totalCommission = Math.round(totalCommission * 100) / 100;

    // 2. Dispute deductions
    let disputeDeductions = 0;
    const sellerDisputes = disputes.filter(d => d.seller_id === seller.id && d.customer_won && d.deduction_applied);
    for (const dsp of sellerDisputes.slice(0, 2)) {
      disputeDeductions += dsp.claim_amount;
      thisBatchPayoutLines.push({
        id: `PLINE-${payoutId}-${String(thisBatchPayoutLines.length + 1).padStart(2, '0')}`,
        payout_id: payoutId,
        order_line_id: dsp.order_line_id,
        type: 'DISPUTE_CLAWBACK',
        amount: -dsp.claim_amount,
        description: `Chargeback Clawback: Dispute ${dsp.id} Reason: ${dsp.reason}`,
        created_at: now.toISOString()
      });
    }
    disputeDeductions = Math.round(disputeDeductions * 100) / 100;

    // 3. Rolling Reserve Hold & Release
    const reserveHeld = Math.round(grossSales * seller.reserve_rate * 100) / 100;
    if (reserveHeld > 0) {
      thisBatchPayoutLines.push({
        id: `PLINE-${payoutId}-${String(thisBatchPayoutLines.length + 1).padStart(2, '0')}`,
        payout_id: payoutId,
        order_line_id: null,
        type: 'RESERVE_HOLD',
        amount: -reserveHeld,
        description: `Rolling Risk Reserve Hold (${Math.round(seller.reserve_rate * 100)}%) for 14 Days`,
        created_at: now.toISOString()
      });
    }

    // Mature reserve release from previous cycle
    const reserveReleased = Math.round(reserveHeld * 0.90 * 100) / 100;
    if (reserveReleased > 0) {
      thisBatchPayoutLines.push({
        id: `PLINE-${payoutId}-${String(thisBatchPayoutLines.length + 1).padStart(2, '0')}`,
        payout_id: payoutId,
        order_line_id: null,
        type: 'RESERVE_RELEASE',
        amount: reserveReleased,
        description: `Release Matured Reserve from Cycle Prior to ${periodStart}`,
        created_at: now.toISOString()
      });
    }

    // Calculate Net Amount
    const netAmount = Math.round(
      (grossSales - totalCommission - disputeDeductions - reserveHeld + reserveReleased) * 100
    ) / 100;

    // Payout Status
    let payoutStatus: Payout['status'] = 'ELIGIBLE';
    if (seller.status === 'SUSPENDED') {
      payoutStatus = 'BLOCKED_SUSPENDED';
    } else if (seller.status === 'PROBATION') {
      payoutStatus = 'PENDING_AUDIT';
    } else if (netAmount <= 0) {
      payoutStatus = 'PENDING_AUDIT';
    }

    const payout: Payout = {
      id: payoutId,
      seller_id: seller.id,
      period_start: periodStart,
      period_end: periodEnd,
      gross_sales: grossSales,
      total_commission: totalCommission,
      dispute_deductions: disputeDeductions,
      reserve_held: reserveHeld,
      reserve_released: reserveReleased,
      net_amount: netAmount,
      status: payoutStatus,
      scheduled_payout_date: scheduledPayoutDate,
      paid_at: null
    };

    payouts.push(payout);
    payoutLines.push(...thisBatchPayoutLines);
  }

  // =========================================================================
  // Step 5: INJECT LABELLED EDGE CASES & RECORD TO SEPARATE GROUND TRUTH
  // =========================================================================
  if (injectAnomalies && payouts.length >= 5) {
    let gtCounter = 0;

    // Edge Case 1: Payout before delivery/hold release (premature payout)
    // Find an active payout, inject a line item whose order is NOT yet delivered or within 14-day hold
    const p1 = payouts[0];
    const nonDeliveredFul = fulfillments.find(f => f.status === 'SHIPPED' || f.status === 'CREATED');
    if (nonDeliveredFul) {
      const targetLine = orderLines.find(ol => ol.id === nonDeliveredFul.order_line_id);
      if (targetLine) {
        gtCounter++;
        p1.status = 'ELIGIBLE'; // Marked eligible despite unfulfilled goods
        const origGross = p1.gross_sales;
        const targetComm = calculateCommission(targetLine.subtotal, targetLine.category, 'TIER_3_STANDARD');
        p1.gross_sales = Math.round((p1.gross_sales + targetLine.subtotal) * 100) / 100;
        p1.total_commission = Math.round((p1.total_commission + targetComm.fee) * 100) / 100;
        p1.net_amount = Math.round((p1.net_amount + targetLine.subtotal - targetComm.fee) * 100) / 100;
        
        // Add premature credit line
        const prematurePlId = `PLINE-${p1.id}-${String(payoutLines.filter(pl => pl.payout_id === p1.id).length + 1).padStart(2, '0')}`;
        payoutLines.push({
          id: prematurePlId,
          payout_id: p1.id,
          order_line_id: targetLine.id,
          type: 'MERCHANDISE_CREDIT',
          amount: targetLine.subtotal,
          description: `[ANOMALY] Premature Credit: Order ${targetLine.order_id} Item not delivered (status: ${nonDeliveredFul.status})`,
          created_at: now.toISOString()
        });
        // Add matching fee line
        payoutLines.push({
          id: `PLINE-${p1.id}-FEE99`,
          payout_id: p1.id,
          order_line_id: targetLine.id,
          type: 'COMMISSION_FEE',
          amount: -targetComm.fee,
          description: `Fee: Order ${targetLine.order_id}`,
          created_at: now.toISOString()
        });

        groundTruth.push({
          id: `GT-${String(gtCounter).padStart(4, '0')}`,
          entity_type: 'Payout',
          entity_id: p1.id,
          parent_id: targetLine.id,
          anomaly_type: 'PAYOUT_BEFORE_DELIVERY_OR_HOLD',
          severity: 'CRITICAL',
          description: `Payout ${p1.id} includes OrderLine ${targetLine.id} whose fulfillment status is ${nonDeliveredFul.status} before delivery and 14-day hold release.`,
          expected_state: {
            fulfillment_status: 'DELIVERED',
            hold_window_satisfied: true,
            payout_status: 'HELD_VIOLATION'
          },
          actual_state: {
            fulfillment_status: nonDeliveredFul.status,
            hold_window_satisfied: false,
            payout_status: p1.status
          },
          detection_rule: 'RULE_TEMPORAL_DELIVERY_HOLD_CHECK',
          remediation: 'Withhold payout until fulfillment transitions to DELIVERED and post-delivery 14-day hold window matures.'
        });
      }
    }

    // Edge Case 2: Duplicate commission fee applied
    const p2 = payouts[1];
    const p2Lines = payoutLines.filter(pl => pl.payout_id === p2.id && pl.type === 'COMMISSION_FEE');
    if (p2Lines.length > 0) {
      gtCounter++;
      const targetCommLine = p2Lines[0];
      const dupPlId = `PLINE-${p2.id}-DUP99`;
      const duplicateFeeLine: PayoutLine = {
        id: dupPlId,
        payout_id: p2.id,
        order_line_id: targetCommLine.order_line_id,
        type: 'COMMISSION_FEE',
        amount: targetCommLine.amount,
        description: `[ANOMALY] Duplicate Commission Deduction for OrderLine ${targetCommLine.order_line_id}`,
        created_at: now.toISOString()
      };
      payoutLines.push(duplicateFeeLine);
      p2.total_commission = Math.round((p2.total_commission + Math.abs(targetCommLine.amount)) * 100) / 100;
      p2.net_amount = Math.round((p2.net_amount - Math.abs(targetCommLine.amount)) * 100) / 100;

      groundTruth.push({
        id: `GT-${String(gtCounter).padStart(4, '0')}`,
        entity_type: 'PayoutLine',
        entity_id: dupPlId,
        parent_id: p2.id,
        anomaly_type: 'DUPLICATE_COMMISSION_APPLIED',
        severity: 'HIGH',
        description: `Commission was deducted twice on OrderLine ${targetCommLine.order_line_id} in Payout ${p2.id}.`,
        expected_state: {
          commission_line_count: 1,
          total_commission: Math.round((p2.total_commission - Math.abs(targetCommLine.amount)) * 100) / 100
        },
        actual_state: {
          commission_line_count: 2,
          total_commission: p2.total_commission
        },
        detection_rule: 'RULE_NO_DUPLICATE_COMMISSION',
        remediation: 'Reverse duplicate commission ledger line and credit back the over-deducted fee to seller net balance.'
      });
    }

    // Edge Case 3: Suspended seller continues listing active products
    const suspendedSeller = sellers.find(s => s.status === 'SUSPENDED') || sellers[sellers.length - 1];
    suspendedSeller.status = 'SUSPENDED'; // ensure suspended
    // Find one of their listings and set it to ACTIVE
    const suspendedSellerListing = listings.find(l => l.seller_id === suspendedSeller.id);
    if (suspendedSellerListing) {
      gtCounter++;
      suspendedSellerListing.status = 'ACTIVE';

      groundTruth.push({
        id: `GT-${String(gtCounter).padStart(4, '0')}`,
        entity_type: 'ProductListing',
        entity_id: suspendedSellerListing.id,
        parent_id: suspendedSeller.id,
        anomaly_type: 'SUSPENDED_SELLER_ACTIVE_LISTINGS',
        severity: 'CRITICAL',
        description: `Seller ${suspendedSeller.id} is marked SUSPENDED, but catalog listing ${suspendedSellerListing.id} remains ACTIVE.`,
        expected_state: {
          seller_status: 'SUSPENDED',
          listing_status: 'DELISTED_SANCTION'
        },
        actual_state: {
          seller_status: 'SUSPENDED',
          listing_status: 'ACTIVE'
        },
        detection_rule: 'RULE_SANCTIONED_SELLER_NO_ACTIVE_LISTINGS',
        remediation: 'Immediately delist and transition listing status to DELISTED_SANCTION to prevent cart additions.'
      });
    }

    // Edge Case 4: Dispute not deducted from payout
    const p4 = payouts[2] || payouts[0];
    const wonDispute = disputes.find(d => d.seller_id === p4.seller_id && d.customer_won) || disputes[0];
    if (wonDispute) {
      gtCounter++;
      wonDispute.deduction_applied = false; // Flag that clawback was not applied
      // Remove any clawback lines for this dispute
      const idx = payoutLines.findIndex(pl => pl.payout_id === p4.id && pl.order_line_id === wonDispute.order_line_id && pl.type === 'DISPUTE_CLAWBACK');
      if (idx !== -1) {
        const removed = payoutLines.splice(idx, 1)[0];
        p4.dispute_deductions = Math.max(0, Math.round((p4.dispute_deductions - Math.abs(removed.amount)) * 100) / 100);
        p4.net_amount = Math.round((p4.net_amount + Math.abs(removed.amount)) * 100) / 100;
      }

      groundTruth.push({
        id: `GT-${String(gtCounter).padStart(4, '0')}`,
        entity_type: 'Dispute',
        entity_id: wonDispute.id,
        parent_id: p4.id,
        anomaly_type: 'DISPUTE_NOT_DEDUCTED',
        severity: 'HIGH',
        description: `Dispute ${wonDispute.id} was won by customer (claim: $${wonDispute.claim_amount}), but clawback was omitted from Payout ${p4.id}.`,
        expected_state: {
          dispute_won: true,
          deduction_applied: true,
          clawback_line_present: true
        },
        actual_state: {
          dispute_won: true,
          deduction_applied: false,
          clawback_line_present: false
        },
        detection_rule: 'RULE_DISPUTE_CLAWBACK_RECONCILIATION',
        remediation: 'Post a negative ledger line DISPUTE_CLAWBACK and reduce seller net disbursement by claim amount.'
      });
    }

    // Edge Case 5: Payout total does not equal lines (arithmetic mismatch)
    const p5 = payouts[3] || payouts[payouts.length - 1];
    if (p5) {
      gtCounter++;
      const trueSum = payoutLines
        .filter(pl => pl.payout_id === p5.id)
        .reduce((sum, pl) => sum + pl.amount, 0);
      const corruptedNet = Math.round((trueSum + 425.50) * 100) / 100;
      const originalNet = p5.net_amount;
      p5.net_amount = corruptedNet; // Injected mismatch

      groundTruth.push({
        id: `GT-${String(gtCounter).padStart(4, '0')}`,
        entity_type: 'Payout',
        entity_id: p5.id,
        anomaly_type: 'PAYOUT_SUM_MISMATCH',
        severity: 'CRITICAL',
        description: `Payout ${p5.id} header net_amount ($${corruptedNet}) does not reconcile to sum of line items ($${Math.round(trueSum * 100) / 100}). Discrepancy: +$425.50.`,
        expected_state: {
          header_net_amount: Math.round(trueSum * 100) / 100,
          sum_payout_lines: Math.round(trueSum * 100) / 100,
          delta: 0.00
        },
        actual_state: {
          header_net_amount: corruptedNet,
          sum_payout_lines: Math.round(trueSum * 100) / 100,
          delta: 425.50
        },
        detection_rule: 'RULE_PAYOUT_HEADER_LINE_RECONCILIATION',
        remediation: 'Recompute payout header net_amount as exact arithmetic sum of constituent payout_lines.'
      });
    }
  }

  return {
    seed,
    scale_label: scaleLabel,
    created_at: now.toISOString(),
    sellers,
    listings,
    orders,
    orderLines,
    fulfillments,
    reviews,
    disputes,
    commissionRules: DEFAULT_COMMISSION_RULES,
    payouts,
    payoutLines,
    groundTruth
  };
}

import { Scenario } from '@/app/types/scenario';
import { 
  ShieldCheck, 
  Camera, 
  Target, 
  Search, 
  TrendingDown, 
  AlertTriangle,
  Truck,
  Thermometer,
  FileText,
  FileCheck,
  Package,
  ArrowRightLeft,
  Ship,
  Shield,
  Coins,
  XCircle,
  CreditCard,
  TrendingUp,
  Calendar,
  RefreshCw,
  Users,
  UserPlus,
  MessageCircle,
  Scale,
  CalendarCheck,
  Wrench,
  Palette
} from 'lucide-react';

export const scenarios: Scenario[] = [
  // ==================== COMMERCIAL - Sales (4 scenarios) ====================
  
  {
    id: 'commercial-4',
    title: 'Promo Compliance Check',
    function: 'Commercial',
    description: 'Experience manual price checking, then watch AI do it in seconds.',
    problem: 'You need to audit 150 SKUs across retailer websites vs JBP agreements.',
    icon: ShieldCheck,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '45-60 min',
    oldWaySteps: [
      'Check promo calendar',
      'List participating retailers',
      'Visit each retailer website manually',
      'Navigate to beverage section',
      'Screenshot prices',
      'Compare to contracted price',
      'Track in spreadsheet',
      'Draft compliance emails'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Identify Active Promotions',
        description: 'Pull current promos and participating retailers',
        tools: ['Promo Management'],
        dataUsed: ['Active promotions', 'Retailer contracts'],
        successCriteria: '"Buy 2 Get $2 Off" on Coke 12pk, 24 retailers, runs through month-end',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-2',
        title: 'Scrape Retailer Websites',
        description: 'Check online prices across all retailers',
        tools: ['Web Scraping Engine'],
        dataUsed: ['Retailer sites', 'Product SKUs'],
        successCriteria: '24 checked: 20 compliant, 4 showing full price',
        requiresHITL: false,
        duration: 7
      },
      {
        id: 'step-3',
        title: 'Flag Non-Compliance',
        description: 'Generate report and alert retailers',
        tools: ['Compliance Reporter'],
        dataUsed: ['Scraping results', 'Contacts'],
        successCriteria: '4 violations: FoodMax (2 stores), QuickShop, ValueMart',
        requiresHITL: true,
        hitlMessage: '4 retailers not honoring the promotion. Review violations before sending alerts.',
        hitlActionContent: {
          title: '⚠️ Promo Compliance Violations',
          sections: [
            { heading: 'Promo', content: 'Buy 2 Get $2 Off Coke 12pk • Mar 15-31 • 24 retailers • 83% compliance' },
            { heading: 'Violations', bullets: ['FoodMax #4289: $7.99 (should be $6.99)', 'FoodMax #4312: $7.99 (should be $6.99)', 'QuickShop: $8.49 (should be $7.49)', 'ValueMart: $7.79 (should be $6.79)'] },
            { heading: 'Impact', content: '$8,400 lost promotional volume over remaining 9 days' }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '42-57 min', impactMetric: '24 retailers checked • $8.4K leak found' },
    learningModules: ['Web Scraping', 'Compliance Monitoring'],
    flagship: true,
    startHere: true
  },

  {
    id: 'commercial-1',
    title: 'Shelf Gap Detection & Auto-Restock',
    function: 'Commercial',
    description: 'One photo stages a complete restock order.',
    problem: 'Walking SuperMart aisle, you notice empty Coke Zero slots.',
    icon: Camera,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '25-30 min',
    oldWaySteps: [
      'Manually tally empty spots on paper',
      'Write down SKU numbers from shelf tags',
      'Return to car, look up each SKU in system',
      'Check inventory levels',
      'Calculate restock quantities',
      'Log into ordering portal',
      'Create manual purchase order',
      'Email store manager',
      'Update CRM visit notes'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Analyze Shelf Photo with Computer Vision',
        description: 'AI detects gaps and identifies missing SKUs via planogram',
        tools: ['Image Recognition AI', 'Planogram DB'],
        dataUsed: ['Shelf photo', 'Store planogram', 'Product catalog'],
        successCriteria: '3 gaps: Coke Zero 12pk (2 facings), Coke Zero 6pk (1 facing), Diet Coke 2L (1 facing)',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-2',
        title: 'Calculate Restock Order',
        description: 'Check store inventory and sales velocity to optimize order size',
        tools: ['Inventory System', 'Order Calculator'],
        dataUsed: ['Current stock', 'Sales velocity', 'Lead times'],
        successCriteria: 'Order: 24 units Coke Zero 12pk, 12 units Coke Zero 6pk, 6 units Diet Coke 2L',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-3',
        title: 'Stage Restock Order for Approval',
        description: 'Draft PO and store manager notification',
        tools: ['Order Management', 'Email Automation'],
        dataUsed: ['Order details', 'Delivery schedule', 'Store contacts'],
        successCriteria: 'PO #RST-48291 ready, delivery tomorrow 6am',
        requiresHITL: true,
        hitlMessage: 'Review the restock order before I submit to warehouse and notify the store manager.',
        hitlActionContent: {
          title: '📦 Restock Order - SuperMart Downtown',
          sections: [
            { heading: 'Gaps Detected', bullets: ['Coke Zero 12pk: 2 facings empty', 'Coke Zero 6pk: 1 facing empty', 'Diet Coke 2L: 1 facing empty'] },
            { heading: 'Proposed Order', bullets: ['24× Coke Zero 12pk ($215)', '12× Coke Zero 6pk ($86)', '6× Diet Coke 2L ($18)', '**Total: $319 • 42 units**'] },
            { heading: 'Delivery', content: 'Tomorrow 6-8am from Atlanta DC to Mike Johnson (mike.j@supermart.com)' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '23-28 min', impactMetric: 'Photo to order in 2 min • Zero manual entry' },
    learningModules: ['Computer Vision AI', 'Auto-Restock Workflows'],
    startHere: true
  },

  {
    id: 'commercial-2',
    title: 'Pre-Meeting Buyer Intel',
    function: 'Commercial',
    description: 'Get 3-bullet buyer summary in seconds.',
    problem: 'Walmart buyer meeting in 30 min. Need quick account intel.',
    icon: Target,
    difficulty: 'Beginner',
    estimatedTime: '3 min',
    oldWayTime: '30-40 min',
    oldWaySteps: [
      'Log into Customer 360 portal',
      'Export 12 months of transaction data',
      'Create Excel pivot tables',
      'Open promo performance dashboard',
      'Cross-reference email history',
      'Check buyer LinkedIn profile',
      'Look up market share data',
      'Manually type talking points',
      'Email document to yourself'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Pull Account Performance',
        description: 'Get 12-month sales, promo participation, category trends',
        tools: ['Customer 360', 'Sales Analytics'],
        dataUsed: ['Transaction history', 'Promo data', 'Category performance'],
        successCriteria: '$4.8M YTD (-3% YoY), 18% promo rate, Zero Sugar +22%',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-2',
        title: 'Generate 3-Bullet Summary',
        description: 'AI synthesizes key insights',
        tools: ['AI Insight Generator'],
        dataUsed: ['Performance trends', 'Benchmarks'],
        successCriteria: '3 insights: (1) Diet Coke decline, (2) Zero Sugar opportunity, (3) Promo gap',
        requiresHITL: true,
        hitlMessage: 'Review these key insights before using them in your buyer meeting.',
        hitlActionContent: {
          title: '📊 Walmart Buyer Meeting Brief',
          sections: [
            { heading: 'Account Summary', content: '$4.8M YTD revenue • Down 3% YoY • 18% promo participation rate' },
            { heading: 'Key Insights', bullets: ['Diet Coke declining 12% - category trend impacting sales', 'Zero Sugar +22% growth - major opportunity to expand', 'Promo gap: only 18% vs 24% category average'] },
            { heading: 'Recommended Talk Track', content: 'Lead with Zero Sugar success, propose increased distribution. Address Diet Coke with category context.' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '27-37 min', impactMetric: 'Meeting-ready in 3 min' },
    learningModules: ['Account Intelligence', 'Meeting Prep Agents'],
    startHere: true
  },

  {
    id: 'commercial-3',
    title: 'Local Lead Scouting',
    function: 'Commercial',
    description: 'Auto-populate CRM with new store leads.',
    problem: 'Territory has 40+ stores but CRM shows only 28.',
    icon: Search,
    difficulty: 'Intermediate',
    estimatedTime: '4 min',
    oldWayTime: '60-90 min',
    oldWaySteps: [
      'Google "convenience stores [zip]"',
      'Click through pages of results',
      'Check Google Maps',
      'Compare each against CRM manually',
      'Look up owner info on LinkedIn',
      'Find phone numbers',
      'Create new CRM entries one by one',
      'Categorize store types',
      'Assign to territory'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Scan Territory for New Stores',
        description: 'Search business databases and maps',
        tools: ['Google Business API', 'Territory Mapping'],
        dataUsed: ['Territory boundaries', 'Business registrations'],
        successCriteria: '47 locations found, 28 in CRM, 19 new prospects',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-2',
        title: 'Enrich Contact Data',
        description: 'Look up owners, phone numbers, details',
        tools: ['Contact Enrichment API', 'LinkedIn Scraper'],
        dataUsed: ['Business names', 'Public records'],
        successCriteria: 'Contact info found for 16/19 stores',
        requiresHITL: false,
        duration: 8
      },
      {
        id: 'step-3',
        title: 'Stage CRM Import',
        description: 'Prepare bulk CRM entries',
        tools: ['CRM Bulk Import'],
        dataUsed: ['Store details', 'Contact info'],
        successCriteria: '16 new entries ready with full contact data',
        requiresHITL: true,
        hitlMessage: 'Found 19 stores not in CRM, enriched 16. Review before adding to Salesforce.',
        hitlActionContent: {
          title: '📍 New Prospects - North Atlanta',
          sections: [
            { heading: 'Summary', content: '19 new stores found (47 total vs 28 in CRM). Enriched 16 with contacts.' },
            { heading: 'Top Prospects', bullets: ['Patel\'s Corner • Raj Patel • (404) 555-2847', 'QuickStop Market • Lisa Chen • (404) 555-8291', 'Neighborhood Grocery • John Martinez • (404) 555-3194'] }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '56-86 min', impactMetric: '19 prospects • 16 enriched • Ready to import' },
    learningModules: ['Lead Generation', 'Data Enrichment']
  },

  // ==================== SUPPLY CHAIN - Logistics, Planning, Procurement (4 scenarios) ====================
  
  {
    id: 'supply-chain-1',
    title: 'Dynamic Route Rerouting',
    function: 'Supply Chain',
    description: 'Auto-reroute trucks around traffic/closures.',
    problem: 'I-85 North closed due to accident. 6 trucks heading into 2-hour delays.',
    icon: Truck,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '30-45 min',
    oldWaySteps: [
      'Get alert from driver call',
      'Check Google Maps for delay',
      'Call each affected driver',
      'Ask current location',
      'Verbally guide alternate route',
      'Check if route affects schedule',
      'Call customers about delays',
      'Update dispatch system',
      'Monitor via periodic check-ins'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Detect Traffic Incident',
        description: 'Monitor real-time traffic feeds',
        tools: ['Traffic API', 'GPS Fleet Tracking'],
        dataUsed: ['Live traffic', 'Truck locations', 'Planned routes'],
        successCriteria: 'I-85N closed at Exit 102, 6 trucks affected, 90-120 min delay',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Calculate Optimal Reroutes',
        description: 'Generate alternate routes for each truck',
        tools: ['Route Optimizer'],
        dataUsed: ['Truck locations', 'Delivery windows', 'Alternate routes'],
        successCriteria: '5 trucks via I-985 (+15min), 1 truck via US-23 (+22min) - all on time',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-3',
        title: 'Push Routes to Drivers',
        description: 'Send new routes to GPS systems',
        tools: ['Fleet Management', 'Driver App'],
        dataUsed: ['New routes', 'Driver contacts', 'ETAs'],
        successCriteria: 'Routes pushed to 6 drivers, notifications sent',
        requiresHITL: true,
        hitlMessage: 'Review optimized routes before pushing to 6 drivers.',
        hitlActionContent: {
          title: '🚛 Reroute Plan - I-85N Closure',
          sections: [
            { heading: 'Incident', content: 'I-85N closed at Exit 102 • 90-120 min delays • 6 trucks affected' },
            { heading: 'Reroutes', bullets: ['Trucks 1-5 → I-985 (+15min each)', 'Truck 6 → US-23 (+22min)'] },
            { heading: 'Impact', content: 'All trucks arrive on-time • Max delay: 22min vs 120min without reroute' }
          ]
        },
        duration: 2
      }
    ],
    benefits: { timeSaved: '28-43 min', impactMetric: '6 trucks saved from delays • All on time • Zero calls' },
    learningModules: ['Real-Time Optimization', 'Fleet Management'],
    flagship: true,
    startHere: true
  },

  {
    id: 'supply-chain-2',
    title: 'Weather-Based Demand Forecasting',
    function: 'Supply Chain',
    description: 'Predict demand spikes from weather and adjust production.',
    problem: 'Heat wave hitting Southeast next week. Need to adjust before stockouts.',
    icon: Thermometer,
    difficulty: 'Intermediate',
    estimatedTime: '4 min',
    oldWayTime: '2-3 hours',
    oldWaySteps: [
      'Check weather forecast manually',
      'Look at last year\'s sales during heatwaves',
      'Export sales data to Excel',
      'Calculate average sales lift',
      'Check inventory across DCs',
      'Estimate days of supply',
      'Calculate additional production needed',
      'Email production planner',
      'Wait for validation',
      'Multiple email rounds',
      'Get approval',
      'Update forecast system'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Detect Weather Event',
        description: 'Monitor forecasts for demand-impacting events',
        tools: ['Weather API', 'Historical Sales Correlator'],
        dataUsed: ['7-day forecast', 'Historical patterns', 'Temp thresholds'],
        successCriteria: 'Heat wave: Southeast 95-102°F for 6 days starting Monday',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-2',
        title: 'Forecast Demand Spike',
        description: 'Predict sales lift based on weather',
        tools: ['Demand Forecasting Engine'],
        dataUsed: ['Weather severity', 'Historical lifts', 'Baseline sales'],
        successCriteria: '+18% demand spike for cold beverages, highest on 20oz singles and 2L',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-3',
        title: 'Recommend Production Adjustment',
        description: 'Calculate optimal production increase',
        tools: ['Production Planner'],
        dataUsed: ['Demand forecast', 'Inventory', 'Capacity'],
        successCriteria: 'Increase production 20% (42K cases) at Atlanta plant, prioritize 20oz',
        requiresHITL: true,
        hitlMessage: 'Heat wave detected. Forecasted 18% demand spike. Review production adjustment.',
        hitlActionContent: {
          title: '🌡️ Heat Wave Demand Spike',
          sections: [
            { heading: 'Weather', content: 'Southeast 95-102°F for 6 days, Monday-Saturday' },
            { heading: 'Forecast', content: '+18% cold beverage sales • +42K cases needed' },
            { heading: 'Inventory', content: 'Current: 6.2 days supply → At spike: 5.1 days (stockout risk)' },
            { heading: 'Recommendation', content: '+20% production at Atlanta plant (42K cases, $31K cost)' },
            { heading: 'Risk', content: 'Without action: 35% stockout chance, $180K lost sales' }
          ]
        },
        duration: 6
      }
    ],
    benefits: { timeSaved: '2-3 hours', impactMetric: 'Forecasted 18% spike • Prevented $180K stockouts • 3-day head start' },
    learningModules: ['Predictive Forecasting', 'Weather Intelligence'],
    startHere: true
  },

  {
    id: 'supply-chain-3',
    title: 'Auto-PO Generation',
    function: 'Supply Chain',
    description: 'Stage PO when inventory hits reorder point.',
    problem: 'Aluminum can inventory at Atlanta DC hit safety stock level.',
    icon: FileText,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '20-30 min',
    oldWaySteps: [
      'Manually check inventory report daily',
      'Notice low stock level',
      'Calculate reorder quantity',
      'Look up supplier contact',
      'Check last purchase price',
      'Create PO in system',
      'Email supplier',
      'Wait for confirmation'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Monitor Inventory Levels',
        description: 'Continuous monitoring of safety stock thresholds',
        tools: ['Inventory Management System'],
        dataUsed: ['Real-time inventory', 'Reorder points', 'Lead times'],
        successCriteria: 'Alert: Aluminum cans at Atlanta DC hit 12K units (reorder point: 15K)',
        requiresHITL: false,
        duration: 1
      },
      {
        id: 'step-2',
        title: 'Calculate Optimal Order Quantity',
        description: 'Determine EOQ based on demand and lead time',
        tools: ['EOQ Calculator', 'Demand Forecaster'],
        dataUsed: ['Usage rate', 'Lead time', 'Order costs'],
        successCriteria: 'Order quantity: 50K units (2-week supply at current usage rate)',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-3',
        title: 'Stage Purchase Order',
        description: 'Generate PO and notify procurement',
        tools: ['Procurement System'],
        dataUsed: ['Supplier info', 'Pricing', 'Delivery terms'],
        successCriteria: 'PO #45892 ready for approval ($42K, 5-day delivery)',
        requiresHITL: true,
        hitlMessage: 'Aluminum can inventory hit reorder point. Review PO before sending to supplier.',
        hitlActionContent: {
          title: '📝 Auto-Generated Purchase Order',
          sections: [
            { heading: 'Trigger', content: 'Aluminum cans: 12K units (below 15K reorder point)' },
            { heading: 'Order', bullets: ['50,000 aluminum cans', '$42,000 total', '5-day delivery', 'Supplier: MetalCan Corp'] },
            { heading: 'Justification', content: 'Current usage: 3.5K/day. Will last 3.4 days. Order provides 14-day supply.' }
          ]
        },
        duration: 2
      }
    ],
    benefits: { timeSaved: '18-28 min', impactMetric: 'Automatic monitoring • Optimal order quantity • No stockouts' },
    learningModules: ['Inventory Automation', 'EOQ Optimization'],
    startHere: true
  },

  {
    id: 'supply-chain-4',
    title: 'Supplier Document Chasing',
    function: 'Supply Chain',
    description: 'Auto-remind suppliers of missing certificates before shipment.',
    problem: 'Sugar shipment arrives tomorrow but COA certificate still missing.',
    icon: FileCheck,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '25-35 min',
    oldWaySteps: [
      'Check incoming shipment schedule',
      'Cross-reference required documents',
      'Notice missing certificate',
      'Look up supplier contact',
      'Draft email reminder',
      'Send reminder',
      'Follow up if no response',
      'Escalate to manager if needed'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Monitor Incoming Shipments',
        description: 'Track shipments and required documentation',
        tools: ['Shipment Tracking System', 'Document Manager'],
        dataUsed: ['Inbound shipments', 'Document requirements', 'Deadlines'],
        successCriteria: 'Sugar shipment #SH-4821 arrives tomorrow, COA certificate missing',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Auto-Remind Supplier',
        description: 'Send automated reminder 48h before shipment',
        tools: ['Email Automation', 'Supplier Portal'],
        dataUsed: ['Supplier contacts', 'Document templates', 'Shipment details'],
        successCriteria: 'Reminder sent to SweetSource Inc. requesting COA by EOD',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-3',
        title: 'Escalate if Needed',
        description: 'Create escalation plan for critical missing documents',
        tools: ['Escalation Manager', 'Compliance Tracker'],
        dataUsed: ['Document status', 'Supplier history', 'Shipment priority'],
        successCriteria: 'Escalation plan ready if COA not received by EOD',
        requiresHITL: true,
        hitlMessage: 'Review escalation plan for missing COA certificate before contacting supplier management.',
        hitlActionContent: {
          title: '📄 Document Escalation - Sugar Shipment',
          sections: [
            { heading: 'Issue', content: 'COA certificate missing for shipment #SH-4821 arriving tomorrow' },
            { heading: 'Actions Taken', content: 'Automated reminder sent to SweetSource Inc. contact at 2pm' },
            { heading: 'Escalation Plan', bullets: ['If no response by 5pm: Call supplier QA manager', 'If not resolved by 8am tomorrow: Hold shipment at gate', 'Alternative: Accept shipment with expedited COA within 24h'] }
          ]
        },
        duration: 2
      }
    ],
    benefits: { timeSaved: '23-33 min', impactMetric: 'No shipment delays • Proactive reminders • Compliance assured' },
    learningModules: ['Supplier Automation', 'Document Tracking'],
    flagship: true,
    startHere: true
  },

  // ==================== FINANCE - FP&A, Audit, Accounting (7 scenarios) ====================
  
  {
    id: 'finance-1',
    title: 'OpEx Variance Deep Dive',
    function: 'Finance',
    description: 'Drill down to GL account level to explain cost overruns.',
    problem: 'North America OpEx $1.2M over budget. Need detailed cost center analysis.',
    icon: Coins,
    difficulty: 'Intermediate',
    estimatedTime: '4 min',
    oldWayTime: '45-50 min',
    oldWaySteps: [
      'Export Q2 OpEx actuals from ERP',
      'Export budget data',
      'Merge using VLOOKUP',
      'Calculate variances',
      'Sort to find overruns',
      'Log into GL system',
      'Export GL detail',
      'Manually categorize lines',
      'Email cost center owners',
      'Wait for responses',
      'Compile into PowerPoint'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Pull OpEx by Cost Center',
        description: 'Get Q2 actuals vs budget',
        tools: ['ERP System'],
        dataUsed: ['Q2 OpEx', 'Budgets', 'Cost centers'],
        successCriteria: '8 cost centers: Marketing $4.8M, Sales $3.9M, IT $2.1M, others',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-2',
        title: 'Drill into Top Variance',
        description: 'Find GL detail for biggest overrun',
        tools: ['GL System', 'Variance Drill-Down'],
        dataUsed: ['GL detail', 'Cost center owners'],
        successCriteria: 'Marketing overrun: $680K in Trade Promo accrual timing difference',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-3',
        title: 'Draft Executive Summary',
        description: 'Explain variance with supporting data',
        tools: ['Report Generator'],
        dataUsed: ['Variance analysis', 'GL details'],
        successCriteria: 'Summary ready: $680K timing difference, $220K consulting overage, $300K FX loss',
        requiresHITL: false,
        duration: 3
      }
    ],
    benefits: { timeSaved: '41-46 min', impactMetric: '$1.2M variance explained down to GL level • Root causes identified' },
    learningModules: ['Financial Analytics', 'Variance Analysis'],
    flagship: true,
    startHere: true
  },

  {
    id: 'finance-2',
    title: 'Duplicate Payment Detection',
    function: 'Finance',
    description: 'Halt near-duplicate invoices in real-time.',
    problem: 'Same vendor invoice appears twice with slight variation in amount.',
    icon: XCircle,
    difficulty: 'Beginner',
    estimatedTime: '1 min',
    oldWayTime: '15-20 min (or 6 months late)',
    oldWaySteps: [
      'Manually review invoice before payment',
      'Check if vendor/amount looks familiar',
      'Search payment history',
      'Compare invoice numbers',
      'Check dates',
      'Call vendor to verify',
      'Either approve or reject',
      'Document reason'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Scan Incoming Invoices',
        description: 'Real-time duplicate detection',
        tools: ['Invoice AI', 'Duplicate Detection Engine'],
        dataUsed: ['New invoices', 'Payment history', 'Fuzzy matching rules'],
        successCriteria: 'Alert: Invoice #INV-4829 from VendorX for $8,450 matches paid invoice #INV-4828 for $8,500 (98% similarity)',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Flag for Review',
        description: 'Hold payment and alert AP team',
        tools: ['Payment Hold System', 'Alert Notifier'],
        dataUsed: ['Duplicate match', 'Original payment'],
        successCriteria: 'Payment held, AP manager notified',
        requiresHITL: true,
        hitlMessage: 'Potential duplicate payment detected. Review before processing.',
        hitlActionContent: {
          title: '🚫 Duplicate Payment Alert',
          sections: [
            { heading: 'New Invoice', content: 'INV-4829 • VendorX • $8,450 • Due today' },
            { heading: 'Matches', content: 'INV-4828 • VendorX • $8,500 • Paid 3 weeks ago' },
            { heading: 'Similarity', content: '98% match (same vendor, similar amount, close dates)' },
            { heading: 'Action', content: '⚠️ Payment HELD pending verification with vendor' }
          ]
        },
        duration: 1
      }
    ],
    benefits: { timeSaved: '15-20 min', impactMetric: 'Prevented $8.4K duplicate • Real-time detection • Zero losses' },
    learningModules: ['Invoice AI', 'Duplicate Detection'],
    startHere: true
  },

  {
    id: 'finance-3',
    title: 'Expense Report Auto-Triage',
    function: 'Finance',
    description: 'Auto-approve compliant expenses, flag only violations.',
    problem: 'Manager needs to review 50 employee expense reports.',
    icon: CreditCard,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '60-90 min',
    oldWaySteps: [
      'Open each expense report',
      'Check if receipts attached',
      'Verify amounts are reasonable',
      'Check policy compliance (taxi vs Uber, meal limits, etc.)',
      'Approve or reject',
      'Add comments if needed',
      'Repeat 50 times'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Detect Port Congestion',
        description: 'Monitor real-time port data',
        tools: ['Port Monitoring API', 'Vessel Tracking'],
        dataUsed: ['Port wait times', 'Your shipments', 'Vessel schedules'],
        successCriteria: 'LA port: 14-day average wait time, your container arriving in 3 days',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-2',
        title: 'Evaluate Alternative Routes',
        description: 'Model land-bridge via Oakland or direct LA wait',
        tools: ['Logistics Optimizer', 'Cost Calculator'],
        dataUsed: ['Alternative ports', 'Rail/truck rates', 'Transit times'],
        successCriteria: 'Oakland land-bridge: +$4.2K cost, -9 days vs LA wait',
        requiresHITL: false,
        duration: 8
      },
      {
        id: 'step-3',
        title: 'Recommend Reroute',
        description: 'Present cost-benefit analysis',
        tools: ['Scenario Comparator'],
        dataUsed: ['Cost analysis', 'Time savings', 'Inventory impact'],
        successCriteria: 'Recommendation: Oakland land-bridge saves 9 days, worth $4.2K premium',
        requiresHITL: true,
        hitlMessage: 'LA port congested. Evaluated land-bridge alternative. Review recommendation.',
        hitlActionContent: {
          title: '🚢 Port Congestion Reroute',
          sections: [
            { heading: 'Current Plan', content: 'LA port arrival in 3 days, 14-day wait = 17-day total' },
            { heading: 'Alternative', content: 'Oakland port + rail land-bridge = 8-day total' },
            { heading: 'Cost', content: 'Additional $4,200 for rail transport' },
            { heading: 'Benefit', content: 'Save 9 days = $12K in expedite fees avoided + inventory availability' },
            { heading: 'Recommendation', content: '✅ Reroute to Oakland land-bridge (net $7.8K benefit)' }
          ]
        },
        duration: 6
      }
    ],
    benefits: { timeSaved: '3-4 hours', impactMetric: 'Saved 9 days • $7.8K net benefit • Real-time decision' },
    learningModules: ['Supply Chain Optimization', 'Port Intelligence']
  },

  {
    id: 'supply-chain-8',
    title: 'Supplier Risk Monitoring',
    function: 'Supply Chain',
    description: 'Map news about factory issues to your supplier network.',
    problem: 'News about factory fire in Malaysia. Need to know if it affects your suppliers.',
    icon: AlertTriangle,
    difficulty: 'Advanced',
    estimatedTime: '4 min',
    oldWayTime: '2-3 hours',
    oldWaySteps: [
      'See news alert about factory fire',
      'Look up which suppliers operate in Malaysia',
      'Check supplier locations in spreadsheet',
      'Call each supplier to verify impact',
      'Check if they have alternative facilities',
      'Assess inventory risk',
      'Calculate potential shortfall',
      'Draft contingency plan',
      'Alert procurement team'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Monitor Supplier Risk Events',
        description: 'Scan news for incidents affecting supplier regions',
        tools: ['News Monitoring AI', 'Supplier Database'],
        dataUsed: ['News feeds', 'Supplier locations', 'Risk keywords'],
        successCriteria: 'Alert: Factory fire in Kuala Lumpur, Malaysia',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Map to Your Supplier Network',
        description: 'Identify which suppliers are affected',
        tools: ['Supplier Mapping Engine', 'Tier-2 Visibility'],
        dataUsed: ['Supplier locations', 'Multi-tier relationships'],
        successCriteria: 'Impact: FlavorChem (your citric acid supplier) sources from affected factory',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-3',
        title: 'Assess Supply Risk',
        description: 'Calculate inventory impact and alternatives',
        tools: ['Risk Analyzer', 'Alternative Supplier Finder'],
        dataUsed: ['Current inventory', 'Usage rate', 'Alternative sources'],
        successCriteria: '45-day citric acid supply on hand, alternative supplier available at +12% cost',
        requiresHITL: true,
        hitlMessage: 'Factory fire in Malaysia affects your citric acid supplier. Review risk assessment.',
        hitlActionContent: {
          title: '⚠️ Supplier Risk Alert - Malaysia Fire',
          sections: [
            { heading: 'Incident', content: 'Factory fire at ChemPlant Malaysia (Tier-2 supplier to FlavorChem)' },
            { heading: 'Your Exposure', content: 'FlavorChem supplies 100% of your citric acid (12 tons/month)' },
            { heading: 'Inventory', content: 'Current: 45-day supply on hand' },
            { heading: 'Alternative', content: 'ChemSource USA can supply at +12% cost, 2-week lead time' },
            { heading: 'Recommendation', content: '⚠️ Place backup order with ChemSource to arrive in 30 days (before stockout)' }
          ]
        },
        duration: 6
      }
    ],
    benefits: { timeSaved: '2-3 hours', impactMetric: 'Real-time risk detection • Tier-2 visibility • 30-day head start' },
    learningModules: ['Supply Chain Risk AI', 'Multi-Tier Mapping']
  },

  {
    id: 'supply-chain-9',
    title: 'Safety Incident Triage',
    function: 'Supply Chain',
    description: 'Analyze safety logs to highlight top injury trends.',
    problem: 'Received 100 handwritten incident cards from warehouses. Need to spot patterns.',
    icon: Shield,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '2-3 hours',
    oldWaySteps: [
      'Manually read through 100 incident cards',
      'Create Excel spreadsheet',
      'Manually categorize each incident',
      'Count frequency by type',
      'Note severity levels',
      'Identify locations with most incidents',
      'Create summary charts',
      'Draft safety recommendations',
      'Present to safety manager'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Digitize Incident Reports',
        description: 'OCR handwritten cards and extract key data',
        tools: ['OCR Engine', 'NLP Extractor'],
        dataUsed: ['Scanned incident cards', 'Injury classifications'],
        successCriteria: '100 incidents digitized: 42 slips/falls, 28 lifting injuries, 18 cuts, 12 other',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-2',
        title: 'Identify Top Trends',
        description: 'Analyze by type, location, and severity',
        tools: ['Safety Analytics Engine'],
        dataUsed: ['Incident data', 'Historical baselines', 'Location info'],
        successCriteria: 'Top 3 trends: (1) Slips in loading docks, (2) Back injuries during unload, (3) Atlanta DC has 3x average rate',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-3',
        title: 'Generate Safety Report',
        description: 'Create executive summary with recommendations',
        tools: ['Report Generator'],
        dataUsed: ['Trend analysis', 'Best practices database'],
        successCriteria: 'Safety report ready with 3 priority actions',
        requiresHITL: false,
        duration: 3
      }
    ],
    benefits: { timeSaved: '2-3 hours', impactMetric: '100 incidents analyzed • Top 3 trends identified • Actionable recommendations' },
    learningModules: ['Safety Analytics', 'OCR & NLP']
  },

  // ==================== FINANCE - FP&A, Audit, Accounting (7 scenarios) ====================
  
  {
    id: 'finance-1',
    title: 'OpEx Variance Deep Dive',
    function: 'Finance',
    description: 'Drill down to GL account level to explain cost overruns.',
    problem: 'North America OpEx $1.2M over budget. Need detailed cost center analysis.',
    icon: Coins,
    difficulty: 'Intermediate',
    estimatedTime: '4 min',
    oldWayTime: '45-50 min',
    oldWaySteps: [
      'Export Q2 OpEx actuals from ERP',
      'Export budget data',
      'Merge using VLOOKUP',
      'Calculate variances',
      'Sort to find overruns',
      'Log into GL system',
      'Export GL detail',
      'Manually categorize lines',
      'Email cost center owners',
      'Wait for responses',
      'Compile into PowerPoint'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Pull OpEx by Cost Center',
        description: 'Get Q2 actuals vs budget',
        tools: ['ERP System'],
        dataUsed: ['Q2 OpEx', 'Budgets', 'Cost centers'],
        successCriteria: '8 cost centers: Marketing $4.8M, Sales $3.9M, IT $2.1M, others',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-2',
        title: 'Flag Overbudget Centers',
        description: 'Identify centers exceeding thresholds',
        tools: ['Variance Engine'],
        dataUsed: ['Variances', 'Thresholds (>5%)'],
        successCriteria: '3 flagged: Marketing +$600K, IT +$400K, Sales Travel +$200K',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-3',
        title: 'Drill to GL Sub-Accounts',
        description: 'Analyze detailed GL accounts',
        tools: ['GL Drill-Down'],
        dataUsed: ['GL transactions', 'Vendor invoices'],
        successCriteria: 'Root causes: Digital ads +$550K, AWS +$350K, Conferences +$180K',
        requiresHITL: false,
        duration: 8
      },
      {
        id: 'step-4',
        title: 'Generate Variance Report',
        description: 'Create detailed cost center summary',
        tools: ['Report Generator'],
        dataUsed: ['Variance analysis', 'Justifications'],
        successCriteria: 'Report ready with line-by-line explanations',
        requiresHITL: true,
        hitlMessage: 'OpEx drill-down complete. Review detailed cost center breakdown before sending to Regional VP.',
        hitlActionContent: {
          title: '📊 North America Q2 OpEx Variance',
          sections: [
            { heading: 'Summary', content: '$16.4M actual vs $15.2M budget = $1.2M over (+8%)' },
            { heading: 'Top 3 Overruns', bullets: ['**Marketing: +$600K** → Digital ads +$550K (new campaign)', '**IT: +$400K** → AWS +$350K (data storage grew 45%)', '**Sales Travel: +$200K** → Conferences +$180K (3 unplanned events)'] },
            { heading: 'Controllability', bullets: ['Strategic (approved): $730K', 'Operational overrun: $350K', 'Timing difference: $120K'] },
            { heading: 'Recommendations', content: 'IT to implement AWS alerts • Update H2 forecast for cloud baseline • Require pre-approval for conferences >$50K' }
          ]
        },
        duration: 5
      }
    ],
    benefits: { timeSaved: '41-46 min', impactMetric: '$1.2M variance drivers identified across 8 cost centers in 4 min' },
    learningModules: ['Financial Analysis', 'Drill-Down Analytics'],
    flagship: true,
    startHere: true
  },

  {
    id: 'finance-2',
    title: 'Duplicate Payment Detection',
    function: 'Finance',
    description: 'Halt near-duplicate invoices in real-time.',
    problem: 'Same vendor invoice appears twice with slight variation in amount.',
    icon: XCircle,
    difficulty: 'Beginner',
    estimatedTime: '1 min',
    oldWayTime: '15-20 min (or 6 months late)',
    oldWaySteps: [
      'Manually review invoice before payment',
      'Check if vendor/amount looks familiar',
      'Search payment history',
      'Compare invoice numbers',
      'Check dates',
      'Call vendor to verify',
      'Either approve or reject',
      'Document reason'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Scan Incoming Invoices',
        description: 'Real-time duplicate detection',
        tools: ['Invoice AI', 'Duplicate Detection Engine'],
        dataUsed: ['New invoices', 'Payment history', 'Fuzzy matching rules'],
        successCriteria: 'Alert: Invoice #INV-4829 from VendorX for $8,450 matches paid invoice #INV-4828 for $8,500 (98% similarity)',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Flag for Review',
        description: 'Hold payment and alert AP team',
        tools: ['Payment Hold System', 'Alert Notifier'],
        dataUsed: ['Duplicate match', 'Original payment'],
        successCriteria: 'Payment held, AP manager notified',
        requiresHITL: true,
        hitlMessage: 'Potential duplicate payment detected. Review before processing.',
        hitlActionContent: {
          title: '🚫 Duplicate Payment Alert',
          sections: [
            { heading: 'New Invoice', content: 'INV-4829 • VendorX • $8,450 • Due today' },
            { heading: 'Matches', content: 'INV-4828 • VendorX • $8,500 • Paid 3 weeks ago' },
            { heading: 'Similarity', content: '98% match (same vendor, similar amount, close dates)' },
            { heading: 'Action', content: '⚠️ Payment HELD pending verification with vendor' }
          ]
        },
        duration: 1
      }
    ],
    benefits: { timeSaved: '15-20 min', impactMetric: 'Prevented $8.4K duplicate • Real-time detection • Zero losses' },
    learningModules: ['Invoice AI', 'Duplicate Detection'],
    startHere: true
  },

  {
    id: 'finance-3',
    title: 'Expense Report Auto-Triage',
    function: 'Finance',
    description: 'Auto-approve compliant expenses, flag only violations.',
    problem: 'Manager needs to review 50 employee expense reports.',
    icon: CreditCard,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '60-90 min',
    oldWaySteps: [
      'Open each expense report',
      'Check if receipts attached',
      'Verify amounts are reasonable',
      'Check policy compliance (taxi vs Uber, meal limits, etc.)',
      'Approve or reject',
      'Add comments if needed',
      'Repeat 50 times'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Analyze All Expense Reports',
        description: 'Check receipts, amounts, policy compliance',
        tools: ['Expense AI', 'Policy Engine'],
        dataUsed: ['50 expense reports', 'Company policies', 'Receipt OCR'],
        successCriteria: '47 compliant (auto-approve), 3 violations flagged',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-2',
        title: 'Auto-Approve Compliant Reports',
        description: 'Process 47 clean reports instantly',
        tools: ['Expense System API'],
        dataUsed: ['Approved reports'],
        successCriteria: '47 reports approved, employees notified',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-3',
        title: 'Flag Violations for Review',
        description: 'Present only 3 exceptions',
        tools: ['Exception Reporter'],
        dataUsed: ['3 violations'],
        successCriteria: 'Violations: $180 dinner (exceeds $75 limit), missing receipt, unauthorized Uber Black',
        requiresHITL: true,
        hitlMessage: 'Auto-approved 47 compliant expense reports. Review only these 3 policy violations.',
        hitlActionContent: {
          title: '💳 Expense Report Exceptions',
          sections: [
            { heading: 'Auto-Approved', content: '47 of 50 reports ($38,450 total) ✅' },
            { heading: 'Violation 1', content: 'Sarah M. • $180 dinner • Exceeds $75 policy limit • Reason: "Client dinner"' },
            { heading: 'Violation 2', content: 'Mike J. • $45 taxi • Missing receipt' },
            { heading: 'Violation 3', content: 'Lisa K. • $92 Uber Black • Policy allows only UberX' }
          ]
        },
        duration: 1
      }
    ],
    benefits: { timeSaved: '58-88 min', impactMetric: 'Auto-approved 94% • Manager reviews only 3 exceptions • 2 min total time' },
    learningModules: ['Expense Automation', 'Policy Compliance AI']
  },

  {
    id: 'finance-4',
    title: 'Tax Scenario Modeling',
    function: 'Finance',
    description: 'Update P&L for proposed tax changes.',
    problem: 'Government proposes 5% sugar tax. Need to model P&L impact.',
    icon: TrendingUp,
    difficulty: 'Advanced',
    estimatedTime: '5 min',
    oldWayTime: '3-4 hours',
    oldWaySteps: [
      'Pull product list with sugar content',
      'Calculate tax impact per SKU',
      'Export sales volume by SKU',
      'Build Excel model',
      'Calculate gross margin impact',
      'Model pass-through scenarios',
      'Estimate volume elasticity',
      'Update P&L line by line',
      'Create scenario comparison',
      'Build PowerPoint presentation'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Identify Affected SKUs',
        description: 'Flag products with sugar content above threshold',
        tools: ['Product Master', 'Ingredient Database'],
        dataUsed: ['SKU list', 'Sugar content', 'Tax proposal details'],
        successCriteria: '28 SKUs affected (all full-sugar products), Zero Sugar exempt',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-2',
        title: 'Model Financial Impact',
        description: 'Calculate tax cost and volume impact',
        tools: ['Financial Modeling Engine', 'Elasticity Calculator'],
        dataUsed: ['Sales volume', 'Pricing', 'Elasticity curves'],
        successCriteria: 'Base scenario: $4.2M tax cost, -8% volume decline = $6.8M total P&L hit',
        requiresHITL: false,
        duration: 9
      },
      {
        id: 'step-3',
        title: 'Generate Scenario Report',
        description: 'Model 3 scenarios: absorb, pass-through, split',
        tools: ['Scenario Builder'],
        dataUsed: ['Financial models', 'Strategic options'],
        successCriteria: '3 scenarios ready with P&L impacts and recommendations',
        requiresHITL: true,
        hitlMessage: 'Modeled sugar tax impact across 3 scenarios. Review before presenting to CFO.',
        hitlActionContent: {
          title: '📈 Sugar Tax P&L Impact',
          sections: [
            { heading: 'Proposal', content: '5% sugar tax on beverages >5g sugar per 100ml • 28 SKUs affected' },
            { heading: 'Scenario A: Absorb Tax', bullets: ['No price increase to consumer', 'Full $4.2M tax absorbed', 'Maintain volume', '**P&L Impact: -$4.2M/year**'] },
            { heading: 'Scenario B: Full Pass-Through', bullets: ['Increase prices 5%', 'Zero tax absorption', 'Volume decline: -12% (price elasticity)', '**P&L Impact: -$3.8M/year**'] },
            { heading: 'Scenario C: Partial (50/50)', bullets: ['Increase prices 2.5%', '$2.1M tax absorbed', 'Volume decline: -8%', '**P&L Impact: -$6.8M/year**'] },
            { heading: 'Recommendation', content: '✅ Scenario B (full pass-through) minimizes P&L hit while accelerating Zero Sugar portfolio shift' }
          ]
        },
        duration: 7
      }
    ],
    benefits: { timeSaved: '3-4 hours', impactMetric: 'Full scenario analysis in 5 min • 3 options modeled • P&L impacts quantified' },
    learningModules: ['Financial Modeling AI', 'Scenario Planning'],
    startHere: true
  },

  {
    id: 'finance-5',
    title: 'Month-End Accruals',
    function: 'Finance',
    description: 'Auto-draft accruals based on PO history.',
    problem: 'Month-end close tomorrow. Need to estimate unbilled expenses.',
    icon: Calendar,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '90-120 min',
    oldWaySteps: [
      'Email 20 department managers asking about unbilled spend',
      'Wait for responses (many won\'t reply)',
      'Check open POs in system',
      'Manually estimate completion %',
      'Look at historical patterns',
      'Create accrual spreadsheet',
      'Calculate amounts',
      'Create journal entry',
      'Get manager approval',
      'Post to GL'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Analyze Open POs',
        description: 'Identify POs with goods received but not invoiced',
        tools: ['ERP System', 'PO Tracker'],
        dataUsed: ['Open POs', 'Receiving records', 'Invoice status'],
        successCriteria: '42 open POs with goods received, no invoice ($284K total)',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-2',
        title: 'Calculate Accrual Amounts',
        description: 'Estimate unbilled amounts based on completion',
        tools: ['Accrual Calculator', 'Historical Patterns'],
        dataUsed: ['PO values', 'Completion %', 'Historical accuracy'],
        successCriteria: 'Total accrual: $284K across 6 expense categories',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-3',
        title: 'Draft Journal Entry',
        description: 'Prepare JE for controller review',
        tools: ['JE Generator'],
        dataUsed: ['Accrual amounts', 'GL accounts', 'Cost centers'],
        successCriteria: 'JE #2024-0430-ACR ready: $284K debit to expense, credit to accrued liabilities',
        requiresHITL: true,
        hitlMessage: 'Month-end accruals calculated based on open POs. Review journal entry before posting.',
        hitlActionContent: {
          title: '📅 Month-End Accrual Journal Entry',
          sections: [
            { heading: 'Summary', content: 'Total Accrual: $284,000 • 42 open POs • Goods received, invoices pending' },
            { heading: 'By Category', bullets: ['Marketing: $120K (agency services)', 'IT: $88K (software licenses)', 'Facilities: $42K (maintenance contracts)', 'Professional Fees: $34K'] },
            { heading: 'Journal Entry', bullets: ['DR: Expense (various GL accounts) $284,000', 'CR: Accrued Liabilities $284,000', 'Description: Month-end accrual for GR/NI items'] },
            { heading: 'Confidence', content: 'Based on historical accuracy: 94% of accruals reverse within 30 days when invoices arrive' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '87-117 min', impactMetric: '$284K accruals calculated • 42 POs analyzed • Zero emails sent' },
    learningModules: ['Accrual Automation', 'Close Process AI']
  },

  {
    id: 'finance-6',
    title: 'Credit Limit Monitoring',
    function: 'Finance',
    description: 'Lower credit limits if retailer risk spikes.',
    problem: 'Regional grocery chain showing signs of financial distress.',
    icon: CreditCard,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '45-60 min',
    oldWaySteps: [
      'Manually check credit bureau reports',
      'Review payment history',
      'Calculate DSO',
      'Check news for bankruptcy signals',
      'Compare to credit limit policy',
      'Draft credit limit change memo',
      'Get CFO approval',
      'Update credit limit in system',
      'Notify sales team'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Monitor Customer Credit Signals',
        description: 'Scan payment patterns, news, credit scores',
        tools: ['Credit Monitoring AI', 'News Scanner', 'Payment Analytics'],
        dataUsed: ['Payment history', 'DSO trends', 'Credit bureau data', 'News articles'],
        successCriteria: 'Alert: RegionalMart DSO increased from 32 to 58 days, credit score dropped 45 points, news mentions "cash flow issues"',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-2',
        title: 'Assess Risk Level',
        description: 'Calculate risk score and recommended action',
        tools: ['Credit Risk Engine'],
        dataUsed: ['Multiple risk factors', 'Exposure amount', 'Industry benchmarks'],
        successCriteria: 'Risk score: HIGH • Current credit limit: $850K • Recommended: Reduce to $400K • Current exposure: $620K',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-3',
        title: 'Stage Credit Limit Reduction',
        description: 'Draft approval memo for CFO',
        tools: ['Credit Policy System'],
        dataUsed: ['Risk assessment', 'Exposure', 'Recommendation'],
        successCriteria: 'Memo ready: Reduce RegionalMart from $850K to $400K, hold new orders until exposure drops',
        requiresHITL: true,
        hitlMessage: 'Credit risk detected for RegionalMart. Review limit reduction recommendation.',
        hitlActionContent: {
          title: '💳 Credit Limit Reduction - RegionalMart',
          sections: [
            { heading: 'Risk Signals', bullets: ['DSO: 32 → 58 days (+81%)', 'Credit score: 680 → 635 (-45 pts)', 'News: "Exploring strategic alternatives" (bankruptcy signal)', 'Payment delays: 3 of last 5 invoices paid late'] },
            { heading: 'Current Exposure', content: 'Credit Limit: $850K • Outstanding AR: $620K • Open orders: $180K' },
            { heading: 'Recommendation', content: '⚠️ REDUCE limit to $400K immediately • HOLD new orders until AR drops below $400K' },
            { heading: 'Impact', content: 'Protects $450K exposure if customer goes bankrupt • Sales team can still fulfill $180K in open orders' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '42-57 min', impactMetric: 'Early warning system • Protected $450K exposure • Real-time monitoring' },
    learningModules: ['Credit Risk AI', 'Payment Analytics']
  },

  {
    id: 'finance-7',
    title: 'Intercompany Reconciliation',
    function: 'Finance',
    description: 'Auto-match 99% of intercompany transactions.',
    problem: 'Quarterly intercompany recon has 500+ transactions to match.',
    icon: RefreshCw,
    difficulty: 'Advanced',
    estimatedTime: '4 min',
    oldWayTime: '4-6 hours',
    oldWaySteps: [
      'Export transactions from Entity A',
      'Export transactions from Entity B',
      'Manually match by date, amount, description',
      'Highlight differences',
      'Investigate mismatches',
      'Email counterparty accountant',
      'Wait for clarification',
      'Adjust entries',
      'Re-run reconciliation',
      'Document resolution'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Pull Intercompany Transactions',
        description: 'Extract transactions from both entities',
        tools: ['ERP System', 'Intercompany Module'],
        dataUsed: ['Entity A transactions', 'Entity B transactions', 'Q2 period'],
        successCriteria: '542 transactions from Entity A, 538 from Entity B',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-2',
        title: 'Auto-Match Transactions',
        description: 'Match by amount, date, reference with fuzzy logic',
        tools: ['Matching Engine', 'Fuzzy Logic Matcher'],
        dataUsed: ['Both entity transactions', 'Matching rules', 'Tolerance thresholds'],
        successCriteria: '534 transactions matched (98.5%), 8 exceptions flagged',
        requiresHITL: false,
        duration: 7
      },
      {
        id: 'step-3',
        title: 'Flag Exceptions for Review',
        description: 'Present unmatched items with suggested resolutions',
        tools: ['Exception Reporter', 'Root Cause Analyzer'],
        dataUsed: ['Unmatched transactions', 'Historical patterns'],
        successCriteria: '8 exceptions: 3 timing differences, 2 FX mismatches, 3 booking errors',
        requiresHITL: true,
        hitlMessage: 'Auto-matched 534 of 542 transactions. Review 8 exceptions.',
        hitlActionContent: {
          title: '🔄 Intercompany Reconciliation - Q2',
          sections: [
            { heading: 'Summary', content: '534 matched (98.5%) • 8 exceptions • $42M total volume reconciled' },
            { heading: 'Exceptions', bullets: [
              '**Timing Diffs (3):** Entity A booked in June, Entity B in July',
              '**FX Mismatch (2):** Different exchange rates used (Entity A: 1.18, Entity B: 1.19)',
              '**Booking Errors (3):** Wrong entity code used'
            ] },
            { heading: 'Recommended Actions', bullets: [
              'Timing: Accept (will match next quarter)',
              'FX: Adjust Entity B to use Entity A rate (standard policy)',
              'Errors: Rebook 3 transactions to correct entities'
            ] }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '4-6 hours', impactMetric: 'Auto-matched 98.5% • $42M volume reconciled • 8 exceptions only' },
    learningModules: ['Intercompany Automation', 'Fuzzy Matching AI']
  },

  // ==================== HR - Human Resources (4 scenarios) ====================
  
  {
    id: 'hr-1',
    title: 'Candidate Resume Triage',
    function: 'HR',
    description: 'AI ranks top candidates from large applicant pool.',
    problem: '200 applications for Senior Developer role. Need to find top 10.',
    icon: Users,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '4-6 hours',
    oldWaySteps: [
      'Download 200 resumes',
      'Read through each one (2-3 min each = 6-10 hours)',
      'Create tracking spreadsheet',
      'Score each candidate subjectively',
      'Look for required skills',
      'Check years of experience',
      'Note education background',
      'Rank candidates',
      'Create shortlist'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Parse All Resumes',
        description: 'Extract skills, experience, education from 200 resumes',
        tools: ['Resume Parser AI', 'NLP Engine'],
        dataUsed: ['200 PDF resumes', 'Job requirements'],
        successCriteria: 'All resumes parsed: skills extracted, years calculated, education noted',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-2',
        title: 'Rank by Job Fit',
        description: 'Score candidates against requirements',
        tools: ['Candidate Scoring Engine'],
        dataUsed: ['Parsed resume data', 'Job requirements', 'Must-have vs nice-to-have'],
        successCriteria: 'Top 10 identified: all have React+Node.js+5yrs, 8 have AWS, 6 have team lead experience',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-3',
        title: 'Generate Shortlist Report',
        description: 'Present top 10 with fit scores',
        tools: ['Report Generator'],
        dataUsed: ['Top 10 candidates', 'Scores', 'Highlights'],
        successCriteria: 'Shortlist ready with candidate summaries',
        requiresHITL: true,
        hitlMessage: 'Analyzed 200 applications. Review top 10 candidates before proceeding to interviews.',
        hitlActionContent: {
          title: '👥 Top 10 Candidates - Senior Developer',
          sections: [
            { heading: 'Summary', content: 'Reviewed 200 applications • Top 10 identified • All meet must-have criteria' },
            { heading: 'Must-Have Criteria', bullets: ['React + Node.js experience ✅', '5+ years experience ✅', 'Bachelor\'s in CS/related ✅'] },
            { heading: 'Top Candidates', bullets: [
              'Sarah Chen • 7 yrs • React/Node/AWS • Ex-Google • 95% fit',
              'Michael Rodriguez • 6 yrs • Full-stack • Team lead • 92% fit',
              'Lisa Patel • 8 yrs • React/Node/Docker • Startup CTO • 90% fit',
              '+ 7 more strong candidates'
            ] },
            { heading: 'Next Step', content: 'Schedule phone screens with top 10 → Technical interviews with top 5' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '4-6 hours', impactMetric: '200 resumes analyzed • Top 10 ranked by fit • 3 min total time' },
    learningModules: ['Resume AI', 'Candidate Scoring'],
    flagship: true,
    startHere: true
  },

  {
    id: 'hr-2',
    title: 'Onboarding Orchestration',
    function: 'HR',
    description: 'Auto-trigger all onboarding tasks across departments.',
    problem: 'New hire starts Monday. Need to coordinate IT, admin, payroll, facilities.',
    icon: UserPlus,
    difficulty: 'Beginner',
    estimatedTime: '2 min',
    oldWayTime: '45-60 min',
    oldWaySteps: [
      'Email IT to create accounts',
      'Email admin for desk assignment',
      'Email facilities for building access',
      'Email payroll for setup',
      'Call manager to confirm start date',
      'Order laptop from IT',
      'Request phone line',
      'Send welcome packet',
      'Schedule orientation',
      'Track all tasks manually'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Trigger Onboarding Workflow',
        description: 'Initiate all tasks from offer acceptance',
        tools: ['HR Workflow System', 'Integration Hub'],
        dataUsed: ['New hire details', 'Department', 'Start date', 'Role'],
        successCriteria: 'Workflow initiated: 12 tasks across 5 departments',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Auto-Create Tickets',
        description: 'Generate tickets in each system',
        tools: ['IT Ticketing', 'Facilities Portal', 'Payroll System'],
        dataUsed: ['Employee info', 'Standard checklists', 'Templates'],
        successCriteria: 'Tickets created: IT account, laptop, desk, access badge, payroll, benefits',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-3',
        title: 'Track Progress',
        description: 'Monitor completion status',
        tools: ['Onboarding Dashboard'],
        dataUsed: ['Ticket status', 'Due dates'],
        successCriteria: 'Dashboard shows: 8 of 12 complete, 4 in progress, all on track for Monday',
        requiresHITL: true,
        hitlMessage: 'Review onboarding status for new hire Alex Martinez before Monday start date.',
        hitlActionContent: {
          title: '🎉 Onboarding Status - Alex Martinez',
          sections: [
            { heading: 'Start Date', content: 'Monday, March 25 • Sales Representative • Reports to Sarah Johnson' },
            { heading: 'Completed (8/12)', bullets: ['✅ IT account created', '✅ Laptop ordered (arrives Friday)', '✅ Email active', '✅ Building access granted', '✅ Desk assigned (Bldg A, Floor 2, Desk 24)', '✅ Payroll setup', '✅ Benefits enrollment sent', '✅ Welcome packet mailed'] },
            { heading: 'In Progress (4/12)', bullets: ['⏳ Phone line (IT working on it)', '⏳ Salesforce license (approval pending)', '⏳ Manager 1:1 scheduled', '⏳ Team lunch reservation'] }
          ]
        },
        duration: 2
      }
    ],
    benefits: { timeSaved: '43-58 min', impactMetric: '12 tasks triggered • 5 departments coordinated • 2 min setup time' },
    learningModules: ['Workflow Automation', 'Onboarding Orchestration'],
    startHere: true
  },

  {
    id: 'hr-3',
    title: 'HR Policy Chatbot',
    function: 'HR',
    description: 'AI answers 80% of policy questions via contract lookup.',
    problem: 'Employees constantly asking "How many sick days?" and other policy questions.',
    icon: MessageCircle,
    difficulty: 'Beginner',
    estimatedTime: '30 sec per question',
    oldWayTime: '5-10 min per question',
    oldWaySteps: [
      'Receive email or Slack message',
      'Look up policy in handbook',
      'Find relevant section',
      'Draft response',
      'Send reply',
      'Repeat for every question'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Employee Asks Question',
        description: 'Employee types question in chat or portal',
        tools: ['HR Chatbot', 'NLP Engine'],
        dataUsed: ['Employee question', 'HR policy documents', 'Employee contracts'],
        successCriteria: 'Question received: "How many sick days do I have?"',
        requiresHITL: false,
        duration: 1
      },
      {
        id: 'step-2',
        title: 'AI Looks Up Answer',
        description: 'Search policy docs and employee contract',
        tools: ['Document Search', 'Contract Parser'],
        dataUsed: ['Policy handbook', 'Employee contract', 'Historical Q&A'],
        successCriteria: 'Answer found: "You have 10 sick days per year (Section 4.2 of employee handbook)"',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-3',
        title: 'Provide Instant Answer',
        description: 'Return answer with source citation',
        tools: ['Chatbot Interface'],
        dataUsed: ['Answer', 'Source reference'],
        successCriteria: 'Employee receives instant answer with policy reference',
        requiresHITL: true,
        hitlMessage: 'Review chatbot response before sending to employee. Complex questions may need HR review.',
        hitlActionContent: {
          title: '💬 HR Chatbot Response',
          sections: [
            { heading: 'Employee Question', content: '\"How many sick days do I get?\"' },
            { heading: 'AI Response', content: 'Full-time employees receive 10 sick days per year, accrued at 0.83 days per month. Unused sick days roll over up to a maximum of 20 days.' },
            { heading: 'Source', content: 'Employee Handbook Section 4.2: Leave Policies (Page 18)' },
            { heading: 'Confidence', content: '98% - Standard policy question with clear handbook reference' }
          ]
        },
        duration: 1
      }
    ],
    benefits: { timeSaved: '5-10 min per question', impactMetric: '80% of questions auto-answered • Instant responses • HR time saved for complex issues' },
    learningModules: ['HR Chatbot AI', 'Policy Lookup Automation'],
    startHere: true
  },

  {
    id: 'hr-4',
    title: 'Interview Scheduling',
    function: 'HR',
    description: 'Find common availability and book interviews automatically.',
    problem: 'Need to schedule interviews with 3 interviewers for 5 candidates.',
    icon: Calendar,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '90-120 min',
    oldWaySteps: [
      'Email candidate: "When are you available?"',
      'Wait for candidate response',
      'Check interviewer 1 calendar',
      'Check interviewer 2 calendar',
      'Check interviewer 3 calendar',
      'Find overlapping time slot',
      'Email candidate to confirm',
      'Send calendar invites to all',
      'Repeat for 5 candidates'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Collect Availability',
        description: 'Request availability from candidates and check interviewer calendars',
        tools: ['Scheduling AI', 'Calendar Integration'],
        dataUsed: ['Interviewer calendars', 'Candidate availability requests'],
        successCriteria: 'Availability collected: 5 candidates responded, 3 interviewer calendars scanned',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-2',
        title: 'Find Optimal Time Slots',
        description: 'Match candidate and interviewer availability',
        tools: ['Smart Scheduler', 'Conflict Resolver'],
        dataUsed: ['All calendars', 'Time zone handling', 'Interview duration (1hr)'],
        successCriteria: '5 interviews scheduled across 3 days, all interviewers available',
        requiresHITL: false,
        duration: 4
      },
      {
        id: 'step-3',
        title: 'Send Calendar Invites',
        description: 'Book meetings and notify all parties',
        tools: ['Calendar API', 'Email Templates'],
        dataUsed: ['Interview details', 'Participant emails', 'Zoom links'],
        successCriteria: 'All invites sent with Zoom links and prep materials',
        requiresHITL: false,
        duration: 2
      }
    ],
    benefits: { timeSaved: '87-117 min', impactMetric: '15 interviews scheduled • Zero email back-and-forth • 3 min total time' },
    learningModules: ['Scheduling Automation', 'Calendar AI']
  },

  // ==================== LEGAL (2 scenarios) ====================
  
  {
    id: 'legal-1',
    title: 'Contract Risk Extraction',
    function: 'Other',
    description: 'AI reads 60-page contract and extracts 1-page risk summary.',
    problem: 'Need to review new supplier contract (60 pages) before signing.',
    icon: Scale,
    difficulty: 'Advanced',
    estimatedTime: '5 min',
    oldWayTime: '4-6 hours',
    oldWaySteps: [
      'Read entire 60-page contract',
      'Highlight risky clauses',
      'Check termination terms',
      'Review liability caps',
      'Note payment terms',
      'Check indemnification clauses',
      'Flag unusual terms',
      'Create summary document',
      'Present to stakeholders'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Parse Contract Document',
        description: 'Extract all clauses and categorize',
        tools: ['Contract AI', 'NLP Parser'],
        dataUsed: ['60-page PDF contract', 'Clause taxonomy', 'Risk keywords'],
        successCriteria: 'Contract parsed: 142 clauses identified across 18 categories',
        requiresHITL: false,
        duration: 8
      },
      {
        id: 'step-2',
        title: 'Identify Risk Clauses',
        description: 'Flag high-risk and unusual terms',
        tools: ['Risk Detection Engine', 'Benchmark Database'],
        dataUsed: ['Parsed clauses', 'Risk rules', 'Market standards'],
        successCriteria: '7 high-risk items flagged: unlimited liability, auto-renewal, 90-day termination notice',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-3',
        title: 'Generate Risk Summary',
        description: 'Create 1-page executive summary',
        tools: ['Summary Generator'],
        dataUsed: ['Risk analysis', 'Key terms', 'Recommendations'],
        successCriteria: '1-page summary ready with traffic-light risk ratings',
        requiresHITL: true,
        hitlMessage: 'Analyzed 60-page supplier contract. Review risk summary before proceeding with signature.',
        hitlActionContent: {
          title: '⚖️ Contract Risk Summary - SupplierX Agreement',
          sections: [
            { heading: 'Overall Risk', content: '⚠️ MEDIUM-HIGH • 7 risks identified • Recommend negotiation on 3 terms' },
            { heading: 'High Risk (RED)', bullets: [
              '**Unlimited Liability:** Section 8.2 has no cap on indemnification (industry standard: 1x annual contract value)',
              '**Auto-Renewal:** Section 12.1 auto-renews unless 90-day notice (standard: 30 days)',
              '**IP Ownership:** Section 9.4 gives supplier ownership of work product (should be joint or customer-owned)'
            ] },
            { heading: 'Medium Risk (YELLOW)', bullets: [
              '**Payment Terms:** Net 15 (typically Net 30)',
              '**Price Escalation:** Annual 5% increase (no CPI cap)',
              '**Exclusivity:** Section 5.3 prevents using other suppliers in same category'
            ] },
            { heading: 'Acceptable (GREEN)', bullets: [
              'Standard confidentiality terms',
              'Reasonable termination for cause provisions',
              'Industry-standard warranties'
            ] },
            { heading: 'Recommendation', content: '⚠️ DO NOT SIGN without negotiating: (1) Liability cap, (2) 30-day termination notice, (3) IP ownership. Everything else is acceptable.' }
          ]
        },
        duration: 6
      }
    ],
    benefits: { timeSaved: '4-6 hours', impactMetric: '60 pages → 1-page summary • 7 risks flagged • 4 hours saved per contract' },
    learningModules: ['Contract AI', 'Legal Risk Detection'],
    flagship: true,
    startHere: true
  },

  {
    id: 'legal-2',
    title: 'Contract Expiry Monitoring',
    function: 'Other',
    description: 'Flag contract expiries 120 days out to avoid auto-renewal.',
    problem: 'Tracking 200+ contracts manually. Often miss cancellation windows.',
    icon: CalendarCheck,
    difficulty: 'Beginner',
    estimatedTime: '1 min (continuous monitoring)',
    oldWayTime: '2-3 hours/month',
    oldWaySteps: [
      'Maintain contract spreadsheet manually',
      'Check expiry dates monthly',
      'Calculate cancellation notice deadlines',
      'Email contract owners',
      'Hope they respond',
      'Follow up multiple times',
      'Escalate if missed',
      'Often discover after deadline passed'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Monitor Contract Database',
        description: 'Continuous monitoring of all contract end dates',
        tools: ['Contract Management System', 'Alert Engine'],
        dataUsed: ['Contract database', 'Expiry dates', 'Cancellation notice periods'],
        successCriteria: 'Alert: 3 contracts expiring in 90-120 days',
        requiresHITL: false,
        duration: 1
      },
      {
        id: 'step-2',
        title: 'Calculate Action Deadlines',
        description: 'Determine when cancellation notice must be sent',
        tools: ['Deadline Calculator'],
        dataUsed: ['Expiry dates', 'Notice periods', 'Business day calendar'],
        successCriteria: 'Deadlines: Contract A (notice due Apr 15), Contract B (May 1), Contract C (May 10)',
        requiresHITL: false,
        duration: 1
      },
      {
        id: 'step-3',
        title: 'Alert Contract Owners',
        description: 'Notify owners with action required',
        tools: ['Alert System', 'Task Tracker'],
        dataUsed: ['Contract owners', 'Deadlines', 'Escalation rules'],
        successCriteria: 'Alerts sent to 3 contract owners with 120-day advance notice',
        requiresHITL: false,
        duration: 1
      }
    ],
    benefits: { timeSaved: '2-3 hours/month', impactMetric: 'Never miss cancellation windows • 120-day advance alerts • Zero spreadsheet maintenance' },
    learningModules: ['Contract Management Automation', 'Expiry Monitoring'],
    startHere: true
  },

  // ==================== IT & MARKETING (2 scenarios) ====================
  
  {
    id: 'it-marketing-1',
    title: 'IT Helpdesk Auto-Resolution',
    function: 'Other',
    description: 'Auto-resolve routine tickets like password resets.',
    problem: 'Helpdesk flooded with 50+ password reset tickets daily.',
    icon: Wrench,
    difficulty: 'Beginner',
    estimatedTime: '30 sec per ticket',
    oldWayTime: '5-10 min per ticket',
    oldWaySteps: [
      'User submits ticket',
      'Ticket assigned to technician',
      'Technician reads ticket',
      'Technician verifies user identity',
      'Technician resets password',
      'Technician emails new password',
      'Technician closes ticket',
      'Repeat 50 times daily'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Detect Routine Request',
        description: 'Classify ticket type automatically',
        tools: ['Ticket Classifier AI', 'NLP Engine'],
        dataUsed: ['Ticket description', 'Historical patterns'],
        successCriteria: 'Classified: Password reset request from verified employee',
        requiresHITL: false,
        duration: 1
      },
      {
        id: 'step-2',
        title: 'Auto-Resolve',
        description: 'Execute password reset via API',
        tools: ['Active Directory API', 'Identity Management'],
        dataUsed: ['User account', 'Security policies'],
        successCriteria: 'Password reset, temporary password sent to user email',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-3',
        title: 'Close Ticket',
        description: 'Mark resolved and notify user',
        tools: ['Ticket System API'],
        dataUsed: ['Ticket status', 'Resolution notes'],
        successCriteria: 'Ticket closed, user notified with instructions',
        requiresHITL: false,
        duration: 1
      }
    ],
    benefits: { timeSaved: '5-10 min per ticket', impactMetric: '80% of helpdesk tickets auto-resolved • 4+ hours/day saved • Better user experience' },
    learningModules: ['Helpdesk Automation', 'Self-Service AI'],
    startHere: true
  },

  {
    id: 'it-marketing-2',
    title: 'Digital Asset Auto-Tagging',
    function: 'Other',
    description: 'AI auto-organizes 500 product photos in DAM library.',
    problem: 'Marketing team uploaded 500 untagged product photos. Need organization.',
    icon: Palette,
    difficulty: 'Intermediate',
    estimatedTime: '5 min',
    oldWayTime: '8-10 hours',
    oldWaySteps: [
      'Open each photo',
      'Identify product',
      'Add product name tag',
      'Add category tag',
      'Add color tags',
      'Add seasonal tags',
      'Note background type',
      'Save metadata',
      'Repeat 500 times'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Analyze All Images',
        description: 'Use computer vision to identify contents',
        tools: ['Image Recognition AI', 'Product Catalog Matcher'],
        dataUsed: ['500 product photos', 'Product catalog', 'Brand guidelines'],
        successCriteria: 'All 500 images analyzed: products identified, attributes extracted',
        requiresHITL: false,
        duration: 8
      },
      {
        id: 'step-2',
        title: 'Generate Smart Tags',
        description: 'Create comprehensive metadata for each image',
        tools: ['Auto-Tagging Engine', 'Taxonomy Manager'],
        dataUsed: ['Image analysis', 'Tagging taxonomy', 'Naming conventions'],
        successCriteria: 'Tags generated: product name, category, color, season, background type, orientation',
        requiresHITL: false,
        duration: 6
      },
      {
        id: 'step-3',
        title: 'Apply to DAM System',
        description: 'Bulk upload tags to Digital Asset Management system',
        tools: ['DAM API', 'Bulk Update Tool'],
        dataUsed: ['Generated tags', 'File mappings'],
        successCriteria: 'All 500 images tagged and searchable in DAM',
        requiresHITL: false,
        duration: 4
      }
    ],
    benefits: { timeSaved: '8-10 hours', impactMetric: '500 images organized • 15+ tags per image • Instant searchability' },
    learningModules: ['Image Recognition AI', 'DAM Automation']
  },

];

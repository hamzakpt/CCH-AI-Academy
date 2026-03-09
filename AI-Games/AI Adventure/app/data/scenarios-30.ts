import { Scenario } from '@/app/types/scenario';
import { 
  ShieldCheck, 
  Camera, 
  Target, 
  Search,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

// Commercial scenarios only
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

  // ==================== SUPPLY CHAIN - Risk Management (1 scenario) ====================
  
  {
    id: 'supply-chain-1',
    title: 'Supplier Risk Detection',
    function: 'Supply Chain',
    description: 'Detect supplier disruptions instantly and activate backup sourcing.',
    problem: 'Major supplier factory disaster detected in global news - need to secure capacity before competitors react.',
    icon: AlertTriangle,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '4 hours',
    oldWaySteps: [
      'Monitor global news manually',
      'Search for supplier names in news articles',
      'Open and read each article',
      'Check supplier database for affected facilities',
      'Verify impact on production capacity',
      'Contact suppliers individually',
      'Search for backup supplier options',
      'Negotiate emergency sourcing',
      'Update risk dashboard'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Auto-Detect Disruption',
        description: 'AI monitors global news and maps to supplier database',
        tools: ['Global News Monitor', 'Supplier Database'],
        dataUsed: ['News feeds', 'Supplier locations', 'Facility data'],
        successCriteria: 'Tier 1 supplier factory explosion detected in Romania, production at risk',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Assess Impact & Options',
        description: 'Calculate capacity gap and identify backup suppliers',
        tools: ['Capacity Planner', 'Supplier Network'],
        dataUsed: ['Production volumes', 'Alternative suppliers', 'Lead times'],
        successCriteria: '40% capacity at risk, 3 backup suppliers identified',
        requiresHITL: false,
        duration: 5
      },
      {
        id: 'step-3',
        title: 'Activate Proactive Sourcing',
        description: 'Secure backup capacity before competitors',
        tools: ['Sourcing Agent', 'Contract System'],
        dataUsed: ['Supplier contracts', 'Pricing', 'Availability'],
        successCriteria: 'Backup supplier contracted within 72 seconds of alert',
        requiresHITL: true,
        hitlMessage: 'Major supplier disruption detected. Review backup sourcing plan before activation.',
        hitlActionContent: {
          title: '🚨 Supplier Risk Alert',
          sections: [
            { heading: 'Disruption', content: 'Glass factory explosion - Romania • Tier 1 Supplier A • 40% capacity at risk' },
            { heading: 'Recommended Action', bullets: ['Activate Backup Supplier B (Czech Republic)', 'Secure 50K units/month capacity', 'Lock pricing at current rates'] },
            { heading: 'Advantage', content: 'Proactive sourcing before competitors react • €5.2K margin protected • 12% cost advantage secured' }
          ]
        },
        duration: 3
      }
    ],
    benefits: { timeSaved: '3 hours 57 min', impactMetric: 'Instant detection • Proactive sourcing • €5.2K margin protected' },
    learningModules: ['Risk Monitoring', 'Supplier Intelligence'],
    flagship: true,
    startHere: true
  },

  // ==================== FINANCE - Month-End Close (1 scenario) ====================
  
  {
    id: 'finance-1',
    title: 'Month-End Accrual Drafting',
    function: 'Finance',
    description: 'Stop chasing emails. Auto-detect unbilled work and draft accruals instantly.',
    problem: 'Month-end close requires chasing 20 department heads via email to identify unbilled POs and ongoing projects.',
    icon: DollarSign,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '24 hours',
    oldWaySteps: [
      'Email all 20 department heads',
      'Ask about unbilled work and ongoing projects',
      'Chase non-responders multiple times',
      'Request detailed PO information',
      'Manually compile responses in spreadsheet',
      'Calculate accrual amounts',
      'Draft journal entries',
      'Gather supporting documentation',
      'Submit for CFO approval'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Scan Open POs & Projects',
        description: 'AI analyzes all open purchase orders and project timelines',
        tools: ['ERP Integration', 'Project Management API'],
        dataUsed: ['Open POs', 'Delivery confirmations', 'Project milestones'],
        successCriteria: '120 open POs scanned, 15 projects analyzed, unbilled work detected',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Identify Unbilled Work',
        description: 'Cross-reference deliveries and progress against invoices',
        tools: ['Accrual Detection Engine', 'Invoice Matching'],
        dataUsed: ['Delivery logs', 'GPS tracking', 'Invoice register'],
        successCriteria: '18 accrual entries identified totaling €248,300 unbilled',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-3',
        title: 'Draft Accrual Entries',
        description: 'Auto-generate journal entries with supporting evidence',
        tools: ['Journal Entry Generator', 'Documentation Attachment'],
        dataUsed: ['PO details', 'Evidence documents', 'Account mappings'],
        successCriteria: 'Complete journal entries with evidence ready for review',
        requiresHITL: true,
        hitlMessage: 'Found €248,300 in unbilled work across 18 entries. Review draft accruals before posting.',
        hitlActionContent: {
          title: '💰 Month-End Accruals Ready',
          sections: [
            { heading: 'Detection Summary', content: '120 POs analyzed • 15 projects reviewed • 18 accrual entries drafted • €248,300 total' },
            { heading: 'Top 3 Accruals', bullets: ['Logistics Q1: €45,000 (GPS logs confirm delivery, no invoice)', 'Marketing Digital: €23,500 (Agency work 80% complete)', 'IT Infrastructure: €67,200 (SaaS active, Feb invoice missing)'] },
            { heading: 'Time Saved', content: 'Zero emails sent • 24 hours saved • 100% coverage vs manual sampling' }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '23 hours 51 min', impactMetric: 'Close time: 5 days → 2 days • Zero email chasing' },
    learningModules: ['Accrual Automation', 'Month-End Close'],
    flagship: true,
    startHere: true
  }
];
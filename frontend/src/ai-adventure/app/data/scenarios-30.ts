import { Scenario } from '@ai-adventure/app/types/scenario';
import { 
  ShieldCheck, 
  Camera, 
  Target, 
  Search,
  AlertTriangle,
  DollarSign,
  Users,
  Scale
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
    active: true
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
    active: true
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
    active: true
  },
  // ==================== HR - Performance Management (1 scenario) ====================
  
  {
    id: 'hr-1',
    title: 'Performance Review Calibration',
    function: 'HR',
    description: 'Detect bias and scoring inconsistencies automatically across all performance reviews.',
    problem: 'Q4 performance calibration requires manually reviewing 12 reviews for bias patterns and scoring consistency.',
    icon: Users,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '8 hours',
    oldWaySteps: [
      'Open each PDF review individually',
      'Read manager comments line by line',
      'Manually highlight subjective language',
      'Track gendered adjectives in spreadsheet',
      'Compare scores to department averages',
      'Calculate scoring deviations',
      'Document bias patterns',
      'Draft calibration meeting notes',
      'Schedule follow-up with managers'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Analyze All Reviews',
        description: 'AI scans 12 performance reviews for language patterns and scoring',
        tools: ['NLP Engine', 'Bias Detection Algorithm'],
        dataUsed: ['Performance reviews', 'Historical scoring data', 'Department averages'],
        successCriteria: '12 reviews analyzed, 2 critical anomalies detected in 1 second',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Flag Scoring Anomalies',
        description: 'Identify managers with systematic over/under-scoring patterns',
        tools: ['Statistical Analysis', 'Scoring Consistency Checker'],
        dataUsed: ['Manager scoring history', 'Peer benchmarks', 'Role comparisons'],
        successCriteria: 'Manager Martinez scores 1.2 points lower than department average',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-3',
        title: 'Surface Bias Patterns',
        description: 'Detect gendered language and subjective adjectives automatically',
        tools: ['Bias Pattern Analyzer', 'Word Cloud Generator'],
        dataUsed: ['Review text', 'Gender data', 'Language policy guidelines'],
        successCriteria: 'Manager Martinez uses gendered adjectives in 67% of female vs 20% of male reviews',
        requiresHITL: true,
        hitlMessage: 'Critical bias patterns detected. Review findings and approve recommended actions.',
        hitlActionContent: {
          title: '⚠️ Performance Calibration Insights',
          sections: [
            { heading: 'Analysis Summary', content: '12 reviews analyzed • 2 critical anomalies identified • Manager Martinez flagged' },
            { heading: 'Anomaly 1: Hard Grader', bullets: ['Manager Martinez avg: 2.3/5', 'Department avg: 3.5/5', 'Deviation: -1.2 points', 'Action: Schedule calibration discussion'] },
            { heading: 'Anomaly 2: Bias Language', bullets: ['Female reviews: 67% contain gendered language (supportive, emotional, needs to smile)', 'Male reviews: 20% contain gendered language (technical leader, ambitious)', 'Action: Flag for rewrite per company policy'] }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '7 hours 51 min', impactMetric: 'Time: 8 hours → 15 min • 100% coverage • Objective bias detection' },
    learningModules: ['Bias Detection', 'Performance Analytics'],
    flagship: true,
    active: true
  },

  // ==================== LEGAL - Contract Risk Management (1 scenario) ====================
  
  {
    id: 'legal-1',
    title: 'Clause Risk Extraction',
    function: 'Other',
    description: 'Extract risky clauses from 60-page contracts instantly vs. hours of manual review.',
    problem: 'You need to review a 60-page vendor agreement to identify liability and indemnity risks before signing.',
    icon: Scale,
    difficulty: 'Intermediate',
    estimatedTime: '3 min',
    oldWayTime: '4.5 hours',
    oldWaySteps: [
      'Open 60-page PDF contract',
      'Read each page line by line',
      'Manually highlight risk clauses',
      'Copy-paste clauses into risk spreadsheet',
      'Look up company policy playbook',
      'Compare clauses against standards',
      'Calculate liability exposure',
      'Draft redline recommendations',
      'Email to General Counsel for review'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Scan Contract Document',
        description: 'AI reads and parses 60-page vendor agreement',
        tools: ['Document Parser', 'Contract Intelligence'],
        dataUsed: ['Contract PDF', 'Company playbook', 'Risk taxonomy'],
        successCriteria: '60 pages scanned, 147 clauses extracted, 3 high-risk flagged',
        requiresHITL: false,
        duration: 2
      },
      {
        id: 'step-2',
        title: 'Compare Against Playbook',
        description: 'Check extracted clauses vs Standard Global Indemnity Playbook',
        tools: ['Policy Comparison Engine', 'Risk Calculator'],
        dataUsed: ['Extracted clauses', 'Company standards', 'Liability thresholds'],
        successCriteria: 'Section 18.3 offers Unlimited Liability - deviates from $50K cap standard',
        requiresHITL: false,
        duration: 3
      },
      {
        id: 'step-3',
        title: 'Generate Risk Report',
        description: 'Draft findings with recommended counter-clauses',
        tools: ['Risk Reporter', 'Clause Library'],
        dataUsed: ['Risk findings', 'Standard clauses', 'Redline templates'],
        successCriteria: '3 high-risk clauses identified with standard counter-language ready',
        requiresHITL: true,
        hitlMessage: '3 risky clauses extracted. Review findings and approve standard counter-language insertion.',
        hitlActionContent: {
          title: '⚖️ Contract Risk Analysis Complete',
          sections: [
            { heading: 'Document Analyzed', content: 'Vendor Agreement v4.2 • 60 pages • 147 clauses extracted • 3 high-risk deviations' },
            { heading: 'Risk Clauses', bullets: ['Section 18.3 Indemnification: Unlimited Liability (Std: $50K cap)', 'Section 22.1 Termination: 90-day notice (Std: 30-day)', 'Section 9.4 Data Rights: Perpetual vendor access (Std: Term-limited)'] },
            { heading: 'Recommended Action', content: 'Insert Mutual Indemnity clause with $50K cap • Add 30-day termination clause • Limit data rights to contract term' }
          ]
        },
        duration: 4
      }
    ],
    benefits: { timeSaved: '4 hours 21 min', impactMetric: 'Review time: 4.5 hrs → 45 sec • 100% clause coverage • Risk-aligned' },
    learningModules: ['Contract Intelligence', 'Risk Extraction'],
    flagship: true,
    active: true
  }
];
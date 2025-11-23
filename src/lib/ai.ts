import { GoogleGenerativeAI } from '@google/generative-ai';

export interface NegotiationData {
  marketRate: { min: number; max: number };
  complexityScore: 'Low' | 'Medium' | 'High';
  whyItMatters: string;
  roiPotential: string;
}

export interface RetainerNegotiation {
  marketRate: { min: number; max: number };
  alternativeCost: { description: string; amount: number };
  riskOfInaction: string;
  whyItMatters: string;
}

export interface QuoteItem {
  description: string;
  amount: number;
  negotiation?: NegotiationData;
}

export interface AiPackage {
  name: string;
  price: number;
  description: string;
  features: string[];
  isRecommended: boolean;
  timeline?: string;
  revisions?: string;
  supportLevel?: string;
}

export interface AiPaymentPlan {
  type: string;
  depositPercent: number;
  discountPercent?: number;
}

export interface QuoteGenerationResponse {
  summary: string;
  items: QuoteItem[];
  total: number;
  packages: AiPackage[];
  paymentPlans: {
    type: string;
    deposit: number;
    total: number;
  }[];
  retainerNegotiation?: RetainerNegotiation;
}

export interface SellerSettings {
  businessName?: string;
  currency?: string;
  baseHourlyRate?: number;
  minHourlyRate?: number;
  defaultDeposit?: number;
}

const apiKey = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3-pro-preview';

function cleanJson(text: string) {
  return text.replace(/```json/gi, '').replace(/```/g, '').trim();
}

function safeParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(cleanJson(text)) as T;
  } catch (error) {
    console.warn('Failed to parse JSON from AI', error);
    return fallback;
  }
}

export async function generateQuoteDetails(
  projectTitle: string,
  notes: string,
  seller: SellerSettings
): Promise<QuoteGenerationResponse> {
  if (!apiKey) {
    console.warn('Missing Gemini API Key. Using mock fallback.');
    return mockGenerate();
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL });

  try {
    // Stage 1: Scope understanding & Negotiation Data
    const scopePrompt = `
You are a senior project manager and pricing strategist. Analyze the project and return JSON only.
Project Title: "${projectTitle}"
Notes: """${notes}"""
Seller: ${JSON.stringify(seller)}

For each deliverable, provide:
- Estimated hours
- Market Rate Range (min/max in seller's currency) based on industry standards
- Complexity (Low/Medium|High)
- "Why it matters" (1 sentence value prop)
- "ROI Potential" (1 sentence business impact)

Return JSON:
{
  "deliverables": [
    {
      "title": "",
      "hours": 0,
      "market_min": 0,
      "market_max": 0,
      "complexity": "Low|Medium|High",
      "why_matters": "",
      "roi": ""
    }
  ],
  "complexity": "simple|medium|complex",
  "total_hours_estimate": 0,
  "risk_factors": [],
  "hidden_work_hours": 0,
  "confidence_score": 0.0,
  "retainer_analysis": {
    "market_min": 0,
    "market_max": 0,
    "alternative_cost_desc": "Hiring full-time junior dev",
    "alternative_cost_amount": 0,
    "risk_of_inaction": "Security vulnerabilities...",
    "why_matters": "Ensures 99.9% uptime"
  }
}
Only JSON.`;
    const scopeResult = await model.generateContent(scopePrompt);
    const scope = safeParse<{
      deliverables: {
        title: string;
        hours: number;
        market_min: number;
        market_max: number;
        complexity: 'Low' | 'Medium' | 'High';
        why_matters: string;
        roi: string;
      }[];
      total_hours_estimate: number;
      hidden_work_hours: number;
      complexity: string;
      confidence_score: number;
      retainer_analysis?: {
        market_min: number;
        market_max: number;
        alternative_cost_desc: string;
        alternative_cost_amount: number;
        risk_of_inaction: string;
        why_matters: string;
      };
    }>(scopeResult.response.text(), {
      deliverables: [],
      total_hours_estimate: 10,
      hidden_work_hours: 2,
      complexity: 'medium',
      confidence_score: 0.7,
      retainer_analysis: {
        market_min: 400,
        market_max: 800,
        alternative_cost_desc: 'Hiring internal junior dev',
        alternative_cost_amount: 4500,
        risk_of_inaction: 'Increased risk of downtime and security breaches.',
        why_matters: 'Guarantees response time and system health.',
      },
    });

    const baseRate = seller.baseHourlyRate ?? 100;
    const minRate = seller.minHourlyRate ?? 75;
    const avgHours =
      (scope.total_hours_estimate || 0) + (scope.hidden_work_hours || 0) || 12;
    const floorTotal = Math.max(avgHours * minRate, 500);

    // Stage 2: Pricing strategy
    const pricingPrompt = `
You are a pricing strategist. Create 3 tiers and payment plans. Respond with JSON only.
Project Title: "${projectTitle}"
Seller settings: ${JSON.stringify(seller)}
Scope: ${JSON.stringify(scope)}
Rules:
- Never price below min rate (${minRate}).
- Standard ~40-50% above Basic; Premium ~40-50% above Standard.
- Mark one recommended.
- Include timelines, revisions, support level.

Return JSON:
{
  "packages": [
    {
      "name": "Essential",
      "price": 0,
      "description": "",
      "features": [],
      "isRecommended": false,
      "timeline": "",
      "revisions": "",
      "supportLevel": ""
    }
  ],
  "payment_plans": [
    { "type": "light", "deposit_percent": 0.3, "discount_percent": 0 },
    { "type": "balanced", "deposit_percent": 0.5, "discount_percent": 0 },
    { "type": "full", "deposit_percent": 1, "discount_percent": 0.05 }
  ]
}
Only JSON.`;

    const pricingResult = await model.generateContent(pricingPrompt);
    const pricing = safeParse<{
      packages: AiPackage[];
      payment_plans: AiPaymentPlan[];
    }>(pricingResult.response.text(), {
      packages: [],
      payment_plans: [],
    });

    const packages = normalizePackages(pricing.packages, floorTotal);
    const paymentPlans = normalizePlans(
      pricing.payment_plans,
      packages.find((p) => p.isRecommended)?.price ||
      packages[1]?.price ||
      floorTotal
    );

    // Stage 3: Client-ready copy
    const copyPrompt = `
You are a copywriter. Write a short summary for the recommended option.
Project: "${projectTitle}"
Notes: "${notes}"
Packages: ${JSON.stringify(packages.slice(0, 3))}

Return JSON:
{ "summary": "max 2 sentences energetic summary" }
Only JSON.`;

    const copyResult = await model.generateContent(copyPrompt);
    const copy = safeParse<{ summary: string }>(copyResult.response.text(), {
      summary: 'Here is a confident proposal tailored to your project.',
    });

    const items: QuoteItem[] =
      scope.deliverables && scope.deliverables.length
        ? scope.deliverables.map((d) => ({
          description: d.title,
          amount: Math.max(Math.round((d.hours || 1) * baseRate), 100),
          negotiation: {
            marketRate: { min: d.market_min || 0, max: d.market_max || 0 },
            complexityScore: d.complexity || 'Medium',
            whyItMatters: d.why_matters || 'Critical for project success.',
            roiPotential: d.roi || 'Improves overall value.'
          }
        }))
        : [
          { description: 'Discovery & Planning', amount: Math.round(floorTotal * 0.2) },
          { description: 'Execution & Build', amount: Math.round(floorTotal * 0.6) },
          { description: 'QA & Launch Support', amount: Math.round(floorTotal * 0.2) },
        ];

    const totalFromItems = items.reduce((sum, i) => sum + i.amount, 0);
    const recommended = packages.find((p) => p.isRecommended) || packages[1] || packages[0];

    return {
      summary: copy.summary,
      items,
      total: recommended?.price ?? totalFromItems,
      packages,
      paymentPlans,
      retainerNegotiation: scope.retainer_analysis ? {
        marketRate: { min: scope.retainer_analysis.market_min, max: scope.retainer_analysis.market_max },
        alternativeCost: {
          description: scope.retainer_analysis.alternative_cost_desc,
          amount: scope.retainer_analysis.alternative_cost_amount
        },
        riskOfInaction: scope.retainer_analysis.risk_of_inaction,
        whyItMatters: scope.retainer_analysis.why_matters
      } : undefined,
    };
  } catch (error) {
    console.error('Gemini generation failed:', error);
    return mockGenerate();
  }
}

function normalizePackages(packages: AiPackage[], floorTotal: number): AiPackage[] {
  if (!packages || packages.length < 3) {
    const base = floorTotal;
    return [
      {
        name: 'Essential',
        price: Math.round(base),
        description: 'Lean scope to deliver essentials quickly.',
        features: ['Core deliverables', 'Email support', '1 revision'],
        isRecommended: false,
      },
      {
        name: 'Recommended',
        price: Math.round(base * 1.4),
        description: 'Balanced scope with polish and QA.',
        features: ['Everything in Essential', 'QA + polish', '2 revisions'],
        isRecommended: true,
      },
      {
        name: 'Complete',
        price: Math.round(base * 2),
        description: 'Premium experience with priority support.',
        features: ['Everything in Recommended', 'Priority support', 'Launch assistance'],
        isRecommended: false,
      },
    ];
  }

  const sorted = [...packages].sort((a, b) => a.price - b.price);
  if (!sorted.some((p) => p.isRecommended) && sorted[1]) {
    sorted[1].isRecommended = true;
  }
  return sorted.map((p) => ({
    ...p,
    price: Math.max(p.price, floorTotal),
    features: p.features?.slice(0, 6) ?? [],
  }));
}

function normalizePlans(plans: AiPaymentPlan[], baseTotal: number) {
  const defaults: AiPaymentPlan[] = [
    { type: 'light', depositPercent: 0.3 },
    { type: 'balanced', depositPercent: 0.5 },
    { type: 'full', depositPercent: 1, discountPercent: 0.05 },
  ];
  const source = plans?.length ? plans : defaults;

  return source.map((p) => {
    const depositPercent = Math.min(Math.max(p.depositPercent ?? 0.5, 0.2), 1);
    const discountPercent = Math.min(Math.max(p.discountPercent ?? 0, 0), 0.2);
    const total = Math.round(baseTotal * (1 - discountPercent));
    const deposit = Math.round(total * depositPercent);
    return { type: p.type, deposit, total };
  });
}

// Fallback for when API key is missing or an error occurs
async function mockGenerate(): Promise<QuoteGenerationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    summary: 'Generated (Mock): Based on your request, here is a standard estimate.',
    items: [
      { description: 'Scope Assessment', amount: 500 },
      { description: 'Implementation', amount: 2000 },
      { description: 'Testing & QA', amount: 500 },
    ],
    total: 3000,
    packages: [
      {
        name: 'Essential',
        price: 3000,
        description: 'Lean scope to deliver essentials quickly.',
        features: ['Core deliverables', 'Email support', '1 revision'],
        isRecommended: false,
      },
      {
        name: 'Recommended',
        price: 4200,
        description: 'Balanced scope with polish and QA.',
        features: ['Everything in Essential', 'QA + polish', '2 revisions'],
        isRecommended: true,
      },
      {
        name: 'Complete',
        price: 6000,
        description: 'Premium experience with priority support.',
        features: ['Everything in Recommended', 'Priority support', 'Launch assistance'],
        isRecommended: false,
      },
    ],
    paymentPlans: [
      { type: 'light', deposit: 900, total: 3000 },
      { type: 'balanced', deposit: 2100, total: 4200 },
      { type: 'full', deposit: 5400, total: 5400 },
    ],
  };
}

import { create } from 'zustand';

export interface NegotiationData {
  marketRate: { min: number; max: number };
  complexityScore: 'Low' | 'Medium' | 'High';
  whyItMatters: string;
  roiPotential: string;
}

export interface QuoteItem {
  description: string;
  amount: number;
  justification?: string;
  negotiation?: NegotiationData;
}

export interface RetainerNegotiation {
  marketRate: { min: number; max: number };
  alternativeCost: { description: string; amount: number };
  riskOfInaction: string;
  whyItMatters: string;
}

export interface Quote {
  id: string;
  slug: string;
  userId: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  mode?: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Paid';
  totalAmount: number | null;
  createdAt: string;
  rawNotes?: string;
  items?: QuoteItem[];
  aiSummary?: string;

  retainerPrice?: number;
  retainerInterval?: string;
  retainerDescription?: string;
  retainerStatus?: string;
  retainerAmount?: number;
  retainerSubscriptionId?: string;
  retainerNegotiation?: RetainerNegotiation;
  currency?: string;
  views?: number;

  packages?: {
    id: string;
    name: string;
    price: number;
    description: string;
    features: string[];
    isRecommended: boolean;
    timeline?: string | null;
    revisions?: string | null;
    supportLevel?: string | null;
  }[];
  paymentPlans?: {
    id: string;
    type: string;
    deposit: number;
    total: number;
  }[];
}

interface AppState {
  user: unknown | null; // Clerk user shape is large; keep lax for now
  setUser: (user: unknown) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  setQuotes: (quotes: Quote[]) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),

  quotes: [],
  addQuote: (quote) => set((state) => ({ quotes: [quote, ...state.quotes] })),
  setQuotes: (quotes) => set({ quotes }),
  updateQuote: (id, updates) =>
    set((state) => ({
      quotes: state.quotes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    })),
  deleteQuote: (id) =>
    set((state) => ({
      quotes: state.quotes.filter((q) => q.id !== id),
    })),
}));

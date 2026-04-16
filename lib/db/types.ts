export type Plan = "starter" | "growth" | "pro";
export type Provider = "openai" | "gemini";
export type RunStatus = "pending" | "running" | "done" | "failed";
export type Sentiment = "positive" | "neutral" | "negative";
export type RecommendationStrength = "recommended" | "mentioned" | "dismissed";

export type Citation = {
  url: string;
  title?: string;
  snippet?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          plan: Plan;
          stripe_customer_id: string | null;
          monthly_cost_cents_used: number;
          billing_period_start: string;
          created_at: string;
        };
        Insert: {
          id: string;
          plan?: Plan;
          stripe_customer_id?: string | null;
          monthly_cost_cents_used?: number;
          billing_period_start?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      brands: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          domain: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          domain?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brands"]["Insert"]>;
      };
      queries: {
        Row: {
          id: string;
          brand_id: string;
          prompt_text: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          prompt_text: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["queries"]["Insert"]>;
      };
      runs: {
        Row: {
          id: string;
          brand_id: string;
          scheduled_at: string;
          completed_at: string | null;
          status: RunStatus;
          total_cost_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          scheduled_at?: string;
          completed_at?: string | null;
          status?: RunStatus;
          total_cost_cents?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runs"]["Insert"]>;
      };
      results: {
        Row: {
          id: string;
          run_id: string;
          query_id: string;
          provider: Provider;
          replication_index: number;
          raw_response: string;
          mentioned: boolean;
          position: number | null;
          sentiment: Sentiment | null;
          recommendation_strength: RecommendationStrength | null;
          context_quote: string | null;
          citations: Citation[];
          competitors_mentioned: string[];
          cost_cents: number;
          idempotency_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          query_id: string;
          provider: Provider;
          replication_index: number;
          raw_response: string;
          mentioned: boolean;
          position?: number | null;
          sentiment?: Sentiment | null;
          recommendation_strength?: RecommendationStrength | null;
          context_quote?: string | null;
          citations?: Citation[];
          competitors_mentioned?: string[];
          cost_cents: number;
          idempotency_key: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["results"]["Insert"]>;
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          payload: Record<string, unknown>;
          dedupe_key: string;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          payload?: Record<string, unknown>;
          dedupe_key: string;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["alerts"]["Insert"]>;
      };
    };
  };
};

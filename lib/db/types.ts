export type Plan = "starter" | "growth" | "pro";
export type Provider = "openai" | "gemini";
export type RunStatus = "pending" | "running" | "done" | "failed";
export type RunTriggerSource = "cron" | "onboarding" | "manual";
export type Sentiment = "positive" | "neutral" | "negative";
export type RecommendationStrength = "recommended" | "mentioned" | "dismissed";

export type Citation = {
  url: string;
  title?: string;
  snippet?: string;
};

export type Database = {
  public: {
    Views: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Enums: {
      plan_tier: Plan;
      run_status: RunStatus;
      run_trigger_source: RunTriggerSource;
      llm_provider: Provider;
      sentiment: Sentiment;
      recommendation_strength: RecommendationStrength;
    };
    Functions: {
      increment_monthly_cost: {
        Args: {
          p_user_id: string;
          p_delta_cents: number;
        };
        Returns: undefined;
      };
    };
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
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      runs: {
        Row: {
          id: string;
          brand_id: string;
          scheduled_at: string;
          completed_at: string | null;
          status: RunStatus;
          triggered_by: RunTriggerSource;
          total_cost_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          brand_id: string;
          scheduled_at?: string;
          completed_at?: string | null;
          status?: RunStatus;
          triggered_by?: RunTriggerSource;
          total_cost_cents?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runs"]["Insert"]>;
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
    };
  };
};

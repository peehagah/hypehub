// ============================================================
// HypeHub — TypeScript Types (mirrors Supabase schema)
// ============================================================

export type WorkspaceStatus = 'active' | 'inactive' | 'paused'
export type AgentStatus = 'running' | 'idle' | 'error' | 'stopped'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type MessageRole = 'user' | 'assistant' | 'system'
export type DelegationStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// ---- Workspaces ------------------------------------------------
export interface Workspace {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  color: string          // hex brand color for this client
  niche: string | null
  goals: Record<string, unknown>
  onboarding_data: Record<string, unknown>
  is_prospect: boolean
  prospect_score: number | null
  created_at: string
  updated_at: string
  // Legacy optional fields for backward compat with mock data and components
  status?: WorkspaceStatus
  owner_id?: string | null
  whatsapp_number?: string | null
  whatsapp_active?: boolean
  instagram_handle?: string | null
  twitter_handle?: string | null
  website_url?: string | null
  industry?: string | null
  monthly_budget?: number | null
}

// ---- Agents ----------------------------------------------------
export interface Agent {
  id: string
  workspace_id: string
  name: string
  // Actual DB columns
  role: string           // e.g. 'orchestrator', 'content', 'analytics', 'social'
  system_prompt: string | null
  model: string          // e.g. 'claude-sonnet-4-6'
  is_gerentao: boolean
  is_active: boolean
  status: AgentStatus
  last_active_at: string | null
  avatar_config: Record<string, unknown>
  created_at: string
  // Legacy / optional fields kept for backward compat with mock data
  slug?: string
  description?: string | null
  type?: string
  temperature?: number
  max_tokens?: number
  tools_enabled?: string[]
  error_message?: string | null
  metadata?: Record<string, unknown>
  updated_at?: string
}

// ---- Knowledge Base --------------------------------------------
export interface KnowledgeBase {
  id: string
  workspace_id: string
  agent_id: string | null
  title: string
  content: string
  category: string | null
  tags: string[]
  embedding: number[] | null
  source_url: string | null
  created_at: string
  updated_at: string
}

// ---- Conversations ---------------------------------------------
export interface Conversation {
  id: string
  workspace_id: string
  agent_id: string
  user_id: string | null
  title: string | null
  channel: string        // 'web' | 'whatsapp' | 'api'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- Messages --------------------------------------------------
export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  tokens_used: number | null
  metadata: Record<string, unknown>
  created_at: string
}

// ---- Tasks -----------------------------------------------------
export interface Task {
  id: string
  workspace_id: string
  agent_id: string | null
  assigned_to: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  tags: string[]
  attachments: string[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- Metrics ---------------------------------------------------
export interface Metric {
  id: string
  workspace_id: string
  metric_name: string
  metric_value: number
  metric_unit: string | null
  dimension: string | null   // e.g. 'instagram', 'tiktok', 'total'
  recorded_at: string
  created_at: string
}

// ---- Competitors -----------------------------------------------
export interface Competitor {
  id: string
  workspace_id: string
  name: string
  website_url: string | null
  instagram_handle: string | null
  twitter_handle: string | null
  notes: string | null
  last_analyzed_at: string | null
  analysis_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ---- News Feed -------------------------------------------------
export interface NewsFeedItem {
  id: string
  workspace_id: string | null   // null = global
  title: string
  summary: string | null
  source_url: string | null
  source_name: string | null
  category: string | null
  relevance_score: number | null
  published_at: string | null
  created_at: string
}

// ---- Weekly Reports --------------------------------------------
export interface WeeklyReport {
  id: string
  workspace_id: string
  week_start: string
  week_end: string
  summary: string | null
  highlights: string[]
  metrics_snapshot: Record<string, unknown>
  tasks_completed: number
  tasks_created: number
  generated_at: string | null
  pdf_url: string | null
  created_at: string
}

// ---- Delegations -----------------------------------------------
export interface Delegation {
  id: string
  from_agent_id: string | null
  to_agent_id: string | null
  task_id: string | null
  workspace_id: string
  instruction: string
  status: DelegationStatus
  result: string | null
  error: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

// ---- Daily Summaries ------------------------------------------
export interface DailySummary {
  id: string
  workspace_id: string | null   // null = cross-client
  date: string
  summary: string
  highlights: string[]
  alerts: string[]
  metrics_delta: Record<string, unknown>
  generated_at: string
  created_at: string
}

// ---- Activity Log ----------------------------------------------
export interface ActivityLogEntry {
  id: string
  workspace_id: string | null
  agent_id: string | null
  user_id: string | null
  action: string
  entity_type: string | null   // 'task' | 'agent' | 'workspace' | 'message'
  entity_id: string | null
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

// ---- Supabase Database Type -----------------------------------
export interface Database {
  public: {
    Tables: {
      workspaces: { Row: Workspace; Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Workspace> }
      agents: { Row: Agent; Insert: Omit<Agent, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Agent> }
      knowledge_base: { Row: KnowledgeBase; Insert: Omit<KnowledgeBase, 'id' | 'created_at' | 'updated_at'>; Update: Partial<KnowledgeBase> }
      conversations: { Row: Conversation; Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Conversation> }
      messages: { Row: Message; Insert: Omit<Message, 'id' | 'created_at'>; Update: Partial<Message> }
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Task> }
      metrics: { Row: Metric; Insert: Omit<Metric, 'id' | 'created_at'>; Update: Partial<Metric> }
      competitors: { Row: Competitor; Insert: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Competitor> }
      news_feed: { Row: NewsFeedItem; Insert: Omit<NewsFeedItem, 'id' | 'created_at'>; Update: Partial<NewsFeedItem> }
      weekly_reports: { Row: WeeklyReport; Insert: Omit<WeeklyReport, 'id' | 'created_at'>; Update: Partial<WeeklyReport> }
      delegations: { Row: Delegation; Insert: Omit<Delegation, 'id' | 'created_at'>; Update: Partial<Delegation> }
      daily_summaries: { Row: DailySummary; Insert: Omit<DailySummary, 'id' | 'created_at'>; Update: Partial<DailySummary> }
      activity_log: { Row: ActivityLogEntry; Insert: Omit<ActivityLogEntry, 'id' | 'created_at'>; Update: Partial<ActivityLogEntry> }
    }
  }
}

// ---- UI / Dashboard types -------------------------------------
export interface MetricCard {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: string
  color: string
}

export interface Alert {
  id: string
  workspace: string
  workspaceColor: string
  message: string
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  shortcut?: string
  action: () => void
}

-- Subscription Plans System
-- User plans, subscriptions, and usage tracking

-- Tabella piani (statica)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_monthly INTEGER,       -- in centesimi (499 = €4.99)
  messages_per_day INTEGER,    -- limite messaggi (-1 = illimitati)
  max_saved_recipes INTEGER,   -- limite ricette (-1 = illimitate)
  features TEXT,               -- JSON array di feature
  stripe_price_id TEXT
);

-- Subscription utente
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_start INTEGER,
  current_period_end INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id)
);

-- Usage tracking (per limiti giornalieri)
CREATE TABLE IF NOT EXISTS usage_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,        -- 'message', 'recipe_save', etc.
  date TEXT NOT NULL,          -- '2024-01-15' (per conteggio giornaliero)
  count INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON user_subscriptions(stripe_subscription_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_user_action_date ON usage_logs(user_id, action, date);

-- Seed piani
INSERT OR REPLACE INTO plans (id, name, display_name, price_monthly, messages_per_day, max_saved_recipes, features, stripe_price_id) VALUES
  ('free', 'free', 'Free', 0, 3, 5, '["Ricette base","3 messaggi al giorno","Salva fino a 5 ricette"]', NULL),
  ('pro', 'pro', 'Pro', 499, 50, -1, '["50 messaggi al giorno","Ricette illimitate","Modalità Stellato","Priorità risposte"]', NULL),
  ('premium', 'premium', 'Premium', 999, -1, -1, '["Messaggi illimitati","Ricette illimitate","Modalità Stellato","Modalità Recupero","Supporto prioritario"]', NULL);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SGD',
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('software','equipment','travel','meals','marketing','office','professional','other')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenants manage own expenses" ON expenses FOR ALL USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());
CREATE INDEX IF NOT EXISTS expenses_tenant_id_idx ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);

-- Add recurring support to invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_interval TEXT CHECK (recurring_interval IN ('weekly','monthly','quarterly','yearly')) DEFAULT NULL;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_next_date DATE DEFAULT NULL;

-- Organizations (Agency / Enterprise tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'agency',      -- 'agency' | 'enterprise'
  seats_limit     INTEGER NOT NULL DEFAULT 10,
  branding        JSONB DEFAULT '{}',                  -- {logo_url, primary_color, tagline}
  custom_domain   TEXT,
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Members of an org (links Lancr tenants → org)
CREATE TABLE IF NOT EXISTS org_memberships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE SET NULL,  -- null until invite accepted
  role          TEXT NOT NULL DEFAULT 'member',   -- 'admin' | 'member'
  status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'active'
  invite_token  TEXT UNIQUE,
  invite_email  TEXT,
  invited_at    TIMESTAMPTZ DEFAULT NOW(),
  joined_at     TIMESTAMPTZ,
  UNIQUE(org_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_org_memberships_org_id       ON org_memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_tenant_id    ON org_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_invite_token ON org_memberships(invite_token);

-- RLS
ALTER TABLE organizations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_memberships ENABLE ROW LEVEL SECURITY;

-- Org admins can read their org
CREATE POLICY "org_read" ON organizations FOR SELECT
  USING (
    id IN (
      SELECT org_id FROM org_memberships
      WHERE tenant_id = auth.uid() AND status = 'active'
    )
  );

-- Org admins can update their org
CREATE POLICY "org_admin_update" ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT org_id FROM org_memberships
      WHERE tenant_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Org admins can insert (create org) — done via service role in action
-- Members can read their own memberships
CREATE POLICY "membership_read" ON org_memberships FOR SELECT
  USING (
    tenant_id = auth.uid()
    OR org_id IN (
      SELECT org_id FROM org_memberships
      WHERE tenant_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

-- Admins can insert/update memberships for their org
CREATE POLICY "membership_admin_write" ON org_memberships FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM org_memberships
      WHERE tenant_id = auth.uid() AND role = 'admin' AND status = 'active'
    )
  );

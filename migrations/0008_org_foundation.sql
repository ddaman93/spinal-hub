-- Sprint 1: Organisation foundation
-- Care companies get a tenant model that owns patient rosters + staff assignments.
-- Uses IF NOT EXISTS guards throughout — safe to run twice.

CREATE TABLE IF NOT EXISTS organizations (
  id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  -- care_company | rehab | acc_vendor
  type        TEXT NOT NULL DEFAULT 'care_company',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_members (
  id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      VARCHAR NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- owner | admin | staff
  role        TEXT NOT NULL DEFAULT 'staff',
  status      TEXT NOT NULL DEFAULT 'active',  -- active | removed
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT org_members_unique_pair UNIQUE (org_id, user_id)
);

CREATE INDEX IF NOT EXISTS org_members_org_status_idx ON org_members (org_id, status);
CREATE INDEX IF NOT EXISTS org_members_user_idx ON org_members (user_id);

CREATE TABLE IF NOT EXISTS org_patients (
  id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      VARCHAR NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id  VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  added_by    VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  -- active | discharged
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT org_patients_unique_pair UNIQUE (org_id, patient_id)
);

CREATE INDEX IF NOT EXISTS org_patients_org_status_idx ON org_patients (org_id, status);

CREATE TABLE IF NOT EXISTS staff_assignments (
  id              VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          VARCHAR NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  staff_user_id   VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  patient_id      VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'active',  -- active | removed
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT staff_assignments_unique_pair UNIQUE (org_id, staff_user_id, patient_id)
);

CREATE INDEX IF NOT EXISTS staff_assignments_staff_idx ON staff_assignments (staff_user_id, status);
CREATE INDEX IF NOT EXISTS staff_assignments_patient_idx ON staff_assignments (patient_id, status);

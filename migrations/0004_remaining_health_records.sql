-- Remaining shared health records: bladder, pain, hydration, routines, skin checks, care preferences

CREATE TABLE IF NOT EXISTS bladder_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  type text NOT NULL,
  volume_ml integer,
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bladder_logs_patient_created_idx ON bladder_logs (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS pain_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  level integer NOT NULL,
  location text NOT NULL,
  description text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pain_entries_patient_created_idx ON pain_entries (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS hydration_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  unit text NOT NULL DEFAULT 'ml',
  date text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hydration_logs_patient_date_idx ON hydration_logs (patient_id, date);

CREATE TABLE IF NOT EXISTS routine_tasks (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'morning',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_completions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id varchar NOT NULL REFERENCES routine_tasks(id) ON DELETE CASCADE,
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date text NOT NULL,
  completed_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS routine_completions_patient_date_idx ON routine_completions (patient_id, date);

CREATE TABLE IF NOT EXISTS skin_check_entries (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  location text NOT NULL,
  severity text NOT NULL,
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS skin_check_entries_patient_created_idx ON skin_check_entries (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS care_preferences (
  patient_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  injury_level text NOT NULL DEFAULT '',
  injury_type text NOT NULL DEFAULT '',
  equipment text NOT NULL DEFAULT '',
  allergies text NOT NULL DEFAULT '',
  medications_summary text NOT NULL DEFAULT '',
  morning_care_notes text NOT NULL DEFAULT '',
  evening_care_notes text NOT NULL DEFAULT '',
  other_notes text NOT NULL DEFAULT '',
  updated_at timestamp NOT NULL DEFAULT now()
);

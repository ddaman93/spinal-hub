-- Shared health records: vitals, medications, medication_logs, appointments

CREATE TABLE IF NOT EXISTS vitals (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  type text NOT NULL,
  value text NOT NULL,
  systolic integer,
  diastolic integer,
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS vitals_patient_created_idx
  ON vitals (patient_id, created_at DESC);

CREATE TABLE IF NOT EXISTS medications (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT 'Daily',
  times text NOT NULL DEFAULT '8:00 AM',
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medication_logs (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id varchar NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recorded_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date text NOT NULL,
  scheduled_time text NOT NULL,
  taken boolean NOT NULL DEFAULT false,
  actual_time text
);

CREATE INDEX IF NOT EXISTS medication_logs_patient_date_idx
  ON medication_logs (patient_id, date);

CREATE TABLE IF NOT EXISTS appointments (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  date text NOT NULL,
  time text NOT NULL DEFAULT '',
  location text,
  notes text,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_patient_date_idx
  ON appointments (patient_id, date);

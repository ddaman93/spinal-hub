-- Care Hub: patient intro fields + shared handover notes table

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS about_me text,
  ADD COLUMN IF NOT EXISTS routine_highlights text;

CREATE TABLE IF NOT EXISTS care_notes (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS care_notes_patient_created_idx
  ON care_notes (patient_id, created_at);

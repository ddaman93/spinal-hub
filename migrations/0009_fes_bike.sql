-- FES bike integration: RTILink config + session data

CREATE TABLE IF NOT EXISTS fes_rtilink_config (
  patient_id varchar PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  rtilink_username varchar NOT NULL,
  rtilink_pin varchar NOT NULL,
  upper_leg_therapy_id varchar,
  lower_leg_therapy_id varchar,
  arms_therapy_id varchar,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fes_sessions (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id varchar NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapy_type varchar NOT NULL,
  session_date timestamptz NOT NULL,
  distance_miles real,
  energy_kcal real,
  energy_per_hour real,
  avg_power_watts real,
  avg_power_active_watts real,
  max_power_active_watts real,
  avg_crank_velocity real,
  avg_resistance real,
  avg_resistance_active real,
  avg_stimulation_uc real,
  avg_symmetry_pct real,
  time_off_motor_support_s integer,
  session_duration_s integer,
  met_minutes real,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(patient_id, therapy_type, session_date)
);

CREATE INDEX IF NOT EXISTS fes_sessions_patient_date_idx
  ON fes_sessions(patient_id, session_date DESC);

-- AIP monthly reports table
CREATE TABLE aip_monthly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES ambassador_contacts(id) ON DELETE CASCADE,
  reporting_month date NOT NULL,
  seniors_served int DEFAULT 0,
  seniors_served_first_time int DEFAULT 0,
  social_isolation_activities text[] DEFAULT '{}',
  independent_living_activities text[] DEFAULT '{}',
  supportive_service_referrals text[] DEFAULT '{}',
  benefits_enrollment_assisted int DEFAULT 0,
  additional_resources_needed text,
  connected_to_village boolean DEFAULT false,
  village_count int,
  village_names text[] DEFAULT '{}',
  unfulfilled_requests boolean DEFAULT false,
  unfulfilled_explanation text,
  seniors_referred_followup int DEFAULT 0,
  requested_director_call boolean DEFAULT false,
  monthly_highlight text,
  project_concerns text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE aip_monthly_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anon can insert only, authenticated can read
CREATE POLICY "anon_can_insert_reports" ON aip_monthly_reports FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "authenticated_can_read_reports" ON aip_monthly_reports FOR SELECT
  TO authenticated USING (true);
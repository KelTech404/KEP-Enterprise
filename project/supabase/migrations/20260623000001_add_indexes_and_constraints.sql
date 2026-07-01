-- Add is_active field to ambassador_contacts for soft delete
ALTER TABLE ambassador_contacts ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE ambassador_contacts ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add edited_at and edited_by fields to aip_monthly_reports for audit trail
ALTER TABLE aip_monthly_reports ADD COLUMN IF NOT EXISTS edited_at timestamptz;
ALTER TABLE aip_monthly_reports ADD COLUMN IF NOT EXISTS edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aip_monthly_reports_ambassador_month ON aip_monthly_reports(ambassador_id, reporting_month);
CREATE INDEX IF NOT EXISTS idx_aip_monthly_reports_created_at ON aip_monthly_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ambassador_contacts_email ON ambassador_contacts(email);
CREATE INDEX IF NOT EXISTS idx_ambassador_contacts_active ON ambassador_contacts(is_active);

-- Add unique constraint to prevent duplicate monthly reports for same ambassador/month
ALTER TABLE aip_monthly_reports ADD CONSTRAINT unique_ambassador_month_report UNIQUE (ambassador_id, reporting_month);

-- Add unique constraint to prevent duplicate ambassadors (name + church)
ALTER TABLE ambassador_contacts ADD CONSTRAINT unique_ambassador_name_church UNIQUE (ambassador_name, church);

-- Add check constraints for numeric fields
ALTER TABLE aip_monthly_reports ADD CONSTRAINT check_seniors_served_positive CHECK (seniors_served >= 0);
ALTER TABLE aip_monthly_reports ADD CONSTRAINT check_seniors_served_first_time_positive CHECK (seniors_served_first_time >= 0);
ALTER TABLE aip_monthly_reports ADD CONSTRAINT check_benefits_enrollment_assisted_positive CHECK (benefits_enrollment_assisted >= 0);
ALTER TABLE aip_monthly_reports ADD CONSTRAINT check_village_count_positive CHECK (village_count >= 0);
ALTER TABLE aip_monthly_reports ADD CONSTRAINT check_seniors_referred_followup_positive CHECK (seniors_referred_followup >= 0);

-- Update RLS policies for ambassador authentication
-- Remove old policies
DROP POLICY IF EXISTS "anon_can_insert_reports" ON aip_monthly_reports;
DROP POLICY IF EXISTS "authenticated_can_read_reports" ON aip_monthly_reports;

-- Ambassadors can only read/edit their own reports
CREATE POLICY "ambassadors_can_own_reports" ON aip_monthly_reports FOR ALL
  TO authenticated USING (
    ambassador_id IN (
      SELECT id FROM ambassador_contacts WHERE email = auth.email() AND is_active = true
    )
  ) WITH CHECK (
    ambassador_id IN (
      SELECT id FROM ambassador_contacts WHERE email = auth.email() AND is_active = true
    )
  );

-- Staff can read all reports
CREATE POLICY "staff_can_read_all_reports" ON aip_monthly_reports FOR SELECT
  TO authenticated USING (true);

-- Staff can insert reports
CREATE POLICY "staff_can_insert_reports" ON aip_monthly_reports FOR INSERT
  TO authenticated WITH CHECK (true);

-- Staff can update reports
CREATE POLICY "staff_can_update_reports" ON aip_monthly_reports FOR UPDATE
  TO authenticated USING (true);

-- Update ambassador_contacts RLS policies
DROP POLICY IF EXISTS "authenticated_can_read_ambassadors" ON ambassador_contacts;
DROP POLICY IF EXISTS "authenticated_can_insert_ambassadors" ON ambassador_contacts;

-- Ambassadors can only read their own contact info
CREATE POLICY "ambassadors_can_read_own_contact" ON ambassador_contacts FOR SELECT
  TO authenticated USING (email = auth.email());

-- Staff can read all ambassadors
CREATE POLICY "staff_can_read_all_ambassadors" ON ambassador_contacts FOR SELECT
  TO authenticated USING (true);

-- Staff can insert ambassadors
CREATE POLICY "staff_can_insert_ambassadors" ON ambassador_contacts FOR INSERT
  TO authenticated WITH CHECK (true);

-- Staff can update ambassadors
CREATE POLICY "staff_can_update_ambassadors" ON ambassador_contacts FOR UPDATE
  TO authenticated USING (true);

-- Staff can delete ambassadors
CREATE POLICY "staff_can_delete_ambassadors" ON ambassador_contacts FOR DELETE
  TO authenticated USING (true);

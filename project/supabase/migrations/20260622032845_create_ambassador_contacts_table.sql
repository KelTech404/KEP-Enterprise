-- Ambassador contacts table
CREATE TABLE ambassador_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_name text NOT NULL,
  church text NOT NULL,
  pastor text,
  ward text,
  phone text,
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ambassador_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only authenticated users can read or insert
CREATE POLICY "authenticated_can_read_ambassadors" ON ambassador_contacts FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "authenticated_can_insert_ambassadors" ON ambassador_contacts FOR INSERT
  TO authenticated WITH CHECK (true);
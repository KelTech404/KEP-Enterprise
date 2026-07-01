-- Create archival table for reports older than 7 years
CREATE TABLE IF NOT EXISTS aip_monthly_reports_archive (
  LIKE aip_monthly_reports INCLUDING ALL
);

-- Add archive timestamp
ALTER TABLE aip_monthly_reports_archive ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT now();

-- Create index on archived_at for querying
CREATE INDEX IF NOT EXISTS idx_aip_monthly_reports_archive_archived_at ON aip_monthly_reports_archive(archived_at DESC);

-- Create function to archive old reports
CREATE OR REPLACE FUNCTION archive_old_reports()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive reports older than 7 years
  INSERT INTO aip_monthly_reports_archive
  SELECT *, now() as archived_at
  FROM aip_monthly_reports
  WHERE created_at < now() - interval '7 years'
  ON CONFLICT DO NOTHING;
  
  -- Delete archived reports from main table
  DELETE FROM aip_monthly_reports
  WHERE created_at < now() - interval '7 years';
END;
$$;

-- Create a scheduled function call (requires pg_cron extension)
-- Note: This requires the pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('archive-old-reports', '0 2 1 * *', 'SELECT archive_old_reports()');

-- Manual execution command:
-- SELECT archive_old_reports();

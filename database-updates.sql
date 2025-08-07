-- Add photo_url column to trips table
ALTER TABLE trips ADD COLUMN photo_url TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN trips.photo_url IS 'URL of the dashboard photo uploaded for this trip';

-- Add audit_status column to trips table
ALTER TABLE trips ADD COLUMN audit_status TEXT DEFAULT 'pending';

-- Add comment to explain the audit_status column
COMMENT ON COLUMN trips.audit_status IS 'Audit status: pending, verified, needs_review, critical';

-- Add audit_notes column to trips table
ALTER TABLE trips ADD COLUMN audit_notes TEXT;

-- Add comment to explain the audit_notes column
COMMENT ON COLUMN trips.audit_notes IS 'Notes from audit review process';

-- Create index for audit status queries
CREATE INDEX idx_trips_audit_status ON trips(audit_status);

-- Create index for photo_url queries
CREATE INDEX idx_trips_photo_url ON trips(photo_url) WHERE photo_url IS NOT NULL; 
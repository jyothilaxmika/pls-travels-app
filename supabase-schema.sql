-- PLS Travels DMS Database Schema
-- Run this in your Supabase SQL Editor

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT,
  license_expiry DATE,
  joining_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  city TEXT,
  address TEXT,
  emergency_contact TEXT,
  vehicle_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips table with anomaly detection
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  fuel_cost DECIMAL(8,2),
  amount DECIMAL(10,2) NOT NULL,
  platform TEXT,
  departure_time TIME,
  arrival_time TIME,
  notes TEXT,
  photo_url TEXT,
  anomaly_flag BOOLEAN DEFAULT FALSE,
  audit_status TEXT DEFAULT 'pending' CHECK (audit_status IN ('pending', 'needs_review', 'verified', 'rejected')),
  audit_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  check_in_time TIME,
  check_out_time TIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(driver_id, date)
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Drivers indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);

-- Trips indexes
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_anomaly_flag ON trips(anomaly_flag);
CREATE INDEX IF NOT EXISTS idx_trips_audit_status ON trips(audit_status);
CREATE INDEX IF NOT EXISTS idx_trips_photo_url ON trips(photo_url) WHERE photo_url IS NOT NULL;

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_driver_id ON payments(driver_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_attendance_driver_id ON attendance(driver_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- Drivers policies
CREATE POLICY "Users can view drivers" ON drivers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert drivers" ON drivers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update drivers" ON drivers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete drivers" ON drivers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Trips policies
CREATE POLICY "Users can view trips" ON trips
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert trips" ON trips
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update trips" ON trips
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete trips" ON trips
  FOR DELETE USING (auth.role() = 'authenticated');

-- Payments policies
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update payments" ON payments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete payments" ON payments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Attendance policies
CREATE POLICY "Users can view attendance" ON attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update attendance" ON attendance
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete attendance" ON attendance
  FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- 5. CREATE STORAGE BUCKET FOR TRIP PHOTOS
-- =============================================

-- Create trip-photos bucket (this needs to be done via Supabase Dashboard)
-- Go to Storage → Create bucket → Name: trip-photos → Public → Create

-- Storage policies for trip-photos bucket
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public viewing" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'trip-photos'
  );

CREATE POLICY "Allow authenticated updates" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow authenticated deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

-- =============================================
-- 6. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get trip summary
CREATE OR REPLACE FUNCTION get_trip_summary()
RETURNS TABLE (
  total_trips BIGINT,
  total_kms DECIMAL,
  total_earnings DECIMAL,
  total_fuel_cost DECIMAL,
  anomaly_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_trips,
    COALESCE(SUM(distance_km), 0) as total_kms,
    COALESCE(SUM(amount), 0) as total_earnings,
    COALESCE(SUM(fuel_cost), 0) as total_fuel_cost,
    COUNT(*) FILTER (WHERE anomaly_flag = true) as anomaly_count
  FROM trips;
END;
$$ LANGUAGE plpgsql;

-- Function to get driver rankings
CREATE OR REPLACE FUNCTION get_driver_rankings()
RETURNS TABLE (
  driver_id UUID,
  driver_name TEXT,
  total_trips BIGINT,
  total_earnings DECIMAL,
  avg_trip_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as driver_id,
    d.name as driver_name,
    COUNT(t.id) as total_trips,
    COALESCE(SUM(t.amount), 0) as total_earnings,
    COALESCE(AVG(t.amount), 0) as avg_trip_earnings
  FROM drivers d
  LEFT JOIN trips t ON d.id = t.driver_id
  WHERE d.status = 'active'
  GROUP BY d.id, d.name
  ORDER BY total_earnings DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 7. INSERT SAMPLE DATA
-- =============================================

-- Sample drivers
INSERT INTO drivers (id, name, phone, email, license_number, license_expiry, status, city) VALUES
('11111111-1111-1111-1111-111111111111', 'John Doe', '+91-9876543210', 'john@example.com', 'DL123456789', '2025-12-31', 'active', 'Mumbai'),
('22222222-2222-2222-2222-222222222222', 'Jane Smith', '+91-9876543211', 'jane@example.com', 'DL987654321', '2025-06-30', 'active', 'Delhi'),
('33333333-3333-3333-3333-333333333333', 'Bob Wilson', '+91-9876543212', 'bob@example.com', 'DL456789123', '2025-09-15', 'active', 'Bangalore')
ON CONFLICT (id) DO NOTHING;

-- Sample trips (including anomalies)
INSERT INTO trips (driver_id, date, distance_km, fuel_cost, amount, platform, notes, anomaly_flag, audit_status) VALUES
-- Normal trips
('11111111-1111-1111-1111-111111111111', '2024-01-15', 25.5, 5.0, 500, 'Uber', 'Regular trip', false, 'verified'),
('22222222-2222-2222-2222-222222222222', '2024-01-16', 30.0, 6.0, 600, 'Ola', 'Airport pickup', false, 'verified'),
('33333333-3333-3333-3333-333333333333', '2024-01-17', 45.2, 8.5, 750, 'Rapido', 'Long distance', false, 'verified'),

-- Anomaly trips
('11111111-1111-1111-1111-111111111111', '2024-01-18', 3.0, 1.0, 100, 'Uber', 'Very short trip', true, 'needs_review'),
('22222222-2222-2222-2222-222222222222', '2024-01-19', 350.0, 20.0, 1200, 'Ola', 'Very long trip', true, 'needs_review'),
('33333333-3333-3333-3333-333333333333', '2024-01-20', 50.0, 35.0, 800, 'Rapido', 'High fuel usage', true, 'needs_review')
ON CONFLICT DO NOTHING;

-- Sample payments
INSERT INTO payments (driver_id, amount, date, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', 500, '2024-01-20', 'completed', 'Weekly payment'),
('22222222-2222-2222-2222-222222222222', 800, '2024-01-21', 'pending', 'Monthly payment'),
('33333333-3333-3333-3333-333333333333', 1200, '2024-01-22', 'completed', 'Trip payment')
ON CONFLICT DO NOTHING;

-- Sample attendance
INSERT INTO attendance (driver_id, date, status, check_in_time, check_out_time) VALUES
('11111111-1111-1111-1111-111111111111', '2024-01-15', 'present', '09:00:00', '18:00:00'),
('22222222-2222-2222-2222-222222222222', '2024-01-15', 'present', '08:30:00', '17:30:00'),
('33333333-3333-3333-3333-333333333333', '2024-01-15', 'late', '10:00:00', '19:00:00')
ON CONFLICT (driver_id, date) DO NOTHING;

-- =============================================
-- 8. VERIFICATION QUERIES
-- =============================================

-- Check if tables were created successfully
SELECT 'drivers' as table_name, COUNT(*) as row_count FROM drivers
UNION ALL
SELECT 'trips' as table_name, COUNT(*) as row_count FROM trips
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments
UNION ALL
SELECT 'attendance' as table_name, COUNT(*) as row_count FROM attendance;

-- Check anomaly trips
SELECT 
  t.id,
  d.name as driver_name,
  t.date,
  t.distance_km,
  t.amount,
  t.anomaly_flag,
  t.audit_status
FROM trips t
JOIN drivers d ON t.driver_id = d.id
WHERE t.anomaly_flag = true
ORDER BY t.date DESC;

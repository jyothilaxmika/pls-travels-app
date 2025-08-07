# 🗄️ Supabase Database Setup for PLS Travels DMS

## 📋 Complete Database Schema

Copy and paste the following SQL into your Supabase SQL Editor:

```sql
-- PLS Travels DMS Database Schema
-- Run this in your Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers table
CREATE TABLE drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  joining_date DATE DEFAULT CURRENT_DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  platform TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  return_time TIME,
  amount DECIMAL(10,2) NOT NULL,
  distance_km DECIMAL(8,2) NOT NULL,
  fuel_cost DECIMAL(8,2),
  notes TEXT,
  status TEXT DEFAULT 'completed',
  photo_url TEXT,
  anomaly_flag BOOLEAN DEFAULT FALSE,
  audit_status TEXT DEFAULT 'verified',
  audit_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attendance table
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status TEXT DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('trip-photos', 'trip-photos', true),
  ('driver-docs', 'driver-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Sample data
INSERT INTO drivers (name, email, phone, license_number, license_expiry, address, emergency_contact, emergency_phone) VALUES
('Rajesh Kumar', 'rajesh@plstravels.com', '+91-9876543210', 'DL-01-1234567890', '2025-12-31', 'Mumbai, Maharashtra', 'Priya Kumar', '+91-9876543211'),
('Amit Singh', 'amit@plstravels.com', '+91-9876543212', 'DL-02-1234567891', '2025-11-30', 'Delhi, NCR', 'Sunita Singh', '+91-9876543213'),
('Suresh Patel', 'suresh@plstravels.com', '+91-9876543214', 'DL-03-1234567892', '2025-10-15', 'Ahmedabad, Gujarat', 'Rekha Patel', '+91-9876543215');

INSERT INTO trips (driver_id, date, platform, destination, departure_time, return_time, amount, distance_km, fuel_cost, notes) VALUES
((SELECT id FROM drivers WHERE name = 'Rajesh Kumar' LIMIT 1), '2024-12-01', 'Uber', 'Mumbai Airport', '08:00:00', '10:30:00', 1200.00, 45.5, 15.2, 'Airport pickup'),
((SELECT id FROM drivers WHERE name = 'Amit Singh' LIMIT 1), '2024-12-01', 'Ola', 'Delhi Railway Station', '09:00:00', '11:15:00', 950.00, 38.2, 12.8, 'Station drop'),
((SELECT id FROM drivers WHERE name = 'Suresh Patel' LIMIT 1), '2024-12-01', 'Uber', 'Ahmedabad Mall', '14:00:00', '15:30:00', 650.00, 25.8, 8.5, 'Shopping trip');
```

## 🔧 Additional Setup Steps

### 1. Storage Bucket Permissions

After creating the buckets, set up the storage policies:

```sql
-- Storage policies for trip-photos
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'trip-photos');
CREATE POLICY "Authenticated users can upload trip photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'trip-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update trip photos" ON storage.objects FOR UPDATE USING (bucket_id = 'trip-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete trip photos" ON storage.objects FOR DELETE USING (bucket_id = 'trip-photos' AND auth.role() = 'authenticated');

-- Storage policies for driver-docs
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'driver-docs');
CREATE POLICY "Authenticated users can upload driver docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'driver-docs' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update driver docs" ON storage.objects FOR UPDATE USING (bucket_id = 'driver-docs' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete driver docs" ON storage.objects FOR DELETE USING (bucket_id = 'driver-docs' AND auth.role() = 'authenticated');
```

### 2. Row Level Security Policies

```sql
-- Drivers policies
CREATE POLICY "Enable read access for all users" ON drivers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON drivers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON drivers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON drivers FOR DELETE USING (auth.role() = 'authenticated');

-- Trips policies
CREATE POLICY "Enable read access for all users" ON trips FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON trips FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON trips FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON trips FOR DELETE USING (auth.role() = 'authenticated');

-- Payments policies
CREATE POLICY "Enable read access for all users" ON payments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON payments FOR DELETE USING (auth.role() = 'authenticated');

-- Attendance policies
CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON attendance FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON attendance FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON attendance FOR DELETE USING (auth.role() = 'authenticated');
```

### 3. Anomaly Detection Function

```sql
-- Function to detect anomalies in trips
CREATE OR REPLACE FUNCTION detect_trip_anomalies()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for very low distance
  IF NEW.distance_km < 5 THEN
    NEW.anomaly_flag = TRUE;
    NEW.audit_status = 'needs_review';
  END IF;
  
  -- Check for very high distance
  IF NEW.distance_km > 500 THEN
    NEW.anomaly_flag = TRUE;
    NEW.audit_status = 'needs_review';
  END IF;
  
  -- Check for missing photo
  IF NEW.photo_url IS NULL OR NEW.photo_url = '' THEN
    NEW.anomaly_flag = TRUE;
    NEW.audit_status = 'needs_review';
  END IF;
  
  -- Check for unusual fuel consumption
  IF NEW.fuel_cost > 50 THEN
    NEW.anomaly_flag = TRUE;
    NEW.audit_status = 'needs_review';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply anomaly detection trigger
CREATE TRIGGER trip_anomaly_detection 
  BEFORE INSERT OR UPDATE ON trips 
  FOR EACH ROW EXECUTE FUNCTION detect_trip_anomalies();
```

## 📊 Database Schema Overview

### Tables Created:

1. **`drivers`** - Driver information and profiles
2. **`trips`** - Trip records with anomaly detection
3. **`payments`** - Payment records for drivers
4. **`attendance`** - Driver attendance tracking

### Storage Buckets:

1. **`trip-photos`** - For trip dashboard photos
2. **`driver-docs`** - For driver documents

### Key Features:

- ✅ **UUID Primary Keys** for security
- ✅ **Row Level Security** enabled
- ✅ **Anomaly Detection** triggers
- ✅ **Sample Data** included
- ✅ **Storage Buckets** configured
- ✅ **Proper Relationships** between tables

## 🚀 Next Steps

1. **Run the SQL** in your Supabase SQL Editor
2. **Verify the tables** are created in the Table Editor
3. **Check storage buckets** in the Storage section
4. **Test the connection** with your application
5. **Deploy your application** using the deployment guide

Your Supabase database is now ready for the PLS Travels DMS application! 🎉

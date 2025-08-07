# Database Setup for Trip Management & Anomaly Detection

## 📋 Required Database Schema

### 1. **Update trips table with anomaly detection columns**

```sql
-- Add anomaly detection columns to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS anomaly_flag BOOLEAN DEFAULT FALSE;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS audit_status TEXT DEFAULT 'pending';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS audit_notes TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_anomaly_flag ON trips(anomaly_flag);
CREATE INDEX IF NOT EXISTS idx_trips_audit_status ON trips(audit_status);
CREATE INDEX IF NOT EXISTS idx_trips_photo_url ON trips(photo_url) WHERE photo_url IS NOT NULL;
```

### 2. **Create payments table (if not exists)**

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_driver_id ON payments(driver_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
```

### 3. **Create RLS Policies for Security**

```sql
-- Enable RLS on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read trips
CREATE POLICY "Users can view trips" ON trips
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert trips
CREATE POLICY "Users can insert trips" ON trips
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update trips
CREATE POLICY "Users can update trips" ON trips
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Enable RLS on payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read payments
CREATE POLICY "Users can view payments" ON payments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert payments
CREATE POLICY "Users can insert payments" ON payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 🗂️ Storage Setup

### 1. **Create trip-photos bucket**

1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `trip-photos`
4. Set to **Public**
5. Click "Create bucket"

### 2. **Configure Storage Policies**

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trip-photos' AND 
    auth.role() = 'authenticated'
  );

-- Allow public viewing of photos
CREATE POLICY "Allow public viewing" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'trip-photos'
  );
```

## 🔧 Anomaly Detection Rules

The system automatically detects anomalies based on these rules:

```typescript
// Anomaly detection thresholds
const ANOMALY_RULES = {
  minDistance: 10,        // km - trips with less than 10km
  maxDistance: 300,       // km - trips with more than 300km
  maxFuelUsage: 30,       // liters - trips with more than 30L fuel
  requirePhoto: true      // require dashboard photo for all trips
}

// Detection logic
function detectAnomalies(trip) {
  const anomalies = []
  
  if (trip.distance_km < 10) 
    anomalies.push('Very low KM')
  
  if (trip.distance_km > 300) 
    anomalies.push('Unusually high KM')
  
  if (trip.fuel_cost > 30) 
    anomalies.push('High fuel usage')
  
  if (!trip.photo_url) 
    anomalies.push('Missing dashboard photo')
  
  return anomalies
}
```

## 📊 Sample Data for Testing

### 1. **Insert sample drivers**

```sql
INSERT INTO drivers (id, name, phone, email, status, created_at) VALUES
('d1', 'John Doe', '+91-9876543210', 'john@example.com', 'active', NOW()),
('d2', 'Jane Smith', '+91-9876543211', 'jane@example.com', 'active', NOW()),
('d3', 'Bob Wilson', '+91-9876543212', 'bob@example.com', 'active', NOW());
```

### 2. **Insert sample trips (including anomalies)**

```sql
-- Normal trip
INSERT INTO trips (driver_id, date, distance_km, fuel_cost, amount, notes, anomaly_flag, audit_status) VALUES
('d1', '2024-01-15', 25, 5, 500, 'Regular trip', false, 'verified');

-- Anomaly trip (very low KM)
INSERT INTO trips (driver_id, date, distance_km, fuel_cost, amount, notes, anomaly_flag, audit_status) VALUES
('d1', '2024-01-16', 3, 1, 100, 'Very short trip', true, 'needs_review');

-- Anomaly trip (high fuel usage)
INSERT INTO trips (driver_id, date, distance_km, fuel_cost, amount, notes, anomaly_flag, audit_status) VALUES
('d2', '2024-01-17', 50, 35, 800, 'High fuel consumption', true, 'needs_review');

-- Anomaly trip (unusually high KM)
INSERT INTO trips (driver_id, date, distance_km, fuel_cost, amount, notes, anomaly_flag, audit_status) VALUES
('d3', '2024-01-18', 350, 20, 1200, 'Very long trip', true, 'needs_review');
```

### 3. **Insert sample payments**

```sql
INSERT INTO payments (driver_id, amount, date, status, notes) VALUES
('d1', 500, '2024-01-20', 'completed', 'Weekly payment'),
('d2', 800, '2024-01-21', 'pending', 'Monthly payment'),
('d3', 1200, '2024-01-22', 'completed', 'Trip payment');
```

## 🧪 Testing the System

### 1. **Test Trip Creation with Anomalies**

1. Navigate to a driver detail page (`/drivers/[id]`)
2. Use the AddTripForm to create trips with:
   - Distance < 10km (should flag as anomaly)
   - Distance > 300km (should flag as anomaly)
   - Fuel > 30L (should flag as anomaly)
   - Missing photo (should flag as anomaly)

### 2. **Test Audit Page**

1. Navigate to `/audit`
2. Verify anomaly trips are displayed
3. Test filtering by status
4. Check photo display functionality

### 3. **Test Photo Upload**

1. Create a trip with photo upload
2. Verify photo appears in trip details
3. Check photo display in audit page

## 🔍 Monitoring Queries

### 1. **View all anomaly trips**

```sql
SELECT 
  t.*,
  d.name as driver_name,
  d.phone as driver_phone
FROM trips t
JOIN drivers d ON t.driver_id = d.id
WHERE t.anomaly_flag = true
ORDER BY t.date DESC;
```

### 2. **View trips by audit status**

```sql
SELECT 
  audit_status,
  COUNT(*) as count
FROM trips
GROUP BY audit_status;
```

### 3. **View driver summary with anomalies**

```sql
SELECT 
  d.name,
  COUNT(t.id) as total_trips,
  COUNT(CASE WHEN t.anomaly_flag = true THEN 1 END) as anomaly_trips,
  SUM(t.amount) as total_earnings
FROM drivers d
LEFT JOIN trips t ON d.id = t.driver_id
GROUP BY d.id, d.name
ORDER BY anomaly_trips DESC;
```

## ✅ Verification Checklist

- [ ] Database schema updated with anomaly columns
- [ ] Storage bucket `trip-photos` created
- [ ] RLS policies configured
- [ ] Sample data inserted
- [ ] Trip creation with anomalies tested
- [ ] Audit page functionality verified
- [ ] Photo upload working
- [ ] Anomaly detection rules working

## 🚨 Troubleshooting

### **Common Issues:**

1. **Photos not displaying**
   - Check bucket permissions
   - Verify RLS policies
   - Check photo URL format

2. **Anomaly detection not working**
   - Verify column names match
   - Check anomaly_flag column exists
   - Test with known anomaly values

3. **RLS blocking queries**
   - Check authentication status
   - Verify RLS policies are correct
   - Test with authenticated user

### **Debug Commands:**

```sql
-- Check table structure
\d trips

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'trips';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'trip-photos';
```

The system is now ready for production use with comprehensive anomaly detection and audit functionality! 
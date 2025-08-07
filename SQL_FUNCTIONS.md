# SQL Functions for Enhanced Dashboard Performance

## 📊 Trip Summary Function

Create this function in your Supabase SQL editor for enhanced performance:

```sql
-- Create or replace the trip summary function
CREATE OR REPLACE FUNCTION get_trip_summary()
RETURNS TABLE (
  total_trips BIGINT,
  total_km NUMERIC,
  total_fuel NUMERIC,
  total_earning NUMERIC,
  anomaly_count BIGINT,
  verified_trips BIGINT,
  needs_review_trips BIGINT,
  average_trip_value NUMERIC,
  total_drivers BIGINT
)
LANGUAGE SQL
AS $$
  SELECT
    COUNT(*) as total_trips,
    COALESCE(SUM(distance_km), 0) as total_km,
    COALESCE(SUM(fuel_cost), 0) as total_fuel,
    COALESCE(SUM(amount), 0) as total_earning,
    COUNT(*) FILTER (WHERE anomaly_flag = true) as anomaly_count,
    COUNT(*) FILTER (WHERE audit_status = 'verified') as verified_trips,
    COUNT(*) FILTER (WHERE audit_status = 'needs_review') as needs_review_trips,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(amount), 0) / COUNT(*)
      ELSE 0 
    END as average_trip_value,
    (SELECT COUNT(*) FROM drivers WHERE status = 'active') as total_drivers
  FROM trips;
$$;
```

## 🏆 Driver Rankings Function

```sql
-- Create driver rankings function
CREATE OR REPLACE FUNCTION get_driver_rankings()
RETURNS TABLE (
  driver_id UUID,
  driver_name TEXT,
  driver_phone TEXT,
  total_trips BIGINT,
  total_km NUMERIC,
  total_earning NUMERIC,
  average_trip_value NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT
    d.id as driver_id,
    d.name as driver_name,
    d.phone as driver_phone,
    COUNT(t.id) as total_trips,
    COALESCE(SUM(t.distance_km), 0) as total_km,
    COALESCE(SUM(t.amount), 0) as total_earning,
    CASE 
      WHEN COUNT(t.id) > 0 THEN COALESCE(SUM(t.amount), 0) / COUNT(t.id)
      ELSE 0 
    END as average_trip_value
  FROM drivers d
  LEFT JOIN trips t ON d.id = t.driver_id
  WHERE d.status = 'active'
  GROUP BY d.id, d.name, d.phone
  ORDER BY total_earning DESC;
$$;
```

## 📈 Daily Analytics Function

```sql
-- Create daily analytics function
CREATE OR REPLACE FUNCTION get_daily_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_trips BIGINT,
  total_km NUMERIC,
  total_fuel NUMERIC,
  total_earning NUMERIC,
  anomaly_count BIGINT
)
LANGUAGE SQL
AS $$
  SELECT
    t.date,
    COUNT(*) as total_trips,
    COALESCE(SUM(t.distance_km), 0) as total_km,
    COALESCE(SUM(t.fuel_cost), 0) as total_fuel,
    COALESCE(SUM(t.amount), 0) as total_earning,
    COUNT(*) FILTER (WHERE t.anomaly_flag = true) as anomaly_count
  FROM trips t
  WHERE t.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  GROUP BY t.date
  ORDER BY t.date DESC;
$$;
```

## 🔍 Anomaly Detection Function

```sql
-- Create anomaly detection function
CREATE OR REPLACE FUNCTION detect_trip_anomalies(trip_record trips)
RETURNS TEXT[]
LANGUAGE PLPGSQL
AS $$
DECLARE
  anomalies TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check for very low distance
  IF trip_record.distance_km < 10 THEN
    anomalies := array_append(anomalies, 'Very low KM');
  END IF;
  
  -- Check for unusually high distance
  IF trip_record.distance_km > 300 THEN
    anomalies := array_append(anomalies, 'Unusually high KM');
  END IF;
  
  -- Check for high fuel usage
  IF trip_record.fuel_cost > 30 THEN
    anomalies := array_append(anomalies, 'High fuel usage');
  END IF;
  
  -- Check for missing photo
  IF trip_record.photo_url IS NULL OR trip_record.photo_url = '' THEN
    anomalies := array_append(anomalies, 'Missing dashboard photo');
  END IF;
  
  -- Check for unusual earnings (optional)
  IF trip_record.amount > 5000 THEN
    anomalies := array_append(anomalies, 'Unusually high earnings');
  END IF;
  
  RETURN anomalies;
END;
$$;
```

## 🚀 Performance Optimization Indexes

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_anomaly_flag ON trips(anomaly_flag);
CREATE INDEX IF NOT EXISTS idx_trips_audit_status ON trips(audit_status);
CREATE INDEX IF NOT EXISTS idx_trips_amount ON trips(amount);
CREATE INDEX IF NOT EXISTS idx_trips_distance_km ON trips(distance_km);
CREATE INDEX IF NOT EXISTS idx_trips_fuel_cost ON trips(fuel_cost);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trips_driver_date ON trips(driver_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_trips_anomaly_date ON trips(anomaly_flag, date DESC);
CREATE INDEX IF NOT EXISTS idx_trips_audit_date ON trips(audit_status, date DESC);
```

## 📊 Materialized Views for Complex Analytics

```sql
-- Create materialized view for daily summaries
CREATE MATERIALIZED VIEW daily_trip_summary AS
SELECT
  date,
  COUNT(*) as total_trips,
  SUM(distance_km) as total_km,
  SUM(fuel_cost) as total_fuel,
  SUM(amount) as total_earning,
  COUNT(*) FILTER (WHERE anomaly_flag = true) as anomaly_count,
  COUNT(*) FILTER (WHERE audit_status = 'verified') as verified_count
FROM trips
GROUP BY date
ORDER BY date DESC;

-- Refresh materialized view (run this periodically)
-- REFRESH MATERIALIZED VIEW daily_trip_summary;
```

## 🔄 Usage Examples

### Using the Functions in Your Application

```typescript
// Example usage in your queries
const { data: summary } = await supabase.rpc('get_trip_summary')
const { data: rankings } = await supabase.rpc('get_driver_rankings')
const { data: dailyStats } = await supabase.rpc('get_daily_analytics', { days_back: 7 })
```

### Performance Benefits

1. **Reduced Network Traffic**: Single function call instead of multiple queries
2. **Better Caching**: Database-level caching of complex calculations
3. **Consistent Logic**: Business logic centralized in database
4. **Real-time Updates**: Functions always use latest data

## 🛠️ Installation Instructions

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste each function**
4. **Run the SQL commands**
5. **Create the indexes for performance**
6. **Test the functions**

## 📈 Monitoring Queries

```sql
-- Check function performance
SELECT 
  schemaname,
  funcname,
  calls,
  total_time,
  mean_time
FROM pg_stat_user_functions
WHERE funcname LIKE 'get_%';

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'trips';
```

## ✅ Verification

After creating the functions, test them:

```sql
-- Test trip summary
SELECT * FROM get_trip_summary();

-- Test driver rankings
SELECT * FROM get_driver_rankings() LIMIT 5;

-- Test daily analytics
SELECT * FROM get_daily_analytics(7);
```

These functions will significantly improve your dashboard performance and provide more accurate analytics! 
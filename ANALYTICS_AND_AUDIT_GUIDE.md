# Analytics Dashboard & Audit System Guide

## 📊 Analytics Dashboard Features

### Overview
The Analytics Dashboard provides comprehensive insights into your travel operations with real-time data visualization and anomaly detection.

### Key Metrics Displayed

#### 1. **Core Statistics**
- **Total Trips**: Number of completed trips
- **Total Earnings**: Sum of all trip amounts
- **Total KMs**: Cumulative distance covered
- **Fuel Used**: Total fuel cost across all trips

#### 2. **Operational Metrics**
- **Active Drivers**: Currently active drivers
- **Pending Dues**: Outstanding payments
- **Verified Trips**: Trips that passed audit
- **Anomalies Detected**: Suspicious records found

### Charts and Visualizations

#### 1. **Daily Trip Trends**
- Area chart showing daily trip counts and earnings
- 30-day rolling window
- Dual-axis for trips and revenue

#### 2. **Platform Distribution**
- Pie chart showing trip distribution across platforms
- Uber, Ola, Rapido, and Other categories
- Percentage breakdown with color coding

#### 3. **Fuel Efficiency**
- Line chart tracking km/liter over time
- Last 10 trips with fuel data
- Trend analysis for vehicle performance

#### 4. **Shift Performance**
- Bar chart comparing morning vs evening shifts
- Earnings comparison by shift
- Trip count distribution

### Time Range Filtering
- **Last Week**: 7-day view
- **Last Month**: 30-day view (default)
- **Last Quarter**: 90-day view

## 🔍 Anomaly Detection System

### Detection Rules

#### 1. **Fuel Usage Anomalies**
- **High Fuel Usage**: > ₹2500 per trip
- **Fuel Efficiency**: < 8 km/l or > 25 km/l
- **Severity**: High for excessive usage

#### 2. **Distance Anomalies**
- **Short Distance**: < 3 km per trip
- **Long Distance**: > 300 km per trip
- **Severity**: Medium for short, High for long

#### 3. **Photo Verification**
- **Missing Photo**: High-value trips (> ₹1000) without dashboard photo
- **Severity**: Medium
- **Recommendation**: Require photo for verification

#### 4. **Earnings Anomalies**
- **Unusual Earnings**: > ₹5000 per trip
- **Severity**: Medium
- **Recommendation**: Verify fare calculation

#### 5. **Time Anomalies**
- **Short Duration**: < 30 minutes
- **Long Duration**: > 12 hours
- **Severity**: Medium for short, High for long

#### 6. **Repeated Images**
- **Detection**: Same image used for multiple trips
- **Severity**: High
- **Recommendation**: Investigate image reuse

### Audit Status Levels

#### 1. **Pending** (Default)
- New trips awaiting review
- No anomalies detected yet

#### 2. **Needs Review**
- Anomalies detected
- Requires manual investigation
- Medium severity issues

#### 3. **Critical**
- High severity anomalies
- Immediate attention required
- Blocked from verification

#### 4. **Verified**
- Passed audit review
- Manually approved
- No issues found

## 📁 File Upload System

### Supported File Types

#### 1. **Trip Photos**
- **Bucket**: `trip-photos`
- **Types**: JPEG, PNG, WebP
- **Size Limit**: 10MB
- **Purpose**: Dashboard verification

#### 2. **Driver Documents**
- **Bucket**: `driver-docs`
- **Types**: JPEG, PNG, PDF, Word documents
- **Size Limit**: 5-10MB
- **Categories**:
  - **Licenses**: Driver license documents
  - **Aadhar**: Identity verification
  - **Other**: Additional documents

### Upload Features

#### 1. **Drag & Drop**
- Drag files directly onto upload area
- Visual feedback during drag
- Multiple file selection

#### 2. **File Validation**
- Size limit checking
- File type validation
- Error messages for invalid files

#### 3. **Preview System**
- Image preview before upload
- File size display
- Remove individual files

#### 4. **Progress Tracking**
- Upload progress bar
- Success/error status
- Batch upload support

### Security Features

#### 1. **Access Control**
- Authenticated users only
- Driver-specific folders
- RLS policies enforced

#### 2. **File Organization**
- UUID-based file names
- Driver-specific folders
- Metadata tracking

#### 3. **Public URLs**
- Safe public access
- Controlled through RLS
- No sensitive data exposure

## 🛠️ Technical Implementation

### Database Schema Updates

```sql
-- Add photo_url column
ALTER TABLE trips ADD COLUMN photo_url TEXT;

-- Add audit status columns
ALTER TABLE trips ADD COLUMN audit_status TEXT DEFAULT 'pending';
ALTER TABLE trips ADD COLUMN audit_notes TEXT;

-- Create indexes
CREATE INDEX idx_trips_audit_status ON trips(audit_status);
CREATE INDEX idx_trips_photo_url ON trips(photo_url) WHERE photo_url IS NOT NULL;
```

### Audit Configuration

```typescript
const DEFAULT_AUDIT_CONFIG = {
  maxFuelPerTrip: 2500,        // ₹2500
  minDistance: 3,              // 3 km
  maxDistance: 300,            // 300 km
  maxEarningsPerTrip: 5000,    // ₹5000
  minFuelEfficiency: 8,        // 8 km/l
  maxFuelEfficiency: 25,       // 25 km/l
  requirePhotoForAmount: 1000, // ₹1000
  maxTripsPerDay: 10,
  maxTripsPerDriver: 5
}
```

### Storage Bucket Setup

#### 1. **Trip Photos Bucket**
```bash
# Create bucket
supabase storage create trip-photos --public

# Set RLS policies
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to view own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);
```

#### 2. **Driver Docs Bucket**
```bash
# Create bucket
supabase storage create driver-docs --public

# Set RLS policies
CREATE POLICY "Allow admin uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

## 📋 Usage Instructions

### For Managers

#### 1. **View Analytics Dashboard**
1. Navigate to `/dashboard`
2. Review key metrics and charts
3. Filter by time range if needed
4. Export data for reporting

#### 2. **Review Anomalies**
1. Check anomaly detection section
2. Click "Review" on suspicious trips
3. Investigate details and photos
4. Mark as "Verified" or add notes

#### 3. **Upload Driver Documents**
1. Go to driver profile page
2. Use upload component
3. Select document type
4. Add description if needed

### For Drivers

#### 1. **Upload Trip Photos**
1. Complete trip entry
2. Add dashboard photo
3. Submit for review
4. Check audit status

#### 2. **View Audit Status**
1. Check trip logs
2. Look for audit badges
3. Address any issues
4. Resubmit if needed

## 🔧 Configuration

### Customizing Audit Rules

```typescript
// Modify audit configuration
const customConfig = {
  ...DEFAULT_AUDIT_CONFIG,
  maxFuelPerTrip: 3000,        // Increase fuel limit
  requirePhotoForAmount: 500,   // Lower photo requirement
  minDistance: 5,              // Increase minimum distance
}
```

### Adding New Anomaly Types

```typescript
// Add new anomaly detection
function detectCustomAnomaly(trip: any): Anomaly[] {
  const anomalies = []
  
  // Your custom logic here
  if (trip.someField > threshold) {
    anomalies.push({
      type: 'custom_anomaly',
      severity: 'medium',
      description: 'Custom anomaly description',
      recommendation: 'Custom recommendation'
    })
  }
  
  return anomalies
}
```

## 📊 Reporting

### Audit Reports

#### 1. **Summary Report**
- Total trips audited
- Anomalies by type
- Verification rates
- Recommendations

#### 2. **Detailed Report**
- Trip-by-trip analysis
- Anomaly details
- Photo verification status
- Audit notes

### Export Options

#### 1. **CSV Export**
- Trip data with audit status
- Anomaly details
- Photo verification status

#### 2. **PDF Reports**
- Monthly audit summaries
- Driver performance reports
- Anomaly trend analysis

## 🚀 Future Enhancements

### Planned Features

#### 1. **AI-Powered Detection**
- Machine learning for anomaly detection
- Pattern recognition
- Predictive analytics

#### 2. **Advanced Reporting**
- Custom report builder
- Scheduled reports
- Email notifications

#### 3. **Mobile App**
- Photo upload from mobile
- Real-time notifications
- Offline capability

#### 4. **Integration**
- WhatsApp notifications
- Email alerts
- SMS updates

### Performance Optimization

#### 1. **Caching**
- Redis for analytics data
- CDN for file delivery
- Query optimization

#### 2. **Scalability**
- Database partitioning
- Load balancing
- Auto-scaling

## 🆘 Troubleshooting

### Common Issues

#### 1. **Upload Failures**
- Check file size limits
- Verify file types
- Ensure authentication

#### 2. **Anomaly Detection**
- Review configuration
- Check data quality
- Verify thresholds

#### 3. **Performance Issues**
- Optimize queries
- Add indexes
- Cache frequently accessed data

### Support

For technical support or feature requests, please contact the development team with:
- Detailed error description
- Steps to reproduce
- System information
- Expected vs actual behavior 
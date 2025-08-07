# Setup Instructions for Analytics & Audit System

## 📊 1. Summary Dashboard Analytics

### ✅ SummaryCards Component
- **File**: `src/components/dashboard/SummaryCards.tsx`
- **Usage**: Displays key metrics in a clean grid layout
- **Metrics**: Total Trips, Total KM, Total Fuel, Total Earnings

### ✅ Integration
- **File**: `src/app/dashboard/page.tsx`
- **Component**: `<SummaryCards />`
- **Status**: ✅ Ready to use

## 🤖 2. Anomaly Detector Functions

### ✅ Simple Anomaly Detection
- **File**: `src/lib/auditUtils.ts`
- **Function**: `detectTripAnomalies(trip)`
- **Checks**:
  - Very low KM (< 5km)
  - Unusually high KM (> 300km)
  - High fuel usage (> ₹2500)
  - Missing dashboard photo
  - KM mismatch (start/end vs total)

### ✅ Visual Audit Badge
- **File**: `src/components/trip/TripAuditBadge.tsx`
- **Component**: `TripAuditBadge({ anomalies })`
- **Display**: ✅ Verified or ⚠️ X issue(s)

### ✅ Integration in Trip Logs
- **File**: `src/components/driver/TripLogs.tsx`
- **Status**: ✅ Added audit status column

## 💾 3. File Upload: Dashboard Photo

### ✅ Supabase Storage Setup
1. Go to Supabase Dashboard → Storage
2. Create bucket: `trip-photos`
3. Set to **Public**
4. Configure RLS policies:

```sql
-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public viewing
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (true);
```

### ✅ Upload Function
- **File**: `src/lib/storage.ts`
- **Function**: `uploadTripPhoto(file, tripId)`
- **Features**:
  - UUID-based file naming
  - Trip-specific folders
  - Public URL generation

### ✅ Simple Upload Component
- **File**: `src/components/ui/SimpleUpload.tsx`
- **Features**:
  - File selection
  - Image preview
  - Upload progress
  - Success feedback

### ✅ Dependencies
```bash
npm install uuid @types/uuid
```

## 🚀 Usage Examples

### 1. Dashboard Analytics
```tsx
// In dashboard page
import SummaryCards from "@/components/dashboard/SummaryCards"

<SummaryCards />
```

### 2. Trip Audit Badge
```tsx
// In trip listing
import { detectTripAnomalies } from "@/lib/auditUtils"
import { TripAuditBadge } from "@/components/trip/TripAuditBadge"

const anomalies = detectTripAnomalies(trip)
<TripAuditBadge anomalies={anomalies} />
```

### 3. Photo Upload in Trip Form
```tsx
// In trip form
import SimpleUpload from "@/components/ui/SimpleUpload"

<SimpleUpload
  tripId={tripId}
  onUploadSuccess={(url) => setPhotoUrl(url)}
  onUploadError={(error) => console.error(error)}
/>
```

## 📋 Database Schema

### ✅ Required Columns
```sql
-- Add to trips table if not exists
ALTER TABLE trips ADD COLUMN photo_url TEXT;
ALTER TABLE trips ADD COLUMN audit_status TEXT DEFAULT 'pending';
```

### ✅ Indexes for Performance
```sql
CREATE INDEX idx_trips_photo_url ON trips(photo_url) WHERE photo_url IS NOT NULL;
CREATE INDEX idx_trips_audit_status ON trips(audit_status);
```

## 🔧 Configuration

### ✅ Audit Thresholds
```typescript
// In auditUtils.ts
const ANOMALY_THRESHOLDS = {
  minDistance: 5,        // km
  maxDistance: 300,      // km
  maxFuelCost: 2500,     // ₹
  requirePhoto: true     // for all trips
}
```

### ✅ Storage Configuration
```typescript
// In storage.ts
const STORAGE_CONFIG = {
  bucketName: 'trip-photos',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
}
```

## 🧪 Testing

### ✅ Test Dashboard
1. Navigate to `/dashboard`
2. Verify summary cards display data
3. Check metrics accuracy

### ✅ Test Anomaly Detection
1. Create a trip with unusual values
2. Check audit badge appears
3. Verify anomaly count

### ✅ Test Photo Upload
1. Go to trip form
2. Select an image file
3. Upload and verify success
4. Check photo appears in trip logs

## 🐛 Troubleshooting

### ✅ Common Issues

#### 1. Dashboard Not Loading
- Check Supabase connection
- Verify trips table exists
- Check column names match

#### 2. Upload Failures
- Verify bucket exists in Supabase
- Check RLS policies
- Ensure file size < 10MB
- Verify file type is image

#### 3. Anomaly Detection Not Working
- Check trip data structure
- Verify column names
- Test with known anomaly values

### ✅ Debug Steps
1. Check browser console for errors
2. Verify Supabase credentials
3. Test with sample data
4. Check network requests

## 📈 Next Steps

### ✅ Enhancements
1. **Charts**: Add Recharts for visualizations
2. **Filters**: Add date range filtering
3. **Export**: Add CSV/PDF export
4. **Notifications**: Add real-time alerts

### ✅ Advanced Features
1. **AI Detection**: Machine learning for anomalies
2. **Batch Upload**: Multiple photo upload
3. **Mobile App**: React Native version
4. **API Integration**: WhatsApp/Email alerts

## ✅ Status Checklist

- [x] SummaryCards component created
- [x] Anomaly detection function implemented
- [x] TripAuditBadge component created
- [x] Storage upload function created
- [x] SimpleUpload component created
- [x] Dashboard integration complete
- [x] Trip logs integration complete
- [x] UUID package installed
- [x] Database schema updated
- [x] Documentation created

**🎉 System is ready for production use!** 
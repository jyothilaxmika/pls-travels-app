# Supabase Storage Setup for Trip Photos

## Step 1: Enable Storage in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click "New bucket" button

## Step 2: Create Trip Photos Bucket

**Bucket Configuration:**
- **Name:** `trip-photos`
- **Public:** ✅ Yes (for easy access to images)
- **File size limit:** 10MB (adjust as needed)
- **Allowed MIME types:** `image/*`

## Step 3: Configure RLS (Row Level Security)

Create a policy for the `trip-photos` bucket:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to view their own uploaded files
CREATE POLICY "Allow users to view own files" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Update Database Schema

Run the SQL script in `database-updates.sql` to add the `photo_url` column:

```sql
ALTER TABLE trips ADD COLUMN photo_url TEXT;
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to a driver profile page
3. Go to the "Trip Logs" tab
4. Click "Add Trip" and try uploading an image
5. Verify the image appears in the trip logs table

## File Structure

Images will be stored with the following structure:
```
trip-photos/
├── {driver-id}/
│   ├── {uuid}.jpg
│   ├── {uuid}.png
│   └── ...
```

## Security Notes

- Images are stored in driver-specific folders
- Only authenticated users can upload files
- Users can only access files in their own folders
- Public URLs are generated for easy display 
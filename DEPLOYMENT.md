# PLS Travels DMS - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
     NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
     NEXT_PUBLIC_APP_NAME={{APP_NAME}}
     ```
   - Deploy!

### Option 2: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 3: Deploy with Docker

1. **Build Docker image**
   ```bash
   docker build -t pls-travels-dms .
   ```

2. **Run container**
   ```bash
   docker run -p 3000:3000 \
      -e NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}} \
      -e NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}} \
      -e NEXT_PUBLIC_APP_NAME="{{APP_NAME}}" \
     pls-travels-dms
   ```

## 🗄️ Database Setup

### 1. Run the SQL Schema

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Run the script

### 2. Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "Create bucket"
3. Name: `trip-photos`
4. Set to **Public**
5. Click "Create bucket"

### 3. Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check tables
SELECT 'drivers' as table_name, COUNT(*) as row_count FROM drivers
UNION ALL
SELECT 'trips' as table_name, COUNT(*) as row_count FROM trips
UNION ALL
SELECT 'payments' as table_name, COUNT(*) as row_count FROM payments;

-- Check anomalies
SELECT COUNT(*) as anomaly_count FROM trips WHERE anomaly_flag = true;
```

## 🔧 Environment Variables

Make sure these are set in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
NEXT_PUBLIC_APP_NAME={{APP_NAME}}
```

## 📱 Features Ready

✅ **Authentication** - Magic Link/OTP login  
✅ **Driver Management** - Add, edit, view drivers  
✅ **Trip Management** - Record trips with photo upload  
✅ **Anomaly Detection** - Automatic flagging of suspicious trips  
✅ **Audit System** - Review and verify flagged trips  
✅ **Analytics Dashboard** - Charts and metrics  
✅ **Mobile Responsive** - Works on all devices  
✅ **Payment Tracking** - Driver payment management  
✅ **Attendance Tracking** - Driver attendance records  

## 🧪 Testing Checklist

- [ ] Login with email OTP
- [ ] Add a new driver
- [ ] Create a trip with photo upload
- [ ] View anomaly detection in action
- [ ] Review trips in audit page
- [ ] Check analytics dashboard
- [ ] Test mobile responsiveness

## 🚨 Troubleshooting

### Common Issues:

1. **Build Errors**
   ```bash
   npm run build
   # Fix any TypeScript errors
   ```

2. **Database Connection**
   - Verify Supabase URL and key
   - Check RLS policies
   - Ensure tables exist

3. **Photo Upload Issues**
   - Verify storage bucket exists
   - Check storage policies
   - Test with small images first

4. **Authentication Issues**
   - Check Supabase Auth settings
   - Verify redirect URLs
   - Test with different email

## 📊 Monitoring

### Key Metrics to Monitor:

- **User Activity**: Login frequency
- **Data Volume**: Trips per day
- **Anomaly Rate**: Percentage of flagged trips
- **Photo Uploads**: Success rate
- **Performance**: Page load times

### Logs to Check:

- Supabase Dashboard → Logs
- Vercel/Railway deployment logs
- Browser console for client-side errors

## 🔒 Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Storage bucket permissions set
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] Authentication required for all routes

## 📈 Scaling Considerations

### For High Traffic:

1. **Database Optimization**
   - Add more indexes
   - Implement pagination
   - Use database functions for complex queries

2. **Caching Strategy**
   - Implement Redis for session storage
   - Cache frequently accessed data
   - Use CDN for static assets

3. **Monitoring**
   - Set up alerts for anomalies
   - Monitor database performance
   - Track user engagement

## 🎉 Success!

Your PLS Travels DMS is now ready for production use!

**Next Steps:**
1. Share the deployed URL with your team
2. Train users on the system
3. Monitor usage and gather feedback
4. Plan future enhancements

**Support:**
- Check the documentation in `/docs`
- Review the codebase for customization
- Contact for additional features

---

*Built with Next.js, TypeScript, Tailwind CSS, and Supabase*
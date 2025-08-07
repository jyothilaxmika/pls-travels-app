# 🚀 PLS Travels DMS - Deployment Guide

## ✅ Build Status: SUCCESS

The application builds successfully with some warnings that don't affect functionality.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=PLS Travels
```

### 2. Database Setup
Run the following SQL in your Supabase SQL Editor:
```sql
-- Create drivers table
CREATE TABLE drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  joining_date DATE,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trips table
CREATE TABLE trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
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

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id),
  amount DECIMAL(10,2) NOT NULL,
  month TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

### 3. Storage Setup
- Create a `trip-photos` bucket in Supabase Storage
- Set bucket to public
- Configure RLS policies

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_NAME`

### Option 2: Docker Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t pls-travels-dms .
   ```

2. **Run Container**:
   ```bash
   docker run -d -p 3000:3000 \
     --env-file .env.local \
     --name pls-travels-dms \
     pls-travels-dms
   ```

### Option 3: Docker Compose

1. **Start with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Option 4: Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

### Option 5: Netlify

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Set Environment Variables** in Netlify Dashboard

## 📱 Mobile Responsive Features

✅ **Fully Mobile Responsive**:
- Hamburger menu for mobile navigation
- Touch-friendly buttons and interactions
- Responsive grid layouts
- Mobile-optimized forms
- Card-based layouts for mobile

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run export       # Export static files
```

## 🐳 Docker Commands

```bash
# Build image
docker build -t pls-travels-dms .

# Run container
docker run -p 3000:3000 --env-file .env.local pls-travels-dms

# Using Docker Compose
docker-compose up -d
```

## ☁️ Cloud Platform Specifics

### Vercel
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Railway
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`

### Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18.x

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Supabase RLS**: Ensure Row Level Security is enabled
3. **API Keys**: Use environment variables for all sensitive data
4. **HTTPS**: Always use HTTPS in production

## 📊 Performance Optimizations

1. **Image Optimization**: Using Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Static Generation**: Where possible
4. **CDN**: Vercel/Netlify provide global CDN

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**:
   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version: `node --version` (should be 18+)

2. **Environment Variables**:
   - Verify all required env vars are set
   - Check Supabase URL and keys

3. **Database Connection**:
   - Verify Supabase project is active
   - Check RLS policies

4. **Photo Uploads**:
   - Ensure storage bucket exists and is public
   - Check bucket permissions

### Support

- **Supabase Documentation**: https://supabase.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Vercel Documentation**: https://vercel.com/docs

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database tables created
- [ ] Storage buckets set up
- [ ] Application builds successfully
- [ ] Domain configured (if custom)
- [ ] SSL certificate active
- [ ] Health checks passing
- [ ] Mobile responsiveness tested
- [ ] Authentication working
- [ ] File uploads functional

## 🎉 Success!

Your PLS Travels DMS is now ready for deployment! Choose your preferred platform and follow the specific instructions above.

**Recommended Deployment Order**:
1. Vercel (easiest, best performance)
2. Railway (good for full-stack)
3. Docker (self-hosted)
4. Netlify (static hosting)

---

**PLS Travels DMS** - Streamlining driver management and trip tracking for modern transportation companies.

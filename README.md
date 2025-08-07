# PLS Travels DMS (Driver Management System)

A comprehensive driver management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Driver Management**: Add, edit, and manage driver profiles
- **Trip Tracking**: Record and monitor trips with photo uploads
- **Anomaly Detection**: Automatic detection of suspicious trip data
- **Audit System**: Review and verify flagged trips
- **Mobile Responsive**: Optimized for all device sizes
- **Real-time Updates**: Live data synchronization
- **Authentication**: Secure login with Supabase Auth

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pls-travels-dms
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_NAME=PLS Travels
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t pls-travels-dms .

# Run the container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  -e NEXT_PUBLIC_APP_NAME="PLS Travels" \
  pls-travels-dms
```

### Using Docker Compose

```bash
# Create .env file with your environment variables
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url" > .env
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env
echo "NEXT_PUBLIC_APP_NAME=PLS Travels" >> .env

# Start the application
docker-compose up -d
```

## ☁️ Cloud Deployment

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_NAME`

### Railway Deployment

1. **Connect to Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy**:
   ```bash
   railway init
   railway up
   ```

3. **Set Environment Variables** in Railway Dashboard

### Netlify Deployment

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Set Environment Variables** in Netlify Dashboard

## 🗄️ Database Setup

### Supabase Setup

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Database Tables**:
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

-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trip-photos', 'trip-photos', true);
```

3. **Storage Setup**:
   - Create a `trip-photos` bucket in Supabase Storage
   - Set bucket to public
   - Configure RLS policies for the bucket

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |

## 📱 Mobile Responsive Features

- **Hamburger Menu**: Mobile navigation
- **Touch-Friendly**: Optimized for mobile interaction
- **Responsive Grid**: Adaptive layouts for all screen sizes
- **Mobile Forms**: Stacked fields for better mobile UX
- **Card Layouts**: Better for mobile scrolling

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run export` - Export static files
- `npm run deploy` - Build and start production

## 📊 Features Overview

### Dashboard
- Real-time trip statistics
- Driver rankings
- Anomaly detection alerts
- Fuel and KM trends

### Driver Management
- Add/edit driver profiles
- View driver details
- Trip history per driver
- Payment summaries

### Trip Management
- Add trips with photo uploads
- Automatic anomaly detection
- Audit system for flagged trips
- Export functionality

### Audit System
- Review flagged trips
- Mark trips as verified
- View anomaly reasons
- Photo verification

## 🔒 Security Features

- **Authentication**: Supabase Auth with email OTP
- **Row Level Security**: Database-level access control
- **Input Validation**: Zod schema validation
- **File Upload Security**: Secure photo uploads

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed
2. **Environment Variables**: Verify all required env vars are set
3. **Database Connection**: Check Supabase URL and keys
4. **Photo Uploads**: Verify storage bucket permissions

### Support

For issues and questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Open an issue in the repository

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**PLS Travels DMS** - Streamlining driver management and trip tracking for modern transportation companies.

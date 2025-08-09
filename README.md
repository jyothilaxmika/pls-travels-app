# 🚗 PLS Travels Driver Management System (DMS)

A comprehensive driver management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

### 🔐 **Authentication**
- Magic Link/OTP email authentication
- Secure session management
- Role-based access control

### 👥 **Driver Management**
- Add, edit, and delete drivers
- Driver profile management
- License and document tracking
- Status management (active/inactive/suspended)

### 🚗 **Trip Management**
- Record trips with detailed information
- Photo upload for trip verification
- Platform tracking (Uber, Ola, Rapido)
- Fuel and expense tracking

### ⚠️ **Anomaly Detection**
- Automatic flagging of suspicious trips
- Configurable detection rules
- Audit system for review and verification
- Photo requirement enforcement

### 📊 **Analytics Dashboard**
- Real-time metrics and KPIs
- Interactive charts and graphs
- Driver performance tracking
- Revenue and expense analysis

### 📱 **Mobile Responsive**
- Optimized for all devices
- Touch-friendly interface
- Mobile-first design

## 🚀 Quick Start

### 1. **Start Development Server**
```bash
npm run dev
```
Visit: http://localhost:3000

### 2. **Set Up Database**
```bash
# Run the setup script
scripts/setup-database.bat
```
Or follow `DATABASE_QUICK_SETUP.md`

### 3. **Deploy to Production**
```bash
# Deploy to Vercel
scripts/deploy-vercel.bat
```

## 📁 Project Structure

```
pls-travels-dms/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/         # Analytics dashboard
│   │   ├── drivers/           # Driver management
│   │   ├── trips/            # Trip management
│   │   ├── audit/            # Anomaly review
│   │   └── login/            # Authentication
│   ├── components/            # React components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── drivers/          # Driver components
│   │   ├── forms/            # Form components
│   │   └── trip/             # Trip components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and config
│   └── types/                # TypeScript types
├── scripts/                  # Deployment scripts
├── supabase-schema.sql       # Database schema
└── docs/                     # Documentation
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Deployment**: Vercel, Docker, Railway

## 📊 Database Schema

### **Tables**
- `drivers` - Driver information and profiles
- `trips` - Trip records with anomaly detection
- `payments` - Payment tracking
- `attendance` - Driver attendance records

### **Storage Buckets**
- `trip-photos` - Trip verification photos

## 🔧 Configuration

### **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}
NEXT_PUBLIC_APP_NAME={{APP_NAME}}
```

You can create a local `.env.local` file with the same keys for development.

Example `.env.example`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL={{SUPABASE_URL}}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{SUPABASE_ANON_KEY}}

# Branding
NEXT_PUBLIC_APP_NAME={{APP_NAME}}
```

### **Anomaly Detection Rules**
```typescript
const ANOMALY_RULES = {
  minDistance: 10,        // Minimum KM
  maxDistance: 300,       // Maximum KM
  maxFuelUsage: 30,       // Maximum fuel in liters
  requirePhoto: true      // Require photo for all trips
}
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

### **Docker**
```bash
docker build -t pls-travels-dms .
docker run -p 3000:3000 pls-travels-dms
```

### **Railway**
```bash
railway up
```

## 📈 Features in Detail

### **Driver Management**
- Complete driver profiles
- License tracking with expiry alerts
- Contact information management
- Status tracking (active/inactive/suspended)
- Document upload and storage

### **Trip Management**
- Detailed trip recording
- Photo upload for verification
- Platform and shift tracking
- Fuel and expense logging
- Notes and remarks

### **Anomaly Detection**
- Automatic flagging of suspicious trips
- Configurable detection thresholds
- Audit workflow for review
- Photo requirement enforcement
- Detailed anomaly reporting

### **Analytics Dashboard**
- Real-time metrics
- Interactive charts
- Driver performance rankings
- Revenue and expense analysis
- Anomaly statistics

### **Mobile Experience**
- Responsive design
- Touch-friendly interface
- Mobile-optimized forms
- Offline capability for basic functions

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **Authentication** with Supabase Auth
- **Secure file uploads** with storage policies
- **Input validation** with Zod schemas
- **Type safety** with TypeScript

## 📱 Mobile Responsiveness

- **Mobile-first design**
- **Touch-friendly interface**
- **Responsive charts and tables**
- **Optimized for all screen sizes**

## 🧪 Testing

### End-to-end testing (Playwright)

This project includes Playwright for E2E tests.

- Install browsers (first time only):

```bash
npx playwright install --with-deps
```

- Run tests:

```bash
npm run test:e2e
```

- Open the UI mode:

```bash
npm run test:e2e:ui
```

- View last test report:

```bash
npm run test:e2e:report
```

### **Manual Testing Checklist**
- [ ] Authentication flow
- [ ] Driver CRUD operations
- [ ] Trip creation and editing
- [ ] Anomaly detection
- [ ] Photo upload functionality
- [ ] Mobile responsiveness
- [ ] Analytics dashboard

### **Performance Testing**
- [ ] Page load times
- [ ] Database query performance
- [ ] Image upload speeds
- [ ] Mobile performance

## 🚨 Troubleshooting

### **Common Issues**

**Build Errors**
```bash
npm run build
# Fix TypeScript errors
npm run dev
```

**Database Connection**
- Verify environment variables
- Check Supabase project status
- Test connection in dashboard

**Photo Upload Issues**
- Check storage bucket exists
- Verify storage policies
- Test with smaller images

## 📞 Support

### **Documentation**
- `DATABASE_QUICK_SETUP.md` - Database setup guide
- `DEPLOYMENT.md` - Deployment instructions
- `NEXT_STEPS.md` - Complete next steps guide

### **Scripts**
- `scripts/setup-database.bat` - Database setup helper
- `scripts/deploy-vercel.bat` - Vercel deployment

## 🎯 Roadmap

### **Phase 1 (Current)**
- ✅ Basic driver management
- ✅ Trip recording
- ✅ Anomaly detection
- ✅ Analytics dashboard

### **Phase 2 (Planned)**
- 📅 Advanced reporting
- 📅 GPS tracking integration
- 📅 Automated notifications
- 📅 Advanced analytics

### **Phase 3 (Future)**
- 📅 Mobile app
- 📅 API for third-party integrations
- 📅 Advanced AI anomaly detection
- 📅 Multi-tenant support

---

## 🎉 Ready to Use!

Your PLS Travels DMS is now ready for production use. Follow the quick start guide above to get started immediately.

**Live Demo**: http://localhost:3000 (when running locally)

**Repository**: https://github.com/jyothilaxmika/pls-travels-app

---

*Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Supabase*

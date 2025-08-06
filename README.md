# 🔌 CableGuard AI - Underwater Cable Monitoring Dashboard

A comprehensive AI-powered monitoring system for underwater cable networks, featuring real-time anomaly detection, intelligent alerting, and interactive visualization.

![CableGuard AI Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kingvis/AI_SEA_N-W.git
   cd AI_SEA_N-W/cableguard-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Launch the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ✨ Features

### 🎯 **Interactive Dashboard Components**
- **📊 Real-time Health Metrics** - Full-width sensor monitoring with color-coded status
- **🌐 Network Status Charts** - Live visualization of cable network health
- **⚠️ Anomaly Detection** - AI-powered anomaly identification with acknowledgment system
- **📋 Compliance Reporting** - Automated report generation and download
- **💼 Business Metrics** - Revenue impact analysis and cost calculations
- **🚨 Alert Management** - Multi-level alert system with escalation workflows

### 🎮 **Fully Functional Buttons**
- **🔄 Live Monitoring Toggle** - Real-time system monitoring controls
- **🌊 Network Status** - Deep sea network information with detailed dropdowns
- **🛡️ AI Protection** - Neural defense system with scanning capabilities
- **🔔 Notifications** - System alerts and status updates
- **⚙️ Settings Panel** - Dashboard configuration and preferences
- **📤 Data Export** - Download comprehensive reports in JSON format
- **✅ Anomaly Acknowledgment** - Professional incident management workflow
- **📈 Business Intelligence** - Period-based metrics and report generation

### 🎨 **User Experience**
- **🌊 Animated Backgrounds** - Interactive bubble animations for underwater theme
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **🎭 Smooth Animations** - Framer Motion powered interactions
- **🎯 Professional UI** - Enterprise-grade interface design
- **⚡ Real-time Updates** - Live data refresh every 30 seconds
- **🔍 Detailed Modals** - In-depth views for all system components

## 🏗️ Project Structure

```
cableguard-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard orchestrator
│   │   ├── Header.tsx             # Interactive header with status indicators
│   │   ├── StatsCards.tsx         # Key performance metrics cards
│   │   ├── SensorHealthMatrix.tsx # Full-width health monitoring table
│   │   ├── NetworkStatusChart.tsx # Network visualization
│   │   ├── AlertsTimeline.tsx     # Alert management interface
│   │   ├── AnomalyAnalysis.tsx    # AI anomaly detection results
│   │   ├── BusinessMetrics.tsx    # Financial impact analysis
│   │   ├── ComplianceReporting.tsx# Regulatory compliance tracking
│   │   ├── PredictiveAnalytics.tsx# Future trend predictions
│   │   └── SystemStatistics.tsx   # Comprehensive system stats
│   ├── app/
│   │   ├── page.tsx              # Main application entry point
│   │   ├── layout.tsx            # Application layout wrapper
│   │   └── globals.css           # Global styles and Tailwind
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── tailwind.config.ts           # Tailwind CSS configuration
├── next.config.ts               # Next.js configuration
└── README.md                    # This file
```

## 🎯 Key Functionalities

### **📊 Real-time Monitoring**
- Live sensor data visualization
- Automatic anomaly detection using AI algorithms
- Color-coded health status indicators
- Interactive sensor selection and filtering

### **🚨 Alert Management**
- Multi-severity alert system (Low, Medium, High, Critical)
- Automatic escalation workflows
- Acknowledgment tracking
- Historical alert timeline

### **📈 Business Intelligence**
- Revenue impact calculations
- SLA compliance monitoring
- Cost savings analysis
- Predictive maintenance scheduling

### **📋 Compliance & Reporting**
- Automated compliance checking
- Regulatory report generation
- Audit trail maintenance
- Export capabilities for external systems

## 🎮 How to Use

### **🔄 Monitoring Controls**
1. **Live Monitoring Button** - Toggle real-time data updates
2. **Refresh Button** - Manually refresh all dashboard data
3. **Settings** - Configure monitoring intervals and display options

### **📊 Data Interaction**
1. **Click Anomaly Cards** - View detailed anomaly information
2. **Select Time Periods** - Change business metrics timeframes
3. **Export Reports** - Download data in JSON format
4. **View Details** - Access comprehensive system information

### **🚨 Alert Handling**
1. **Acknowledge Alerts** - Mark anomalies as reviewed
2. **Escalate Issues** - Send critical alerts to operations team
3. **View History** - Review past alerts and responses

## 🛠️ Development

### **Available Scripts**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### **Tech Stack**
- **⚛️ Next.js 15** - React framework with App Router
- **🔷 TypeScript** - Type-safe development
- **🎨 Tailwind CSS** - Utility-first styling
- **🎭 Framer Motion** - Smooth animations
- **⚡ Lucide React** - Beautiful icons
- **📊 Chart.js** - Data visualization

## 🔧 Configuration

### **Environment Variables**
Create a `.env.local` file for custom configuration:

```bash
# Optional: Custom port (default: 3000)
PORT=3000

# Optional: API endpoints for real data
NEXT_PUBLIC_API_URL=https://your-api-endpoint.com

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=false
```

### **Customization Options**
- **🎨 Theme Colors** - Modify `THEME_COLORS` in `Dashboard.tsx`
- **📊 Data Refresh Rate** - Adjust `AUTO_REFRESH_INTERVAL` (default: 30 seconds)
- **🎭 Animation Settings** - Configure Framer Motion parameters
- **📱 Responsive Breakpoints** - Customize Tailwind CSS breakpoints

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

### **Netlify**
```bash
npm run build
# Upload dist folder to Netlify
```

### **Docker**
```bash
docker build -t cableguard-ai .
docker run -p 3000:3000 cableguard-ai
```

## 📈 Performance Features

- **⚡ Optimized Rendering** - React.memo and useMemo for performance
- **🎯 Lazy Loading** - Components load on demand
- **📱 Responsive Images** - Automatic image optimization
- **🔄 Efficient Updates** - Smart re-rendering strategies
- **💾 State Management** - Optimized state updates and persistence

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify Node.js version** (18.0.0+)
3. **Clear npm cache** (`npm cache clean --force`)
4. **Delete node_modules** and reinstall (`rm -rf node_modules && npm install`)

## 🎉 Acknowledgments

- **🌊 Underwater Cable Industry** - For inspiring this monitoring solution
- **⚛️ React Team** - For the excellent framework
- **🎨 Tailwind CSS** - For the utility-first CSS framework
- **🎭 Framer Motion** - For beautiful animations

---

**🔌 CableGuard AI - Protecting underwater infrastructure with intelligent monitoring**

Made with ❤️ for submarine cable operators worldwide 
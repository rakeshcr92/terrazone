# Terra Zone - AI-Powered Real Estate Development Feasibility Platform

[![Built with enter.pro](https://img.shields.io/badge/Build%20with-Enter.pro-FC5776?style=for-the-badge&labelColor=1F1F1F)](https://enter.pro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF?logo=vite)](https://vitejs.dev/)

> "**Zillow meets ChatGPT for developers**" - Analyze land feasibility in 60 seconds, not 6 weeks.

---

## 🎯 Vision

**Terra Zone** is an intelligent real estate development feasibility platform that analyzes land parcels in **under 60 seconds** and delivers investment-grade GO/NO-GO/CONDITIONAL verdicts with AI-powered executive summaries.

### The Problem
- Traditional site feasibility takes **6+ weeks** and costs **$20k-$50k** per analysis
- Involves 5-10 separate consultant studies (geotechnical, zoning, environmental, etc.)
- By the time analysis completes, deals are gone
- Small developers can't afford to analyze multiple sites

### The Solution
- ⚡ **60-second analysis** integrating USGS, USDA, zoning, and elevation data
- 💰 **$10 per analysis** vs. $20k+ traditional cost
- 🎯 **Investment-grade verdicts**: GO / NO-GO / CONDITIONAL
- 🤖 **AI-powered insights** with specific recommendations
- 📊 **Multi-site comparison** to evaluate 10+ sites in minutes
- 📄 **Professional reports** (PDF, PowerPoint, Excel)

---

## ✨ Key Features

### 🗺️ Interactive Map Interface
- **Draw custom polygons** on any US land parcel
- **Real-time area calculation** (sq ft, acres, sq meters)
- **Location search** with autocomplete
- **3D building visualization** with data-driven extrusions
- **Cinematic animations** (smooth 2D→3D transitions)
- **Multi-site comparison** with simultaneous 3D rendering

### 🤖 AI Decision Engine
**5-Phase Analysis Pipeline:**
1. **Geological Analysis** - USGS data for soil stability, foundation requirements
2. **Zoning Analysis** - Local codes, FAR, max height, setbacks
3. **Cost Estimation** - Foundation costs, development budget
4. **ROI Prediction** - Risk-adjusted returns, payback period
5. **AI Synthesis** - Gemini 2.0 executive summary with verdict

### 💡 Smart Recommendations ("Path to GO")
For CONDITIONAL verdicts, AI suggests 3 specific strategies:
- **Design Optimization** - Architectural changes (e.g., reduce floors to cut foundation costs)
- **Phasing Strategy** - Break into stages to reduce upfront capital
- **Financial Engineering** - Revenue optimization or creative financing

### 📊 Site Comparison
- Compare up to **6 sites** simultaneously
- Visual ROI comparison charts
- Cost breakdown side-by-side
- Risk factor analysis
- Zoning envelope overlay

### 📈 Scenario Analysis
- Adjust **Floor Area Ratio** (FAR) 
- Modify **building height** and floor count
- Real-time financial impact calculation
- What-if analysis for zoning variances

### 📄 Professional Reports
- **PDF Export** - Multi-page investment memo with jsPDF
- **PowerPoint Export** - 4-slide presentation with pptxgenjs
- **Excel/CSV Export** - Financial model data

---

## 🛠️ Tech Stack

### Frontend Framework
- **[React 19.1.1](https://reactjs.org/)** - UI library
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - Type safety
- **[Vite 7.1.4](https://vitejs.dev/)** - Build tool & dev server
- **[React Router 7.8.2](https://reactrouter.com/)** - Client-side routing

### UI Components & Styling
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Accessible component library built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI components (40+ primitives)
- **[Lucide React 0.542](https://lucide.dev/)** - Icon library (1000+ icons)
- **[Framer Motion 12.23](https://www.framer.com/motion/)** - Animation library
- **[next-themes 0.4.6](https://github.com/pacocoursey/next-themes)** - Dark mode support
- **[Sonner 2.0.7](https://sonner.emilkowal.ski/)** - Toast notifications
- **[Vaul 1.1.2](https://vaul.emilko.dev/)** - Drawer component

### Mapping & Geospatial
- **[MapLibre GL 4.1.2](https://maplibre.org/)** - Open-source map rendering engine
- **[react-map-gl 7.1.7](https://visgl.github.io/react-map-gl/)** - React wrapper for MapLibre
- **[Mapbox GL Draw 1.4.3](https://github.com/mapbox/mapbox-gl-draw)** - Drawing tools for polygons
- **[Turf.js 7.3.4](https://turfjs.org/)** - Geospatial analysis library (area calculation, geometry operations)

### Data Visualization
- **[Recharts 3.1.2](https://recharts.org/)** - Composable charting library
- **[React Three Fiber 9.6](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[Three.js 0.184](https://threejs.org/)** - 3D graphics library
- **[@react-three/drei 10.7.7](https://github.com/pmndrs/drei)** - Helper components for R3F

### Forms & Data Management
- **[React Hook Form 7.62](https://react-hook-form.com/)** - Performant form library
- **[Zod 4.1.5](https://zod.dev/)** - TypeScript-first schema validation
- **[TanStack Query 5.86](https://tanstack.com/query/)** - Data fetching & caching
- **[date-fns 4.1](https://date-fns.org/)** - Date utility library

### Backend & Database
- **[Supabase 2.57.4](https://supabase.com/)** - Open-source Firebase alternative
  - PostgreSQL database
  - Edge Functions (Deno runtime)
  - Authentication
  - Row Level Security (RLS)
- **[Deno](https://deno.land/)** - Serverless runtime for Edge Functions

### Document Generation
- **[jsPDF 4.2.1](https://github.com/parallax/jsPDF)** - PDF generation
- **[pptxgenjs 4.0.1](https://gitbrent.github.io/PptxGenJS/)** - PowerPoint generation

### AI & API Integration
- **[Enter AI Platform](https://enter.pro)** - Managed AI service
  - **Google Gemini 2.0 Flash Thinking** - Multi-modal AI reasoning
  - **Model ID**: `google/gemini-3.1-pro-preview`
  - Accessible via Enter API endpoint

### Layout & UI Utilities
- **[react-resizable-panels 3.0.5](https://github.com/bvaughn/react-resizable-panels)** - Resizable panel layouts
- **[embla-carousel-react 8.6](https://www.embla-carousel.com/)** - Carousel component
- **[cmdk 1.1.1](https://cmdk.paco.me/)** - Command menu component
- **[react-markdown 10.1](https://remarkjs.github.io/react-markdown/)** - Markdown renderer
- **[input-otp 1.4.2](https://input-otp.rodz.dev/)** - OTP input component

### Development Tools
- **[ESLint 9.34](https://eslint.org/)** - Code linting
- **[TypeScript ESLint 8.42](https://typescript-eslint.io/)** - TypeScript linting rules
- **[Autoprefixer 10.4.21](https://github.com/postcss/autoprefixer)** - CSS vendor prefixes
- **[pnpm 8.6.12](https://pnpm.io/)** - Fast, disk space efficient package manager

---

## 🏛️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   MapView   │  │ DecisionPanel│  │ Comparison  │    │
│  │  (MapLibre) │  │   (Charts)   │  │  (Recharts) │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                 │                 │            │
│         └─────────────────┴─────────────────┘            │
│                           │                              │
└───────────────────────────┼──────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Supabase API  │
                    │   (PostgREST)  │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
   │Database │      │Edge Functions│    │   Storage   │
   │(Postgres)│     │    (Deno)    │    │    (S3)     │
   └─────────┘      └──────┬──────┘    └─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐      ┌──────▼──────┐    ┌──────▼──────┐
   │  USGS   │      │   Gemini    │    │   OpenCage  │
   │Geological│     │  AI (2.0)   │    │  Geocoding  │
   └─────────┘      └─────────────┘    └─────────────┘
```

### Edge Functions (Serverless Backend)

| Function | Purpose | AI Model |
|----------|---------|----------|
| `decision-engine` | Orchestrates 5-phase analysis pipeline | Gemini 2.0 |
| `gemini-orchestrator` | Central AI reasoning engine | Gemini 2.0 |
| `geosetta-analysis` | USGS geological data analysis | Gemini 2.0 |
| `zoning-rag` | Zoning code interpretation with RAG | Gemini 2.0 |
| `foundation-estimator` | Foundation cost estimation | Gemini 2.0 |
| `roi-predictor` | ROI calculation with risk adjustment | Gemini 2.0 |

### Database Schema

**Tables:**
- `site_analyses` - Stores all analysis results
- `site_comparisons` - Multi-site comparison data
- `user_profiles` - User accounts & preferences
- `zoning_cache` - Cached zoning data
- `cost_benchmarks` - Historical cost data
- `roi_models` - ROI calculation models

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **pnpm** 8.6+ (recommended) or npm
- **Supabase** account (for backend) - [Sign up free](https://supabase.com)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd terra-zone

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Custom API endpoints
VITE_API_BASE_URL=https://api.enter.pro
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run migrations**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link your project
   supabase link --project-ref your-project-ref
   
   # Push database migrations
   supabase db push
   ```

3. **Deploy Edge Functions**:
   ```bash
   # Deploy all functions
   supabase functions deploy decision-engine
   supabase functions deploy gemini-orchestrator
   supabase functions deploy geosetta-analysis
   supabase functions deploy zoning-rag
   supabase functions deploy foundation-estimator
   supabase functions deploy roi-predictor
   ```

4. **Set secrets** (required for AI features):
   ```bash
   # Set AI API token
   supabase secrets set AI_API_TOKEN_c8dba0ffb829=your_enter_ai_token
   ```

---

## 📖 Usage

### Basic Workflow

1. **Open the map** (defaults to Princeton, NJ)
2. **Search for a location** or navigate to your target area
3. **Draw a polygon** around the land parcel using the drawing tool
4. **Click "Analyze"** - the system will:
   - Calculate parcel area
   - Fetch geological data (USGS)
   - Analyze zoning requirements
   - Estimate foundation costs
   - Predict ROI
   - Generate AI executive summary
5. **Review the verdict**: GO / NO-GO / CONDITIONAL
6. **Explore insights**:
   - Decision tab: Overall verdict & AI reasoning
   - Compare tab: Multi-site comparison
   - Scenarios tab: What-if analysis
   - PDF tab: Generate professional report

### Advanced Features

**Site Comparison:**
1. Analyze multiple sites (draw & analyze each one)
2. Switch to "Compare" tab
3. View all sites in 3D with color-coded heights
4. Compare ROI, costs, and risk factors side-by-side

**Scenario Analysis:**
1. After analyzing a site, go to "Scenarios" tab
2. Adjust Floor Area Ratio (FAR) slider
3. Modify building height slider
4. See real-time financial impact

**Path to GO (for CONDITIONAL sites):**
1. If verdict is CONDITIONAL, look for "Show Me What Changes Would Work" button
2. Click to get AI-powered recommendations
3. See 3 specific strategies to improve feasibility

---

## 🗺️ Data Sources

### Open Data APIs Used

| Source | Data Type | Provider | License |
|--------|-----------|----------|---------|
| **USGS** | Geological data, soil types | US Geological Survey | Public Domain |
| **USDA** | Soil surveys, SSURGO data | US Dept of Agriculture | Public Domain |
| **OpenCage** | Geocoding, reverse geocoding | OpenCage Data | Attribution Required |
| **CARTO** | Base map tiles (dark-matter) | CARTO | CC BY 4.0 |
| **Local Zoning APIs** | Zoning codes, regulations | Municipal sources | Varies by jurisdiction |

### AI Models

- **Google Gemini 2.0 Flash Thinking** (`google/gemini-3.1-pro-preview`)
  - Accessed via [Enter AI Platform](https://enter.pro)
  - Used for all analysis synthesis and reasoning

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--primary: #FF8C42 (Orange)
--primary-glow: #FF6B35

/* Backgrounds */
--background: #0A0A0A (Near Black)
--card: #1A1A1A
--glass: rgba(0, 0, 0, 0.8) with backdrop-blur

/* Text */
--foreground: #FFFFFF
--muted: rgba(255, 255, 255, 0.7)
--subtle: rgba(255, 255, 255, 0.4)

/* Accent Colors */
--success: #10B981 (Green)
--warning: #F59E0B (Amber)
--destructive: #EF4444 (Red)
```

### Typography

- **Headings**: System font stack (SF Pro, Inter, Segoe UI)
- **Body**: 14px base, font-medium
- **Mono**: JetBrains Mono for code/numbers

### Components

All UI components from shadcn/ui are customizable in `src/components/ui/`:
- Buttons, Cards, Dialogs
- Forms (Input, Select, Checkbox)
- Data Display (Tables, Charts)
- Overlays (Modals, Tooltips)

---

## 🏗️ Project Structure

```
terra-zone/
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── MapView.tsx      # Main map interface
│   │   ├── DecisionPanel.tsx # Analysis results
│   │   ├── SiteComparison.tsx # Multi-site comparison
│   │   ├── ScenarioAnalysis.tsx # What-if scenarios
│   │   └── ReportGenerator.tsx # PDF/PPT export
│   ├── pages/               # Route pages
│   │   └── Index.tsx        # Main app page
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client & types
│   ├── lib/                 # Utility functions
│   ├── hooks/               # Custom React hooks
│   └── index.css            # Global styles
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   │   ├── decision-engine/
│   │   ├── gemini-orchestrator/
│   │   ├── geosetta-analysis/
│   │   ├── zoning-rag/
│   │   ├── foundation-estimator/
│   │   └── roi-predictor/
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── docs/                    # Documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── 3D_MAP_TRANSITION.md
│   ├── COMPARISON_3D_FIX.md
│   └── NAVIGATION_REDESIGN.md
└── package.json
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server (Vite)
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm lint             # Run ESLint

# Supabase
supabase start        # Start local Supabase
supabase db reset     # Reset database
supabase functions serve  # Test Edge Functions locally
```

### Code Quality

- **TypeScript** - Strict mode enabled
- **ESLint** - Configured with React & TypeScript rules
- **Prettier** - Code formatting (via ESLint)
- **Husky** - Git hooks for pre-commit checks (optional)

### Testing

```bash
# Unit tests (add as needed)
pnpm test

# E2E tests (add as needed)
pnpm test:e2e
```

---

## 📊 Performance

### Metrics

- **Time to Interactive**: < 2s
- **First Contentful Paint**: < 1s
- **Analysis Speed**: < 60s (typically 30-45s)
- **Bundle Size**: ~2.5MB (gzipped: ~600KB)

### Optimizations

- **Code Splitting** - Lazy load routes & heavy components
- **Tree Shaking** - Vite removes unused code
- **Image Optimization** - WebP format, responsive images
- **Caching** - Zoning data cached in database
- **CDN** - Static assets served via CDN

---

## 🌐 Deployment

### Hosting Options

**Recommended:**
- **[Enter.pro](https://enter.pro)** - One-click deployment (recommended)
- **[Vercel](https://vercel.com)** - Automatic CI/CD from GitHub
- **[Netlify](https://netlify.com)** - Easy deployment with Edge Functions
- **[Cloudflare Pages](https://pages.cloudflare.com)** - Global CDN

### Build Configuration

```bash
# Production build
pnpm build:prod

# The build outputs to /dist
# Deploy the /dist folder to your hosting provider
```

### Environment Variables

Set these in your hosting provider's dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (optional)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write TypeScript (no plain JS)
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly

### Reporting Issues

Use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Terra Zone

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

- **Documentation**: See `/docs` folder for detailed guides
- **Issues**: [GitHub Issues](https://github.com/your-org/terra-zone/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/terra-zone/discussions)
- **Email**: support@terrazone.ai (if applicable)

---

## 🙏 Acknowledgments

### Open Source Libraries

Special thanks to the maintainers and contributors of:
- [React](https://reactjs.org/) - Meta & community
- [Vite](https://vitejs.dev/) - Evan You & team
- [Supabase](https://supabase.com/) - Supabase team
- [MapLibre GL](https://maplibre.org/) - MapLibre community
- [Radix UI](https://www.radix-ui.com/) - WorkOS team
- [shadcn/ui](https://ui.shadcn.com/) - shadcn & community
- [Tailwind CSS](https://tailwindcss.com/) - Tailwind Labs
- [Turf.js](https://turfjs.org/) - Mapbox & contributors
- All other dependencies listed above

### Data Providers

- **USGS** - US Geological Survey for geological data
- **USDA** - US Dept of Agriculture for soil surveys
- **OpenCage** - Geocoding services
- **CARTO** - Base map tiles
- **Google** - Gemini AI models

---

## 🚀 Roadmap

### Current Features (v1.0)
- ✅ Interactive map with polygon drawing
- ✅ 60-second AI analysis
- ✅ GO/NO-GO/CONDITIONAL verdicts
- ✅ Multi-site comparison
- ✅ Scenario analysis
- ✅ Professional report generation
- ✅ 3D building visualization

### Upcoming Features (v1.1+)
- 🔄 Historical analysis tracking
- 🔄 User authentication & saved sites
- 🔄 Team collaboration features
- 🔄 Mobile app (React Native)
- 🔄 API access for developers
- 🔄 Expanded geographic coverage (nationwide US)
- 🔄 Integration with MLS data
- 🔄 Custom report templates

---

## 📈 Project Stats

- **Lines of Code**: ~15,000+
- **Components**: 50+
- **Edge Functions**: 6
- **Database Tables**: 6
- **Third-party APIs**: 5+
- **AI Models**: 1 (Gemini 2.0)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ using Enter.pro and open source technologies**

*Last updated: April 2026*

# Terra-Zone AI - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React 19 + TypeScript)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Map View    │  │  Decision    │  │  Comparison  │          │
│  │  (MapLibre)  │  │  Panel       │  │  Tool        │          │
│  │              │  │  (Results)   │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Scenario    │  │  Report      │  │  Path to GO  │          │
│  │  Analysis    │  │  Generator   │  │  (AI Recs)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTP/WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
│                  (PostgreSQL + Edge Functions)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Edge Functions (Deno Runtime):                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │  decision-engine (Main Orchestrator)               │         │
│  │  ├── Phase 1: geological-data                      │         │
│  │  ├── Phase 2: zoning                               │         │
│  │  ├── Phase 3: foundation-estimator                 │         │
│  │  ├── Phase 4: roi-predictor                        │         │
│  │  └── Phase 5: gemini-orchestrator (AI)            │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
│  Database Tables:                                                │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐      │
│  │  sites   │ │site_analyses│ │  zoning  │ │foundation  │      │
│  │          │ │            │ │  _codes   │ │_estimates  │      │
│  └──────────┘ └────────────┘ └──────────┘ └────────────┘      │
│                                                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ External API Calls
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL DATA SOURCES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  USGS API    │  │  USDA Soil   │  │ Open-Elev.   │          │
│  │  (Bedrock)   │  │  Survey      │  │ API          │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │  Gemini 2.0 Flash (via Enter Cloud AI)          │           │
│  │  - Investment-grade summary generation           │           │
│  │  - Structured JSON output                        │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

For complete architecture details including data flow diagrams, security architecture, performance optimization, and scalability plans, see PROJECT_OVERVIEW.md.

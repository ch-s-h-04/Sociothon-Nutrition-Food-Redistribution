# Sociothon 2026: Smart Food Waste Prevention, Recovery & Redistribution Platform

> An AI-powered, decentralized food waste management and resource recovery platform developed for **Sociothon 2026 (NSS IIT Roorkee)** under the theme **Smart and Sustainable Waste Management**. Unifies open components from **Anya** and **ReRoute** into a cohesive, production-ready solution.

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-16%2F16%20Passing-emerald.svg)]()
[![Theme](https://img.shields.io/badge/Sociothon%202026-Waste%20Management-teal.svg)]()
[![NFHS-5 Verified](https://img.shields.io/badge/Data%20Source-NFHS--5%20Factsheets-orange.svg)]()

---

## 1. Hackathon Challenge Alignment

- **Hackathon**: Sociothon 2026, National Service Scheme (NSS), IIT Roorkee
- **Official Theme**: Smart and Sustainable Waste Management
- **Challenge Statement**: *Develop an innovative, affordable, and scalable technology-driven solution that improves waste segregation, collection, recycling, monitoring, or resource recovery.*
- **Platform Focus**: Prevention, segregation, collection routing, monitoring, and multi-pathway resource recovery for institutional and campus food waste (dining halls, canteens, catering, local communities).

---

## 2. Platform Architecture & Core Pillars

The platform implements a complete closed-loop waste lifecycle connecting source generation to verified resource recovery:

```
[ Dining Halls / Canteens / Caterers ]
                 │
                 ▼
  [ 1. Source Segregation & Logging ]
  • Cooked meals, produce, bakery, pantry
  • Storage constraints (Hot Holding >60°C, Cold Chain <4°C, Ambient)
  • Expiry timestamps & batch weights
                 │
                 ▼
  [ 2. Smart Priority Matching Engine ]
  • Strict operational feasibility (dietary compatibility, vehicle capacity, radius)
  • Supporting nutrition prioritization (NFHS-5 stunting & anemia indicators)
                 │
                 ▼
  [ 3. Collection Fleet Route Optimization ]
  • Earliest-expiry-first pickup sequencing
  • Realistic road circuity modeling (1.35x)
  • Fleet capacity constraints & K-medoids consolidation hubs
                 │
                 ▼
  [ 4. Multi-Pathway Quality Verification & Handover ]
  ├── SAFE & WITHIN DEADLINE  ──► Human Redistribution (NGOs, shelters, community centers)
  ├── PAST SAFE CONSUMPTION   ──► Organic Bio-Composting (Local aerobic soil amendment units)
  └── SPOILED / CONTAMINATED  ──► Compliant Municipal Disposal
                 │
                 ▼
  [ 5. Audited Material Accounting & Monitoring ]
  • Material Recovery Rate (%) & Redistribution Rate (%)
  • Lifecycle CO₂ avoided (2.5 kg/kg food, 0.85 kg/kg compost methane prevention)
  • Agricultural water conserved (750 L/kg) & compost soil yield (0.25 kg/kg)
```

### Core Solution Capabilities:
1. **Source Segregation & Logging**: Categorizes food surplus by dietary classification, food type, strict temperature requirements, and safe consumption windows.
2. **Collection Logistics & Route Optimization**: Deterministic nearest-expiry-first fleet routing with realistic road circuity, reducing collection transit time, vehicle emissions, and food spoilage during transport.
3. **Food Safety Enforcement**: Automated guard prevents expired food batches from human distribution, enforcing safe diversion to bio-composting or municipal disposal.
4. **Multi-Pathway Resource Recovery**:
   - **Primary**: Edible surplus redistributed to high-vulnerability recipients.
   - **Secondary**: Degraded/expired batches diverted to organic bio-composting to produce organic soil conditioner.
   - **Tertiary**: Compliant municipal disposal for contaminated items.
5. **Audited Material Stream & Environmental Accounting**: Computes real operational recovery rates, collection fleet efficiency ($kg/km$), CO₂ emissions averted, embedded water saved, and compost generated.
6. **Supporting Nutrition Intelligence**: Anya's micronutrient index and NFHS-5 factsheets act as a supporting prioritization factor (+25pts for acute malnutrition/deficiencies), ensuring recovered edible food delivers maximum public health impact without overshadowing the primary waste management mission.

---

## 3. Reused Components & Source Attribution

This repository integrates and enhances open components from two repositories by **Dishank Sen**:
- **Anya**: [https://github.com/Dishank-Sen/Anya](https://github.com/Dishank-Sen/Anya)
- **ReRoute**: [https://github.com/Dishank-Sen/ReRoute](https://github.com/Dishank-Sen/ReRoute)

See [ATTRIBUTION.md](./ATTRIBUTION.md) for full notices.

### Provenance Mapping:
| Component | Source Origin | Role in Sociothon 2026 Solution |
|---|---|---|
| **Waste Paradox Data** | ReRoute | Live waste ticker ($2474.89 \text{ kg/sec}$ based on UNEP 78 MT/yr) and macroeconomic benchmarks. |
| **Fleet Routing Engine** | ReRoute | Multi-stop collection routing, road circuity modeling (1.35x), and K-medoids consolidation hub optimization. |
| **Surplus Intake Schema** | ReRoute | Data models for donors, portions, storage requirements, and expiry deadlines. |
| **Nutrition Intelligence** | Anya | Supporting prioritization factor matching high-synergy food to critical NFHS-5 aspirational districts. |
| **Fortification & Meal Planner** | Anya | Supporting optimization tools for public health diet planning and micronutrient vehicle allocation. |
| **Multi-Pathway Recovery** | Unified Core | Food safety expiration guard, aerobic composting diversion, compost yield modeling, and material recovery metrics. |

---

## 4. Technology Stack

- **Backend**: Node.js 24 (native TypeScript execution with `--experimental-strip-types`), Express.
- **Data Persistence**: Zero-external-dependency ACID JSON store (`server/db/store.ts`) ensuring donations, dispatches, and recovery states persist reliably without requiring Docker or cloud databases.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Leaflet interactive mapping.
- **Test Runner**: Node.js native test runner (`node --test`), 16 automated tests covering the complete collection, matching, food safety, and recovery accounting lifecycle.

---

## 5. Quickstart & Installation

### Prerequisites
- **Node.js 20+** (tested on Node.js v24.15.0)
- **npm** (comes with Node.js)

### Setup & Run
```bash
# 1. Clone the destination repository
git clone https://github.com/ch-s-h-04/Sociothon-Nutrition-Food-Redistribution.git
cd Sociothon-Nutrition-Food-Redistribution

# 2. Install dependencies
npm install

# 3. Build production bundle
npm run build

# 4. Start production server
npm start
```

The application will start at:
- **Web Platform**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### Development Mode
```bash
npm run dev
```

### Running Automated Test Suite
```bash
npm test
```

---

## 6. Demonstration Sequence for Sociothon Judges

To experience the platform's waste management workflow during evaluation:

1. **Launch the Application**: Open `http://localhost:5000` in your browser.
2. **Tab 1: Waste Monitoring & Impact**:
   - Inspect verified operational metrics: Total Surplus Registered (kg), Quantity Collected (kg), Human Redistribution (kg), Organic Bio-Composting Diversion (kg), Material Recovery Rate (%), and Collection Efficiency (kg/km).
   - View the live 2026 estimated national waste ticker contrasting macroeconomic waste with verified local platform interventions.
3. **Tab 2: Surplus Prevention & Logging**:
   - Inspect existing campus surplus batches.
   - Click **"Log Surplus Batch"** to register excess meals with storage requirements (hot holding >60°C, cold storage <4°C, ambient) and safe consumption deadlines.
4. **Tab 3: Smart Recipient Matching**:
   - Execute algorithmic matching.
   - Inspect constraint feasibility (capacity, distance, dietary compatibility) and supporting nutrition vulnerability prioritization (+25pts for acute stunting/anemia).
   - Click **"Assign Donation & Dispatch Route"**.
5. **Tab 4: Collection Fleet & Routing**:
   - Inspect optimized collection route sequenced by earliest deadline first with realistic 1.35x road circuity distance.
6. **Tab 5: Collection & Recovery Tracking**:
   - Advance batch state to **"Start Collection / En Route"**.
   - Test **Multi-Pathway Handover**:
     - *Edible batch within deadline*: Click **"Redistribute (Edible)"** to confirm human delivery.
     - *Batch past prime/expired*: Click **"Divert to Compost"** to divert to bio-composting and calculate organic soil amendment yield.
     - Notice the built-in **Food Safety Guard**: expired food is blocked from human redistribution.
7. **Return to Tab 1**:
   - Observe how the completed delivery or composting batch immediately updates the verified material recovery ledger in real time.
8. **Interactive Tour (Tab 8: Guided Sociothon Demo)**:
   - Click through the 7-step guided evaluator tour for an automated step-by-step walkthrough.

---

## 7. Automated Test Results

```text
> sociothon-nutrition-food-redistribution@1.0.0 test
> node --test tests/**/*.test.mjs

✔ End-to-End Workflow: Nutrition Data -> Risk Prioritization -> Surplus Registration -> Smart Matching -> Route Planning -> Delivery -> Impact Reflection (26.38ms)
✔ Sociothon 2026: Multi-Pathway Recovery, Composting Diversion & Food Safety Guard (14.72ms)
✔ Matching: Haversine distance is non-negative and symmetric (1.75ms)
✔ Matching: Travel time calculation incorporates road factor and speed model (0.33ms)
✔ Matching: evaluateNutritionSynergy boosts iron/protein foods for vulnerable districts (0.34ms)
✔ Matching: findNGORecommendations enforces constraints and ranks top recipient (3.95ms)
✔ Nutrition: getRiskLevel categorizes percentages properly (0.99ms)
✔ Nutrition: getAllDistrictSummaries returns verified NFHS-5 factsheet districts (0.78ms)
✔ Nutrition: getDistrictById returns full micronutrient profile and provenance (0.46ms)
✔ Nutrition: optimizeFortification calculates cost-effective food vehicle allocation (0.69ms)
✔ Nutrition: generateCulturallyAwareMealPlan respects cultural dietary constraints (0.31ms)
✔ Routing: generateInterpolatedWaypoints produces valid coordinate paths (1.63ms)
✔ Routing: optimizeFleetRoutes respects vehicle capacities and deadline feasibility (3.20ms)
✔ Routing: optimizeHubLocations selects medoids among donor locations (1.49ms)
✔ Surplus: calculateFoodWeightKg converts standard meals to kilograms (2.32ms)
✔ Surplus: CRUD lifecycle maintains persistent records and status transitions (7.45ms)

ℹ tests 16
ℹ pass 16
ℹ fail 0
ℹ duration_ms 345.5ms
```

---

## 8. Data Provenance & Scientific Methodology

1. **Operational Platform Records**: All metrics reported in the operational recovery panel (kilograms registered, collected, redistributed, composted, and disposed) are computed directly from verified database records with zero synthetic inflation.
2. **Food Safety Standards**: In alignment with FSSAI (Food Safety and Standards Authority of India) donation guidelines, prepared surplus must be maintained within safe temperature bands (hot holding $\ge 60^\circ\text{C}$, cold chain $\le 4^\circ\text{C}$) and cannot be distributed for human consumption once the safe consumption deadline has elapsed.
3. **Environmental Accounting Factors**:
   - **Human Consumption**: $2.5\text{ kg CO}_2\text{e} / \text{kg food}$ avoided (FAO / UNEP Food Waste Index 2024 lifecycle benchmark), $750\text{ L} / \text{kg}$ embedded agricultural water conserved (Water Footprint Network India), ₹65 / meal consumer replacement value.
   - **Organic Bio-Composting**: $0.85\text{ kg CO}_2\text{e} / \text{kg}$ organic waste avoided (EPA WARM model for anaerobic landfill methane abatement), $0.25\text{ kg}$ soil amendment compost generated per kg wet food waste, ₹8 / kg organic compost market value.
   - **Disposal**: 0 offsets.
4. **Macroeconomic Research Benchmarks**: Annual food waste (78 MT/yr) and financial loss (₹1.52 lakh crore) cite UNEP Food Waste Index 2024 and NABCONS 2022. The real-time ticker ($2474.89\text{ kg/sec}$) is an illustrative statistical projection.
5. **Nutrition Factsheets**: District stunting, wasting, and anemia statistics are extracted directly from official National Family Health Survey (NFHS-5, 2019–2021) factsheets published by the Ministry of Health & Family Welfare, Government of India.

---

## 9. License & Attribution

This project is licensed under the **MIT License**.
Original source components created by Dishank Sen:
- Anya: [https://github.com/Dishank-Sen/Anya](https://github.com/Dishank-Sen/Anya)
- ReRoute: [https://github.com/Dishank-Sen/ReRoute](https://github.com/Dishank-Sen/ReRoute)
See [ATTRIBUTION.md](./ATTRIBUTION.md) for full notices.

# Sociothon: Unified Nutrition Intelligence & Surplus Food Redistribution Platform

> An autonomous end-to-end integration of **Anya** (India's Nutrition Intelligence Copilot) and **ReRoute** (Intelligent Food Recovery & Logistics Network) into one unified, full-stack platform for the **Sociothon Hackathon**.

[![Node.js](https://img.shields.io/badge/Node.js-24%2B-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-15%2F15%20Passing-emerald.svg)]()
[![NFHS-5 Verified](https://img.shields.io/badge/Data%20Source-NFHS--5%20Factsheets-orange.svg)]()

---

## 1. Product Objective & Inspiration

India produces ample calories to nourish its entire population, yet faces a staggering paradox:
- **78 Million Tonnes** of food are wasted annually across India (UNEP Food Waste Index 2024 / NABCONS 2022).
- Concurrently, **194 Million citizens** experience undernourishment, **35.5% of children under 5 are stunted**, and **57% of women are anemic**, placing India at rank 102/123 in the 2025 Global Hunger Index.

Traditional food redistribution treats all food and all recipients identically: meals are dispatched purely by nearest distance without considering whether the food addresses local micro-nutrient crises. Meanwhile, nutrition policies operate in static silos, disconnected from daily ground-level surplus availability.

**This platform bridges that critical gap:**
```text
Nutrition Data (NFHS-5) 
  → Nutrition Risk Analysis (Stunting, Wasting, Micronutrients) 
  → Geographic Prioritization (Aspirational Districts) 
  → Food Surplus Registration (Donors, Storage, Deadlines) 
  → Nutrition-Aware NGO Matching (Vulnerability + Synergy Scoring) 
  → Route Planning (Earliest-Expiry First, Fleet Circuity) 
  → Delivery Tracking (State Machine: Assigned → In Transit → Delivered) 
  → Verified Impact Dashboard (CO₂ Averted, Water Conserved, GHI Metrics)
```

---

## 2. Reused Components & Source Attribution

This repository integrates and enhances codebases from two public repositories by **Dishank Sen**:
- **Anya**: [https://github.com/Dishank-Sen/Anya](https://github.com/Dishank-Sen/Anya)
- **ReRoute**: [https://github.com/Dishank-Sen/ReRoute](https://github.com/Dishank-Sen/ReRoute)

See [ATTRIBUTION.md](./ATTRIBUTION.md) for full notices.

### Component Provenance
| System | Reused Source Component | Purpose in Unified Platform |
|---|---|---|
| **Anya** | Verified NFHS-5 District Factsheets (`districts.json`) | Provides real clinical survey metrics (stunting, wasting, child/women anemia) across top aspirational districts (Pashchimi Singhbhum, Nandurbar, Bahraich, Alirajpur, etc.). |
| **Anya** | Fortification Vehicle Optimizer (`fortification_vehicles.json`) | Linear-programming inspired vehicle selection (PDS Rice, Anganwadi THR, Double Fortified Salt, PDS Oil) maximizing deficiency reduction per rupee. |
| **Anya** | Culturally-Aware Meal Generation (`cultural_rules.json`, `food_composition.json`) | 7-day family meal schedules respecting 9 religious/cultural dietary frameworks and ICMR/WHO RDA bioavailability rules. |
| **Anya** | Standalone Python Service (`python_service/`) | Preserved independent FastAPI microservice for standalone evaluation. |
| **ReRoute** | Food Surplus & Donor Data Models | Standardized donation schema capturing donors, food categories, dietary types, portions, weight, and expiry deadlines. |
| **ReRoute** | Fleet Routing & Scheduling Engine | Earliest-deadline-first routing, vehicle capacity constraints, and Haversine distance calculations with realistic road network circuity (1.35x). |
| **ReRoute** | K-Medoids Consolidation Hubs | Optimization clustering food donors into central collection nodes. |
| **ReRoute** | India Food Waste Crisis Dataset (`india_food_waste_dashboard_data.json`) | Real-time live waste counter, UNEP 2024 / NABCONS 2022 benchmarks, and GHI historical trends (2000–2025). |

---

## 3. Core Architectural Integration: Nutrition-Aware Matching

The intellectual core of this unified platform is the **Nutrition-Aware Matching Engine** (`server/services/matchingService.ts`):

### A. Strict Feasibility (Hard Constraints)
Every match must satisfy all strict operational safety constraints before scoring:
1. Recipient NGO is active.
2. Dietary compatibility (e.g. strict vegetarian recipients never receive non-vegetarian donations).
3. Food category acceptance.
4. NGO open capacity $\ge$ donation meal quantity.
5. Transit distance $\le$ NGO service radius.
6. Storage compatibility (e.g. food requiring cold storage or hot holding only dispatched to equipped facilities).
7. Transport vehicle available in NGO fleet.
8. Estimated Arrival Time (ETA) < remaining safe-consumption deadline.

### B. Transparent Multi-Factor Soft Scoring (100 Points Total)
Feasible recipients are ranked using a transparent formula:
- **Geographic Nutrition Vulnerability (25 pts)**: Awarded based on the recipient district's NFHS-5 clinical severity. Critical districts (child stunting $\ge 50\%$ or anemia $\ge 60\%$) receive maximum 25 points.
- **Nutrient-to-Deficiency Synergy (15 pts)**: Evaluates whether the donation's nutritional profile directly counteracts the local community's primary deficiency (e.g., iron-rich pulses/cooked meals dispatched to high-anemia districts).
- **Distance & Travel Time Efficiency (20 pts)**: Linear penalty prioritizing local deliveries to minimize transit degradation and vehicle emissions.
- **Capacity Match & Absorption (15 pts)**: Optimizes utilization without overwhelming the NGO.
- **NGO Historical Reliability (15 pts)**: Track record of successful completed redistributions.
- **Safe-Consumption Urgency Boost (10 pts)**: Prioritizes rapidly expiring cooked items.

### C. Plain-English Explainability
Every recommendation returns an itemized score breakdown and clear rationale explaining to dispatchers *why* an NGO was selected.

---

## 4. Technology Stack & Design Decisions

- **Unified Backend**: Node.js 24 with native TypeScript execution (`--experimental-strip-types`) and Express.
  - Zero external database dependencies: file-backed ACID store (`server/db/store.ts`) ensuring donations, dispatches, and delivery states persist across restarts without requiring Docker or PostgreSQL containers.
- **Unified Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, and Leaflet mapping.
- **Dual Runtime Support**: Anya's original Python FastAPI service is preserved in `python_service/` and can be run concurrently or independently.

---

## 5. Quickstart & Installation

### Prerequisites
- **Node.js 20+** (tested on Node.js v24)
- **npm** (comes with Node.js)
- **Python 3.10+** (optional, for standalone `python_service`)

### Installation
```bash
# 1. Clone repository
git clone https://github.com/ch-s-h-04/Sociothon-Nutrition-Food-Redistribution.git
cd Sociothon-Nutrition-Food-Redistribution

# 2. Install dependencies
npm install

# 3. Build production frontend bundle
npm run build

# 4. Start unified server
npm start
```

The application will start at:
- **Unified Web Application**: `http://localhost:5000`
- **Health Check Endpoint**: `http://localhost:5000/api/health`

### Development Mode
```bash
# Run Vite client dev server with API proxying
npm run dev
```

### Running Automated Test Suite
```bash
npm test
```
Runs 15 automated test suites covering nutrition factsheets, matching constraints, fleet routing, donation persistence, and the complete end-to-end integration workflow.

---

## 6. Demonstration Sequence for Sociothon Judges

To experience the platform's complete workflow during evaluation:

1. **Launch the Application**: Open `http://localhost:5000` in your browser.
2. **Open "Guided Hackathon Demo" (Tab 1)**: Click through the 7-stage interactive tour specifically designed for judges.
3. **Stage 1 (Nutrition Intelligence)**:
   - Select **Nandurbar** (Rank #5).
   - Review NFHS-5 factsheet indicators: 60.6% child stunting, 62.6% child anemia, and 68% Iron deficiency.
   - Click **"Target Food Redistribution"**.
4. **Stage 2 (Surplus Registration)**:
   - Notice the form pre-filled for Nandurbar.
   - Review quantity: 60 meals (22.8 kg), hot holding requirement, 2.5 hr deadline.
   - Click **"Confirm Surplus Listing"**.
5. **Stage 3 (Smart NGO Matching)**:
   - View algorithmic matching results.
   - Inspect **Asha Poshan Collective**: ranked #1 with score **92.9/100**.
   - Note the score breakdown: +25pts nutrition vulnerability, +15pts iron deficiency synergy.
   - Click **"Assign Donation & Dispatch Route"**.
6. **Stage 4 (Fleet Routing)**:
   - View vehicle **V-N01** schedule with 1.35x road circuity distance and verified deadline compliance.
7. **Stage 5 (Delivery Tracking)**:
   - Click **"Start Transit / Picked Up"** to advance state to "In Transit".
   - Click **"Confirm Handover & Deliver"** to mark complete.
8. **Stage 6 (Impact & The Paradox)**:
   - Watch the completed delivery reflect in verified operational metrics: meals delivered, CO₂ averted, water conserved, and economic value preserved.
   - Observe the live estimated 2026 India food waste counter ticking in real time.
9. **Stage 7 (Fortification & Meal Planner)**:
   - Inspect Anya's linear-programming fortification strategy and 7-day culturally-appropriate family meal schedules.

---

## 7. Automated Test Results

```text
> sociothon-nutrition-food-redistribution@1.0.0 test
> node --test tests/**/*.test.mjs

✔ End-to-End Workflow: Nutrition Data -> Risk Prioritization -> Surplus Registration -> Smart Matching -> Route Planning -> Delivery -> Impact Reflection
✔ Matching: Haversine distance is non-negative and symmetric
✔ Matching: Travel time calculation incorporates road factor and speed model
✔ Matching: evaluateNutritionSynergy boosts iron/protein foods for vulnerable districts
✔ Matching: findNGORecommendations enforces constraints and ranks top recipient
✔ Nutrition: getRiskLevel categorizes percentages properly
✔ Nutrition: getAllDistrictSummaries returns verified NFHS-5 factsheet districts
✔ Nutrition: getDistrictById returns full micronutrient profile and provenance
✔ Nutrition: optimizeFortification calculates cost-effective food vehicle allocation
✔ Nutrition: generateCulturallyAwareMealPlan respects cultural dietary constraints
✔ Routing: generateInterpolatedWaypoints produces valid coordinate paths
✔ Routing: optimizeFleetRoutes respects vehicle capacities and deadline feasibility
✔ Routing: optimizeHubLocations selects medoids among donor locations
✔ Surplus: calculateFoodWeightKg converts standard meals to kilograms
✔ Surplus: CRUD lifecycle maintains persistent records and status transitions

ℹ tests 15
ℹ pass 15
ℹ fail 0
ℹ duration_ms 301.2ms
```

---

## 8. Data Provenance & Methodology Distinctions

In adherence to scientific integrity standards:
1. **Empirical Health Statistics**: All district stunting, wasting, anemia, and poverty statistics are sourced directly from verified National Family Health Survey (NFHS-5, 2019–2021) district factsheets published by the Ministry of Health & Family Welfare, Government of India.
2. **National Food Waste Baselines**: Macro benchmarks (78 MT/yr, 1.05 billion tonnes global waste, ₹1.52 lakh crore economic loss) cite the UNEP Food Waste Index Report 2024 and NABCONS 2022.
3. **Live Waste Tracker**: The ticking counter is a deterministic mathematical rate projection ($2474.89 \text{ kg/second}$) derived from the UNEP annual baseline, clearly labeled as an illustrative projection.
4. **Platform Environmental Accounting**:
   - CO₂ Averted: $2.5 \text{ kg CO}_2\text{e} / \text{kg food}$ (FAO/UNEP LCA standard).
   - Water Saved: $750 \text{ L} / \text{kg food}$ (Water Footprint Network agricultural average).
   - Economic Value: ₹65 / meal saved.

---

## 9. License & Attribution

This project is released under the **MIT License**.
Original source implementations by Dishank Sen:
- Anya: [https://github.com/Dishank-Sen/Anya](https://github.com/Dishank-Sen/Anya)
- ReRoute: [https://github.com/Dishank-Sen/ReRoute](https://github.com/Dishank-Sen/ReRoute)
See [ATTRIBUTION.md](./ATTRIBUTION.md) for detailed acknowledgements.

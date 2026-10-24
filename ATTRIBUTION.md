# Attribution and Source Provenance

This project integrates, expands, and connects components from two open-source hackathon repositories by Dishank Sen:

1. **Anya — India's Nutrition Copilot**
   - **Original Repository**: [https://github.com/Dishank-Sen/Anya](https://github.com/Dishank-Sen/Anya)
   - **Author**: Dishank Sen
   - **Reused Components**:
     - Verified National Family Health Survey (NFHS-5, 2019–2021) district factsheet dataset (`data/districts.json`)
     - Heuristic district-level nutrition risk scoring.
     - Standalone FastAPI nutrition-risk service in `python_service/`.

2. **ReRoute — Intelligent Food Recovery Network**
   - **Original Repository**: [https://github.com/Dishank-Sen/ReRoute](https://github.com/Dishank-Sen/ReRoute)
   - **Author**: Dishank Sen
   - **Reused Components**:
     - Food surplus models, donor profiles, and recipient NGO data models
     - Fleet routing logic (earliest-expiry-first scheduling, vehicle capacity constraints, time windows)
     - Haversine distance and k-medoids hub clustering algorithms
     - India Food Waste Crisis dataset (`india_food_waste_dashboard_data.json`) incorporating UNEP Food Waste Index 2024 and NABCONS 2022 research
     - Interactive operational simulation models

---

### Core Integration & Novel Contributions in this Unified Project

This Sociothon unified platform creates a direct operational bridge between Nutrition Intelligence and Surplus Redistribution:
1. **Nutrition-Aware NGO Matching Engine**: Enhances pure proximity/capacity matching by incorporating district-level malnutrition urgency and food-to-deficiency micronutrient synergies.
2. **Normalized Cross-Domain Schema**: Unifies geographic identifiers, food classification, and storage handling across both systems.
3. **Deterministic Persistent Store**: Local ACID-compliant file-backed database ensuring persistence of donations, recipient assignments, and multi-stage delivery lifecycles without requiring external Docker/PostgreSQL containers.
4. **Unified Operations & Impact Dashboard**: Aggregates real-time surplus recovery with macro-level hunger indicators and environmental offset accounting.
5. **Interactive End-to-End Walkthrough Wizard**: Step-by-step hackathon judge demonstration flow.

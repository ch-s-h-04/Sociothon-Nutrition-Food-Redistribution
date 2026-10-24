"""
Anya — India's Nutrition Copilot
FastAPI Backend — Main Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from services.risk_predictor import predict_district, get_all_district_summaries
from services.ai_district_analyzer import analyze_district_with_ai

# In-memory store for AI-generated districts (session-scoped)
ai_districts: dict = {}

app = FastAPI(
    title="Anya — India's Nutrition Copilot API",
    description="AI-powered nutrition risk prediction for India",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────

class AnalyzeDistrictRequest(BaseModel):
    district_name: str
    state_name: Optional[str] = ""


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "name": "Anya — India's Nutrition Copilot",
        "tagline": "Predict. Prioritize. Support.",
        "version": "1.0.0",
        "endpoints": {
            "districts": "GET /api/districts",
            "predict": "GET /api/predict/{district_id}"
        }
    }


@app.get("/api/districts")
def list_districts():
    """
    Get all districts with risk summary scores.
    Returns districts sorted by overall risk (worst first).
    """
    summaries = get_all_district_summaries()
    return {
        "total": len(summaries),
        "districts": summaries,
        "metadata": {
            "data_source": "NFHS-5 (National Family Health Survey, 2019-21)",
            "model": "XGBoost + LSTM Ensemble Prediction",
            "last_updated": "2026-03"
        }
    }


@app.get("/api/predict/{district_id}")
def predict(district_id: str):
    """
    Get full micronutrient deficiency risk prediction for a district.
    Returns per-nutrient risk scores, trends, causes, and confidence intervals.
    """
    clean_id = district_id.lower().replace(" ", "_").replace("-", "_")
    
    # Check if this district was AI-generated during this session
    if clean_id in ai_districts:
        # We need to format the raw AI generated dict similar to how `predict_district` formats it.
        # However, the AI district analyzer output schema might already match the frontend expected format or the raw district.json format.
        # Let's import the formatter from risk_predictor
        from services.risk_predictor import format_prediction_response
        return format_prediction_response(ai_districts[clean_id])

    result = predict_district(clean_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"District '{district_id}' not found")
    return result


@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "Anya Nutrition API"}


# ── AI Custom District Endpoints ─────────────────────────────────────────────

@app.post("/api/analyze-district")
async def analyze_district(request: AnalyzeDistrictRequest):
    """
    Use Azure OpenAI grok-4-fast-reasoning to analyze a custom district not in our database.
    Returns a full nutrition profile matching the same schema as built-in districts.
    """
    key = request.district_name.lower().replace(" ", "_")
    if key in ai_districts:
        return {"district": ai_districts[key], "cached": True}

    try:
        district_data = await analyze_district_with_ai(
            district_name=request.district_name,
            state_name=request.state_name or ""
        )
        ai_districts[key] = district_data
        return {"district": district_data, "cached": False}
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")


@app.get("/api/geocode")
async def geocode_district(q: str):
    """
    Forward geocoding via Nominatim (OpenStreetMap) — free, no API key.
    Returns candidates with lat/lng for district search.
    """
    import httpx
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{q}, India",
        "format": "json",
        "limit": 5,
        "countrycodes": "in",
        "addressdetails": 1,
    }
    headers = {"User-Agent": "Anya-NutritionCopilot/1.0"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, params=params, headers=headers)
        resp.raise_for_status()
    results = resp.json()
    return {
        "results": [
            {
                "display_name": r.get("display_name", ""),
                "name": r.get("address", {}).get("county") or r.get("address", {}).get("state_district") or r.get("name", q),
                "state": r.get("address", {}).get("state", ""),
                "lat": float(r["lat"]),
                "lng": float(r["lon"]),
            }
            for r in results
        ]
    }


@app.get("/api/ai-districts")
def get_ai_districts():
    """Return all AI-generated districts added in this session."""
    return {"districts": list(ai_districts.values())}

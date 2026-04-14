"""Prediction service — computes success probability.

This service uses a deterministic formula to evaluate psychological signals
and predict the likelihood of candidate success and associated risk.
"""

def predict(scores: dict) -> dict:
    """
    Core prediction function.
    
    Args:
        scores: Dict containing confidence, motivation, clarity, and emotional_stability (0-100).
        
    Returns:
        Dict with success_probability and risk level.
    """
    # 1. Extract scores with fallbacks
    c = scores.get("confidence", 50.0)
    m = scores.get("motivation", 50.0)
    cl = scores.get("clarity", 50.0)
    es = scores.get("emotional_stability", 50.0)

    # 2. Weighted Calculation (Simple version)
    # Weights: 25% each
    success_probability = (0.25 * c) + (0.25 * m) + (0.25 * cl) + (0.25 * es)
    success_probability = round(max(0.0, min(100.0, success_probability)), 1)

    # 3. Categorize Risk
    # Higher success = lower risk
    if success_probability >= 75:
        risk = "Low"
    elif success_probability >= 45:
        risk = "Medium"
    else:
        risk = "High"

    return {
        "success_probability": success_probability,
        "risk": risk
    }

class PredictionService:
    """Stateless service for success prediction compatibility."""

    async def predict(self, session_id: str, **scores) -> dict:
        """Compatibility wrapper for the core predict function."""
        result = predict(scores)
        result["session_id"] = session_id
        return result

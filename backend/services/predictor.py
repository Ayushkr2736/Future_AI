"""Prediction engine — Calculates success probability and risk level from analysis scores."""

def predict(scores: dict) -> dict:
    """Calculate success probability and risk based on analysis scores.
    
    Args:
        scores: A dictionary containing confidence, motivation, clarity, and emotional_stability.
        Values are expected to be in the range 0-100 or 0-1.
    """
    # Normalize scores to 0-1 if they are in 0-100 range
    def normalize(val):
        return val / 100.0 if val and val > 1.0 else (val or 0)

    # Convert everything to 0.0 - 1.0
    c = normalize(scores.get("confidence", 0))
    m = normalize(scores.get("motivation", 0))
    cl = normalize(scores.get("clarity", 0))
    e = normalize(scores.get("emotional_stability", 0))

    # Weight-based success formula
    success = (0.25 * c + 0.25 * m + 0.25 * cl + 0.25 * e)

    # Determine risk level
    risk = "low" if success > 0.7 else "medium" if success > 0.4 else "high"

    return {
        "success_probability": round(success * 100, 2),
        "risk_level": risk
    }

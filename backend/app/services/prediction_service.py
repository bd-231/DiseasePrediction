"""Disease prediction and medicine recommendation service."""
import joblib
import pandas as pd
import numpy as np
from app.config import settings

# Module-level globals loaded at startup
disease_model = None
feature_cols = None
idx_to_disease = None
drug_regressor = None
drug_label_encoder = None
cond_label_encoder = None
drug_stats_primary = None
drug_stats_fallback = None
disease_to_condition = None

def load_models():
    """Load all ML models and data files into memory. Called on app startup."""
    global disease_model, feature_cols, idx_to_disease
    global drug_regressor, drug_label_encoder, cond_label_encoder
    global drug_stats_primary, drug_stats_fallback, disease_to_condition

    print("Loading disease prediction model...")
    disease_model = joblib.load(settings.MODEL_DIR / "best_disease_model.pkl")
    feature_cols = joblib.load(settings.MODEL_DIR / "feature_cols.pkl")

    label_map = pd.read_csv(settings.DATA_DIR / "label_map.csv")
    idx_to_disease = dict(zip(label_map["encoded"], label_map["label"]))

    import os
    if os.getenv("RENDER") == "true" or os.getenv("LOW_MEMORY") == "true":
        print("Skipping heavy drug recommendation models due to memory constraints...")
    else:
        print("Loading drug recommendation model...")
        drug_regressor = joblib.load(settings.MODEL_DIR / "drug_rf_regressor.pkl")
        drug_label_encoder = joblib.load(settings.MODEL_DIR / "drug_label_encoder.pkl")
        cond_label_encoder = joblib.load(settings.MODEL_DIR / "cond_label_encoder.pkl")

    drug_stats_primary = pd.read_csv(settings.DATA_DIR / "drug_stats.csv")
    drug_stats_fallback = pd.read_csv(settings.DATA_DIR / "drug_stats_fallback.csv")

    mapping = pd.read_csv(settings.DATA_DIR / "disease_condition_map.csv")
    disease_to_condition = dict(zip(mapping["disease"], mapping["drug_condition"]))

    print(f"Models loaded: {len(feature_cols)} features, {len(idx_to_disease)} diseases, "
          f"{len(drug_stats_primary)} primary drugs, {len(drug_stats_fallback)} fallback drugs")

def get_symptom_list() -> list[str]:
    """Return the list of all valid symptom names."""
    return list(feature_cols) if feature_cols is not None else []

def predict_disease(symptoms: list[str]) -> tuple[str, float]:
    """Predict disease from symptom list. Returns (disease_name, confidence)."""
    symptom_set = set(symptoms)
    x = np.array([1 if c in symptom_set else 0 for c in feature_cols]).reshape(1, -1)
    enc_pred = disease_model.predict(x)[0]
    disease = idx_to_disease[int(enc_pred)]
    probas = disease_model.predict_proba(x)[0]
    confidence = float(max(probas))
    return disease, round(confidence, 4)

def recommend_medicines(
    predicted_disease: str,
    allergies: list[str] | None = None,
    current_medications: list[str] | None = None,
    top_n: int = 5,
    alpha: float = 0.7,
) -> list[dict]:
    """Recommend top-N medicines for the predicted disease.
    
    Uses the drug RF regressor to predict ratings, then combines with avg_rating
    using: final_score = alpha * predicted_rating + (1-alpha) * avg_rating
    """
    condition = disease_to_condition.get(predicted_disease)
    if condition is None:
        return []

    # Try primary stats (min_reviews=5), then fallback (min_reviews=3)
    candidates = None
    for stats_df in [drug_stats_primary, drug_stats_fallback]:
        cands = stats_df[stats_df["condition"] == condition].copy()
        if cands.empty:
            # Fuzzy match as fallback
            mask = stats_df["condition"].str.lower().str.contains(
                condition.lower(), na=False
            )
            cands = stats_df[mask].copy()
        if not cands.empty:
            candidates = cands
            break

    if candidates is None or candidates.empty:
        return []

    if drug_regressor is not None:
        # Encode drug and condition for the regressor
        candidates["drug_enc"] = candidates["drugName"].apply(
            lambda x: (
                drug_label_encoder.transform([x])[0]
                if x in drug_label_encoder.classes_
                else -1
            )
        )
        candidates["cond_enc"] = candidates["condition"].apply(
            lambda x: (
                cond_label_encoder.transform([x])[0]
                if x in cond_label_encoder.classes_
                else -1
            )
        )

        # Feature vector matches training: [drug_enc, cond_enc, log_useful, avg_rating, log_review_count]
        X_cand = candidates[
            ["drug_enc", "cond_enc", "log_useful", "avg_rating", "log_review_count"]
        ].values
        candidates["predicted_rating"] = drug_regressor.predict(X_cand)

        # Weighted ranking score
        candidates["final_score"] = (
            alpha * candidates["predicted_rating"] + (1 - alpha) * candidates["avg_rating"]
        )
    else:
        # Low-memory fallback: Use historical average ratings directly
        candidates["predicted_rating"] = candidates["avg_rating"]
        candidates["final_score"] = candidates["avg_rating"]

    # Filter out drugs matching patient allergies
    if allergies:
        allergy_lower = [a.strip().lower() for a in allergies if a.strip()]
        if allergy_lower:
            candidates = candidates[
                ~candidates["drugName"].str.lower().isin(allergy_lower)
            ]

    # Sort by final score and take top N
    top = candidates.sort_values("final_score", ascending=False).head(top_n)

    results = []
    med_lower = (
        [m.strip().lower() for m in current_medications if m.strip()]
        if current_medications
        else []
    )
    for _, row in top.iterrows():
        med = {
            "drugName": row["drugName"],
            "condition": row["condition"],
            "avg_rating": round(float(row["avg_rating"]), 2),
            "review_count": int(row["review_count"]),
            "predicted_rating": round(float(row["predicted_rating"]), 2),
            "final_score": round(float(row["final_score"]), 2),
            "conflict_flag": row["drugName"].lower() in med_lower,
        }
        results.append(med)

    return results

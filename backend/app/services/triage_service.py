"""Symptom triage service - severity scoring and dangerous combination detection."""

SYMPTOM_SEVERITY = {
    "itching": 2, "skin_rash": 3, "nodal_skin_eruptions": 4, "continuous_sneezing": 3,
    "shivering": 4, "chills": 4, "joint_pain": 5, "stomach_pain": 5, "acidity": 3,
    "ulcers_on_tongue": 4, "muscle_wasting": 6, "vomiting": 5, "burning_micturition": 4,
    "spotting_ urination": 5, "fatigue": 4, "weight_gain": 3, "anxiety": 4,
    "cold_hands_and_feets": 3, "mood_swings": 3, "weight_loss": 5, "restlessness": 4,
    "lethargy": 4, "patches_in_throat": 5, "irregular_sugar_level": 6, "cough": 3,
    "high_fever": 7, "sunken_eyes": 5, "breathlessness": 9, "sweating": 3,
    "dehydration": 6, "indigestion": 3, "headache": 5, "yellowish_skin": 6,
    "dark_urine": 5, "nausea": 4, "loss_of_appetite": 4, "pain_behind_the_eyes": 5,
    "back_pain": 4, "constipation": 3, "abdominal_pain": 5, "diarrhoea": 4,
    "mild_fever": 4, "yellow_urine": 4, "yellowing_of_eyes": 6,
    "acute_liver_failure": 10, "swelling_of_stomach": 6, "swelled_lymph_nodes": 5,
    "malaise": 4, "blurred_and_distorted_vision": 6, "phlegm": 3, "throat_irritation": 3,
    "redness_of_eyes": 3, "sinus_pressure": 4, "runny_nose": 2, "congestion": 3,
    "chest_pain": 9, "weakness_in_limbs": 6, "fast_heart_rate": 7,
    "pain_during_bowel_movements": 4, "pain_in_anal_region": 4, "bloody_stool": 7,
    "irritation_in_anus": 3, "neck_pain": 4, "dizziness": 5, "cramps": 4,
    "bruising": 4, "obesity": 4, "swollen_legs": 5, "swollen_blood_vessels": 5,
    "puffy_face_and_eyes": 4, "enlarged_thyroid": 6, "brittle_nails": 3,
    "swollen_extremeties": 5, "excessive_hunger": 4, "extra_marital_contacts": 3,
    "drying_and_tingling_lips": 3, "slurred_speech": 8, "knee_pain": 4,
    "hip_joint_pain": 5, "muscle_weakness": 5, "stiff_neck": 5, "swelling_joints": 5,
    "movement_stiffness": 5, "spinning_movements": 6, "loss_of_balance": 8,
    "unsteadiness": 6, "weakness_of_one_body_side": 8, "loss_of_smell": 4,
    "bladder_discomfort": 4, "foul_smell_of urine": 4, "continuous_feel_of_urine": 4,
    "passage_of_gases": 2, "internal_itching": 3, "toxic_look_(typhos)": 7,
    "depression": 5, "irritability": 3, "muscle_pain": 4, "altered_sensorium": 8,
    "red_spots_over_body": 4, "belly_pain": 5, "abnormal_menstruation": 4,
    "dischromic _patches": 3, "watering_from_eyes": 2, "increased_appetite": 3,
    "polyuria": 5, "family_history": 3, "mucoid_sputum": 4, "rusty_sputum": 6,
    "lack_of_concentration": 4, "visual_disturbances": 6,
    "receiving_blood_transfusion": 5, "receiving_unsterile_injections": 5, "coma": 10,
    "stomach_bleeding": 9, "distention_of_abdomen": 5,
    "history_of_alcohol_consumption": 4, "fluid_overload.1": 6, "blood_in_sputum": 7,
    "prominent_veins_on_calf": 4, "palpitations": 6, "painful_walking": 4,
    "pus_filled_pimples": 3, "blackheads": 2, "scurring": 3, "skin_peeling": 3,
    "silver_like_dusting": 3, "small_dents_in_nails": 3, "inflammatory_nails": 3,
    "blister": 4, "red_sore_around_nose": 3, "yellow_crust_ooze": 3,
}

DANGEROUS_COMBINATIONS = [
    {"chest_pain", "breathlessness"},
    {"coma"},
    {"loss_of_consciousness"},
    {"stomach_bleeding", "vomiting"},
    {"paralysis_(brain_hemorrhage)", "weakness_of_one_body_side"},
]

def calculate_severity_index(symptoms: list[str]) -> float:
    if not symptoms:
        return 0.0
    total = sum(SYMPTOM_SEVERITY.get(s, 3) for s in symptoms)
    return round(total / len(symptoms), 2)

def detect_dangerous_combinations(symptoms: list[str]) -> bool:
    symptom_set = set(symptoms)
    for combo in DANGEROUS_COMBINATIONS:
        if combo.issubset(symptom_set):
            return True
    return False

def assign_priority(severity_index: float, dangerous_detected: bool) -> str:
    if dangerous_detected:
        return "critical"
    if severity_index >= 7.5:
        return "critical"
    if severity_index >= 5.5:
        return "high"
    if severity_index >= 3.5:
        return "medium"
    return "low"

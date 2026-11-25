"""
Fertilizer recommendation service based on soil analysis
"""

def get_fertilizer_recommendation(pH, N, P, K, crop=""):
    """
    Get fertilizer recommendations based on soil analysis
    
    Args:
        pH: Soil pH value
        N: Nitrogen level (low/medium/high or numeric)
        P: Phosphorus level (low/medium/high or numeric)
        K: Potassium level (low/medium/high or numeric)
        crop: Optional crop name
    
    Returns:
        dict: {'marathi': str, 'english': str, 'soil_condition': str, 'recommendations': list}
    """
    try:
        # Convert string levels to numeric if needed
        n_level = _convert_to_numeric(N)
        p_level = _convert_to_numeric(P)
        k_level = _convert_to_numeric(K)
        
        recommendations = []
        soil_condition = ""
        
        # pH-based recommendations
        if pH < 5.5:
            soil_condition = "अम्लीय माती (Acidic Soil)"
            recommendations.extend([
                "चुना किंवा डोलोमाइट वापरा",
                "सेंद्रिय खत जोडा",
                "अमोनियम सल्फेट टाळा"
            ])
        elif pH > 7.5:
            soil_condition = "क्षारीय माती (Alkaline Soil)"
            recommendations.extend([
                "जिप्सम किंवा सल्फर वापरा",
                "अमोनियम सल्फेट प्राधान्य द्या",
                "सेंद्रिय खत वापरा"
            ])
        else:
            soil_condition = "संतुलित माती (Balanced Soil)"
            recommendations.append("सामान्य NPK खत वापरा")
        
        # NPK-based recommendations
        if n_level < 2:  # Low nitrogen
            recommendations.append("युरिया किंवा सेंद्रिय नायट्रोजन जोडा")
        if p_level < 2:  # Low phosphorus
            recommendations.append("SSP किंवा DAP वापरा")
        if k_level < 2:  # Low potassium
            recommendations.append("MOP (म्युरेट ऑफ पोटॅश) वापरा")
        
        # Crop-specific recommendations
        if crop:
            crop_recs = _get_crop_specific_recommendations(crop, pH, n_level, p_level, k_level)
            recommendations.extend(crop_recs)
        
        # Generate bilingual text
        marathi_text = f"मातीची स्थिती: {soil_condition}\n\n"
        marathi_text += "शिफारसी:\n"
        for i, rec in enumerate(recommendations[:5], 1):  # Top 5 recommendations
            marathi_text += f"{i}. {rec}\n"
        
        english_text = f"Soil Condition: {soil_condition}\n\n"
        english_text += "Recommendations:\n"
        for i, rec in enumerate(recommendations[:5], 1):
            english_text += f"{i}. {rec}\n"
        
        return {
            'marathi': marathi_text,
            'english': english_text,
            'soil_condition': soil_condition,
            'recommendations': recommendations
        }
        
    except Exception as e:
        print(f"Error in fertilizer recommendation: {e}")
        return {
            'marathi': "माफ करा, खताची शिफारस देऊ शकत नाही.",
            'english': "Sorry, cannot provide fertilizer recommendations.",
            'soil_condition': "Unknown",
            'recommendations': []
        }

def _convert_to_numeric(level):
    """Convert string level to numeric value"""
    if isinstance(level, (int, float)):
        return level
    
    level_str = str(level).lower()
    if level_str in ['low', 'कमी', '1']:
        return 1
    elif level_str in ['medium', 'मध्यम', '2']:
        return 2
    elif level_str in ['high', 'जास्त', '3']:
        return 3
    else:
        return 2  # Default to medium

def _get_crop_specific_recommendations(crop, pH, N, P, K):
    """Get crop-specific fertilizer recommendations"""
    crop_lower = crop.lower()
    recommendations = []
    
    # Rice recommendations
    if 'rice' in crop_lower or 'भात' in crop_lower or 'paddy' in crop_lower:
        if pH < 6:
            recommendations.append("भातासाठी चुना वापरा")
        recommendations.append("भातासाठी नायट्रोजन जास्त वापरा")
    
    # Wheat recommendations  
    elif 'wheat' in crop_lower or 'गहू' in crop_lower:
        if pH > 7:
            recommendations.append("गव्हासाठी जिप्सम वापरा")
        recommendations.append("गव्हासाठी फॉस्फरस जास्त वापरा")
    
    # Cotton recommendations
    elif 'cotton' in crop_lower or 'कापूस' in crop_lower:
        recommendations.append("कापसासाठी पोटॅश जास्त वापरा")
        if pH < 6:
            recommendations.append("कापसासाठी चुना वापरा")
    
    # Sugarcane recommendations
    elif 'sugarcane' in crop_lower or 'ऊस' in crop_lower:
        recommendations.append("ऊसासाठी नायट्रोजन जास्त वापरा")
        recommendations.append("ऊसासाठी पोटॅश जास्त वापरा")
    
    return recommendations



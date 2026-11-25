"""
Crop recommendation service based on soil conditions and season
"""

# Simple crop database
CROP_DATABASE = {
    'kharif': {
        'neutral': ['Soybean (सोयाबीन)', 'Cotton (कापूस)', 'Paddy (भात)', 'Maize (मका)'],
        'acidic': ['Rice (भात)', 'Sugarcane (ऊस)', 'Groundnut (भुईमूग)', 'Turmeric (हळद)'],
        'alkaline': ['Pearl Millet (बाजरी)', 'Sorghum (ज्वारी)', 'Groundnut (भुईमूग)', 'Sunflower (सूर्यफूल)']
    },
    'rabi': {
        'neutral': ['Wheat (गहू)', 'Chickpea (चणा)', 'Mustard (सरसों)', 'Barley (जव)'],
        'acidic': ['Potato (बटाटा)', 'Onion (कांदा)', 'Tomato (टोमॅटो)', 'Chili (मिरची)'],
        'alkaline': ['Wheat (गहू)', 'Barley (जव)', 'Gram (चणा)', 'Lentil (मसूर)']
    },
    'zaid': {
        'neutral': ['Cucumber (काकडी)', 'Bottle Gourd (लौकी)', 'Ridge Gourd (तुरई)', 'Bitter Gourd (करेला)'],
        'acidic': ['Tomato (टोमॅटो)', 'Chili (मिरची)', 'Brinjal (वांगी)', 'Okra (भेंडी)'],
        'alkaline': ['Watermelon (तरबूज)', 'Muskmelon (खरबूज)', 'Pumpkin (भोपळा)', 'Cucumber (काकडी)']
    }
}

def get_crop_recommendations(soil, season, region=""):
    """
    Get crop recommendations based on soil conditions and season
    
    Args:
        soil: dict with pH, N, P, K values
        season: 'kharif', 'rabi', or 'zaid'
        region: Optional region name
    
    Returns:
        dict: {'marathi': str, 'english': str, 'crops': list}
    """
    try:
        pH = soil.get('pH', 7)
        N = soil.get('N', 2)
        P = soil.get('P', 2)
        K = soil.get('K', 2)
        
        # Determine soil type based on pH
        if pH < 6.5:
            soil_type = 'acidic'
        elif pH > 7.5:
            soil_type = 'alkaline'
        else:
            soil_type = 'neutral'
        
        # Get crops for the season and soil type
        available_crops = CROP_DATABASE.get(season, {}).get(soil_type, [])
        
        # Filter crops based on NPK levels
        recommended_crops = _filter_crops_by_npk(available_crops, N, P, K)
        
        # Take top 3 recommendations
        top_crops = recommended_crops[:3]
        
        # Generate rationale
        rationale = _generate_crop_rationale(top_crops, pH, N, P, K, season)
        
        # Generate bilingual text
        marathi_text = f"हंगाम: {_get_season_name_marathi(season)}\n"
        marathi_text += f"मातीचा pH: {pH}\n\n"
        marathi_text += "शिफारस केलेली पिके:\n"
        for i, crop in enumerate(top_crops, 1):
            marathi_text += f"{i}. {crop}\n"
        marathi_text += f"\nकारण: {rationale['marathi']}\n"
        
        english_text = f"Season: {season.title()}\n"
        english_text += f"Soil pH: {pH}\n\n"
        english_text += "Recommended Crops:\n"
        for i, crop in enumerate(top_crops, 1):
            english_text += f"{i}. {crop}\n"
        english_text += f"\nRationale: {rationale['english']}\n"
        
        return {
            'marathi': marathi_text,
            'english': english_text,
            'crops': top_crops
        }
        
    except Exception as e:
        print(f"Error in crop recommendation: {e}")
        return {
            'marathi': "माफ करा, पिकाची शिफारस देऊ शकत नाही.",
            'english': "Sorry, cannot provide crop recommendations.",
            'crops': []
        }

def _filter_crops_by_npk(crops, N, P, K):
    """Filter crops based on NPK requirements"""
    # Simple filtering logic - in production, use more sophisticated matching
    filtered_crops = []
    
    for crop in crops:
        # High nitrogen crops
        if 'Rice' in crop or 'भात' in crop or 'Sugarcane' in crop or 'ऊस' in crop:
            if N >= 2:  # Medium to high nitrogen
                filtered_crops.append(crop)
        # High phosphorus crops
        elif 'Wheat' in crop or 'गहू' in crop or 'Potato' in crop or 'बटाटा' in crop:
            if P >= 2:  # Medium to high phosphorus
                filtered_crops.append(crop)
        # High potassium crops
        elif 'Cotton' in crop or 'कापूस' in crop or 'Sugarcane' in crop or 'ऊस' in crop:
            if K >= 2:  # Medium to high potassium
                filtered_crops.append(crop)
        else:
            # General crops - include if NPK levels are reasonable
            if N >= 1 and P >= 1 and K >= 1:
                filtered_crops.append(crop)
    
    return filtered_crops

def _generate_crop_rationale(crops, pH, N, P, K, season):
    """Generate rationale for crop recommendations"""
    rationale_parts = []
    
    # pH-based rationale
    if pH < 6.5:
        rationale_parts.append("अम्लीय मातीत या पिकांना चांगले वाढतात")
    elif pH > 7.5:
        rationale_parts.append("क्षारीय मातीत या पिकांना चांगले वाढतात")
    else:
        rationale_parts.append("संतुलित मातीत या पिकांना चांगले वाढतात")
    
    # Season-based rationale
    if season == 'kharif':
        rationale_parts.append("खरीप हंगामात पाऊस पडतो")
    elif season == 'rabi':
        rationale_parts.append("रबी हंगामात हिवाळा असतो")
    else:
        rationale_parts.append("जायद हंगामात उन्हाळा असतो")
    
    # NPK-based rationale
    if N >= 2:
        rationale_parts.append("नायट्रोजन पुरेसे आहे")
    if P >= 2:
        rationale_parts.append("फॉस्फरस पुरेसे आहे")
    if K >= 2:
        rationale_parts.append("पोटॅश पुरेसे आहे")
    
    marathi_rationale = " ".join(rationale_parts)
    english_rationale = "These crops are suitable for current soil and weather conditions."
    
    return {
        'marathi': marathi_rationale,
        'english': english_rationale
    }

def _get_season_name_marathi(season):
    """Get Marathi name for season"""
    season_names = {
        'kharif': 'खरीप',
        'rabi': 'रबी',
        'zaid': 'जायद'
    }
    return season_names.get(season, season)



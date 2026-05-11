import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_crop_growth_guide(crop_name: str, location_info: str = None):
    """
    Generates a detailed agricultural growth guide for a specific crop using Gemini AI.
    Handles potential model availability issues with a fallback mechanism.
    """
    
    prompt = f"""
    You are an expert agricultural advisor. Create a comprehensive, professional, and easy-to-follow growth guide for the crop: {crop_name}.
    
    {f"The user is located in: {location_info}." if location_info else ""}
    
    The guide should be structured with the following sections using clear headings:
    1. Introduction (Brief overview of the crop)
    2. Ideal Soil Conditions (pH, texture, nutrients)
    3. Climate & Temperature Requirements
    4. Sowing/Planting Instructions (Timing, depth, spacing)
    5. Water Management (Irrigation frequency)
    6. Fertilization Schedule
    7. Pest & Disease Management (Common issues and organic/chemical solutions)
    8. Harvesting & Storage
    
    Format the output in clean Markdown. Use bullet points and bold text for readability.
    Keep the tone professional yet encouraging for a farmer.
    """
    
    # List of models based on successful ListModels call for this API Key
    models_to_try = [
        'gemini-2.0-flash',      # Modern Flash
        'gemini-flash-latest',   # Latest Flash
        'gemini-pro-latest',     # Latest Pro
        'gemini-1.5-flash',      # Legacy Flash
    ]
    
    last_error = None
    for model_name in models_to_try:
        try:
            print(f"Attempting to generate with {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Failed to generate with {model_name}: {e}")
            last_error = e
            continue
            
    return f"Error: {last_error if last_error else 'Could not connect to Gemini API'}. Please try again later."

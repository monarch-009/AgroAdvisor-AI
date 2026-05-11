import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def generate_crop_growth_guide(crop_name: str, location_info: str = None):
    """
    Generates a detailed agricultural growth guide for a specific crop using Gemini AI.
    Dynamically identifies available models to avoid 404 errors.
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
    9. Video Tutorial (Include ONE specific line at the very end of your response):
       YT_SEARCH: [Search Query for this crop cultivation in India]
    
    Format the output in clean Markdown. Use bullet points and bold text for readability.
    Keep the tone professional yet encouraging for a farmer.
    """
    
    try:
        # Dynamically fetch available models to prevent 404 errors
        available_models = []
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    # Clean the model name (remove 'models/' prefix if present)
                    name = m.name.split('/')[-1]
                    available_models.append(name)
        except Exception as list_err:
            print(f"Could not list models: {list_err}")
            # Fallback to a safe default if listing fails
            available_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']

        # Prioritization: 1. Flash (Fast/High Quota), 2. Pro, 3. Anything else
        flash_models = [m for m in available_models if 'flash' in m.lower()]
        pro_models = [m for m in available_models if 'pro' in m.lower()]
        
        models_to_try = flash_models + pro_models + available_models
        # Remove duplicates while preserving order
        models_to_try = list(dict.fromkeys(models_to_try))

        last_error = "No supported models found"
        for model_name in models_to_try:
            try:
                print(f"Attempting to generate with available model: {model_name}...")
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                return response.text
            except Exception as e:
                print(f"Failed to generate with {model_name}: {e}")
                last_error = e
                continue
                
        return f"Error: {last_error}. Please try again later."
        
    except Exception as global_err:
        return f"System Error: {global_err}. Please check your GEMINI_API_KEY."

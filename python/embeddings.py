from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import time
from io import BytesIO  # For handling image data in memory
from PIL import Image   # For image processing (optional, can be installed via pip install Pillow)
import uuid             # For generating unique filenames

# Load environment variables
load_dotenv('.env.local')

# Connect to Supabase
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
# key: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4d3N3YXZnZWd1eHhiZmR3aHp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTgyNDM4NSwiZXhwIjoyMDI3NDAwMzg1fQ.xfcjFUhqE03ORC4-l3qb8Dp51Y9UynALSg26G_KWEoo'
print(f"Supabase URL: {url}")
supabase: Client = create_client(url, key)

# Set up OpenAI API
apiKey = os.getenv("OPENAI_API_KEY")
apiURL = ""
if (os.getenv("OPENAI_PROXY") == ""):
    apiURL = "https://api.openai.com"
else:
    apiURL = os.getenv("OPENAI_PROXY")

# Function to create content string
def serialize_content(content):
    # Create a text representation of the content object
    text_representation = f"{content['title']}. Ingredients: {', '.join(content['ingredient_lines'])}. "
    text_representation += f"Diet labels: {', '.join(content['diet_health_labels'])}. "
    text_representation += f"Cuisine: {', '.join(content['cuisine_type'])}. "
    text_representation += f"Meal types: {', '.join(content['meal_type'])}. "
    text_representation += f"Dish types: {', '.join(content['dish_type'])}."
    return text_representation

# Function to generate vector embeddings from content string
def generate_embedding(text):
    headers = {
        'Authorization': f'Bearer {apiKey}',
        'Content-Type': 'application/json',
    }
    data = {
        'input': text,
        'model': 'text-embedding-ada-002',
    }
    response = requests.post(f'{apiURL}/v1/embeddings', headers=headers, data=json.dumps(data))
    embeddingResponse = response.json()
    if 'data' not in embeddingResponse or not embeddingResponse['data']:
        print(f"Error generating embedding for text: {text}")
        print(f"Response: {embeddingResponse}")
        return None
    embedding = embeddingResponse['data'][0]['embedding']
    return embedding

class NutritionSubclass(BaseModel):
    nutrient: str
    label: str
    quantity: float
    daily: float
    unit: str

# Model for nutrition info
class NutritionInfo(BaseModel):
    nutrient: str
    label: str
    quantity: float
    daily: float
    unit: str
    sub: List[NutritionSubclass]

# Model for metadata
class RecipeMetadata(BaseModel):
    title: str
    image: str
    source: str
    source_url: str
    yields: int
    calories: float
    nutrition_info: List[NutritionInfo]

# Model for content to be embedded
class RecipeContent(BaseModel):
    title: str
    ingredient_lines: List[str]
    calories: float
    total_time: float
    diet_health_labels: List[str]
    cuisine_type: List[str]
    meal_type: List[str]
    dish_type: List[str]

# Function to process recipe into content and metadata
def process_recipe(recipe):
    # Handle cases where 'yield' is not an integer
    yields_value = recipe.get("yield", 1)  # Default to 1 if 'yield' is not present

    if isinstance(yields_value, float):
        yields_value = round(yields_value)

    content = RecipeContent(
        title=recipe["label"],
        ingredient_lines=recipe["ingredientLines"],
        calories=recipe["calories"],
        total_time=recipe["totalTime"],
        diet_health_labels=recipe["healthLabels"],
        cuisine_type=recipe.get("cuisineType", []),
        meal_type=recipe.get("mealType", []),
        dish_type=recipe.get("dishType", [])
    )

    metadata = RecipeMetadata(
        title=recipe["label"],
        image=recipe["image"],  # Will be updated after image is stored
        source=recipe["source"],
        source_url=recipe["url"],
        yields=yields_value,
        calories=recipe['calories'],
        nutrition_info=[
            NutritionInfo(
                nutrient=nutrient["label"],
                label=nutrient["tag"],
                quantity=nutrient["total"],
                daily=nutrient["daily"],
                unit=nutrient["unit"],
                sub = [
                    NutritionSubclass(
                        nutrient=sub_nutrient["label"],
                        label=sub_nutrient["tag"],
                        quantity=sub_nutrient["total"],
                        daily=sub_nutrient["daily"],
                        unit=sub_nutrient["unit"]
                    ) for sub_nutrient in nutrient.get("sub", []) 
                ] if nutrient["label"] in ["Carbs", "Fat"] else []
            ) for nutrient in recipe["digest"]
        ]
    )

    return content.dict(), metadata.dict()

# Load Edamam keys and define queries array
edamam_id: str = os.getenv("EDAMAM_APP_ID")
edamam_key: str = os.getenv("EDAMAM_APP_KEY")
queries = [
    "Vegan desserts",
    "Gluten-free breakfasts",
    "Italian pasta dishes",
    "Mexican street food",
    "French patisserie",
    "Chinese dim sum",
    "Indian vegetarian",
    "Japanese ramen",
    "Mediterranean salads",
    "Brazilian snacks",
    "Thai seafood",
    "Moroccan tagines",
    "Spanish tapas",
    "Greek gyros",
    "American barbecue",
    "Korean bibimbap",
    "Turkish kebabs",
    "British pies",
    "Caribbean jerk chicken",
    "Polish soups",
    "Egyptian ful medames",
    "Dutch stamppot",
    "Argentinian empanadas",
    "Ethiopian injera and stews",
    "Filipino adobo",
    "German sausages",
    "South African bunny chow",
    "Russian borscht",
    "Canadian poutine",
    "Vietnamese pho",
    "Low-carb lunches",
    "High-protein snacks",
    "Paleo-friendly dinners",
    "Kid-friendly meals",
    "Quick 20-minute dinners",
    "Slow cooker recipes",
    "Dairy-free baking",
    "Nut-free treats",
    "Festive holiday dishes",
    "Comfort food classics",
    "Seafood grills",
    "Vegan protein bowls",
    "Gluten-free pasta alternatives",
    "Breakfast smoothies",
    "Decadent chocolate desserts",
    "Cold summer soups",
    "Winter warmers",
    "Budget-friendly meals",
    "Fermented foods",
    "Raw food recipes"
]

# Function to make API call
def get_recipes(query):
    response = requests.get(
        'https://api.edamam.com/api/recipes/v2',
        params={
            'type': 'public',
            'q': query,
            'app_id': edamam_id,
            'app_key': edamam_key
        }
    )
    return response.json()

# Adjusted function to download and store the image
def download_and_store_image(image_url, image_name):
    try:
        image_response = requests.get(image_url)
        if image_response.status_code == 200:
            # Read the image content
            image_content = image_response.content

            # Upload the image to Supabase Storage
            supabase.storage.from_('images').upload(
                path=image_name,
                file=image_content,
                file_options={"content-type": "image/jpeg"}  # Set appropriate content type
            )

            public_url = supabase.storage.from_('images').get_public_url(image_name)
            return public_url
        else:
            print(f"Failed to download image from URL: {image_url}")
            return None
    except Exception as e:
        print(f"Exception occurred while downloading or storing image: {e}")
        return None

# Iterate over queries
for i, query in enumerate(queries):
    # Get recipes JSON
    print('Query #: ', i+1)
    recipes = get_recipes(query)

    # Generate embeddings for each recipe and insert data into Supabase
    hits = recipes.get("hits", [])
    for j, hit in enumerate(hits):
        recipe = hit["recipe"]
        content, metadata = process_recipe(recipe)

        # Download and store the image, and update the metadata
        original_image_url = metadata['image']
        # Generate a unique filename for the image
        image_extension = os.path.splitext(original_image_url)[1].split('?')[0]  # Get extension without query params
        unique_image_name = f"{uuid.uuid4()}{image_extension}"

        stored_image_url = download_and_store_image(original_image_url, unique_image_name)

        if stored_image_url:
            # Update metadata to point to the new image URL
            metadata['image'] = stored_image_url
        else:
            print(f"Using original image URL due to failure in storing: {original_image_url}")

        # Insert `content` and `metadata` into Supabase here
        content_text = serialize_content(content)
        embedding = generate_embedding(content_text)

        if not embedding:
            continue

        try:
            response = supabase.table("documents").insert([{
                "content": content_text,
                "embedding": embedding,
                "metadata": metadata
            }]).execute()
            print(f"Inserted recipe #{j+1} into the database.")
        except Exception as exception:
            print(f"Error in supabase response: {exception}")

        # Sleep briefly to respect API rate limits (optional)
        time.sleep(0.5)

    # Sleep for a while to avoid hitting API rate limits
    time.sleep(1)



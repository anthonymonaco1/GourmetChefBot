from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import os
from dotenv import load_dotenv
from supabase_py import create_client, Client
import time

# Load environment variables
load_dotenv('.env.local')

# Connect to Supabase
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ANON_KEY") 
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

# Model for nutrition info
class NutritionInfo(BaseModel):
    nutrient: str
    quantity: float
    unit: str
    daily_value_percentage: Optional[float] = None

# Model for metadata
class RecipeMetadata(BaseModel):
    source: str
    source_url: str
    yields: int
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
        source=recipe["source"],
        source_url=recipe["url"],
        yields=recipe["yield"],
        nutrition_info=[
            NutritionInfo(
                nutrient=key,
                quantity=value["quantity"],
                unit=value["unit"],
                daily_value_percentage=value.get("percentOfDailyNeeds")
            ) for key, value in recipe["totalNutrients"].items()
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

# Iterate over queries
for i, query in enumerate(queries):
    # Get recipes JSON
    print('Query #: ', i+1)
    recipes = get_recipes(query)

    # Generate embeddings for each recipe and insert data into Supabase
    hits = recipes["hits"]
    for i, hit in enumerate(hits):
        recipe = hit["recipe"]
        content, metadata = process_recipe(recipe)

        # Insert `content` and `metadata` into Supabase here
        content_text = serialize_content(content)
        embedding = generate_embedding(content_text)

        if not embedding:
            continue

        response = supabase.table("documents").insert([{
            "content": content_text,
            "embedding": embedding,
            "metadata": metadata
        }]).execute()

        if 'error' in response or 'data' not in response or not response['data']:
            print(f"Error inserting recipe into database")
            print(f"Response: {response}")
            continue

        print('Recipe #: ', i+1)

    # Sleep for a while to avoid hitting API rate limits
    time.sleep(1)



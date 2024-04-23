from pydantic import BaseModel
from typing import List, Optional
import json
import requests
import os
from dotenv import load_dotenv
from supabase_py import create_client, Client

# Load environment variables
load_dotenv('.env.local')

# print(os.getenv("NEXT_PUBLIC_SUPABASE_URL"))

# Connect to Supabase
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") 
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

# Load your recipes JSON
with open('chicken_recipes.json', 'r') as file:
    recipes = json.load(file)

# Generate embeddings for each recipe and insert data into Supabase
hits = recipes["hits"]
for i,hit in enumerate(hits):
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

    print('Entry #: ', i+1)



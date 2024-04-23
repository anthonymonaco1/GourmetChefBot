export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}

export interface NutritionData {
  unit: string,
  nutrient: string, 
  quantity: number,
  daily_value_percentage?: any;
}

export interface RecipeMetadata {
  title: string,
  source: string;
  yields: number;
  source_url: string;
  nutrition_info: Array<NutritionData>;
}

export interface Recipe {
  id: number;
  content: string;
  metadata: RecipeMetadata;
}
export interface PageMeta {
  title: string;
  description: string;
  cardImage: string;
}
export interface NutritionDataSubclass {
  nutrient: string,
  label: string,
  quantity: number,
  daily: number,
  unit: string,
}

export interface NutritionData {
  nutrient: string,
  label: string,
  quantity: number,
  daily: number,
  unit: string,
  sub: Array<NutritionDataSubclass>
}

export interface RecipeMetadata {
  title: string,
  image: string,
  source: string;
  yields: number;
  calories: number;
  source_url: string;
  nutrition_info: Array<NutritionData>;
}

export interface Recipe {
  id: number;
  content: string;
  metadata: RecipeMetadata;
}
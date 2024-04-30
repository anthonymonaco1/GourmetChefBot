import React from "react";
import { Recipe } from "@/app/types";
import ArrowLeft02Icon from "../icons/leftArrow";

interface RecipeInfoProps {
  recipe: Recipe | null;
  onArrowClick: () => void;
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({ recipe, onArrowClick }) => {
  let title = recipe?.content.split('. Ingredients')[0];
  title = title?.replace(/recipes/gi, '').trim(); // remove 'recipe' and 'recipes'
  title = title?.replace(/recipe/gi, '').trim(); // remove 'recipe' and 'recipes'
  title = title?.charAt(0).toUpperCase() + title!.slice(1); // capitalize first letter

  return (
    <div className="flex flex-col bg-slate-100 border-2 border-gray-400 rounded-lg h-full w-full shadow-xl ml-1">
      <div className="relative flex flex-row items-center justify-center p-2">
        <div className="absolute left-2 cursor-pointer" onClick={onArrowClick}>
          <ArrowLeft02Icon color={"#000000"} />
        </div>
        <div className="text-lg font-bold text-center px-8">{title}</div>
      </div>
      <div className="flex flex-row px-2 py-1">
        <div className="font-bold mr-1.5">Source:</div>
        {recipe?.metadata.source}
      </div>
      <div className="flex flex-row px-2 py-1">
        <div className="font-bold mr-1.5">Serves:</div>
        {recipe?.metadata.yields}
      </div>
      <div className="flex flex-col px-2 py-1">
        <div className="font-bold mr-1.5">Recipe Details:</div>
        {recipe?.metadata.source_url && (
          <a
            className="underline text-blue-600 break-all"
            href={recipe.metadata.source_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {recipe.metadata.source_url}
          </a>
        )}
      </div>
      <div className="flex flex-col px-2 py-1 min-h-2/5 max-h-75">
        <div className="font-bold mr-1.5">Nutritional Info:</div>{" "}
        <div className="border-2 border-gray-400 overflow-y-auto px-2 py-1 rounded-lg">
          {recipe?.metadata.nutrition_info?.map((info, index) => (
            <div key={index}>
              <span>{info.nutrient}: </span>
              <span>
                {Number(info.quantity).toFixed(2)}
                {info.unit}
              </span>
              <span>
                {info.daily_value_percentage
                  ? ` (${info.daily_value_percentage}%)`
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecipeInfo;

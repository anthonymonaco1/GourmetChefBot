import React from "react";
import { Recipe } from "@/app/types";
import ArrowRight02Icon from "../icons/rightArrow";

interface RecipeBoxProps {
  recipe: Recipe;
  onArrowClick: () => void;
}

const RecipeBox: React.FC<RecipeBoxProps> = ({ recipe, onArrowClick }) => {
  let title = recipe?.content.split('. Ingredients')[0];
  title = title.replace(/recipes/gi, '').trim(); // remove 'recipe' and 'recipes'
  title = title.replace(/recipe/gi, '').trim(); // remove 'recipe' and 'recipes'
  title = title.charAt(0).toUpperCase() + title.slice(1); // capitalize first letter

  return (
    <div className="bg-slate-100 border-2 border-gray-400 p-5 m-1.5 rounded-xl flex flex-row justify-between shadow-lg w-full">
      <h2 className="font-semibold text-md overflow-hidden overflow-ellipsis whitespace-nowrap">{title}</h2>
      <div className="cursor-pointer" onClick={onArrowClick}>
        <ArrowRight02Icon color={"#000000"} />
      </div>
    </div>
  );
};

export default RecipeBox;

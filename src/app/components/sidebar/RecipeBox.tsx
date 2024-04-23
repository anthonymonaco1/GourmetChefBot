import React from "react";
import { Recipe } from "@/app/types";
import ArrowRight02Icon from "../icons/rightArrow";

interface RecipeBoxProps {
  recipe: Recipe;
  onArrowClick: () => void;
}

const RecipeBox: React.FC<RecipeBoxProps> = ({ recipe, onArrowClick }) => {
  return (
    <div className="bg-slate-100 border-2 border-gray-400 p-5 m-1.5 rounded-xl flex flex-row justify-between shadow-lg">
      <h2 className="font-semibold text-lg">{recipe.metadata.title}</h2>
      <div onClick={onArrowClick}>
        <ArrowRight02Icon color={"#000000"} />
      </div>
    </div>
  );
};

export default RecipeBox;

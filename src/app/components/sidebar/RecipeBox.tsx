import React from "react";
import { Recipe } from "@/app/types";
import ArrowRight02Icon from "../icons/rightArrow";

interface RecipeBoxProps {
  recipe: Recipe;
  onArrowClick: () => void;
}

const RecipeBox: React.FC<RecipeBoxProps> = ({ recipe, onArrowClick }) => {
  return (
    <div className="relative bg-slate-100 border-2 border-gray-400 m-1.5 rounded-xl flex flex-col shadow-lg cursor-pointer" onClick={onArrowClick}>
      <img
        src={recipe.metadata.image}
        alt={recipe.metadata.title}
        className="rounded-xl"
      />
      <div className="h-14 flex items-center justify-center">
        <div className="text-center font-semibold px-4 overflow-hidden line-clamp-2">
          {recipe.metadata.title}
        </div>
      </div>
      {/* <div className="cursor-pointer absolute right-0" onClick={onArrowClick}>
        <ArrowRight02Icon color={"#000000"} />
      </div> */}
    </div>
  );
};

export default RecipeBox;

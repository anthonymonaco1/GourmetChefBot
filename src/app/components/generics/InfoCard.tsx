// src/components/generics/InfoDropdown.tsx
import React from "react";

const InfoCard = () => {
  return (
    <div className="w-2/3 bg-surface border border-gray-400 rounded-lg shadow-lg p-4 z-10">
      <div className="text-sm text-text">
        <p className="mb-4">
          <strong className="text-dark-powder-blue font-extrabold">
            Welcome to your Gourmet ChefBot!
          </strong>
        </p>
        <p className="mb-4">
          Discover new flavors and cuisines with our interactive platform
          designed for personalized recipe discovery!
        </p>
        <p className="mb-4">
          <strong className="text-dark-powder-blue font-extrabold">
            Recipe Explorer:
          </strong>{" "}
          Dive into our vast database by querying based on ingredients,
          cuisine types, diet labels, or meal types. Click on recipe cards on
          to view detailed information including ingredients,
          nutritional facts, and links to the full recipes.
        </p>
        <p className="mb-4">
          <strong className="text-dark-powder-blue font-extrabold">Note:</strong>{" "}
          This chatbot excels with specific queries such as “Show me low-calorie
          dinner options” or “Find vegetarian appetizers that include tomatoes.”
          The more specific your query, the more tailored the results. Please
          keep your queries recipe related to ensure it does not get confused!
        </p>
        <p>
          Get ready to explore and enjoy a variety of delicious, tailor-made
          recipes!
        </p>
      </div>
    </div>
  );
};

export default InfoCard;

const IntroMessage = () => {
    return (
      <div className="flex flex-col rounded-2xl border-2 border-gray-400 text-black text-sm bg-slate-100 mb-2 shadow-lg">
        <div className="p-2 pb-0 flex flex-row">
          <div className="flex flex-col basis-4/5 p-3 pb-0">
            <div className="flex flex-row space-x-1">
              <div className="font-semibold text-lg text-crimsonDefault flex text-start justify-start pb-2">
                Welcome to your
              </div>
              <div className="flex flex-row">
                <div className="font-semibold text-lg text-black flex text-start justify-start pb-2 mr-1">
                  Gourmet
                </div>
                <div className="font-bold text-lg text-dark-powder-blue flex text-start justify-start pb-2">
                  ChefBot!
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start p-3 py-2">
          <div className="text-left p-2 pt-0 leading-loose text-sm pb-4">
            Discover new flavors and cuisines with our interactive platform
            designed for personalized recipe discovery!
          </div>
          <div className="text-left p-2 pt-0 leading-loose text-sm">
            <b className="text-dark-powder-blue font-extrabold">Recipe Explorer:</b> Dive into our vast database by querying based on ingredients, cuisine types, diet labels, or meal types. Click on recipe cards on the left to view detailed information including ingredients, nutritional facts, and links to the full recipes.
          </div>
          <div className="text-left p-2 pt-0 leading-loose text-sm">
            <b className="text-dark-powder-blue font-extrabold">Note:</b> This chatbot excels with specific queries such as 'Show me low-calorie dinner options' or 'Find vegetarian appetizers that include tomatoes.' The more specific your query, the more tailored the results. Please keep your queries recipe related to ensure it does not get confused!
          </div>
          <div className="text-left p-2 pt-1 leading-loose text-sm">
            Our smart search leverages vector embeddings to understand and match your culinary preferences effectively. However, please be aware that while we strive for accuracy, LLM chatbots like this one may sometimes produce responses that are not entirely accurate or might 'hallucinate' details. Always verify critical information independently.
          </div>
          <div className="text-left p-2 pt-1 leading-loose text-sm">
            Get ready to explore and enjoy a variety of delicious, tailor-made recipes!
          </div>
        </div>
      </div>
    );
  };
  
  export default IntroMessage;
  
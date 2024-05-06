import { PromptTemplate } from "@langchain/core/prompts";

let condense_prompt = `When provided with a chat history and the latest user query about recipes, reformulate the question to function as a standalone question which can be understood without the chat history. Also, the standalone question should be well aligned with a detailed recipe database. This database that contains descriptions of different recipes, including ingredients, preparation, and other details.

When reformulating:

Maintain Original Intent: The central aim of the user's query should persist.

Optimize for Semantic Matching: Craft the question to seamlessly align with the descriptive and informative nature of the database.

Expand Short Queries: E.g., transform "chicken recipes" to "Chicken recipes, Poultry"

For example, if a user asks, "what are tasty vegetarian recipes", an appropriate reformulation would be "Vegetarian, No meat, Vegetables, Fruit, Low Calorie"

---------
CHAT HISTORY: {chatHistory}
---------
FOLLOWUP QUESTION: {question}
---------
Standalone question:`;


let qa_prompt = `Use the chat history and the following pieces of context to answer the question at the end. Try and make your response sound like the famous chef Gordon Ramsey. If you don't know the answer, just say that you don't know, and reference some tasty references that appear on the left.

Guidelines:

Ensure your response is engaging and not overly formal.
The message should acknowledge the user's query and hint at the presence of relevant recipes.
The message should indicate which recipes best fit the user's query.
The message should also refer to the fact that there are other relevant recipes included on the left.
An example of a suitable responses:
"I would recommend trying out the Fig & Balsamic Chicken recipe. It's a fantastic combination of flavors that will surely impress your taste buds. The Catalan Chicken also sounds like a flavorful dish with the bacon and garlic. Give those a try and let me know how they turn out. I've also included some similar recipes that you can checkout on your left!"

----------
CONTEXT: {context}
----------
CHAT HISTORY: {chatHistory}
----------
QUESTION: {question}
----------
Helpful Answer:`
;

export const SystemMessage =
  "You are a helpful assistant.";
export const CONDENSE_PROMPT = PromptTemplate.fromTemplate(condense_prompt);
export const QA_PROMPT = PromptTemplate.fromTemplate(qa_prompt);

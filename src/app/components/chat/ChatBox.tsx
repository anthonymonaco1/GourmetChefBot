"use client";

import Send from "../icons/send";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { useState, Fragment, useRef, useEffect } from "react";
import { Recipe } from "@/app/types";
import { supabaseClient } from "@/app/utils/supabase/client";
import RecipeBox from "../sidebar/RecipeBox";
import RecipeInfo from "../sidebar/RecipeInfo";
import LoadingDots from "../generics/LoadingDots";
import IntroMessage from "../generics/IntroMessage";

export default function ChatBox() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showRecipeInfo, setShowRecipeInfo] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeObjects, setRecipeObjects] = useState<Recipe[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{
      question: string;
      answer: string;
    }>
  >([]);

  // Text change handler for chat input
  const handleTextChange = (e: any) => {
    setUserQuestion(e.target.value);
  };

  const generateAnswer = async (e: any) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!userQuestion) {
      return toast.error("Please enter a question!"); // If no question is provided, an error message is displayed.
    }

    setRecipeObjects([]);

    let query = userQuestion;
    let systemAnswer = "";
    let conversation = chatHistory;
    // console.log("Chat History being sent to API route:\n", conversation);
    let recipes = [{}];

    setUserQuestion("");

    // Create a new chat Log array that includes the new message
    const newChatLog = [
      ...chatLog,
      {
        question: query,
        answer: systemAnswer,
      },
    ];

    // Update the state
    setChatLog(newChatLog);

    setLoading(true); // Sets the loading state to true, indicating that the process has started.
    setDisabled(true); // Disables further interactions until the process is complete.

    const response = await fetch("api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userQuery: query,
        chatHistory: conversation,
      }), // Send user Q and chat history as the request body
    });
    // console.log("Response received:", response);

    setLoading(false); // Sets the loading state to false, indicating that the process has ended.

    // Checks if the conversation was successful.
    if (response.ok) {
      console.log("response successful");
    } else {
      console.error("Error in response", response.statusText);
    }

    // Reads the response stream and processes the answer.
    const stream = response.body;
    if (!stream) {
      return;
    }
    // console.log("Stream received:", stream);

    // Continues reading the stream and appending the answer.
    const reader = stream.getReader();
    let sources = "";
    let isSourceMode = false; // This flag will help us determine if we are appending to the 'sources' variable
    // console.log("Reader created:", reader);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        // console.log("Read value:", value);

        let decodedValue = new TextDecoder().decode(value);
        // console.log("Decoded value:", decodedValue);

        // If 'decodedValue' contains the marker and we haven't started source mode, start it
        if (decodedValue.includes("##SOURCE_DOCUMENTS##")) {
          isSourceMode = true;
        }

        // If we're in source mode, append everything to 'sources'
        if (isSourceMode) {
          sources += decodedValue;
          decodedValue = ""; // Resetting so it won't be appended to 'tracked_answer' or the chat log
        } else {
          systemAnswer += decodedValue;
        }
        // console.log("Current system answer:", systemAnswer);

        // If not in source mode, update the chat log
        if (!isSourceMode) {
          setChatLog((prev) => {
            const lastMessage = prev.slice(-1)[0];
            const updatedMessage = lastMessage
              ? { ...lastMessage, answer: lastMessage.answer + decodedValue }
              : {
                  question: query,
                  answer: decodedValue,
                };
            return [...prev.slice(0, -1), updatedMessage];
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      reader.releaseLock();
    }

    // Processes the sources and retrieves related courses
    let sourceSplit = sources.split("##SOURCE_DOCUMENTS##")[1];

    if (typeof sourceSplit !== "undefined") {
      recipes = JSON.parse(sources.split("##SOURCE_DOCUMENTS##")[1].trim());
      // if no sources were returned, ask for a refined query
      //TODO, fix it so it doesn't change the stream
      if (recipes.length === 0) {
        let noCourseString = `No courses fitting that query were found. Please refine your query.`;
        setChatLog((prev) => {
          const lastMessage = prev.slice(-1)[0];
          const updatedMessage = lastMessage
            ? { ...lastMessage, answer: noCourseString }
            : {
                question: query,
                answer: noCourseString,
              };
          return [...prev.slice(0, -1), updatedMessage];
        });
      }
    } else {
      console.log("No sources were returned");
    }

    // Retrieve the recipe objects
    recipes.map(async (recipe: any) => {
      const { data, error } = await supabaseClient
        .from("documents")
        .select("*")
        .eq("metadata", JSON.stringify(recipe.metadata));

      if (error) {
        console.error(error);
        return;
      } else {
        setRecipeObjects((prevRecipeObjects) => [
          ...prevRecipeObjects,
          data[0],
        ]);
      }
    });

    // setAnswer(answer);

    setChatHistory(
      (prevChatHistory) =>
        `${prevChatHistory}${
          prevChatHistory ? "\n\n" : ""
        }Human: ${query}\nAI: ${systemAnswer}`
    );

    setDisabled(false); // Re-enables interactions.
  };

  const recipeArrowClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeInfo(true);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [chatLog]);

  return (
    <div className="flex flex-grow max-h-9/10">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{ duration: 2000 }}
      />
      <div className="w-1/3 border-r-2 border-eton-blue p-4 overflow-y-auto overflow-x-hidden relative">
        <div
          className={
            showRecipeInfo
              ? "slide-out absolute w-11/12 pb-4"
              : "slide-in absolute w-11/12 pb-4"
          }
        >
          {recipeObjects.length !== 0 ? (
            recipeObjects.map((recipe) => (
              <RecipeBox
                key={recipe.id}
                recipe={recipe}
                onArrowClick={() => recipeArrowClick(recipe)}
              />
            ))
          ) : (
            <div className="text-black absolute inset-x-1/5 font-semibold">
              Relevant recipes will appear here!
            </div>
          )}
        </div>
        <div
          className={
            showRecipeInfo
              ? "slide-in absolute w-11/12 max-h-97.5 h-97.5"
              : "slide-out absolute w-11/12 max-h-97.5 h-97.5"
          }
        >
          <RecipeInfo
            recipe={selectedRecipe}
            onArrowClick={() => setShowRecipeInfo(false)}
          />
        </div>
      </div>
      <div className="text-black w-2/3 flex-col h-full">
        <div
          className="border-b-2 border-eton-blue h-5/6 overflow-y-scroll"
          ref={chatContainerRef}
        >
          <div className="p-5">
            <IntroMessage />
          </div>
          {chatLog.map((chat, index) => (
            <Fragment key={index}>
              <div className="flex flex-row justify-end p-6 rounded-2xl ml-16">
                <div className="text-black bg-eton-blue brightness-105 shadow-xl text-left px-5 py-2.5 w-fit rounded-3xl rounded-br-sm text-sans text-sm font-medium">
                  {chat.question}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div>
                  <div className="flex flex-row p-6 mr-28 rounded-2xl transition">
                    <div className="prose max-w-none bg-light-powder-blue text-black shadow-xl text-left px-5 py-2.5 rounded-3xl rounded-bl-sm text-sans text-sm font-medium whitespace-pre-wrap">
                      {loading && chatLog[chatLog.length - 1] === chat && (
                        <LoadingDots color="#9CA3AF" style="xl" />
                      )}
                      {!(chat.answer === "") && chat.answer}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </Fragment>
          ))}
        </div>
        <div className="h-1/6 flex items-center justify-center">
          <div className="bg-slate-100 border-2 border-gray-400 rounded-xl flex items-center justify-center w-11/12 shadow-xl">
            <form
              className="flex flex-row items-center w-full"
              onSubmit={generateAnswer}
            >
              <input
                className="h-14 outline-none p-3 rounded-xl w-11/12 resize-none flex items-center bg-slate-100"
                value={userQuestion}
                onChange={handleTextChange}
                placeholder="Ask me about recipes here!"
                disabled={disabled}
              />
              <div className="w-1/12 flex items-center justify-center">
                <button
                  type="submit"
                  disabled={!userQuestion}
                  className={`flex items-center justify-center brightness-105 rounded-xl px-3 py-2 text-white ${
                    userQuestion ? "bg-eton-blue" : "bg-gray-400"
                  }`}
                >
                  <Send />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

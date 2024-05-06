import { NextRequest, NextResponse } from "next/server";
import { createSemanticRetriever } from "../../utils/langchain/VectorRetrievers";
import { CONDENSE_PROMPT, QA_PROMPT } from "../../utils/langchain/Prompts";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { StreamingTextResponse, LangChainStream } from "ai";

// Handler for generating AI response
export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  // Get user question and chat history as request body
  const requestBody = await req.json();
  const { userQuery, chatHistory } = requestBody;

  // Define langhchain stream 
  let {
    stream,
    handlers: {
      handleChainEnd,
      handleLLMStart,
      handleLLMNewToken,
      handleLLMError,
      handleChainStart,
      handleChainError,
      handleToolStart,
      handleToolError,
    },
  } = LangChainStream();

  // Define stream handlers
  let id = "";
  const handlers = {
    handleLLMStart: (llm: any, prompts: string[], runId: string) => {
      id = runId;
      return handleLLMStart(llm, prompts, runId);
    },
    handleLLMNewToken,
    handleLLMError,
    handleChainStart,
    handleChainError,
    handleToolStart,
    handleToolError,
  };

  try {
    // Define embeddings and llm models
    const embeddings = new OpenAIEmbeddings();

    // Model for reformatting user question
    const questionReformatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // Model for generating answer
    const questionAnswerModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
      streaming: true,
      callbacks: [handlers],
    });

    // Define vectorStore with relevant supabase table and function
    const vectorStore = await createSemanticRetriever(
      embeddings,
      "documents",
      "match_documents"
    );

    // Define retriever (returns 10 documents)
    const retriever = vectorStore.asRetriever(16);

    // Construct conversational retrieval QA chain that returns source docs
    const chain = RunnableSequence.from([
      // Reformats input question to optimize for semantic matching, preserves original question/Chat hsitory
      {
        reformattedQuestion: RunnableSequence.from([
          {
            chatHistory: (input: { question: string; chatHistory: string }) =>
              input.chatHistory,
            question: (input: { question: string; chatHistory: string }) =>
              input.question,
          },
          CONDENSE_PROMPT,
          questionReformatModel,
          new StringOutputParser(),
        ]),
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) =>
          input.chatHistory ?? "",
      },
      // Passes reformatted question to retriever to get the source documents, preserves original question/chat history
      {
        sourceDocuments: RunnableSequence.from([
          (previousStepResult) => previousStepResult.reformattedQuestion,
          retriever,
        ]),
        question: (previousStepResult) => previousStepResult.question,
        chatHistory: (previousStepResult) => previousStepResult.chatHistory,
      },
      // Passes source docs through unchanged, preserves original question/chat history and generates context string
      {
        sourceDocuments: (previousStepResult) =>
          previousStepResult.sourceDocuments,
        chatHistory: (previousStepResult) => previousStepResult.chatHistory,
        question: (previousStepResult) => previousStepResult.question,
        context: (previousStepResult) =>
          formatDocumentsAsString(previousStepResult.sourceDocuments),
      },
      // Generates result with QA prompt and also returns source docs in original format
      {
        result: QA_PROMPT.pipe(questionAnswerModel).pipe(new StringOutputParser()),
        sourceDocuments: (previousStepResult) =>
          previousStepResult.sourceDocuments,
      },
    ]);

    // Invoke chain as stream
    chain
      .invoke({
        question: userQuery,
        chatHistory: chatHistory,
      })
      .then(async (response) => {

        // Convert source docs to string format
        const sources = JSON.stringify(
          response.sourceDocuments.map((document: any) => document)
        );
        
        // Identifier for source docs on client side
        await handleLLMNewToken(`##SOURCE_DOCUMENTS##${sources}`);
        await handleChainEnd(null, id);
      });

    // Return generated answer/source docs as text stream
    return new StreamingTextResponse(stream);
  } catch (error: any) {
    console.error(error);
    return new Response("Internal server error", { status: 500 });
  }
}

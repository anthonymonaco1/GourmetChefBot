import { SupabaseHybridSearch } from "@langchain/community/retrievers/supabase";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabaseClient } from "../supabase/client";

const client = supabaseClient;
// finds a supabase database from existing index,
export const createSemanticRetriever = (embeddings: any, tableName: string, queryName: string) => {
    return SupabaseVectorStore.fromExistingIndex(embeddings, {
      client,
      tableName: tableName,
      queryName: queryName,
    });
  };

//does both a similarity search and keyword search
export const createHybridRetriever = (embeddings: any) => {
 return new SupabaseHybridSearch(embeddings, {
    client,
    similarityK: 16,
    keywordK: 4,
    tableName: "courses_0808",
    similarityQueryName: "match_courses_0808",
    keywordQueryName: "kw_match_courses0808",
    // filter:filter,
    });

}

//uploads JSONS to supabase - make sure that table & search function are created 
//ex: https://js.langchain.com/docs/modules/data_connection/vectorstores/integrations/supabase#create-a-table-and-search-function-in-your-database
export const uploadDocuments = async (embeddings: any, tableName: string, docs: any) => {
  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName: tableName,
  });

  try {
   await store.addDocuments(docs);
  }
  catch (error){
    console.log("SUPAERROR: ", error)
  }
}
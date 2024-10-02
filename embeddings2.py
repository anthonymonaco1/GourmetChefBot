import fitz  # PyMuPDF
import os
import requests
import json
import time
from dotenv import load_dotenv
from supabase_py import create_client, Client
import tiktoken  # Import the tiktoken library

# Load environment variables
load_dotenv('.env.local')

# Connect to Supabase
url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") 
print(f"Supabase URL: {url}")
supabase: Client = create_client(url, key)

# Set up OpenAI API
apiKey = os.getenv("OPENAI_API_KEY")
apiURL = ""
if (os.getenv("OPENAI_PROXY") == ""):
    apiURL = "https://api.openai.com"
else:
    apiURL = os.getenv("OPENAI_PROXY")

# Set the token limit for the model
TOKEN_LIMIT = 8192
encoder = tiktoken.get_encoding("cl100k_base")  # Or use another encoding depending on the model

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text += page.get_text("text")  # Extract text in a readable format
    return text

# Function to count tokens in a text
def count_tokens(text):
    tokens = encoder.encode(text)
    return len(tokens)

# Function to chunk text into smaller pieces based on token count
def chunk_text(text, max_tokens=2000):
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        if count_tokens(' '.join(current_chunk)) > max_tokens:
            # Remove the last word and finalize the chunk
            current_chunk.pop()
            chunks.append(' '.join(current_chunk))
            # Start a new chunk with the last word
            current_chunk = [word]

    # Add the last chunk if there's remaining text
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

# Function to generate vector embeddings from text with retry logic
def generate_embedding(text, retries=3, delay=5):
    headers = {
        'Authorization': f'Bearer {apiKey}',
        'Content-Type': 'application/json',
    }
    data = {
        'input': text,
        'model': 'text-embedding-ada-002',
    }
    
    for attempt in range(retries):
        try:
            response = requests.post(f'{apiURL}/v1/embeddings', headers=headers, data=json.dumps(data))
            response.raise_for_status()  # Raise an HTTPError if the HTTP request returned an unsuccessful status code
            embeddingResponse = response.json()
            if 'data' not in embeddingResponse or not embeddingResponse['data']:
                print(f"Error generating embedding for text: {text}")
                print(f"Response: {embeddingResponse}")
                return None
            embedding = embeddingResponse['data'][0]['embedding']
            return embedding
        
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            if attempt < retries - 1:
                print(f"Retrying in {delay} seconds... (Attempt {attempt + 2}/{retries})")
                time.sleep(delay)
            else:
                print("Max retries reached. Moving on to the next chunk.")
                return None

# Function to store text and embeddings in Supabase
def store_embedding_in_supabase(text, embedding, metadata):
    response = supabase.table("documents").insert([{
        "content": text,
        "embedding": embedding,
        "metadata": metadata
    }]).execute()

    if 'error' in response or 'data' not in response or not response['data']:
        print(f"Error inserting data into database: {response}")
    else:
        print("Data successfully inserted")

# Main function to process PDFs
def process_pdfs(pdf_folder_path):
    pdf_files = [f for f in os.listdir(pdf_folder_path) if f.endswith('.pdf')]
    
    print(f"Found {len(pdf_files)} PDF files in {pdf_folder_path}")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder_path, pdf_file)
        print(f"Processing {pdf_file}...")

        # Step 1: Extract text from PDF
        pdf_text = extract_text_from_pdf(pdf_path)
        print(f"Extracted text length: {len(pdf_text)} characters")
        
        # Step 2: Chunk the extracted text
        chunks = chunk_text(pdf_text)
        print(f"Text chunked into {len(chunks)} chunks")

        # Step 3: Generate embeddings and store them in Supabase
        for i, chunk in enumerate(chunks):
            print(f"Generating embedding for chunk {i+1}/{len(chunks)}")
            embedding = generate_embedding(chunk)
            if embedding:
                metadata = {
                    "source": pdf_file,
                    "chunk_number": i + 1
                }
                print(f"Storing chunk {i+1} in Supabase")
                store_embedding_in_supabase(chunk, embedding, metadata)
            
            # Sleep to avoid hitting API rate limits
            time.sleep(1)

# Specify the folder where your PDFs are stored
pdf_folder_path = "public"

# Run the processing function
process_pdfs(pdf_folder_path)

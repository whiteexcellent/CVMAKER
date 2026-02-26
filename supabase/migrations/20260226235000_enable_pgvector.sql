-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create the ai_knowledge_base table to store successful resume templates and sections
create table if not exists ai_knowledge_base (
  id uuid primary key default uuid_generate_v4(),
  industry text not null, -- e.g., 'Technology', 'Finance'
  role text not null, -- e.g., 'Software Engineer', 'Product Manager'
  content text not null, -- The actual successful resume bullet point or summary
  embedding vector(1536), -- OpenAI text-embedding-3-small generates 1536 dimensions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index to speed up vector similarity searches (using HNSW)
create index if not exists ai_knowledge_base_embedding_idx 
on ai_knowledge_base 
using hnsw (embedding vector_cosine_ops);

-- Create a database function that we can call securely from our API to perform similarity search
create or replace function match_resume_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  industry text,
  role text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    ai_knowledge_base.id,
    ai_knowledge_base.industry,
    ai_knowledge_base.role,
    ai_knowledge_base.content,
    1 - (ai_knowledge_base.embedding <=> query_embedding) as similarity
  from ai_knowledge_base
  where 1 - (ai_knowledge_base.embedding <=> query_embedding) > match_threshold
  order by ai_knowledge_base.embedding <=> query_embedding
  limit match_count;
$$;

-- Enable Row Level Security (RLS) on the ai_knowledge_base table
-- Since this table is queried securely from the backend API using the service_role key,
-- we enforce RLS without adding public policies, effectively denying public access
-- while allowing the backend API full access.

ALTER TABLE public.ai_knowledge_base ENABLE ROW LEVEL SECURITY;

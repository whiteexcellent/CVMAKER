require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const seedData = [
    {
        industry: 'Technology',
        role: 'Software Engineer',
        content: 'Architected a highly scalable microservices backend using Node.js and PostgreSQL, supporting 100,000+ daily active users with 99.99% uptime and reducing API latency by 45%.'
    },
    {
        industry: 'Technology',
        role: 'Frontend Developer',
        content: 'Engineered a responsive React user interface with TailwindCSS, reducing Largest Contentful Paint (LCP) by 1.2s and improving overall conversion rates by 15% across mobile platforms.'
    },
    {
        industry: 'Management',
        role: 'Product Manager',
        content: 'Spearheaded the 0-to-1 launch of an AI-powered SaaS product, coordinating a cross-functional team of 15 engineers and designers to achieve $1M ARR within the first 6 months of release.'
    },
    {
        industry: 'Finance',
        role: 'Financial Analyst',
        content: 'Developed automated financial forecasting models in Python and Excel, reducing monthly reporting time by 30 hours and identifying $2.5M in cost-saving opportunities.'
    },
    {
        industry: 'Marketing',
        role: 'Growth Marketing Manager',
        content: 'Designed and executed omni-channel acquisition campaigns that increased inbound MQLs by 300% year-over-year while reducing Customer Acquisition Cost (CAC) by 22%.'
    }
];

// Helper to generate a deterministic pseudo-random 1536-d vector based on a string
function generateMockEmbedding(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }

    // Seed a basic RNG
    function rng(seed) {
        let s = seed;
        return function () {
            s = Math.sin(s) * 10000;
            return s - Math.floor(s);
        }
    }

    const randomFunc = rng(hash);
    // Generate 1536 dims, normalized between -1 and 1
    return Array.from({ length: 1536 }, () => (randomFunc() * 2) - 1);
}

async function seedDatabase() {
    console.log("Starting RAG Vector Database Seed...");

    for (const item of seedData) {
        const embedding = generateMockEmbedding(item.content);

        // Insert into Supabase
        const { data, error } = await supabase
            .from('ai_knowledge_base')
            .insert({
                industry: item.industry,
                role: item.role,
                content: item.content,
                embedding: embedding
            });

        if (error) {
            console.error(`Failed to insert ${item.role}:`, error.message);
        } else {
            console.log(`Successfully inserted template for: ${item.role}`);
        }
    }

    console.log("Seeding complete!");
}

seedDatabase();

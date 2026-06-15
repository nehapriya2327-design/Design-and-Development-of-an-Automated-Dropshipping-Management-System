import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY
});

export default groq
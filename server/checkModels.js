require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

groq.models.list().then((res) => {
  res.data.forEach(m => console.log(m.id, '-', m.active ? 'ACTIVE' : 'INACTIVE'));
}).catch(err => console.error('Error:', err.message));
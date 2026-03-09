import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateCaptions({ topic, platforms, tone }) {
  const platformRules = platforms
    .map((p) => {
      if (p === 'twitter')  return 'Twitter/X (strict max 280 characters including hashtags)'
      if (p === 'linkedin') return 'LinkedIn (professional network, max 3000 characters)'
    })
    .filter(Boolean)
    .join(' and ')

  const prompt = `You are a social media expert. Generate exactly 3 different captions for a post.

Topic: ${topic}
Tone: ${tone}
Target platforms: ${platformRules}

Rules:
- Each caption must match the "${tone}" tone
- Strictly respect character limits for each platform
- Include 2-4 relevant emojis per caption
- Include 3-5 relevant hashtags at the end of each caption
- Each caption must be unique and engaging
- Do NOT number the captions
- Return ONLY a valid raw JSON array of exactly 3 strings
- No markdown, no code blocks, no explanation — just the JSON array

Example of correct response:
["Caption one here with #hashtags 🔥", "Caption two here with #hashtags ✨", "Caption three here with #hashtags 💡"]`

  const completion = await groq.chat.completions.create({
    model:    'llama-3.1-8b-instant', // free, fast
    messages: [
      {
        role:    'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens:  1024,
  })

  const text    = completion.choices[0]?.message?.content?.trim()
  const cleaned = text.replace(/```json|```/g, '').trim()

  let captions
  try {
    captions = JSON.parse(cleaned)
  } catch {
    throw new Error('Groq returned invalid JSON: ' + cleaned)
  }

  if (!Array.isArray(captions) || captions.length !== 3) {
    throw new Error('Groq did not return exactly 3 captions')
  }

  return captions
}
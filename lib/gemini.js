import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function generateCaptions({ topic, platforms, tone }) {
  // ✅ Use gemini-1.5-flash-latest or gemini-2.0-flash
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })

  const platformRules = platforms
    .map((p) => {
      if (p === 'twitter')  return 'Twitter/X (strict max 280 characters including hashtags)'
      if (p === 'linkedin') return 'LinkedIn (professional network, max 3000 characters)'
    })
    .filter(Boolean)
    .join(' and ')

  const prompt = `
You are a social media expert. Generate exactly 3 different captions for a post.

Topic: ${topic}
Tone: ${tone}
Target platforms: ${platformRules}

Rules:
- Each caption must match the "${tone}" tone
- Strictly respect character limits for each platform
- Include 2-4 relevant emojis per caption
- Include 3-5 relevant hashtags at the end
- Each caption must be unique and engaging
- Do NOT number the captions
- Return ONLY a valid raw JSON array of exactly 3 strings
- No markdown, no code blocks, no explanation — just the JSON array

Example of correct response:
["Caption one here #hashtags 🔥", "Caption two here #hashtags ✨", "Caption three here #hashtags 💡"]
`

  const result  = await model.generateContent(prompt)
  const text    = result.response.text().trim()
  const cleaned = text.replace(/```json|```/g, '').trim()

  let captions
  try {
    captions = JSON.parse(cleaned)
  } catch {
    throw new Error('Gemini returned invalid JSON: ' + cleaned)
  }

  if (!Array.isArray(captions) || captions.length !== 3) {
    throw new Error('Gemini did not return exactly 3 captions')
  }

  return captions
}
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";
// Using Pro for the coding task to ensure the prototype is high quality
const MODEL_NAME_PRO = "gemini-3-pro-preview";

export const analyzeD3 = async (idea: string, niche: string): Promise<string> => {
  const prompt = `
    Role: You are a ruthless startup validator using the "D3 Formula" (Demonstrable, Desirable, Debatable).
    Task: Analyze the following startup idea for a niche market.
    
    Idea: ${idea}
    Niche: ${niche}

    Criteria:
    1. D1 - Demonstrable: Can it be understood instantly in a video without explanation?
    2. D2 - Desirable: Does it touch a core human instinct (addiction, fear of missing out, control, improvement)?
    3. D3 - Debatable: Will it cause people to comment (agree/disagree/want)?

    Output: Provide a bulleted critique **IN THAI LANGUAGE**. End with a score (0-10) on potential virality.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "เกิดข้อผิดพลาดในการวิเคราะห์";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ไม่สามารถเชื่อมต่อกับ AI ได้";
  }
};

export const generateViralIdeas = async (niche: string): Promise<string> => {
  const prompt = `
    Role: You are a Viral Idea Generator.
    Task: Generate 3 "Content-First" startup ideas for the niche: "${niche || 'General Mass Market'}".
    
    Criteria:
    - Must follow D3 (Demonstrable, Desirable, Debatable).
    - Must be solvable with a simple MVP (3 screens max).
    - Focus on "Painkiller" or "Addiction" apps.
    
    Output format:
    Provide 3 distinct ideas **IN THAI LANGUAGE**. Use **Bold** for titles.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "เกิดข้อผิดพลาดในการสร้างไอเดีย";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "ไม่สามารถเชื่อมต่อกับ AI ได้";
  }
};

export const generateFakeDemoScript = async (idea: string): Promise<string> => {
  const prompt = `
    Role: You are a Viral Content Agent.
    Task: Create a "Fake Demo" video script (Shorts/Reels/TikTok) to validate demand for this product.
    
    Product Idea: ${idea}

    Guidelines:
    - Hook: First 3 seconds must be visually arresting or controversial.
    - Structure: Problem -> Agitation -> Solution (The "Fake" UI/Demo) -> Call to Action (Should we build this?).
    - Vibe: Raw, authentic, not "salesy".
    - Goal: Get comments like "I need this" or debates.

    Output: A scene-by-scene script with visual cues and voiceover text **IN THAI LANGUAGE**.
    Also include a brief "Story Board" description for the creator.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "เกิดข้อผิดพลาดในการสร้างสคริปต์";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการสร้างสคริปต์";
  }
};

export const processRawComments = async (rawText: string): Promise<{comments: number, wants: number, feedback: string}> => {
  const prompt = `
    Role: You are a Sentiment Data Analyst.
    Task: Analyze the following raw comment dump (or description of comments) from a video.

    Raw Data:
    "${rawText.substring(0, 15000)}"

    Output JSON ONLY:
    {
        "estimated_total_comments": number (count the lines or estimates based on text),
        "high_intent_count": number (count comments saying "I want this", "Download link?", "Need", "Take my money" or Thai equivalents like "ขอวาร์ป", "อยากได้", "ซื้อที่ไหน"),
        "summary": "string summary of the feedback in Thai language, max 2 sentences"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text || "{}";
    const json = JSON.parse(text);
    return {
        comments: json.estimated_total_comments || 0,
        wants: json.high_intent_count || 0,
        feedback: json.summary || "AI วิเคราะห์เสร็จสิ้น"
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { comments: 0, wants: 0, feedback: "เกิดข้อผิดพลาดในการประมวลผลข้อความ" };
  }
};

export const analyzeDemand = async (comments: number, wants: number, qualitativeData: string): Promise<{analysis: string, isGo: boolean}> => {
  const prompt = `
    Role: You are a Data Analyst Agent.
    Task: Analyze the market response to a fake demo video.

    Metrics:
    - Total Comments: ${comments}
    - "I want this" requests: ${wants}
    - Qualitative Feedback Summary: ${qualitativeData}

    Gate Criteria:
    - Must have meaningful engagement, not just likes.
    - >10% of comments should be high intent ("Build it!", "Take my money").

    Output:
    1. Analysis of the sentiment (Vanity metrics vs Real Demand) **IN THAI LANGUAGE**.
    2. A clear "GO" or "NO GO" decision.
    3. If NO GO, suggest a pivot in Thai.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    
    const text = response.text || "";
    const isGo = text.toUpperCase().includes("GO") && !text.toUpperCase().includes("NO GO");
    
    return { analysis: text, isGo };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { analysis: "เกิดข้อผิดพลาดในการวิเคราะห์", isGo: false };
  }
};

export const generateMVPPlan = async (idea: string, analysis: string): Promise<string> => {
  const prompt = `
    Role: You are an MVP Architect & Monetization Strategist.
    Task: Define the "Shameful but Sellable" MVP for this validated idea.

    Idea: ${idea}
    Context/Validation: ${analysis}

    Requirements:
    1. Core Loop: Define the SINGLE feature that delivers value. Max 3 screens.
    2. Paywall Strategy: How to charge from Day 1.
    3. Tech Stack: HTML/Tailwind/JS.

    IMPORTANT:
    After the plan (Write the plan **IN THAI LANGUAGE**), provide a SINGLE-FILE HTML CODE BLOCK that implements a functional prototype of this MVP.
    The code should be a complete 'index.html' with embedded CSS/JS.
    The UI text inside the code should be in **THAI LANGUAGE**.
    It should look modern (use Tailwind via CDN) and demonstrate the core interaction.
    
    Format:
    [Strategy Text in Thai]
    
    \`\`\`html
    [Code Here]
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME_PRO, // Using Pro for better coding capabilities
      contents: prompt,
    });
    return response.text || "เกิดข้อผิดพลาดในการสร้างแผนงาน";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการสร้างแผนงาน";
  }
};
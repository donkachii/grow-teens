import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check API key
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key is missing");
      return NextResponse.json(
        { error: "Server configuration error", title: "New Conversation" },
        { status: 500 }
      );
    }

    // Parse the request body
    const { message, response } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate a title using a simpler/faster model using fetch
    const titleResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://growteens.org' // Add this required header
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "Generate a very short, concise title (5 words maximum) for this conversation based on the user message and AI response provided. Return ONLY the title text with no additional explanation or formatting.",
          },
          {
            role: "user",
            content: `User message: "${message}"\nAI response: "${response}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 20
      })
    });

    if (!titleResponse.ok) {
      const errorText = await titleResponse.text();
      console.error(`OpenRouter API error: ${titleResponse.status}`, errorText);
      throw new Error(`OpenRouter API error: ${titleResponse.status} - ${errorText}`);
    }

    const data = await titleResponse.json();
    const title = data.choices[0]?.message?.content?.trim() || "New Conversation";

    return NextResponse.json({ title });
  } catch (error) {
    console.error("Error generating title:", error);
    return NextResponse.json({ title: "New Conversation" }, { status: 500 });
  }
}

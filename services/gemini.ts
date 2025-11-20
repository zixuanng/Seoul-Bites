import { GoogleGenAI, Tool, ToolConfig } from "@google/genai";
import { ChatMessage, GroundingMetadata, LocationCoords } from "../types";

// Initialize Gemini Client
// Prefer Vite env `VITE_GEMINI_API_KEY` (exposed via `import.meta.env`) when running in the dev client,
// fall back to `process.env.API_KEY` for server / terminal runs. Avoid committing secrets to source.
const apiKey =
  ((import.meta as any)?.env?.VITE_GEMINI_API_KEY as string) ||
  (typeof process !== "undefined"
    ? (process.env as any)?.API_KEY
    : undefined) ||
  "";
if (!apiKey) {
  console.warn(
    "No Gemini API key found. Set `VITE_GEMINI_API_KEY` in a local `.env` file or `API_KEY` env var."
  );
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Service to handle "Find Places" queries using Search & Maps Grounding.
 * Uses gemini-2.5-flash.
 */
export const searchPlaces = async (
  query: string,
  userLocation?: LocationCoords
): Promise<{ text: string; groundingMetadata?: GroundingMetadata }> => {
  const tools: Tool[] = [{ googleSearch: {} }, { googleMaps: {} }];

  let toolConfig: ToolConfig | undefined;

  if (userLocation) {
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools,
        toolConfig,
        // Requesting specific JSON structure in text for the map, followed by markdown
        systemInstruction: `You are a helpful local guide for Seoul, Korea. 
        When users ask for places to eat (best, cheapest, nearest, etc.), use the Google Maps and Search tools to find accurate, real-time information.
        
        CRITICAL OUTPUT FORMAT:
        You must start your response with a JSON code block containing the details of the places found, including coordinates.
        The format must be:
        \`\`\`json
        [
          {
            "name": "Place Name",
            "latitude": 37.123,
            "longitude": 127.123,
            "description": "Brief description of why it fits",
            "price": "$$"
          }
        ]
        \`\`\`

        After the JSON block, provide a helpful summary in clean Markdown, describing the options and why they were chosen.
        `,
      },
    });

    return {
      text:
        response.text ||
        "I couldn't find any specific places matching that request.",
      groundingMetadata: response.candidates?.[0]
        ?.groundingMetadata as GroundingMetadata,
    };
  } catch (error) {
    console.error("Error searching places:", error);
    return {
      text: "Sorry, I encountered an error while searching for places. Please try again.",
    };
  }
};

/**
 * Service to handle general Chat using gemini-3-pro-preview.
 */
export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    // Convert internal message format to Gemini history format if needed,
    // but for simplicity in this demo, we'll just send the new message
    // as we are creating a new chat instance or maintaining state externally.
    // Ideally, we persist the chat object, but here we re-instantiate for stateless simplicity
    // or pass history if we were using the stateful chat API properly across renders.
    // To keep it simple and robust for this snippet, we will start a new chat with history context
    // or just send the message if it's a single turn app pattern.

    // Let's use a simplified approach: Just generate content with the message for now
    // to avoid complex history management in this specific file structure,
    // but for a real chatbot, we'd use ai.chats.create() and keep the reference.

    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction:
          "You are a knowledgeable and friendly AI assistant specializing in Seoul, South Korea tourism and dining. Be helpful, polite, and enthusiastic.",
      },
    });

    // Replay history to restore state (simplified)
    for (const msg of history) {
      if (msg.role === "user") {
        await chat.sendMessage({ message: msg.text });
      }
      // We skip model responses in replay for this simple implementation
      // or we would need to manually construct the history object passed to chats.create
    }

    const response = await chat.sendMessage({ message: newMessage });
    return response.text || "";
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
};

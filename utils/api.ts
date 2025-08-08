import { Platform } from "react-native";

export async function transcribeAudio(
  audioUri: string, 
  language?: string
): Promise<{ text: string; detectedLanguage?: string; confidence?: number }> {
  try {
    console.log("Transcribing audio with language:", language || 'auto-detect');
    
    const formData = new FormData();
    
    if (Platform.OS === "web") {
      // For web, fetch the file and append it
      const response = await fetch(audioUri);
      const blob = await response.blob();
      formData.append("audio", blob);
    } else {
      // For native platforms
      const uriParts = audioUri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      
      const audioFile = {
        uri: audioUri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`
      };
      
      // @ts-ignore - React Native's FormData accepts this format
      formData.append("audio", audioFile);
    }
    
    // Add language parameter if specified
    if (language && language !== 'auto') {
      formData.append("language", language);
    }
    
    const response = await fetch("https://toolkit.rork.com/stt/transcribe/", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Transcription completed:", data.text.substring(0, 50) + "...");
    
    return {
      text: data.text,
      detectedLanguage: data.language,
      confidence: data.confidence || 1.0,
    };
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
}

export async function generateSummary(
  transcript: string, 
  language?: string
): Promise<string> {
  try {
    console.log("Generating summary for language:", language || 'auto');
    
    const languageInstruction = language && language !== 'auto' && language !== 'en' 
      ? ` Please respond in the same language as the transcript (${language}).`
      : '';
    
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant that creates concise, well-structured summaries of meeting transcripts. Focus on key points, action items, and decisions. Use bullet points where appropriate. Keep summaries clear and professional.${languageInstruction}`
      },
      {
        role: "user",
        content: `Please summarize this meeting transcript: ${transcript}`
      }
    ];
    
    const response = await fetch("https://toolkit.rork.com/text/llm/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      throw new Error(`Summary generation failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Summary generated:", data.completion.substring(0, 50) + "...");
    return data.completion;
  } catch (error) {
    console.error("Summary generation error:", error);
    throw error;
  }
}
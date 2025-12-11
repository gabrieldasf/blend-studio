import { GoogleGenAI, Type } from "@google/genai";
import { AudioResult } from "../types";

// Helper to get initialized AI client
const getGenAI = () => {
    const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Chave de API não encontrada. Por favor, configure sua chave no menu Configurações.");
    }
    return new GoogleGenAI({ apiKey });
};

// 6MB chunks to be safe with browser request limits and base64 overhead
const CHUNK_SIZE = 6 * 1024 * 1024; 

// Helper to convert Blob/File to Base64
const blobToGenerativePart = async (blob: Blob, mimeType: string): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const transcribeChunk = async (chunk: Blob, mimeType: string, index: number, total: number): Promise<string> => {
  try {
    const ai = getGenAI();
    const audioPart = await blobToGenerativePart(chunk, mimeType);
    
    // Prompt specific for pure transcription of a segment
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          audioPart,
          {
            text: `Esta é a parte ${index + 1} de ${total} de um arquivo de áudio.
            Sua tarefa é APENAS transcrever o áudio fornecido fielmente, palavra por palavra, em Português.
            Não inclua cabeçalhos, não descreva sons de fundo, não coloque "Continua na próxima parte".
            Apenas o texto falado. Se o áudio estiver vazio ou for apenas ruído, retorne uma string vazia.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                text: { type: Type.STRING }
            }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return json.text || "";
  } catch (e) {
    console.warn(`Retry chunk ${index + 1}...`, e);
    // Simple retry logic could go here, for now return empty string or throw
    throw e;
  }
};

const generateFinalSummary = async (fullTranscription: string): Promise<string> => {
    if (!fullTranscription || fullTranscription.length < 50) {
        return "Áudio insuficiente para gerar um resumo detalhado.";
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [{
                text: `Aqui está a transcrição completa de um áudio/vídeo:
                
                "${fullTranscription}"
                
                Com base APENAS neste texto:
                Forneça um resumo executivo detalhado e estruturado da ideia principal discutida, destacando pontos-chave, argumentos e conclusões.
                O resumo deve ser rico e útil.`
            }]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING }
                }
            }
        }
    });

    const json = JSON.parse(response.text || "{}");
    return json.summary || "Não foi possível gerar o resumo.";
};

export const processAudioWithGemini = async (
    file: File, 
    onProgress: (current: number, total: number) => void
): Promise<AudioResult> => {
  try {
    // Validate API Key existence before starting
    getGenAI();

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let fullTranscription = "";

    // 1. Chunk Processing Loop
    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Notify UI about progress
        onProgress(i + 1, totalChunks);

        // Transcribe this specific chunk
        const chunkText = await transcribeChunk(chunk, file.type, i, totalChunks);
        
        fullTranscription += chunkText + " ";
    }

    fullTranscription = fullTranscription.trim();

    // 2. Final Summarization
    onProgress(totalChunks, totalChunks); // Ensure UI shows 100% before summary
    
    const summary = await generateFinalSummary(fullTranscription);

    return {
        transcription: fullTranscription,
        summary: summary
    };

  } catch (error: any) {
    console.error("Erro ao processar áudio em chunks:", error);
    throw new Error(error.message || "Falha ao processar o áudio.");
  }
};
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ImageFormat, AIResolution } from '../types';

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });

    return {
        inlineData: {
            data: await base64EncodedDataPromise,
            mimeType: file.type,
        },
    };
};

export const analyzeImageForSettings = async (file: File): Promise<AnalysisResult> => {
    try {
        const ai = getClient();
        const imagePart = await fileToGenerativePart(file);

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    imagePart,
                    {
                        text: `Analyze this image to determine the optimal compression settings for web usage.
                        - If it is a photograph or realistic scene, suggest JPEG.
                        - If it contains text, diagrams, screenshots, or flat colors, suggest PNG.
                        - If it needs transparency or is general purpose, consider WEBP.
                        - Suggest a quality value between 0.1 and 1.0 (where 0.8 is standard high quality, 0.6 is good compression).
                        Return a JSON object with 'suggestedFormat', 'suggestedQuality', and a short 'reasoning' string.`
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedFormat: {
                            type: Type.STRING,
                            enum: ['image/jpeg', 'image/png', 'image/webp'],
                            description: "The recommended MIME type"
                        },
                        suggestedQuality: {
                            type: Type.NUMBER,
                            description: "The quality factor from 0.1 to 1.0"
                        },
                        reasoning: {
                            type: Type.STRING,
                            description: "Short explanation of why these settings were chosen"
                        }
                    },
                    required: ["suggestedFormat", "suggestedQuality", "reasoning"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        const result = JSON.parse(text);
        
        return {
            suggestedFormat: result.suggestedFormat as ImageFormat,
            suggestedQuality: result.suggestedQuality,
            reasoning: result.reasoning
        };

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            suggestedFormat: 'image/jpeg',
            suggestedQuality: 0.8,
            reasoning: "AI Analysis failed, defaulting to standard JPEG settings."
        };
    }
};

export const upscaleImageWithAI = async (file: File, resolution: AIResolution): Promise<Blob> => {
    const ai = getClient();
    const imagePart = await fileToGenerativePart(file);

    // gemini-3-pro-image-preview is required for image editing/generation
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [
                imagePart,
                {
                    text: 'Upscale this image to high resolution. Increase detail, sharpen edges, and improve clarity while maintaining the exact subject matter and composition of the original.',
                },
            ],
        },
        config: {
            imageConfig: {
                imageSize: resolution // "2K" or "4K"
            }
        }
    });

    // Extract image from response
    // The response for images usually has the image in the parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) throw new Error("No content generated");

    for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
             const byteCharacters = atob(part.inlineData.data);
             const byteNumbers = new Array(byteCharacters.length);
             for (let i = 0; i < byteCharacters.length; i++) {
                 byteNumbers[i] = byteCharacters.charCodeAt(i);
             }
             const byteArray = new Uint8Array(byteNumbers);
             return new Blob([byteArray], { type: 'image/png' }); // Gemini usually returns PNG
        }
    }

    throw new Error("No image data found in response");
};
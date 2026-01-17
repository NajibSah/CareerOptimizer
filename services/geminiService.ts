
import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, GeneratorResponse, CheckerResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const GENERATOR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    suggestedSkills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["name", "category"]
      }
    },
    cvSections: {
      type: Type.OBJECT,
      properties: {
        professionalSummary: { type: Type.STRING },
        coreCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        keyProjects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["role", "bulletPoints"]
          }
        }
      },
      required: ["professionalSummary", "coreCompetencies", "keyProjects", "experience"]
    },
    cta: { type: Type.STRING },
    canvaLogic: { type: Type.STRING }
  },
  required: ["suggestedSkills", "cvSections", "cta", "canvaLogic"]
};

const CHECKER_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          suggestedCourse: { type: Type.STRING },
          platform: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["skill", "suggestedCourse", "platform", "reason"]
      }
    }
  },
  required: ["skillGaps"]
};

export const generateCV = async (careerDetails: string, targetJob: string): Promise<GeneratorResponse> => {
  const prompt = `Mode: [GENERATOR]. Career Details: ${careerDetails}. Target Job: ${targetJob}. Generate 5-7 high-impact skills and 4 essential CV sections. End with CTA: [UI_BUTTON: DESIGN_WITH_CANVA] and explain the logic.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: GENERATOR_SCHEMA,
    }
  });

  return JSON.parse(response.text);
};

export const checkCV = async (
  cvInput: { text?: string; file?: { data: string; mimeType: string } }, 
  jobDescription: string
): Promise<CheckerResponse> => {
  const promptText = `Mode: [CHECKER]. Analyze the provided CV against this Job Description: ${jobDescription}. Identify critical skill gaps. Suggest courses based on: Technical/Business -> Coursera, Niche/Software -> Udemy, Data/AI -> DataCamp, General -> LinkedIn Learning.`;

  const parts: any[] = [{ text: promptText }];
  
  if (cvInput.file) {
    parts.push({
      inlineData: {
        data: cvInput.file.data,
        mimeType: cvInput.file.mimeType
      }
    });
  } else if (cvInput.text) {
    parts.push({ text: `CV Text: ${cvInput.text}` });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: CHECKER_SCHEMA,
    }
  });

  return JSON.parse(response.text);
};

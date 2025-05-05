// src/ai/flows/generate-planting-tips.ts
'use server';

/**
 * @fileOverview Generates planting tips for healthy cotton plants using GenAI.
 *
 * - generatePlantingTips - A function that generates planting tips.
 * - GeneratePlantingTipsInput - The input type for the generatePlantingTips function.
 * - GeneratePlantingTipsOutput - The return type for the generatePlantingTips function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GeneratePlantingTipsInputSchema = z.object({
  disease: z.literal("Healthy").describe('The detected disease of the cotton plant. Must be \"Healthy\".'),
});
export type GeneratePlantingTipsInput = z.infer<typeof GeneratePlantingTipsInputSchema>;

const GeneratePlantingTipsOutputSchema = z.object({
  plantingTips: z.string().describe('Tips for maintaining the health of the cotton plant and preventing diseases.'),
});
export type GeneratePlantingTipsOutput = z.infer<typeof GeneratePlantingTipsOutputSchema>;

export async function generatePlantingTips(input: GeneratePlantingTipsInput): Promise<GeneratePlantingTipsOutput> {
  return generatePlantingTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePlantingTipsPrompt',
  input: {
    schema: z.object({
      disease: z.literal("Healthy").describe('The detected disease of the cotton plant. Must be \"Healthy\".'),
    }),
  },
  output: {
    schema: z.object({
      plantingTips: z.string().describe('Tips for maintaining the health of the cotton plant and preventing diseases.'),
    }),
  },
  prompt: `You are an expert in cotton plant care. Given that the cotton plant is healthy, provide proactive tips on maintaining its health and preventing diseases.

  Disease: {{{disease}}}

  Planting Tips:`, 
});

const generatePlantingTipsFlow = ai.defineFlow<
  typeof GeneratePlantingTipsInputSchema,
  typeof GeneratePlantingTipsOutputSchema
>({
  name: 'generatePlantingTipsFlow',
  inputSchema: GeneratePlantingTipsInputSchema,
  outputSchema: GeneratePlantingTipsOutputSchema,
}, async (input) => {
  const {output} = await prompt(input);
  return output!;
});

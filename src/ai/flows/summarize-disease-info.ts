// SummarizeDiseaseInfo story
'use server';

/**
 * @fileOverview Summarizes information about a detected cotton disease.
 *
 * - summarizeDiseaseInfo - A function that summarizes information about a detected cotton disease.
 * - SummarizeDiseaseInfoInput - The input type for the summarizeDiseaseInfo function.
 * - SummarizeDiseaseInfoOutput - The return type for the summarizeDiseaseInfo function.
 */

import {ai} from '@/ai/ai-instance';
import {CottonDisease} from '@/services/cotton-disease-api';
import {z} from 'genkit';

const SummarizeDiseaseInfoInputSchema = z.object({
  disease: z.string().describe('The detected cotton disease.'),
});
export type SummarizeDiseaseInfoInput = z.infer<typeof SummarizeDiseaseInfoInputSchema>;

const SummarizeDiseaseInfoOutputSchema = z.object({
  summary: z.string().describe('A summary of the detected disease, its common causes, and potential impact on the cotton crop.'),
});
export type SummarizeDiseaseInfoOutput = z.infer<typeof SummarizeDiseaseInfoOutputSchema>;

export async function summarizeDiseaseInfo(input: SummarizeDiseaseInfoInput): Promise<SummarizeDiseaseInfoOutput> {
  return summarizeDiseaseInfoFlow(input);
}

const summarizeDiseaseInfoPrompt = ai.definePrompt({
  name: 'summarizeDiseaseInfoPrompt',
  input: {
    schema: z.object({
      disease: z.string().describe('The detected cotton disease.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A summary of the detected disease, its common causes, and potential impact on the cotton crop.'),
    }),
  },
  prompt: `You are an expert in cotton diseases. Please provide a summary of the following disease, including its common causes and potential impact on the cotton crop.\n\nDisease: {{{disease}}}`,
});

const summarizeDiseaseInfoFlow = ai.defineFlow<
  typeof SummarizeDiseaseInfoInputSchema,
  typeof SummarizeDiseaseInfoOutputSchema
>(
  {
    name: 'summarizeDiseaseInfoFlow',
    inputSchema: SummarizeDiseaseInfoInputSchema,
    outputSchema: SummarizeDiseaseInfoOutputSchema,
  },
  async input => {
    const {output} = await summarizeDiseaseInfoPrompt(input);
    return output!;
  }
);

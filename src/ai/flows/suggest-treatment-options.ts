// src/ai/flows/suggest-treatment-options.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting treatment options and preventative measures for cotton diseases.
 *
 * - suggestTreatmentOptions - A function that takes a disease summary and available pesticide products
 *   and returns suggested treatment options and preventative measures.
 * - SuggestTreatmentOptionsInput - The input type for the suggestTreatmentOptions function.
 * - SuggestTreatmentOptionsOutput - The return type for the suggestTreatmentOptions function.
 */

import {ai} from '@/ai/ai-instance';
import type {CottonDisease} from '@/services/cotton-disease-api'; // Use import type
import {z} from 'genkit';

const SuggestTreatmentOptionsInputSchema = z.object({
  disease: z.enum([ // Use z.enum with the known values directly for validation
        "Aphids",
        "Army worm",
        "Bacterial blight",
        "Cotton Boll Rot",
        "Green Cotton Boll",
        "Healthy",
        "Powdery mildew",
        "Target spot",
        "Unknown" // Include Unknown if the API might return it
     ]).describe('The detected cotton disease.'),
  availableProducts: z.array(
    z.object({
      name: z.string().describe('The name of the pesticide product.'),
      description: z.string().describe('A description of the pesticide product.'),
    })
  ).describe('A list of available pesticide products.'),
});
export type SuggestTreatmentOptionsInput = z.infer<typeof SuggestTreatmentOptionsInputSchema>;

const SuggestTreatmentOptionsOutputSchema = z.object({
  treatmentOptions: z.string().describe('Suggested treatment options for the disease.'),
  preventativeMeasures: z.string().describe('Preventative measures to avoid future outbreaks.'),
});
export type SuggestTreatmentOptionsOutput = z.infer<typeof SuggestTreatmentOptionsOutputSchema>;

export async function suggestTreatmentOptions(
  input: SuggestTreatmentOptionsInput
): Promise<SuggestTreatmentOptionsOutput> {
  return suggestTreatmentOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentOptionsPrompt',
  input: {
    schema: z.object({
      disease: z.enum([ // Keep consistent with input schema
            "Aphids",
            "Army worm",
            "Bacterial blight",
            "Cotton Boll Rot",
            "Green Cotton Boll",
            "Healthy",
            "Powdery mildew",
            "Target spot",
            "Unknown"
        ]).describe('The detected cotton disease.'),
      availableProducts: z.array(
        z.object({
          name: z.string().describe('The name of the pesticide product.'),
          description: z.string().describe('A description of the pesticide product.'),
        })
      ).describe('A list of available pesticide products.'),
    }),
  },
  output: {
    schema: z.object({
      treatmentOptions: z.string().describe('Suggested treatment options for the disease.'),
      preventativeMeasures: z.string().describe('Preventative measures to avoid future outbreaks.'),
    }),
  },
  prompt: `You are an expert in cotton disease management. Given the detected disease and available pesticide products, suggest treatment options and preventative measures.

Disease: {{{disease}}}

Available Products:
{{#each availableProducts}}
- Name: {{{name}}}
  Description: {{{description}}}
{{/each}}

Treatment Options: Summarize treatment options using the available pesticide products.

Preventative Measures: Suggest preventative measures to avoid future outbreaks of the disease.
`,
});

const suggestTreatmentOptionsFlow = ai.defineFlow<
  typeof SuggestTreatmentOptionsInputSchema,
  typeof SuggestTreatmentOptionsOutputSchema
>(
  {
    name: 'suggestTreatmentOptionsFlow',
    inputSchema: SuggestTreatmentOptionsInputSchema,
    outputSchema: SuggestTreatmentOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

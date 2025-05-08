'use server';
/**
 * @fileOverview AI-powered conversation summary suggestion.
 *
 * - suggestConversationSummary - A function that suggests a summary for conversation notes.
 *   Input and Output types are defined in '@/ai/schemas/conversation-summary-schemas.ts'.
 */

import {ai} from '@/ai/genkit';
import {
  SuggestConversationSummaryInputSchema,
  type SuggestConversationSummaryInput,
  SuggestConversationSummaryOutputSchema,
  type SuggestConversationSummaryOutput,
} from '@/ai/schemas/conversation-summary-schemas';


export async function suggestConversationSummary(input: SuggestConversationSummaryInput): Promise<SuggestConversationSummaryOutput> {
  return suggestConversationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestConversationSummaryPrompt',
  input: {
    schema: SuggestConversationSummaryInputSchema,
  },
  output: {
    schema: SuggestConversationSummaryOutputSchema,
  },
  system: `You are an AI assistant that helps users create concise summaries of their conversation notes for a CRM.
Given the raw notes, provide a brief and informative summary highlighting key actions, decisions, and outcomes.
Output ONLY a JSON object with a single key "suggestedSummary", which is a string.
Make sure that the output is valid JSON. For example:
{
  "suggestedSummary": "Discussed project timelines and agreed on the next steps for phase 2. Follow-up meeting scheduled for next week."
}`,
  prompt: `Raw Conversation Notes: {{{rawNotes}}}`,
});

const suggestConversationSummaryFlow = ai.defineFlow(
  {
    name: 'suggestConversationSummaryFlow',
    inputSchema: SuggestConversationSummaryInputSchema,
    outputSchema: SuggestConversationSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI did not return a summary.');
    }
    return output;
  }
);

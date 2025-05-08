
import {z} from 'genkit';

export const SuggestConversationSummaryInputSchema = z.object({
  rawNotes: z.string().min(10, { message: 'Please provide at least 10 characters of notes to summarize.' }).describe('The raw notes or draft summary of the conversation.'),
});
export type SuggestConversationSummaryInput = z.infer<typeof SuggestConversationSummaryInputSchema>;

export const SuggestConversationSummaryOutputSchema = z.object({
  suggestedSummary: z.string().describe('A concise, AI-generated summary of the conversation notes.'),
});
export type SuggestConversationSummaryOutput = z.infer<typeof SuggestConversationSummaryOutputSchema>;

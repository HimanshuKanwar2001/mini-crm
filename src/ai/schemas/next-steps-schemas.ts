
import {z} from 'genkit';

export const SuggestNextStepsInputSchema = z.object({
  leadName: z.string().describe('The name of the lead.'),
  leadEmail: z.string().email().describe('The email address of the lead.'),
  leadLinkedInProfileUrl: z.string().url().optional().or(z.literal('')).describe('The LinkedIn profile URL of the lead.'),
  company: z.string().optional().describe('The company the lead works for.'),
  notes: z.string().optional().describe('Any notes about the lead.'),
  tags: z.array(z.string()).describe('Tags associated with the lead.'),
  communicationHistory: z.string().describe('A summary of past communications with the lead.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

export const SuggestNextStepsOutputSchema = z.object({
  nextSteps: z.array(
    z.string().describe('A specific, actionable next step for the lead.')
  ).describe('The list of next steps suggested for the lead based on their information. Should contain 3-5 suggestions.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

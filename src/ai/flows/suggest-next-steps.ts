'use server';
/**
 * @fileOverview AI-powered next step suggestion for leads.
 *
 * - suggestNextSteps - A function that suggests the next steps for a lead.
 * - SuggestNextStepsInput - The input type for the suggestNextSteps function.
 * - SuggestNextStepsOutput - The return type for the suggestNextSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {LinkedInProfile, getLinkedInProfile} from '@/services/linkedin';

const SuggestNextStepsInputSchema = z.object({
  leadName: z.string().describe('The name of the lead.'),
  leadEmail: z.string().email().describe('The email address of the lead.'),
  leadLinkedInProfileUrl: z.string().url().describe('The LinkedIn profile URL of the lead.'),
  company: z.string().describe('The company the lead works for.'),
  notes: z.string().describe('Any notes about the lead.'),
  tags: z.array(z.string()).describe('Tags associated with the lead.'),
  communicationHistory: z.string().describe('A summary of past communications with the lead.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

const SuggestNextStepsOutputSchema = z.object({
  nextSteps: z.array(
    z.string().describe('A list of suggested next steps for the lead.')
  ).describe('The next steps suggested for the lead based on their information.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const linkedInProfileTool = ai.defineTool({
  name: 'getLinkedInProfile',
  description: 'Retrieves information from a LinkedIn profile given a profile URL.',
  inputSchema: z.object({
    profileUrl: z.string().url().describe('The URL of the LinkedIn profile to retrieve data from.'),
  }),
  outputSchema: z.object({
    profileUrl: z.string().url().describe('The URL of the LinkedIn profile.'),
  }),
  async resolve(input) {
    return await getLinkedInProfile(input.profileUrl);
  },
});

const prompt = ai.definePrompt({
  name: 'suggestNextStepsPrompt',
  input: {
    schema: SuggestNextStepsInputSchema,
  },
  output: {
    schema: SuggestNextStepsOutputSchema,
  },
  tools: [linkedInProfileTool],
  system: `You are an AI assistant helping salespeople determine the next best action for a lead. 

  Given the following information about a lead, suggest 3-5 next steps that the salesperson can take to engage with the lead and move them closer to a sale.
  Consider the lead's LinkedIn profile, company, notes, tags, and communication history when making your suggestions.
  If a LinkedIn profile URL is provided, you can use the linkedInProfileTool to get additional information about the lead's profile.

  Output ONLY a JSON array of strings. Do not include any other text. Make sure that the output is valid JSON. For example:
  [
    "Send a follow-up email",
    "Engage on LinkedIn",
    "Wait 2 days and message again"
  ]
  `,
  prompt: `Lead Name: {{{leadName}}}
Lead Email: {{{leadEmail}}}
Lead LinkedIn Profile URL: {{{leadLinkedInProfileUrl}}}
Company: {{{company}}}
Notes: {{{notes}}}
Tags: {{#each tags}}{{{this}}} {{/each}}
Communication History: {{{communicationHistory}}}`, // Ensure proper Handlebars usage
});

const suggestNextStepsFlow = ai.defineFlow(
  {
    name: 'suggestNextStepsFlow',
    inputSchema: SuggestNextStepsInputSchema,
    outputSchema: SuggestNextStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

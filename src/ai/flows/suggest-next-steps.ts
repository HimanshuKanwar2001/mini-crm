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
  leadLinkedInProfileUrl: z.string().url().optional().or(z.literal('')).describe('The LinkedIn profile URL of the lead.'),
  company: z.string().optional().describe('The company the lead works for.'),
  notes: z.string().optional().describe('Any notes about the lead.'),
  tags: z.array(z.string()).describe('Tags associated with the lead.'),
  communicationHistory: z.string().describe('A summary of past communications with the lead.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

const SuggestNextStepsOutputSchema = z.object({
  nextSteps: z.array(
    z.string().describe('A specific, actionable next step for the lead.')
  ).describe('The list of next steps suggested for the lead based on their information. Should contain 3-5 suggestions.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const linkedInProfileTool = ai.defineTool({
  name: 'getLinkedInProfile',
  description: 'Retrieves information from a LinkedIn profile given a profile URL. Use this tool if a LinkedIn profile URL is provided to gather more context for suggestions.',
  inputSchema: z.object({
    profileUrl: z.string().url().describe('The URL of the LinkedIn profile to retrieve data from.'),
  }),
  outputSchema: z.object({ // This schema should match the return type of getLinkedInProfile
    profileUrl: z.string().url().describe('The URL of the LinkedIn profile.'),
    // Add other fields here if getLinkedInProfile returns them, e.g., summary, experience, etc.
    // For now, it only returns profileUrl as per src/services/linkedin.ts
  }),
  async resolve(input) {
    // The getLinkedInProfile function currently returns a simple object: { profileUrl: string }
    // If it were to return more complex data, this tool's outputSchema and the function's return type
    // would need to be updated accordingly.
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

  Given the following information about a lead, suggest 3-5 concise, actionable next steps that the salesperson can take to engage with the lead and move them closer to a sale.
  Consider the lead's LinkedIn profile (if available, use the getLinkedInProfile tool for more context), company, notes, tags, and communication history when making your suggestions.
  Each suggestion should be a clear, actionable task.

  Output ONLY a JSON object with a single key "nextSteps", which is an array of strings. Do not include any other text or explanations.
  Make sure that the output is valid JSON. For example:
  {
    "nextSteps": [
      "Send a personalized follow-up email referencing key points from the communication history.",
      "Research the lead's company recent news to find relevant conversation starters.",
      "If LinkedIn profile is available and not yet connected, send a connection request with a personalized message.",
      "Schedule a brief call to discuss their specific challenges and how your solution can help.",
      "Set a reminder to follow up in X days if no response is received."
    ]
  }
  `,
  prompt: `Lead Name: {{{leadName}}}
Lead Email: {{{leadEmail}}}
{{#if leadLinkedInProfileUrl}}Lead LinkedIn Profile URL: {{{leadLinkedInProfileUrl}}}{{/if}}
{{#if company}}Company: {{{company}}}{{/if}}
{{#if notes}}Notes: {{{notes}}}{{/if}}
{{#if tags}}Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
Communication History: {{{communicationHistory}}}`,
});

const suggestNextStepsFlow = ai.defineFlow(
  {
    name: 'suggestNextStepsFlow',
    inputSchema: SuggestNextStepsInputSchema,
    outputSchema: SuggestNextStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI did not return an output.');
    }
    // The output from the prompt should now directly match SuggestNextStepsOutputSchema
    // thanks to the updated system prompt and output.schema definition.
    return output;
  }
);


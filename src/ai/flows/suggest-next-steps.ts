'use server';
/**
 * @fileOverview AI-powered next step suggestion for leads.
 *
 * - suggestNextSteps - A function that suggests the next steps for a lead.
 *   Input and Output types are defined in '@/ai/schemas/next-steps-schemas.ts'.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {LinkedInProfile, getLinkedInProfile} from '@/services/linkedin';
import {
  SuggestNextStepsInputSchema,
  type SuggestNextStepsInput,
  SuggestNextStepsOutputSchema,
  type SuggestNextStepsOutput,
} from '@/ai/schemas/next-steps-schemas';


export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
  return suggestNextStepsFlow(input);
}

const linkedInProfileTool = ai.defineTool({
  name: 'getLinkedInProfile',
  description: 'Retrieves information from a LinkedIn profile given a profile URL. Use this tool if a LinkedIn profile URL is provided to gather more context for suggestions.',
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
    return output;
  }
);

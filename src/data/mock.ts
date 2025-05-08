
import type { Lead, LeadStatus, ConversationType } from '@/types';

export const leadStatusOptions: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"];

export const conversationTypeOptions: ConversationType[] = ["Email", "Call", "LinkedIn Message", "Meeting", "Note"];

// export const mockLeads: Lead[] = [
//   {
//     id: '1',
//     name: 'Alice Wonderland',
//     email: 'alice@example.com',
//     linkedinProfileUrl: 'https://linkedin.com/in/alicew',
//     company: 'Wonderland Inc.',
//     notes: 'Met at a conference. Interested in Product A.',
//     tags: ['conference', 'product-a', 'priority'],
//     status: 'New',
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
//     conversations: [
//       {
//         id: 'c1',
//         type: 'Email',
//         date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
//         summary: 'Sent initial introductory email with brochure.',
//         customNotes: 'Used template X.',
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
//       },
//     ],
//   },
//   {
//     id: '2',
//     name: 'Bob The Builder',
//     email: 'bob@example.com',
//     company: 'Construction Co.',
//     notes: 'Referral from existing client. Needs custom solution.',
//     tags: ['referral', 'custom-solution'],
//     status: 'Contacted',
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
//     conversations: [
//       {
//         id: 'c2',
//         type: 'Call',
//         date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
//         summary: 'Initial call. Discussed requirements. Scheduled follow-up meeting.',
//         followUpReminderDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // in 2 days
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
//       },
//       {
//         id: 'c3',
//         type: 'Meeting',
//         date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
//         summary: 'Detailed discussion about custom solution. Client seems positive.',
//         createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
//       }
//     ],
//   },
//   {
//     id: '3',
//     name: 'Charlie Brown',
//     email: 'charlie@example.com',
//     linkedinProfileUrl: 'https://linkedin.com/in/charlieb',
//     company: 'Peanuts Corp.',
//     notes: 'Long-term prospect. Budget constraints previously.',
//     tags: ['long-term', 'budget-sensitive'],
//     status: 'Qualified',
//     createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
//     updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
//     conversations: [],
//   },
// ];

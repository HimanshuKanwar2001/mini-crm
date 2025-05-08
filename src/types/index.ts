
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

export const CONVERSATION_TYPES = ["Email", "Call", "LinkedIn Message", "Meeting", "Note"] as const;
export type ConversationType = typeof CONVERSATION_TYPES[number];

export interface Tag {
  id: string;
  name: string;
}
export interface Lead {
  id: string;
  name: string;
  email: string;
  linkedinProfileUrl?: string;
  company?: string;
  notes?: string;
  tags: string[]; // Simple array of strings for tags
  status: LeadStatus;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  conversations: Conversation[];
}

export interface Conversation {
  id: string;
  type: ConversationType;
  date: string; // ISO string date
  summary: string;
  customNotes?: string;
  followUpReminderDate?: string; // ISO string date
  createdAt: string; // ISO string date
}

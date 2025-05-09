

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

export const CONVERSATION_TYPES = ["Email", "Call", "LinkedIn Message", "Meeting", "Note"] as const;
export type ConversationType = typeof CONVERSATION_TYPES[number];

export interface Tag {
  id: string; // Assuming tags might be stored separately later, using string ID
  name: string;
}
export interface Lead {
  id: string; // MongoDB _id will be converted to string 'id'
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
  id: string; // MongoDB ObjectId for subdocuments can also be string
  type: ConversationType;
  date: string; // ISO string date
  summary: string;
  customNotes?: string;
  followUpReminderDate?: string; // ISO string date
  createdAt: string; // ISO string date
}

export const ACTIVITY_TYPES = ["LEAD_CREATED", "LEAD_UPDATED", "STATUS_CHANGED", "CONVERSATION_LOGGED", "LEAD_DELETED"] as const;
export type ActivityType = typeof ACTIVITY_TYPES[number];

export interface Activity {
  id: string; // MongoDB _id will be converted to string 'id'
  timestamp: string; // ISO string date
  type: ActivityType;
  description: string;
  leadId: string; // Store the string representation of the Lead's ObjectId
  leadName: string;
  details?: {
    oldValue?: string | string[] | null; // Allow null for dates
    newValue?: string | string[] | null; // Allow null for dates
    fieldName?: string;
    conversationType?: ConversationType;
  };
}

// Specific type for events on the calendar page
export interface CalendarFollowUpEvent {
  id: string; // Combination of leadId and conversationId for uniqueness
  leadId: string;
  leadName: string;
  conversationId: string;
  conversationType: ConversationType;
  conversationSummary: string; 
  date: Date; // Date object for easier manipulation with react-day-picker
  originalData: Conversation; // Keep original conversation data if needed
}

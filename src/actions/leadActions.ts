
'use server';

import { ObjectId, Filter, Collection, Document } from 'mongodb';
import { getLeadsCollection, toObjectId, mapMongoDocument, getDb } from '@/lib/mongodb';
import type { Lead, LeadStatus, Conversation, ActivityType } from '@/types';
import type { ConversationFormValues } from '@/components/conversations/ConversationForm';
import type { LeadFormValues } from '@/components/leads/LeadForm';
import { createActivity } from './activityActions'; // Import for logging


export async function getLeads(): Promise<Lead[]> {
  const leadsCollection = await getLeadsCollection();
  const leadsCursor = leadsCollection.find({}).sort({ createdAt: -1 });
  const leadsArray = await leadsCursor.toArray();
  return leadsArray.map(leadDoc => mapMongoDocument<Lead>(leadDoc));
}

export async function createLead(values: LeadFormValues): Promise<Lead> {
  const leadsCollection = await getLeadsCollection();
  const now = new Date().toISOString();
  const processedTags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

  const newLeadData: Omit<Lead, 'id'> = {
    name: values.name,
    email: values.email,
    linkedinProfileUrl: values.linkedinProfileUrl || '',
    company: values.company || '',
    notes: values.notes || '',
    tags: processedTags,
    status: values.status || 'New',
    createdAt: now,
    updatedAt: now,
    conversations: [],
  };

  const result = await leadsCollection.insertOne(newLeadData);
  const createdLead = mapMongoDocument<Lead>({ ...newLeadData, _id: result.insertedId });
  
  // Log activity
  await createActivity('LEAD_CREATED', { id: createdLead.id, name: createdLead.name }, `Lead '${createdLead.name}' was created.`);
  
  return createdLead;
}

export async function updateLead(id: string, values: LeadFormValues): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  const originalLead = await leadsCollection.findOne({ _id: toObjectId(id) } as Filter<Lead>);
  if (!originalLead) return null;

  const originalStatus = originalLead.status as LeadStatus;

  const processedTags = values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  
  const updateData: Partial<Omit<Lead, 'id' | 'createdAt' | 'conversations'>> = {
    name: values.name,
    email: values.email,
    linkedinProfileUrl: values.linkedinProfileUrl || '',
    company: values.company || '',
    notes: values.notes || '',
    tags: processedTags,
    status: values.status,
    updatedAt: new Date().toISOString(),
  };

  Object.keys(updateData).forEach(key => 
    (updateData as any)[key] === undefined && delete (updateData as any)[key]
  );

  const result = await leadsCollection.findOneAndUpdate(
    { _id: toObjectId(id) } as Filter<Lead>,
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  const updatedLead = mapMongoDocument<Lead>(result);

  // Log activity for general update
  await createActivity('LEAD_UPDATED', { id: updatedLead.id, name: updatedLead.name }, `Details for lead '${updatedLead.name}' were updated.`);

  // Log activity if status changed
  if (originalStatus !== updatedLead.status) {
    await createActivity('STATUS_CHANGED', {id: updatedLead.id, name: updatedLead.name}, `Status of lead '${updatedLead.name}' changed from '${originalStatus}' to '${updatedLead.status}'.`, { fieldName: 'status', oldValue: originalStatus, newValue: updatedLead.status });
  }
  
  return updatedLead;
}

export async function deleteLeadDb(id: string): Promise<boolean> {
  const leadsCollection = await getLeadsCollection();
  const leadToDelete = await leadsCollection.findOne({ _id: toObjectId(id) } as Filter<Lead>);
  if (!leadToDelete) return false;

  const result = await leadsCollection.deleteOne({ _id: toObjectId(id) } as Filter<Lead>);
  
  if (result.deletedCount === 1) {
    const mappedLead = mapMongoDocument<Lead>(leadToDelete);
    await createActivity('LEAD_DELETED', { id: mappedLead.id, name: mappedLead.name }, `Lead '${mappedLead.name}' was deleted.`);
    return true;
  }
  return false;
}

export async function addConversationToLead(leadId: string, convoValues: ConversationFormValues): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  
  const newConversation: Conversation = {
    id: new ObjectId().toHexString(),
    type: convoValues.type,
    date: convoValues.date.toISOString(),
    summary: convoValues.summary,
    customNotes: convoValues.customNotes,
    followUpReminderDate: convoValues.followUpReminderDate?.toISOString(),
    createdAt: new Date().toISOString(),
  };

  const result = await leadsCollection.findOneAndUpdate(
    { _id: toObjectId(leadId) } as Filter<Lead>,
    { 
      $push: { conversations: { $each: [newConversation], $sort: { date: -1 } } },
      $set: { updatedAt: new Date().toISOString() }
    },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const updatedLead = mapMongoDocument<Lead>(result);

  // Log activity
  await createActivity('CONVERSATION_LOGGED', { id: updatedLead.id, name: updatedLead.name }, `A '${newConversation.type}' conversation was logged for lead '${updatedLead.name}'.`, { conversationType: newConversation.type });

  return updatedLead;
}

export async function updateLeadStatusDb(leadId: string, newStatus: LeadStatus): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  const leadToUpdate = await leadsCollection.findOne({ _id: toObjectId(leadId) } as Filter<Lead>);
  if (!leadToUpdate) return null;
  
  const oldStatus = leadToUpdate.status as LeadStatus;

  const result = await leadsCollection.findOneAndUpdate(
    { _id: toObjectId(leadId) } as Filter<Lead>,
    { $set: { status: newStatus, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  const updatedLead = mapMongoDocument<Lead>(result);

  // Log activity
  await createActivity('STATUS_CHANGED', { id: updatedLead.id, name: updatedLead.name }, `Status of lead '${updatedLead.name}' changed from '${oldStatus}' to '${newStatus}'.`, { fieldName: 'status', oldValue: oldStatus, newValue: newStatus });
  
  return updatedLead;
}


export async function updateConversationFollowUpReminder(
  leadId: string,
  conversationId: string,
  newFollowUpDate: string | null
): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  const leadObjectId = toObjectId(leadId);

  const lead = await leadsCollection.findOne({ _id: leadObjectId } as Filter<Lead>);
  if (!lead || !lead.conversations) return null;

  const conversationIndex = lead.conversations.findIndex(c => c.id === conversationId);
  if (conversationIndex === -1) return null;

  const oldFollowUpDate = lead.conversations[conversationIndex].followUpReminderDate;

  const updateField = `conversations.${conversationIndex}.followUpReminderDate`;
  
  const result = await leadsCollection.findOneAndUpdate(
    { _id: leadObjectId, "conversations.id": conversationId } as Filter<Document>,
    { 
      $set: { [updateField]: newFollowUpDate, updatedAt: new Date().toISOString() }
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  const updatedLead = mapMongoDocument<Lead>(result);

  // Log activity
  const activityDescription = newFollowUpDate
    ? `Follow-up reminder for conversation on ${new Date(lead.conversations[conversationIndex].date).toLocaleDateString()} with lead '${updatedLead.name}' was changed from ${oldFollowUpDate ? new Date(oldFollowUpDate).toLocaleDateString() : 'none'} to ${new Date(newFollowUpDate).toLocaleDateString()}.`
    : `Follow-up reminder for conversation on ${new Date(lead.conversations[conversationIndex].date).toLocaleDateString()} with lead '${updatedLead.name}' was removed.`;
  
  await createActivity(
    'LEAD_UPDATED', // Or a more specific type like 'REMINDER_UPDATED' if you add it
    { id: updatedLead.id, name: updatedLead.name }, 
    activityDescription,
    { 
      fieldName: `Conversation Reminder (ID: ${conversationId})`, 
      oldValue: oldFollowUpDate || 'None', 
      newValue: newFollowUpDate || 'None' 
    }
  );

  return updatedLead;
}

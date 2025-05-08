
'use server';

import { ObjectId, Filter } from 'mongodb';
import { getLeadsCollection, toObjectId, mapMongoDocument } from '@/lib/mongodb';
import type { Lead, LeadStatus, Conversation } from '@/types';
import type { ConversationFormValues } from '@/components/conversations/ConversationForm';
import type { LeadFormValues } from '@/components/leads/LeadForm';


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
  return mapMongoDocument<Lead>({ ...newLeadData, _id: result.insertedId });
}

export async function updateLead(id: string, values: LeadFormValues): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
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

  // Remove undefined fields to avoid issues with $set
  Object.keys(updateData).forEach(key => 
    (updateData as any)[key] === undefined && delete (updateData as any)[key]
  );

  const result = await leadsCollection.findOneAndUpdate(
    { _id: toObjectId(id) } as Filter<Lead>,
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;
  return mapMongoDocument<Lead>(result);
}

export async function deleteLeadDb(id: string): Promise<boolean> {
  const leadsCollection = await getLeadsCollection();
  const result = await leadsCollection.deleteOne({ _id: toObjectId(id) } as Filter<Lead>);
  return result.deletedCount === 1;
}

export async function addConversationToLead(leadId: string, convoValues: ConversationFormValues): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  
  const newConversation: Conversation = {
    id: new ObjectId().toHexString(),
    type: convoValues.type,
    date: convoValues.date.toISOString(), // Ensure date is ISO string
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
  return mapMongoDocument<Lead>(result);
}

export async function updateLeadStatusDb(leadId: string, newStatus: LeadStatus): Promise<Lead | null> {
  const leadsCollection = await getLeadsCollection();
  const result = await leadsCollection.findOneAndUpdate(
    { _id: toObjectId(leadId) } as Filter<Lead>,
    { $set: { status: newStatus, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  if (!result) return null;
  return mapMongoDocument<Lead>(result);
}

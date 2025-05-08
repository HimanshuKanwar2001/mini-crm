
'use server';

import { ObjectId, Filter } from 'mongodb';
import { getActivitiesCollection, mapMongoDocument } from '@/lib/mongodb';
import type { Activity, ActivityType, Lead } from '@/types'; // Assuming Lead might be needed for context

export async function getActivities(): Promise<Activity[]> {
  const activitiesCollection = await getActivitiesCollection();
  const activitiesCursor = activitiesCollection.find({}).sort({ timestamp: -1 });
  const activitiesArray = await activitiesCursor.toArray();
  return activitiesArray.map(activityDoc => mapMongoDocument<Activity>(activityDoc));
}

export async function createActivity(
  type: ActivityType,
  leadData: { id: string; name: string }, // Simplified lead data for logging
  description: string,
  details?: Activity['details']
): Promise<Activity> {
  const activitiesCollection = await getActivitiesCollection();
  const now = new Date().toISOString();

  const newActivityData: Omit<Activity, 'id'> = {
    timestamp: now,
    type,
    description,
    leadId: leadData.id, // This is the string ID
    leadName: leadData.name,
    details,
  };

  const result = await activitiesCollection.insertOne(newActivityData);
  return mapMongoDocument<Activity>({ ...newActivityData, _id: result.insertedId });
}

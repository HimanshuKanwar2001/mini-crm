
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Activity } from '@/types';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { RefreshCw, Search, History, Info, FilePenLine, Route, MessageSquare, UserPlus, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { getActivities } from '@/actions/activityActions'; // Import server action
import { useToast } from '@/hooks/use-toast';

// Helper function to get icon based on activity type
const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'LEAD_CREATED': return <UserPlus className="h-4 w-4 text-green-500" />;
    case 'LEAD_UPDATED': return <FilePenLine className="h-4 w-4 text-blue-500" />;
    case 'STATUS_CHANGED': return <Route className="h-4 w-4 text-purple-500" />;
    case 'CONVERSATION_LOGGED': return <MessageSquare className="h-4 w-4 text-teal-500" />;
    case 'LEAD_DELETED': return <UserMinus className="h-4 w-4 text-red-500" />;
    default: return <Info className="h-4 w-4 text-gray-500" />;
  }
};


export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadActivities() {
      try {
        const activitiesData = await getActivities();
        setActivities(activitiesData);
      } catch (error) {
        console.error("Failed to load activities:", error);
        toast({ title: "Error", description: "Failed to load activities from server.", variant: "destructive" });
        setActivities([]);
      }
      setIsMounted(true);
    }
    loadActivities();
  }, [toast]);


  const filteredActivities = useMemo(() => {
    if (!activities) return []; 
    if (!searchTerm) return activities;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return activities.filter(activity =>
      activity.leadName.toLowerCase().includes(lowerSearchTerm) ||
      activity.description.toLowerCase().includes(lowerSearchTerm) ||
      activity.type.toLowerCase().includes(lowerSearchTerm) ||
      (activity.leadId && activity.leadId.toLowerCase().includes(lowerSearchTerm)) ||
      (activity.details?.newValue && String(activity.details.newValue).toLowerCase().includes(lowerSearchTerm)) ||
      (activity.details?.oldValue && String(activity.details.oldValue).toLowerCase().includes(lowerSearchTerm)) ||
      (activity.details?.conversationType && String(activity.details.conversationType).toLowerCase().includes(lowerSearchTerm))
    );
  }, [activities, searchTerm]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-muted-foreground">Loading Activity Log...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
          <History className="mr-3 h-8 w-8" /> Activity Log
        </h1>
        <div className="relative w-full sm:w-1/2 md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center text-muted-foreground">
            <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
            {searchTerm ? `No activities found matching "${searchTerm}".` : "No activities recorded yet."}
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-18rem)] rounded-md border shadow-lg bg-card">
          <div className="space-y-4 p-4">
            {filteredActivities.map(activity => (
              <Card key={activity.id} className="shadow-sm hover:shadow-md transition-shadow bg-background">
                <CardHeader className="pb-3 pt-4">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold flex items-center text-foreground">
                      {getActivityIcon(activity.type)}
                      <span className="ml-2">{activity.type.replace(/_/g, ' ')}</span>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy - hh:mm a')}
                    </span>
                  </div>
                  <CardDescription className="text-base !mt-1">
                    {activity.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm space-y-1 pt-0 pb-3">
                  <p>
                    <span className="font-semibold text-muted-foreground">Lead:</span>{' '}
                    <Link href={`/?leadId=${activity.leadId}#lead-${activity.leadId}`} className="text-accent hover:underline" title={`View details for lead ${activity.leadName}`}>
                      {activity.leadName}
                    </Link>
                  </p>
                  {activity.details?.fieldName && (
                    <p>
                      <span className="font-semibold text-muted-foreground">Field:</span> {activity.details.fieldName}
                    </p>
                  )}
                  {activity.details?.oldValue !== undefined && (
                    <p>
                      <span className="font-semibold text-muted-foreground">Previous:</span>{' '}
                      <Badge variant="outline" className="font-normal bg-muted/50 text-sm">{String(activity.details.oldValue)}</Badge>
                    </p>
                  )}
                  {activity.details?.newValue !== undefined && (
                    <p>
                      <span className="font-semibold text-muted-foreground">New:</span>{' '}
                      <Badge variant="secondary" className="font-normal text-sm">{String(activity.details.newValue)}</Badge>
                    </p>
                  )}
                   {activity.details?.conversationType && (
                    <p>
                      <span className="font-semibold text-muted-foreground">Type:</span>{' '}
                      <Badge variant="outline" className="font-normal bg-muted/50 text-sm">{String(activity.details.conversationType)}</Badge>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}



'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Lead } from '@/types';
import { leadStatusOptions } from '@/data/mock';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LeadsByStatusChart } from '@/components/dashboard/LeadsByStatusChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Users, TrendingUp, TrendingDown, BarChartBig } from 'lucide-react';
import { getLeads } from '@/actions/leadActions'; // Import server action
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadLeads() {
      try {
        const leadsData = await getLeads();
        setLeads(leadsData);
      } catch (error) {
        console.error("Failed to load leads for dashboard:", error);
        toast({ title: "Error", description: "Failed to load lead data from server.", variant: "destructive" });
        setLeads([]);
      }
      setIsMounted(true);
    }
    loadLeads();
  }, [toast]);

  const stats = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        totalLeads: 0,
        convertedLeads: 0,
        lostLeads: 0,
        conversionRate: 0,
        leadsByStatusData: [],
      };
    }

    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const lostLeads = leads.filter(lead => lead.status === 'Lost').length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    const leadsByStatusData = leadStatusOptions.map(status => ({
      name: status,
      count: leads.filter(lead => lead.status === status).length,
    }));

    return {
      totalLeads,
      convertedLeads,
      lostLeads,
      conversionRate,
      leadsByStatusData,
    };
  }, [leads]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <RefreshCw className="h-10 w-10 animate-spin text-accent" />
        <p className="ml-3 text-lg text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads.toString()}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          description="Total number of leads in the system."
        />
        <StatsCard
          title="Converted Leads"
          value={stats.convertedLeads.toString()}
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
          description="Leads successfully converted to customers."
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={<BarChartBig className="h-5 w-5 text-muted-foreground" />}
          description="Percentage of leads converted."
        />
        <StatsCard
          title="Lost Leads"
          value={stats.lostLeads.toString()}
          icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
          description="Leads marked as lost."
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Leads by Status</CardTitle>
          <CardDescription>Distribution of leads across different statuses.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.leadsByStatusData.length > 0 && stats.totalLeads > 0 ? (
            <LeadsByStatusChart data={stats.leadsByStatusData} />
          ) : (
            <p className="text-muted-foreground text-center py-8">No lead data available to display chart.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'; // Removed ResponsiveContainer import
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { leadStatusOptions } from '@/data/mock'; 

interface LeadsByStatusChartProps {
  data: { name: string; count: number }[];
}

const chartConfig = {
  count: {
    label: 'Lead Count',
    color: 'hsl(var(--chart-1))', 
  },
  ...leadStatusOptions.reduce((acc, status, index) => {
    acc[status] = {
      label: status,
      color: `hsl(var(--chart-${(index % 5) + 1}))` 
    };
    return acc;
  }, {} as Record<string, { label: string, color: string }>)
} satisfies ChartConfig;


export function LeadsByStatusChart({ data }: LeadsByStatusChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No data to display in chart.</p>;
  }
  
  return (
    <div className="h-[350px] w-full">
      {/* 
        ChartContainer internally wraps its children with ResponsiveContainer.
        The className prop applies to the div rendered by ChartContainer.
        Setting h-full ensures it respects the parent's height constraint.
      */}
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart data={data} accessibilityLayer>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            // tickFormatter={(value) => value.slice(0, 3)} // Example: Shorten labels if needed
          />
          <YAxis allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))', radius: 'var(--radius)' }}
            content={<ChartTooltipContent />}
          />
          <Legend content={<ChartLegendContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}


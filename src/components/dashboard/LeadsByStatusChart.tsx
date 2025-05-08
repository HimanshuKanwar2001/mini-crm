'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { leadStatusOptions } from '@/data/mock'; // To ensure consistent color mapping if needed

interface LeadsByStatusChartProps {
  data: { name: string; count: number }[];
}

const chartConfig = {
  count: {
    label: 'Lead Count',
    color: 'hsl(var(--chart-1))', // Using primary chart color
  },
  // You can define colors for each status if you want them to be distinct and consistent
  // For now, we'll use a single color for the bars.
  ...leadStatusOptions.reduce((acc, status, index) => {
    acc[status] = {
      label: status,
      color: `hsl(var(--chart-${(index % 5) + 1}))` // Cycle through 5 chart colors
    };
    return acc;
  }, {} as Record<string, { label: string, color: string }>)
} satisfies ChartConfig;


export function LeadsByStatusChart({ data }: LeadsByStatusChartProps) {
  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No data to display in chart.</p>;
  }
  
  // Transform data to fit what Recharts expects if needed, but current structure should work
  // Ensure data has 'name' (for XAxis dataKey) and 'count' (for Bar dataKey)

  return (
    <div className="h-[350px] w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

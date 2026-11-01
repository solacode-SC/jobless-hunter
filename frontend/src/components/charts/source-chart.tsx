'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SourceCount } from '@/types';

interface SourceChartProps {
  data: SourceCount[];
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export function SourceChart({ data }: SourceChartProps) {
  const formattedData = data.map((d) => ({
    name: d.source.replace('_', ' ').toUpperCase(),
    count: d.count,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc',
            }}
          />
          <Bar dataKey="count" name="Jobs Found" radius={[4, 4, 0, 0]}>
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


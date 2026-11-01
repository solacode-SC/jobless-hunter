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

const SKETCH_COLORS = ['#FFEB00', '#BAE6FD', '#BBF7D0', '#FECDD3', '#DDD6FE'];

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
            stroke="#111111"
            fontFamily="Space Mono, monospace"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#111111', strokeWidth: 1.5, strokeDasharray: '3 3' }}
          />
          <YAxis
            stroke="#111111"
            fontFamily="Space Mono, monospace"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#111111', strokeWidth: 1.5, strokeDasharray: '3 3' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#111111',
              borderWidth: '2px',
              borderRadius: '8px',
              boxShadow: '3px 3px 0 #111111',
              fontFamily: 'Space Mono, monospace',
              fontSize: '12px',
              color: '#111111',
            }}
          />
          <Bar dataKey="count" name="Jobs Found" stroke="#111111" strokeWidth={2}>
            {formattedData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={SKETCH_COLORS[index % SKETCH_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendPoint } from '@/types';

interface ActivityChartProps {
  data: TrendPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFEB00" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FFEB00" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#111111"
            fontFamily="Space Mono, monospace"
            fontSize={11}
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
          <Area
            type="monotone"
            dataKey="jobs_discovered"
            name="Discovered Jobs"
            stroke="#111111"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#jobsGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

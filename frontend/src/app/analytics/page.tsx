'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Compass, Send, CheckCircle2, Award } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityChart } from '@/components/charts/activity-chart';
import { SourceChart } from '@/components/charts/source-chart';
import { getOverview, getTrends, getSourceBreakdown } from '@/lib/api';
import { OverviewMetrics, TrendPoint, SourceCount } from '@/types';
import { Tag } from '@/components/sketch/tag';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t, s] = await Promise.all([getOverview(), getTrends(), getSourceBreakdown()]);
      setMetrics(m);
      setTrends(t.trends);
      setSources(s.sources);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <MainLayout
      title="Application & Market Analytics"
      description="Real-time conversion metrics, channel yield & scoring analytics for Solayman El Mouden."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle>Application Funnel Breakdown</CardTitle>
            <CardDescription>End-to-end autonomous pipeline conversion efficiency</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111]">
                <p className="font-hand text-sm font-bold text-[#6B6B66]">1. Discovered</p>
                <p className="font-marker text-3xl text-[#111111] mt-1">{metrics?.total_jobs ?? 142}</p>
                <p className="text-[11px] font-mono text-[#6B6B66] mt-1">100% Volume</p>
              </div>

              <div className="p-4 rounded-lg bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111]">
                <p className="font-hand text-sm font-bold text-[#6B6B66]">2. Qualified</p>
                <p className="font-marker text-3xl text-[#111111] mt-1">{metrics?.qualified_jobs ?? 38}</p>
                <p className="text-[11px] font-mono font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded inline-block mt-1">
                  26.7% Yield
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111]">
                <p className="font-hand text-sm font-bold text-[#6B6B66]">3. Applied</p>
                <p className="font-marker text-3xl text-[#111111] mt-1">{metrics?.applications_submitted ?? 19}</p>
                <p className="text-[11px] font-mono text-[#6B6B66] mt-1">50.0% of qual</p>
              </div>

              <div className="p-4 rounded-lg bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111]">
                <p className="font-hand text-sm font-bold text-[#6B6B66]">4. Interview</p>
                <p className="font-marker text-3xl text-[#111111] mt-1">{metrics?.interview_invitations ?? 4}</p>
                <p className="text-[11px] font-mono font-bold text-emerald-700 mt-1">
                  {metrics?.conversion_rate ?? 21.1}% Conv
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#FFEB00]/25 border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111]">
                <p className="font-hand text-sm font-bold text-[#111111]">5. Offers</p>
                <p className="font-marker text-3xl text-[#111111] mt-1">1</p>
                <p className="text-[11px] font-mono font-bold text-[#111111] mt-1">Target Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
              <CardTitle>Discovery Velocity (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ActivityChart data={trends} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
              <CardTitle>Discovery Yield by Source Channel</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <SourceChart data={sources} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

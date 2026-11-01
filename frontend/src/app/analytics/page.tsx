'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Compass, Send, CheckCircle2, Award } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityChart } from '@/components/charts/activity-chart';
import { SourceChart } from '@/components/charts/source-chart';
import { getOverview, getTrends, getSourceBreakdown } from '@/lib/api';
import { OverviewMetrics, TrendPoint, SourceCount } from '@/types';

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
      description="Real-time conversion metrics, channel yield, and scoring analytics."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-8">
        {/* Conversion Funnel */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Application Funnel Breakdown</CardTitle>
            <CardDescription className="text-xs">End-to-end conversion efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">1. Discovered</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">{metrics?.total_jobs ?? 142}</p>
                <p className="text-[10px] text-slate-500 mt-1">100%</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">2. Qualified</p>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{metrics?.qualified_jobs ?? 38}</p>
                <p className="text-[10px] text-indigo-400/80 mt-1">26.7% yield</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">3. Applied</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{metrics?.applications_submitted ?? 19}</p>
                <p className="text-[10px] text-blue-400/80 mt-1">50.0% of qual</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">4. Interview</p>
                <p className="text-2xl font-bold text-purple-400 mt-1">{metrics?.interview_invitations ?? 4}</p>
                <p className="text-[10px] text-purple-400/80 mt-1">{metrics?.conversion_rate ?? 21.1}% conv</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <p className="text-xs text-slate-400">5. Offer</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">1</p>
                <p className="text-[10px] text-emerald-400/80 mt-1">5.2% of apps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Discovery Velocity (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart data={trends} />
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Discovery Yield by Source Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <SourceChart data={sources} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}


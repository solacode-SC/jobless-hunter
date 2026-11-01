'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  Send,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Building2,
  MapPin,
  Bot,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/status-badge';
import { ActivityChart } from '@/components/charts/activity-chart';
import { SourceChart } from '@/components/charts/source-chart';
import { getOverview, getTrends, getSourceBreakdown, getJobs, triggerDiscovery } from '@/lib/api';
import { OverviewMetrics, TrendPoint, SourceCount, Job } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t, s, j] = await Promise.all([
        getOverview(),
        getTrends(),
        getSourceBreakdown(),
        getJobs({ page: 1, status: 'qualified' }),
      ]);
      setMetrics(m);
      setTrends(t.trends);
      setSources(s.sources);
      setRecentJobs(j.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerDiscovery = async () => {
    setIsDiscovering(true);
    try {
      await triggerDiscovery('Software Engineer');
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <MainLayout
      title="Agent Overview"
      description="24/7 autonomous job discovery, evaluation, and application pipeline."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-8">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Total Discovered</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1">
                    {metrics?.total_jobs ?? '...'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Compass className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                <span className="text-emerald-400 font-medium">Auto-synced</span> every 30m
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Qualified Matches</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1">
                    {metrics?.qualified_jobs ?? '...'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                Avg score: <span className="text-emerald-400 font-semibold">{metrics?.average_match_score}%</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Applications Sent</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1">
                    {metrics?.applications_submitted ?? '...'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Send className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                <span className="text-amber-400 font-medium">{metrics?.pending_approvals}</span> awaiting review
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Interviews Secured</p>
                  <h3 className="text-2xl font-bold text-slate-100 mt-1">
                    {metrics?.interview_invitations ?? '...'}
                  </h3>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                <span className="text-purple-400 font-semibold">{metrics?.conversion_rate}%</span> conversion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-sm font-semibold">Discovery Activity Trend</CardTitle>
                <CardDescription className="text-xs">Jobs discovered over time</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleTriggerDiscovery}
                disabled={isDiscovering}
                className="gap-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              >
                <Bot className="h-3.5 w-3.5" />
                <span>{isDiscovering ? 'Discovering...' : 'Run Discovery Now'}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <ActivityChart data={trends} />
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Source Channels</CardTitle>
              <CardDescription className="text-xs">Distribution across connectors</CardDescription>
            </CardHeader>
            <CardContent>
              <SourceChart data={sources} />
            </CardContent>
          </Card>
        </div>

        {/* Top Matches Section */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Top Qualified Matches for Solayman El Mouden</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Scored using candidate CV (1337 UM6P, RiLyMed DevOps, C/Python/TypeScript stack)
              </CardDescription>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-indigo-400">
                <span>View all jobs</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-800/60">
              {recentJobs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No qualified jobs found yet. Run discovery cycle.</p>
              ) : (
                recentJobs.map((job) => (
                  <div key={job.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/jobs/${job.id}`} className="font-medium text-sm text-slate-200 hover:text-indigo-400 transition-colors truncate">
                          {job.title}
                        </Link>
                        <MatchScoreBadge score={job.match_score} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          {job.location || 'Remote'}
                        </span>
                        <span className="capitalize text-slate-500">{job.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}


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
import { DoodleIcon, Tag } from '@/components/sketch/tag';
import { Highlight } from '@/components/sketch/highlight';
import { SketchCard } from '@/components/sketch/card';

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
      title="Agent Control Pad"
      description="24/7 autonomous job discovery, evaluation & application pipeline for Solayman El Mouden."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Top KPI Cards (Notebook Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* KPI 1 */}
          <SketchCard variant="white" rotation={-1} className="p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-hand text-base font-bold text-[#6B6B66]">Total Discovered</p>
                <h3 className="font-marker text-3xl md:text-4xl text-[#111111] mt-1">
                  {metrics?.total_jobs ?? '...'}
                </h3>
              </div>
              <DoodleIcon icon={Compass} variant="yellow" size="md" />
            </div>
            <div className="pt-3 mt-3 border-t border-dashed border-[#111111]/30 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
              <span className="font-bold text-[#111111]">Auto-synced</span>
              <span>Every 30m</span>
            </div>
          </SketchCard>

          {/* KPI 2 */}
          <SketchCard variant="white" rotation={1.2} className="p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-hand text-base font-bold text-[#6B6B66]">Qualified Matches</p>
                <h3 className="font-marker text-3xl md:text-4xl text-[#111111] mt-1">
                  {metrics?.qualified_jobs ?? '...'}
                </h3>
              </div>
              <DoodleIcon icon={CheckCircle2} variant="white" size="md" />
            </div>
            <div className="pt-3 mt-3 border-t border-dashed border-[#111111]/30 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
              <span>Avg Match Score</span>
              <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded text-[#111111]">
                {metrics?.average_match_score}%
              </span>
            </div>
          </SketchCard>

          {/* KPI 3 */}
          <SketchCard variant="white" rotation={-1.2} className="p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-hand text-base font-bold text-[#6B6B66]">Applications Sent</p>
                <h3 className="font-marker text-3xl md:text-4xl text-[#111111] mt-1">
                  {metrics?.applications_submitted ?? '...'}
                </h3>
              </div>
              <DoodleIcon icon={Send} variant="yellow" size="md" />
            </div>
            <div className="pt-3 mt-3 border-t border-dashed border-[#111111]/30 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
              <span>Awaiting Review</span>
              <span className="font-bold text-[#111111]">{metrics?.pending_approvals ?? 0}</span>
            </div>
          </SketchCard>

          {/* KPI 4 */}
          <SketchCard variant="white" rotation={1} className="p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-hand text-base font-bold text-[#6B6B66]">Interviews Secured</p>
                <h3 className="font-marker text-3xl md:text-4xl text-[#111111] mt-1">
                  {metrics?.interview_invitations ?? '...'}
                </h3>
              </div>
              <DoodleIcon icon={Calendar} variant="white" size="md" />
            </div>
            <div className="pt-3 mt-3 border-t border-dashed border-[#111111]/30 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
              <span>Pipeline Rate</span>
              <span className="font-bold text-emerald-700">{metrics?.conversion_rate}%</span>
            </div>
          </SketchCard>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-dashed border-[#111111]/20 gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Discovery Activity Trend</span>
                  <Tag variant="yellow">Live</Tag>
                </CardTitle>
                <CardDescription>Daily automated crawler intake across job boards</CardDescription>
              </div>
              <Button
                size="sm"
                variant="default"
                onClick={handleTriggerDiscovery}
                disabled={isDiscovering}
                className="gap-2 shrink-0"
              >
                <Bot className="h-4 w-4" />
                <span>{isDiscovering ? 'Crawling...' : 'Run Discovery Now'}</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <ActivityChart data={trends} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b-2 border-dashed border-[#111111]/20">
              <CardTitle>Source Distribution</CardTitle>
              <CardDescription>Breakdown by connector</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SourceChart data={sources} />
            </CardContent>
          </Card>
        </div>

        {/* Top Matches Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-dashed border-[#111111]/20 gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#111111]" />
                <span>Top Qualified Opportunities for Solayman El Mouden</span>
              </CardTitle>
              <CardDescription>
                Evaluated against verified candidate profile (1337 UM6P, RiLyMed DevOps, C/Python/TypeScript)
              </CardDescription>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>View all jobs</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="divide-y-2 divide-dashed divide-[#111111]/20">
              {recentJobs.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="font-hand text-xl text-[#6B6B66]">No qualified jobs found in current batch.</p>
                  <Button size="sm" onClick={handleTriggerDiscovery} disabled={isDiscovering}>
                    Trigger Discovery Crawl
                  </Button>
                </div>
              ) : (
                recentJobs.map((job) => (
                  <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-marker text-base md:text-lg text-[#111111] hover:underline truncate"
                        >
                          {job.title}
                        </Link>
                        <MatchScoreBadge score={job.match_score} />
                        <StatusBadge status={job.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6B6B66]">
                        <span className="flex items-center gap-1 text-[#111111] font-bold">
                          <Building2 className="h-3.5 w-3.5" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || 'Remote'}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{job.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/jobs/${job.id}`}>
                        <Button size="sm" variant="secondary" className="text-xs">
                          Review Details
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

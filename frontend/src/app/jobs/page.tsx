'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Sparkles,
  Building2,
  MapPin,
  ExternalLink,
  Bot,
  CheckCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/status-badge';
import { getJobs, evaluateJob, triggerDiscovery } from '@/lib/api';
import { Job } from '@/types';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const fetchJobsList = async () => {
    setLoading(true);
    try {
      const res = await getJobs({
        search: search || undefined,
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
      setJobs(res.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsList();
  }, [statusFilter, sourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobsList();
  };

  const handleEvaluate = async (id: string) => {
    setEvaluatingId(id);
    try {
      await evaluateJob(id);
      await fetchJobsList();
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    try {
      await triggerDiscovery(search || 'Software Engineer');
      await fetchJobsList();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <MainLayout
      title="Job Discovery Engine"
      description="Aggregated from LinkedIn, Indeed, Google Jobs, and Remote Boards."
      onRefresh={fetchJobsList}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search job title, skills, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-9 px-4">
              Search
            </Button>
          </form>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="discovered">Discovered</option>
              <option value="disqualified">Disqualified</option>
              <option value="applied">Applied</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="remote_board">Remote Boards</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="google_jobs">Google Jobs</option>
            </select>

            <Button
              size="sm"
              onClick={handleRunDiscovery}
              disabled={isDiscovering}
              className="h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{isDiscovering ? 'Crawling...' : 'Scan Sources'}</span>
            </Button>
          </div>
        </div>

        {/* Job Cards List */}
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/40 p-12 text-center">
              <p className="text-slate-400 text-sm">No job records matched your query.</p>
              <Button onClick={handleRunDiscovery} variant="outline" className="mt-4 gap-2 border-indigo-500/30 text-indigo-400">
                <Bot className="h-4 w-4" />
                <span>Run Discovery Now</span>
              </Button>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="border-slate-800/80 bg-slate-900/40 hover:border-slate-700 transition-all">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-slate-100 hover:text-indigo-400 text-base transition-colors">
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status} />
                      <MatchScoreBadge score={job.match_score} />
                      <Badge variant="outline" className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                        {job.source.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {job.location || 'Remote'}
                      </span>
                      {job.salary_min && (
                        <span className="text-emerald-400 font-medium">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                        </span>
                      )}
                    </div>

                    {job.match_explanation && (
                      <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 line-clamp-2">
                        <span className="text-indigo-400 font-medium">AI Rationale: </span>
                        {job.match_explanation}
                      </p>
                    )}

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.required_skills.slice(0, 5).map((sk) => (
                          <span key={sk} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {job.source_url && (
                      <a href={job.source_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-100">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}

                    {job.match_score === null && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEvaluate(job.id)}
                        disabled={evaluatingId === job.id}
                        className="h-8 gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{evaluatingId === job.id ? 'Scoring...' : 'Evaluate Fit'}</span>
                      </Button>
                    )}

                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm" variant="default" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500">
                        View & Tailor
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}


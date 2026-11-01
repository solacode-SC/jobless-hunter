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
import { Tag } from '@/components/sketch/tag';

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
      title="Job Discovery Harvester"
      description="Aggregated from LinkedIn, Indeed, Google Jobs & Remote Boards for Solayman El Mouden."
      onRefresh={fetchJobsList}
      isRefreshing={loading}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#6B6B66]" />
              <input
                type="text"
                placeholder="Search job title, skills, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-[150px_10px_120px_8px/10px_120px_8px_150px] text-sm text-[#111111] placeholder:text-[#6B6B66] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="h-9 px-4">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-xs font-mono font-bold text-[#111111] rounded-full px-3 py-2 focus:outline-none"
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
              className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-xs font-mono font-bold text-[#111111] rounded-full px-3 py-2 focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="remote_board">Remote Boards</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="google_jobs">Google Jobs</option>
            </select>

            <Button
              size="sm"
              variant="default"
              onClick={handleRunDiscovery}
              disabled={isDiscovering}
              className="h-9 gap-1.5"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>{isDiscovering ? 'Crawling...' : 'Scan Feeds'}</span>
            </Button>
          </div>
        </div>

        {/* Job Cards List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <Card className="p-12 text-center bg-[#FFFFFF]">
              <p className="font-hand text-xl text-[#6B6B66]">No job records matched your query.</p>
              <Button onClick={handleRunDiscovery} variant="default" className="mt-4 gap-2">
                <Bot className="h-4 w-4" />
                <span>Run Discovery Now</span>
              </Button>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="p-5 bg-[#FFFFFF]">
                <CardContent className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-marker text-lg text-[#111111] hover:underline transition-colors"
                      >
                        {job.title}
                      </Link>
                      <StatusBadge status={job.status} />
                      <MatchScoreBadge score={job.match_score} />
                      <Tag variant="paper">{job.source.replace('_', ' ')}</Tag>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6B6B66]">
                      <span className="flex items-center gap-1 font-bold text-[#111111]">
                        <Building2 className="h-3.5 w-3.5" />
                        {job.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || 'Remote'}
                      </span>
                      {job.salary_min && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()} {job.salary_currency}
                          </span>
                        </>
                      )}
                    </div>

                    {job.match_explanation && (
                      <div className="text-xs bg-[#FAFAF5] p-3 rounded-[120px_10px_100px_8px/10px_100px_8px_120px] border border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                        <span className="font-bold text-[#111111] block mb-0.5">🧠 AI Evaluation Rationale:</span>
                        <p className="font-hand text-sm text-[#111111] line-clamp-2 leading-snug">
                          {job.match_explanation}
                        </p>
                      </div>
                    )}

                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.required_skills.slice(0, 6).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-[#111111] bg-[#FAFAF5] text-[#111111]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {job.source_url && (
                      <a href={job.source_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0" title="Open Original Posting">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}

                    {job.match_score === null && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleEvaluate(job.id)}
                        disabled={evaluatingId === job.id}
                        className="h-8 gap-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{evaluatingId === job.id ? 'Scoring...' : 'Score Fit'}</span>
                      </Button>
                    )}

                    <Link href={`/jobs/${job.id}`}>
                      <Button size="sm" variant="secondary" className="h-8 text-xs">
                        Review & Tailor
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

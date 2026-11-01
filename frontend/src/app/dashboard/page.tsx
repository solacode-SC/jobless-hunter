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
  Mail,
  FileText,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/status-badge';
import { ActivityChart } from '@/components/charts/activity-chart';
import { SourceChart } from '@/components/charts/source-chart';
import {
  getOverview,
  getTrends,
  getSourceBreakdown,
  getJobs,
  triggerDiscovery,
  getCandidateProfile,
  getCandidateFiles,
  getEmailConfig,
  getOutreachHistory,
  sendOutreachEmail,
} from '@/lib/api';
import { OverviewMetrics, TrendPoint, SourceCount, Job, CandidateProfile } from '@/types';
import { DoodleIcon, Tag } from '@/components/sketch/tag';
import { Highlight } from '@/components/sketch/highlight';
import { SketchCard } from '@/components/sketch/card';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [sources, setSources] = useState<SourceCount[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [filesData, setFilesData] = useState<{ cv_path: string | null; files: any[] }>({ cv_path: null, files: [] });
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [outreachHistory, setOutreachHistory] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Outreach modal state
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachRecipient, setOutreachRecipient] = useState('');
  const [outreachCompany, setOutreachCompany] = useState('');
  const [outreachRole, setOutreachRole] = useState('Software Engineer');
  const [outreachSubject, setOutreachSubject] = useState('Application: Software Engineer — Solayman El Mouden');
  const [outreachBody, setOutreachBody] = useState(
    'Dear Hiring Team,\n\nI am writing to express my strong interest in engineering roles at your company. With a solid foundation in low-level systems (C/C++) from 1337 School (UM6P) and hands-on DevOps containerization experience at RiLyMed, I build robust, high-performance infrastructure.\n\nPlease find my resume attached.\n\nBest regards,\nSolayman El Mouden\nhttps://solaymanbuilds.com'
  );
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachMsg, setOutreachMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, t, s, j, cand, fData, eCfg, oHist] = await Promise.all([
        getOverview(),
        getTrends(),
        getSourceBreakdown(),
        getJobs({ page: 1, status: 'qualified' }),
        getCandidateProfile(),
        getCandidateFiles(),
        getEmailConfig(),
        getOutreachHistory(),
      ]);
      setMetrics(m);
      setTrends(t.trends);
      setSources(s.sources);
      setRecentJobs(j.items);
      setCandidate(cand);
      setFilesData(fData);
      setEmailConfig(eCfg);
      setOutreachHistory(oHist.items || []);
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

  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOutreach(true);
    setOutreachMsg(null);
    try {
      const res = await sendOutreachEmail({
        recipient: outreachRecipient,
        company: outreachCompany,
        role: outreachRole,
        subject: outreachSubject,
        body: outreachBody,
        attach_cv: true,
      });
      setOutreachMsg('✓ Outreach email successfully dispatched to company recruiter!');
      setTimeout(() => {
        setShowOutreachModal(false);
        setOutreachMsg(null);
      }, 2000);
      await loadData();
    } catch (err: any) {
      setOutreachMsg(`Failed: ${err.message}`);
    } finally {
      setSendingOutreach(false);
    }
  };

  return (
    <MainLayout
      title="Agent Control Pad"
      description={`24/7 autonomous job discovery, evaluation & outreach pipeline for ${candidate?.name || 'Solayman El Mouden'}.`}
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* 1. CANDIDATE PROFILE & EMAIL DISPATCH READINESS BAR */}
        <div className="p-5 bg-[#FFFFFF] border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-marker text-sm">
                SE
              </div>
              <div>
                <p className="font-marker text-base text-[#111111] leading-tight">
                  {candidate?.name || 'Solayman El Mouden'}
                </p>
                <p className="font-mono text-xs text-[#6B6B66]">
                  {candidate?.professional_title || 'Software Engineer'} • 1337 UM6P
                </p>
              </div>
            </div>

            <div className="h-8 w-[2px] bg-[#111111]/20 hidden lg:block" />

            {/* Document status */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1 font-bold text-[#111111]">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>{filesData.cv_path ? 'Master CV Active' : 'No CV Uploaded'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#6B6B66]">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{filesData.files.length} Supporting Files</span>
              </span>
            </div>

            <div className="h-8 w-[2px] bg-[#111111]/20 hidden lg:block" />

            {/* Email outreach auth status */}
            <div className="flex items-center gap-2">
              {emailConfig?.is_authenticated ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Agent Mail Ready ({emailConfig.email})</span>
                </div>
              ) : (
                <Link href="/profile">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FECDD3] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111] hover:bg-[#FFEB00] transition-colors">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                    <span>Authorize Mail in Profile →</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="default"
              onClick={() => setShowOutreachModal(true)}
              className="gap-1.5 text-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Outreach</span>
            </Button>
            <Link href="/profile">
              <Button size="sm" variant="secondary" className="text-xs">
                Manage Profile &amp; Files
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. TOP KPI CARDS */}
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
                <p className="font-hand text-base font-bold text-[#6B6B66]">Applications &amp; Outreach</p>
                <h3 className="font-marker text-3xl md:text-4xl text-[#111111] mt-1">
                  {(metrics?.applications_submitted ?? 0) + outreachHistory.length}
                </h3>
              </div>
              <DoodleIcon icon={Send} variant="yellow" size="md" />
            </div>
            <div className="pt-3 mt-3 border-t border-dashed border-[#111111]/30 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
              <span>Outreach Sent</span>
              <span className="font-bold text-[#111111]">{outreachHistory.length} Direct Mails</span>
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

        {/* 3. RECENT RECRUITER OUTREACH & EMAIL DISPATCH TRACKER */}
        {outreachHistory.length > 0 && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-dashed border-[#111111]/20 gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#111111]" />
                  <span>Outreach Dispatch History ({outreachHistory.length})</span>
                </CardTitle>
                <CardDescription>
                  Cold applications and recruiter emails sent via authenticated candidate email.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowOutreachModal(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Outreach</span>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y-2 divide-dashed divide-[#111111]/20">
                {outreachHistory.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-marker text-sm text-[#111111]">{entry.company}</span>
                        <Tag variant="yellow">{entry.role}</Tag>
                        {entry.cv_attached && <Tag variant="paper">CV Attached</Tag>}
                      </div>
                      <p className="font-hand text-sm text-[#6B6B66] mt-0.5">
                        Subject: <strong className="text-[#111111]">{entry.subject}</strong> → To: {entry.recipient}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-[#6B6B66]">
                      <span>{entry.sent_at ? new Date(entry.sent_at).toLocaleDateString() : 'Today'}</span>
                      <span className="font-bold text-emerald-700 bg-[#BBF7D0] px-2 py-0.5 rounded-full border border-[#111111]">
                        {entry.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. CHARTS ROW */}
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

        {/* 5. TOP MATCHES SECTION */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-dashed border-[#111111]/20 gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#111111]" />
                <span>Top Qualified Opportunities for {candidate?.name || 'Solayman'}</span>
              </CardTitle>
              <CardDescription>
                Evaluated against verified candidate profile ({candidate?.skills?.slice(0, 4).join(', ')} stack)
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
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setOutreachCompany(job.company);
                          setOutreachRole(job.title);
                          setOutreachSubject(`Application: ${job.title} — ${candidate?.name || 'Solayman El Mouden'}`);
                          setShowOutreachModal(true);
                        }}
                        className="text-xs gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Outreach</span>
                      </Button>
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

      {/* DISPATCH OUTREACH MODAL */}
      {showOutreachModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-[3px] border-[#111111] shadow-[8px_8px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
              <div>
                <h3 className="font-marker text-xl text-[#111111] flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span>Direct Recruiter Outreach Dispatch</span>
                </h3>
                <p className="font-hand text-sm text-[#6B6B66]">
                  Sent directly from your authenticated email ({emailConfig?.email || 'Gmail'})
                </p>
              </div>
              <button
                onClick={() => setShowOutreachModal(false)}
                className="w-8 h-8 rounded-full border-2 border-[#111111] bg-[#FAFAF5] flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {outreachMsg && (
              <div className="p-3 bg-[#FFEB00]/30 border-2 border-[#111111] rounded-lg text-xs font-mono font-bold text-[#111111]">
                {outreachMsg}
              </div>
            )}

            <form onSubmit={handleSendOutreach} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={outreachCompany}
                    onChange={(e) => setOutreachCompany(e.target.value)}
                    className="w-full bg-[#FAFAF5] border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono"
                    placeholder="e.g. OpenAI, Stripe, RiLyMed"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Target Role</label>
                  <input
                    type="text"
                    required
                    value={outreachRole}
                    onChange={(e) => setOutreachRole(e.target.value)}
                    className="w-full bg-[#FAFAF5] border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  Recipient Email (Recruiter / Hiring Manager / Careers)
                </label>
                <input
                  type="email"
                  required
                  value={outreachRecipient}
                  onChange={(e) => setOutreachRecipient(e.target.value)}
                  className="w-full bg-[#FAFAF5] border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono"
                  placeholder="e.g. careers@company.com or recruiter@company.com"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={outreachSubject}
                  onChange={(e) => setOutreachSubject(e.target.value)}
                  className="w-full bg-[#FAFAF5] border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={outreachBody}
                  onChange={(e) => setOutreachBody(e.target.value)}
                  className="w-full bg-[#FAFAF5] border-2 border-[#111111] rounded-lg p-3 text-xs font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Master CV attached automatically</span>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowOutreachModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={sendingOutreach || !emailConfig?.is_authenticated}
                    className="gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingOutreach ? 'Sending...' : 'Authorize & Send'}</span>
                  </Button>
                </div>
              </div>

              {!emailConfig?.is_authenticated && (
                <p className="text-[11px] font-mono text-rose-700 pt-1 text-center font-bold">
                  ⚠️ Your email is not authenticated. Please authenticate in Candidate Profile before dispatching emails.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

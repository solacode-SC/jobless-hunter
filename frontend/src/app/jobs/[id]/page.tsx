'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  FileText,
  Mail,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/status-badge';
import { getJob, evaluateJob, generateCV, generateCoverLetter, getCandidateProfile } from '@/lib/api';
import { Job, CandidateProfile } from '@/types';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingCV, setGeneratingCV] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [j, c] = await Promise.all([getJob(jobId), getCandidateProfile()]);
      setJob(j);
      setCandidate(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) loadData();
  }, [jobId]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      await evaluateJob(jobId);
      await loadData();
      setActionMessage('Job evaluated successfully against Solayman El Mouden profile!');
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!candidate || !job) return;
    setGeneratingCV(true);
    try {
      await generateCV(candidate.id, job.id, 'en');
      setActionMessage('Tailored CV generated and saved to CV Manager!');
      setTimeout(() => router.push('/cv-manager'), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCV(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!candidate || !job) return;
    setGeneratingCover(true);
    try {
      await generateCoverLetter(candidate.id, job.id, 'en');
      setActionMessage('Tailored Cover Letter generated and saved to Cover Letters!');
      setTimeout(() => router.push('/cover-letters'), 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCover(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Job Details">
        <div className="p-12 text-center text-slate-500 text-sm">Loading job listing...</div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout title="Job Details">
        <div className="p-12 text-center text-slate-400">Job not found.</div>
      </MainLayout>
    );
  }

  const aiEval = job.raw_data?.ai_evaluation;

  return (
    <MainLayout
      title={job.title}
      description={`At ${job.company} — Discovered via ${job.source}`}
      onRefresh={loadData}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to listings</span>
          </Button>

          {job.source_url && (
            <a href={job.source_url} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="gap-2 border-slate-700 text-xs">
                <span>View Original Posting</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          )}
        </div>

        {actionMessage && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl font-bold">{job.title}</CardTitle>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        {job.location || 'Remote'}
                      </span>
                      <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <MatchScoreBadge score={job.match_score} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800/60 pt-4">
                {job.description || 'No description text provided.'}
              </CardContent>
            </Card>
          </div>

          {/* AI Match & Actions Sidebar */}
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>AI Match Assessment</span>
                </CardTitle>
                <CardDescription className="text-xs">Candidate: Solayman El Mouden</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.match_score !== null ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center">
                      <div className="text-3xl font-extrabold text-indigo-400">{job.match_score}%</div>
                      <p className="text-xs text-slate-400 mt-1 capitalize">
                        {aiEval?.classification || 'Evaluated Fit'}
                      </p>
                    </div>

                    {job.match_explanation && (
                      <div className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                        <p className="font-semibold text-slate-200 mb-1">Match Rationale</p>
                        <p>{job.match_explanation}</p>
                      </div>
                    )}

                    {aiEval?.matched_skills && aiEval.matched_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Matched Skills</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiEval.matched_skills.map((sk: string) => (
                            <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiEval?.missing_skills && aiEval.missing_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Identified Gaps / Stretches</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiEval.missing_skills.map((sk: string) => (
                            <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-xs text-slate-400">This job hasn&apos;t been evaluated against your CV yet.</p>
                    <Button
                      onClick={handleEvaluate}
                      disabled={evaluating}
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{evaluating ? 'Evaluating...' : 'Run AI Match'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Generation Actions */}
            <Card className="border-slate-800 bg-slate-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Truthful Document Generator</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Generates job-targeted assets preserving strictly verified facts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleGenerateCV}
                  disabled={generatingCV}
                  variant="outline"
                  className="w-full justify-start gap-2 text-xs border-indigo-500/30 hover:bg-indigo-500/10 text-slate-200"
                >
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span>{generatingCV ? 'Generating Tailored CV...' : 'Generate Tailored CV'}</span>
                </Button>

                <Button
                  onClick={handleGenerateCover}
                  disabled={generatingCover}
                  variant="outline"
                  className="w-full justify-start gap-2 text-xs border-purple-500/30 hover:bg-purple-500/10 text-slate-200"
                >
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span>{generatingCover ? 'Writing Cover Letter...' : 'Generate Cover Letter'}</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


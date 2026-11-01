'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ExternalLink,
  Sparkles,
  FileText,
  Mail,
  Send,
  CheckCircle,
  Clock,
  ShieldCheck,
  Bot,
  Ban,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, MatchScoreBadge } from '@/components/ui/status-badge';
import { Tag } from '@/components/sketch/tag';
import {
  getJob,
  evaluateJob,
  generateCV,
  generateCoverLetter,
  getCandidateProfile,
} from '@/lib/api';
import { Job, CandidateProfile } from '@/types';

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [job, setJob] = useState<Job | null>(null);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingCV, setGeneratingCV] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadJobData = async () => {
    setLoading(true);
    try {
      const [j, c] = await Promise.all([getJob(id), getCandidateProfile()]);
      setJob(j);
      setCandidate(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [id]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      await evaluateJob(id);
      await loadJobData();
      setActionMessage('✓ AI match evaluation complete!');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleGenerateCV = async () => {
    if (!candidate) return;
    setGeneratingCV(true);
    try {
      await generateCV(candidate.id, id, 'en');
      setActionMessage('✓ Truthful tailored CV generated! View in CV Manager.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCV(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!candidate) return;
    setGeneratingCover(true);
    try {
      await generateCoverLetter(candidate.id, id, 'en');
      setActionMessage('✓ Job-specific cover letter generated! View in Cover Letters.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingCover(false);
    }
  };

  if (loading || !job) {
    return (
      <MainLayout title="Job Opportunity">
        <div className="py-20 text-center font-hand text-xl text-[#6B6B66]">
          Loading opportunity specifications...
        </div>
      </MainLayout>
    );
  }

  const aiEval = (job as any).ai_evaluation || job.raw_data?.ai_evaluation;

  return (
    <MainLayout
      title={job.title}
      description={`Discovered from ${job.source.replace('_', ' ')} • Scored against Solayman El Mouden's credentials.`}
      onRefresh={loadJobData}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link href="/jobs">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Job Harvester</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {job.source_url && (
              <a href={job.source_url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                  <span>Original Listing</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 rounded-lg bg-[#FFEB00]/30 border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] font-mono text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Job Description */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6B6B66] mt-2">
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
                      <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={job.status} />
                    <MatchScoreBadge score={job.match_score} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm font-body text-[#111111] leading-relaxed whitespace-pre-line pt-5">
                {job.description || 'No description text provided.'}
              </CardContent>
            </Card>
          </div>

          {/* AI Match & Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#111111]" />
                  <span>AI Match Assessment</span>
                </CardTitle>
                <CardDescription>Candidate: Solayman El Mouden</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {job.match_score !== null ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] text-center">
                      <div className="font-marker text-4xl text-[#111111]">{job.match_score}%</div>
                      <p className="font-hand text-base font-bold text-[#6B6B66] mt-1 capitalize">
                        {aiEval?.classification || 'Evaluated Fit'}
                      </p>
                    </div>

                    {job.match_explanation?.includes('SKIPPED by blocklist') ? (
                      <div className="text-xs bg-red-50 p-3.5 rounded-lg border-2 border-red-900 shadow-[2px_2px_0_#991b1b]">
                        <div className="flex items-center gap-1.5 font-marker text-red-900 mb-1">
                          <Ban className="w-4 h-4 text-red-600" />
                          <span>Skipped by Candidate Blocklist Rule</span>
                        </div>
                        <p className="font-mono text-xs text-red-800 leading-snug">{job.match_explanation}</p>
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <Link href="/settings" className="font-mono text-[11px] underline text-red-900 hover:text-black font-bold">
                            Adjust exclusion block keys in Settings →
                          </Link>
                        </div>
                      </div>
                    ) : job.match_explanation ? (
                      <div className="text-xs bg-[#FFFFFF] p-3.5 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0_#111111]">
                        <p className="font-marker text-xs text-[#111111] mb-1">Match Rationale</p>
                        <p className="font-hand text-sm text-[#111111] leading-snug">{job.match_explanation}</p>
                      </div>
                    ) : null}

                    {aiEval?.matched_skills && aiEval.matched_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-mono font-bold text-[#111111] mb-1.5 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Matched Skills</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiEval.matched_skills.map((sk: string) => (
                            <span
                              key={sk}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFEB00] text-[#111111] border border-[#111111] shadow-[1px_1px_0_#111111]"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiEval?.missing_skills && aiEval.missing_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-mono font-bold text-[#6B6B66] mb-1.5 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#6B6B66]" />
                          <span>Identified Gaps / Stretches</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {aiEval.missing_skills.map((sk: string) => (
                            <span
                              key={sk}
                              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAFAF5] text-[#6B6B66] border border-dashed border-[#111111]/40"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-3">
                    <p className="font-hand text-base text-[#6B6B66]">This job hasn&apos;t been evaluated against your CV yet.</p>
                    <Button
                      onClick={handleEvaluate}
                      disabled={evaluating}
                      variant="default"
                      className="w-full gap-2 text-xs"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{evaluating ? 'Evaluating...' : 'Run AI Match'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Generation Actions */}
            <Card>
              <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#111111]" />
                  <span>Truthful Document Generator</span>
                </CardTitle>
                <CardDescription>
                  Generates job-targeted assets preserving strictly verified facts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button
                  onClick={handleGenerateCV}
                  disabled={generatingCV}
                  variant="secondary"
                  className="w-full justify-start gap-2 text-xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>{generatingCV ? 'Generating Tailored CV...' : 'Generate Tailored CV'}</span>
                </Button>

                <Button
                  onClick={handleGenerateCover}
                  disabled={generatingCover}
                  variant="secondary"
                  className="w-full justify-start gap-2 text-xs"
                >
                  <Mail className="h-4 w-4" />
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

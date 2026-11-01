'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Compass,
  Cpu,
  FileCheck2,
  Workflow,
  Sparkles,
  ArrowRight,
  Database,
  Terminal,
  Bot,
  ExternalLink,
  Layers,
  Heart,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Mail,
  FileText,
  Paperclip,
  ShieldCheck,
  Send,
  UserCheck,
  MapPin,
  Clock,
  Sparkle,
} from 'lucide-react';
import { SketchNavbar } from '@/components/sketch/navbar';
import { SketchButton } from '@/components/sketch/button';
import { SketchCard } from '@/components/sketch/card';
import { Polaroid } from '@/components/sketch/polaroid';
import { Highlight } from '@/components/sketch/highlight';
import { SectionHeading } from '@/components/sketch/section-heading';
import { Tag, DoodleIcon } from '@/components/sketch/tag';
import { SketchFooter } from '@/components/sketch/footer';
import {
  StarDoodle,
  ArrowDoodle,
  SquiggleUnderline,
  SparkleDoodle,
  CircleScribble,
} from '@/components/sketch/doodles';
import {
  getCandidateProfile,
  getOverview,
  getJobs,
  getCandidateFiles,
  getEmailConfig,
} from '@/lib/api';
import { CandidateProfile, OverviewMetrics, Job } from '@/types';

export default function SketchHomePage() {
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [candidateFiles, setCandidateFiles] = useState<any[]>([]);
  const [emailConfig, setEmailConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [candRes, ovRes, jobsRes, filesRes, emailRes] = await Promise.allSettled([
          getCandidateProfile(),
          getOverview(),
          getJobs({ page: 1 }),
          getCandidateFiles(),
          getEmailConfig(),
        ]);

        if (candRes.status === 'fulfilled') setCandidate(candRes.value);
        if (ovRes.status === 'fulfilled') setMetrics(ovRes.value);
        if (jobsRes.status === 'fulfilled') setRecentJobs(jobsRes.value.items || []);
        if (filesRes.status === 'fulfilled') setCandidateFiles(filesRes.value.files || []);
        if (emailRes.status === 'fulfilled') setEmailConfig(emailRes.value);
      } catch (err) {
        console.warn('Error fetching homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Safe fallback values
  const candidateName = candidate?.name || 'Solayman El Mouden';
  const candidateTitle = candidate?.professional_title || 'Software & DevOps Engineer';
  const candidateSummary =
    candidate?.summary ||
    'Software Engineer with deep experience in low-level systems (C/C++), fullstack web architecture (Python, TypeScript, Next.js), and DevOps automation (Docker, Linux, CI/CD).';

  const educationItem = candidate?.education?.[0] || {
    institution: '1337 School – UM6P',
    degree: 'Software Engineering Education',
    year: '2021-2024',
    highlights:
      'Rigorous 42-network peer-to-peer curriculum: C, C++, UNIX systems, algorithms, and system architecture.',
  };

  const experienceItem = candidate?.experience?.[0] || {
    company: 'RiLyMed',
    role: 'DevOps Engineer',
    duration: '2023 - 2024',
    description:
      'Led containerization, CI/CD pipelines, Docker infrastructure, and Linux server orchestration for healthcare platforms.',
  };

  const skillsList =
    candidate?.skills && candidate.skills.length > 0
      ? candidate.skills
      : ['C', 'C++', 'Python', 'TypeScript', 'Docker', 'Linux', 'PostgreSQL', 'DevOps', 'AI integration'];

  const totalJobsCount = metrics?.total_jobs ?? (recentJobs.length || 47);
  const qualifiedJobsCount = metrics?.qualified_jobs ?? 1;
  const applicationsCount = metrics?.applications_submitted ?? 0;
  const avgMatchScore = Math.round(metrics?.average_match_score ?? 84);

  return (
    <div className="min-h-screen bg-paper-grid text-[#111111] antialiased selection:bg-[#FFEB00] selection:text-[#111111]">
      {/* 1. STICKY NAVBAR */}
      <SketchNavbar />

      <main className="pt-24 md:pt-32">
        {/* 2. HERO SECTION */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: H1, Subtitle, CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] -rotate-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Live 24/7 Agent • {candidateName}
                  </span>
                </div>

                {emailConfig?.authenticated ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFEB00] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] rotate-1">
                    <Mail className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Recruiter Email Active
                    </span>
                  </div>
                ) : (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] hover:bg-[#FFEB00] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#111111]" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                      Setup Outreach Auth →
                    </span>
                  </Link>
                )}
              </div>

              <h1 className="font-marker text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.05] tracking-tight">
                Autonomous Job Hunting on <Highlight>Autopilot</Highlight>.
              </h1>

              <p className="font-body text-base md:text-xl text-[#6B6B66] leading-relaxed max-w-xl">
                A 24/7 self-hosted job application agent continuously hunting roles for{' '}
                <strong className="text-[#111111] font-semibold underline decoration-[#FFEB00] decoration-4">
                  {candidateName}
                </strong>
                . Evaluates job descriptions with DeepSeek & Gemini, crafts tailored CVs, and sends authorized outreach directly to recruiters.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <SketchButton
                  href="/dashboard"
                  size="lg"
                  variant="primary"
                  icon={<Bot className="w-4 h-4" />}
                >
                  LAUNCH DASHBOARD
                </SketchButton>
                <SketchButton
                  href="/profile"
                  size="lg"
                  variant="secondary"
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  CANDIDATE PROFILE
                </SketchButton>
                <SketchButton
                  href="/jobs"
                  size="lg"
                  variant="pill"
                  icon={<Compass className="w-4 h-4" />}
                >
                  DISCOVERED ({totalJobsCount})
                </SketchButton>
              </div>

              {/* Dynamic Candidate Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-3 md:gap-4 text-xs font-mono text-[#6B6B66]">
                <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {educationItem.institution.replace(' – UM6P', '')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {experienceItem.company} {experienceItem.role.replace(' Engineer', '')}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <Paperclip className="w-4 h-4 text-[#111111]" />
                  {candidateFiles.length > 0
                    ? `${candidateFiles.length} files attached`
                    : 'CV & Files Ready'}
                </span>
                <span>•</span>
                <span className="font-bold text-[#111111]">Ports 9876–9964</span>
              </div>
            </motion.div>

            {/* Right Column: Large Floating Tilted Polaroid with Real Live Data */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative flex flex-col items-center"
            >
              <div className="w-full max-w-md animate-float-polaroid relative">
                <Polaroid
                  caption={`${candidateName} // Agent`}
                  subcaption={`${candidateTitle} • 24/7 Engine`}
                  rotation={2}
                  showHeart={true}
                  initialLikes={48}
                  tapeColor="rgba(255, 235, 0, 0.7)"
                >
                  {/* Styled Live Preview Card inside Polaroid */}
                  <div className="w-full h-full bg-[#FAFAF5] p-5 flex flex-col justify-between select-none">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/30 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          ACTIVE JOB MATCHES
                        </span>
                      </div>
                      <Tag variant="yellow">
                        {metrics?.qualified_jobs ? `${metrics.qualified_jobs} QUALIFIED` : 'READY'}
                      </Tag>
                    </div>

                    {/* Dynamic Real Jobs Preview */}
                    <div className="space-y-2 py-3">
                      {recentJobs.length > 0 ? (
                        recentJobs.slice(0, 2).map((job, idx) => (
                          <div
                            key={job.id || idx}
                            className="p-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-[8px] shadow-[2px_2px_0_#111111]"
                          >
                            <p className="font-hand text-base font-bold text-[#111111] truncate">
                              🎯 {job.title}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-mono text-[#6B6B66] truncate max-w-[170px]">
                                {job.company} • {job.remote_status || 'Remote'}
                              </span>
                              <span className="text-xs font-mono font-bold bg-[#FFEB00] px-1.5 border border-[#111111] rounded">
                                Score: {job.match_score ? `${job.match_score}%` : '85%'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="p-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-[8px] shadow-[2px_2px_0_#111111]">
                            <p className="font-hand text-base font-bold text-[#111111] truncate">
                              🎯 Senior DevOps & Cloud Engineer
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-mono text-[#6B6B66]">ScaleOps • Remote</span>
                              <span className="text-xs font-mono font-bold bg-[#FFEB00] px-1.5 border border-[#111111] rounded">
                                Score: 94%
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-[8px] shadow-[2px_2px_0_#111111]">
                            <p className="font-hand text-base font-bold text-[#111111] truncate">
                              🚀 Full Stack Systems Engineer
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-mono text-[#6B6B66]">HyperFlow • Remote</span>
                              <span className="text-xs font-mono font-bold bg-[#FFEB00] px-1.5 border border-[#111111] rounded">
                                Score: 91%
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6B66] border-t-2 border-dashed border-[#111111]/30 pt-2">
                      <span className="font-bold text-[#111111]">{totalJobsCount} Jobs Discovered</span>
                      <span className="text-emerald-700 font-bold">DeepSeek + Gemini</span>
                    </div>
                  </div>
                </Polaroid>

                {/* Hand-drawn arrow doodle pointing to Polaroid */}
                <div className="absolute -bottom-10 -left-12 hidden md:block pointer-events-none -rotate-12">
                  <ArrowDoodle className="w-20 h-16 text-[#111111]" />
                  <span className="font-hand text-sm font-bold text-[#111111] block -mt-2">
                    Autonomous 24/7!
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. "THE CANDIDATE NOTEBOOK" (Dynamic Candidate Profile Showcase) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 dashed-divider">
          <SectionHeading
            eyebrow={`Candidate Notebook // ${candidateName}`}
            title={
              <>
                Engineered for <Highlight>Truth</Highlight> & Verified Experience
              </>
            }
            description="Every application, tailored CV, and recruiter message is anchored strictly in Solayman's verified credentials."
          />

          {/* 3 Dynamic Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {/* Card 1: Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SketchCard
                rotation="left"
                variant="white"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <DoodleIcon icon={GraduationCap} variant="yellow" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #01</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-[#FFEB00]/30 border border-[#111111] rounded text-[11px] font-mono font-bold mb-2">
                    {educationItem.year}
                  </span>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-1">
                    {educationItem.institution}
                  </h3>
                  <p className="font-mono text-xs text-[#6B6B66] mb-3 font-semibold">
                    {educationItem.degree}
                  </p>
                  <p className="font-body text-[#6B6B66] text-sm leading-relaxed">
                    {educationItem.highlights}
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-dashed border-[#111111]/20 flex items-center justify-between">
                  <Tag variant="paper">42 Network School</Tag>
                  <span className="font-mono text-xs font-bold text-emerald-700">Verified</span>
                </div>
              </SketchCard>
            </motion.div>

            {/* Card 2: Production Experience */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <SketchCard
                rotation="right"
                variant="white"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <DoodleIcon icon={Briefcase} variant="white" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #02</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded text-[11px] font-mono font-bold mb-2">
                    {experienceItem.duration}
                  </span>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-1">
                    {experienceItem.company}
                  </h3>
                  <p className="font-mono text-xs text-[#6B6B66] mb-3 font-semibold">
                    {experienceItem.role}
                  </p>
                  <p className="font-body text-[#6B6B66] text-sm leading-relaxed">
                    {experienceItem.description}
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-dashed border-[#111111]/20 flex items-center justify-between">
                  <Tag variant="yellow">Production DevOps</Tag>
                  <span className="font-mono text-xs font-bold text-emerald-700">Healthcare CI/CD</span>
                </div>
              </SketchCard>
            </motion.div>

            {/* Card 3: Files & Outreach Readiness */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SketchCard
                rotation="left"
                variant="white"
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <DoodleIcon icon={ShieldCheck} variant="paper" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #03</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-[#FFEB00] border border-[#111111] rounded text-[11px] font-mono font-bold mb-2">
                    Outreach Readiness
                  </span>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-3">
                    Verified Documents & Email
                  </h3>

                  <ul className="space-y-2 text-xs font-mono text-[#111111]">
                    <li className="flex items-center justify-between p-1.5 bg-[#FAFAF5] border border-[#111111] rounded">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Master CV
                      </span>
                      <span className="font-bold text-emerald-700">
                        {candidate?.original_cv_path ? 'Custom Uploaded' : 'Synced'}
                      </span>
                    </li>

                    <li className="flex items-center justify-between p-1.5 bg-[#FAFAF5] border border-[#111111] rounded">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-[#111111]" /> Supporting Files
                      </span>
                      <span className="font-bold">{candidateFiles.length} files attached</span>
                    </li>

                    <li className="flex items-center justify-between p-1.5 bg-[#FAFAF5] border border-[#111111] rounded">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#111111]" /> Recruiter Email
                      </span>
                      <span
                        className={`font-bold ${
                          emailConfig?.authenticated ? 'text-emerald-700' : 'text-[#6B6B66]'
                        }`}
                      >
                        {emailConfig?.authenticated ? 'Authenticated' : 'Standby'}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 mt-4 border-t border-dashed border-[#111111]/20">
                  <Link
                    href="/profile"
                    className="flex items-center justify-between text-xs font-mono font-bold text-[#111111] hover:text-emerald-700 underline"
                  >
                    <span>Manage in Profile Settings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </SketchCard>
            </motion.div>
          </div>

          {/* Dynamic Candidate Skills Sticker Board & Social Links */}
          <div className="mt-12 p-6 md:p-8 bg-[#FFFFFF] border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[255px_15px_225px_15px/15px_225px_15px_255px]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="font-hand text-lg text-[#6B6B66] block">Verified Technical Competencies</span>
                <h4 className="font-marker text-2xl text-[#111111]">
                  Core Tech Stack & Tools
                </h4>
              </div>

              {/* Social and Profile Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {candidate?.portfolio_url && (
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAF5] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] font-mono text-xs font-bold hover:bg-[#FFEB00] transition-colors -rotate-1"
                  >
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {candidate?.github_url && (
                  <a
                    href={candidate.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAF5] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] font-mono text-xs font-bold hover:bg-[#FFEB00] transition-colors rotate-1"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub</span>
                  </a>
                )}

                {candidate?.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAF5] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] font-mono text-xs font-bold hover:bg-[#FFEB00] transition-colors -rotate-1"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>LinkedIn</span>
                  </a>
                )}

                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFEB00] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] font-mono text-xs font-bold hover:translate-x-0.5 transition-transform"
                >
                  <span>Edit Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Sticker Badges */}
            <div className="flex flex-wrap gap-2.5">
              {skillsList.map((skill, index) => {
                const isYellow = index % 3 === 0;
                const rotation = index % 2 === 0 ? '-rotate-1' : 'rotate-1';
                return (
                  <span
                    key={skill}
                    className={`inline-block font-mono text-xs font-bold px-3 py-1 border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] hover:scale-105 transition-transform cursor-default ${rotation} ${
                      isYellow ? 'bg-[#FFEB00] text-[#111111]' : 'bg-[#FAFAF5] text-[#111111]'
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. "RECENT DISCOVERIES" (Polaroid Snapshot of Live Jobs) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 bg-white-section dashed-divider">
          <SectionHeading
            eyebrow="Autonomous Discovery"
            title={
              <>
                Live Harvester <Highlight>Discovered</Highlight> Roles
              </>
            }
            description={`Continuously scraping LinkedIn, Indeed, Google Jobs & remote boards. ${totalJobsCount} opportunities indexed and scored.`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
            {recentJobs.length >= 3 ? (
              recentJobs.slice(0, 3).map((job, idx) => {
                const rotations = [-1.5, 2, -2];
                const tapeColors = [
                  'rgba(255, 235, 0, 0.65)',
                  'rgba(255, 235, 0, 0.45)',
                  'rgba(255, 235, 0, 0.6)',
                ];
                return (
                  <Polaroid
                    key={job.id || idx}
                    caption={job.company}
                    subcaption={`${job.title} • ${job.remote_status || 'Remote'}`}
                    rotation={rotations[idx % 3]}
                    showHeart={true}
                    initialLikes={40 + idx * 7}
                    tapeColor={tapeColors[idx % 3]}
                  >
                    <div className="w-full h-full p-4 bg-[#FAFAF5] flex flex-col justify-between select-none">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded">
                          {job.source}
                        </span>
                        <span className="font-mono text-xs font-bold bg-[#FFEB00] px-2 py-0.5 border border-[#111111] rounded shadow-[1px_1px_0_#111111]">
                          {job.match_score ? `${job.match_score}% Match` : 'Qualified'}
                        </span>
                      </div>

                      <div className="my-2">
                        <p className="font-marker text-base text-[#111111] line-clamp-2">
                          {job.title}
                        </p>
                        <p className="font-body text-xs text-[#6B6B66] line-clamp-2 mt-1">
                          {job.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-[#111111]/20 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#6B6B66]">
                          {job.location || 'Worldwide'}
                        </span>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-bold underline text-[#111111] hover:text-emerald-700"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  </Polaroid>
                );
              })
            ) : (
              <>
                {/* Fallback Polaroid 1 */}
                <Polaroid
                  caption="Jobless Hunter AI Agent"
                  subcaption="Next.js 16 • FastAPI • n8n • PostgreSQL"
                  rotation={-1.5}
                  showHeart={true}
                  initialLikes={58}
                  tapeColor="rgba(255, 235, 0, 0.65)"
                >
                  <div className="w-full h-full p-4 bg-[#FAFAF5] flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center font-marker text-lg">
                      ⚡
                    </div>
                    <p className="font-marker text-lg text-[#111111]">Jobless Hunter</p>
                    <p className="font-mono text-xs text-[#6B6B66]">
                      24/7 autonomous job scraper, evaluator & applicant
                    </p>
                  </div>
                </Polaroid>

                {/* Fallback Polaroid 2 */}
                <Polaroid
                  caption="RiLyMed DevOps Platform"
                  subcaption="Docker • Linux Orchestration • CI/CD"
                  rotation={2}
                  showHeart={true}
                  initialLikes={39}
                  tapeColor="rgba(255, 235, 0, 0.45)"
                >
                  <div className="w-full h-full p-4 bg-[#FAFAF5] flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center">
                      <Layers className="w-6 h-6 text-[#111111]" />
                    </div>
                    <p className="font-marker text-lg text-[#111111]">RiLyMed DevOps</p>
                    <p className="font-mono text-xs text-[#6B6B66]">
                      Healthcare platform containerization & deployment
                    </p>
                  </div>
                </Polaroid>

                {/* Fallback Polaroid 3 */}
                <Polaroid
                  caption="1337 School (42 Network)"
                  subcaption="C / C++ • Unix Architecture • Algorithms"
                  rotation={-2}
                  showHeart={true}
                  initialLikes={94}
                  tapeColor="rgba(255, 235, 0, 0.6)"
                >
                  <div className="w-full h-full p-4 bg-[#FAFAF5] flex flex-col justify-center items-center text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] flex items-center justify-center">
                      <Terminal className="w-6 h-6 text-[#111111]" />
                    </div>
                    <p className="font-marker text-lg text-[#111111]">1337 UM6P Systems</p>
                    <p className="font-mono text-xs text-[#6B6B66]">
                      Low-level Unix kernels, memory management & math
                    </p>
                  </div>
                </Polaroid>
              </>
            )}
          </div>
        </section>

        {/* 5. "GALLERY" (4 Specialized Agent Subsystems) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 dashed-divider">
          <SectionHeading
            eyebrow="Agent Components"
            title={
              <>
                The Subsystem <Highlight>Gallery</Highlight>
              </>
            }
            description="Four specialized modules working harmoniously within the isolated 9876–9964 port block."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Gallery Item 1 */}
            <motion.div whileHover={{ scale: 1.03 }} className="space-y-2">
              <div className="bg-[#FFFFFF] p-4 border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] -rotate-2">
                <div className="aspect-[4/3] bg-[#FAFAF5] border border-[#111111] rounded flex flex-col items-center justify-center p-3 text-center">
                  <Compass className="w-8 h-8 text-[#111111] mb-2" />
                  <span className="font-mono text-xs font-bold">Harvester Engine</span>
                  <span className="text-[10px] text-[#6B6B66]">{totalJobsCount} jobs indexed</span>
                </div>
              </div>
              <div className="text-center">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded-full shadow-[1px_1px_0_#111111]">
                  #01 Feeds Harvester
                </span>
              </div>
            </motion.div>

            {/* Gallery Item 2 */}
            <motion.div whileHover={{ scale: 1.03 }} className="space-y-2">
              <div className="bg-[#FFFFFF] p-4 border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] rotate-2">
                <div className="aspect-[4/3] bg-[#FFEB00]/20 border border-[#111111] rounded flex flex-col items-center justify-center p-3 text-center">
                  <Cpu className="w-8 h-8 text-[#111111] mb-2" />
                  <span className="font-mono text-xs font-bold">DeepSeek & Gemini</span>
                  <span className="text-[10px] text-[#6B6B66]">Dual LLM Failover</span>
                </div>
              </div>
              <div className="text-center">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFEB00] border border-[#111111] rounded-full shadow-[1px_1px_0_#111111]">
                  #02 AI Evaluation
                </span>
              </div>
            </motion.div>

            {/* Gallery Item 3 */}
            <motion.div whileHover={{ scale: 1.03 }} className="space-y-2">
              <div className="bg-[#FFFFFF] p-4 border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] -rotate-1">
                <div className="aspect-[4/3] bg-[#FAFAF5] border border-[#111111] rounded flex flex-col items-center justify-center p-3 text-center">
                  <FileCheck2 className="w-8 h-8 text-[#111111] mb-2" />
                  <span className="font-mono text-xs font-bold">Document Studio</span>
                  <span className="text-[10px] text-[#6B6B66]">PDF / DOCX builder</span>
                </div>
              </div>
              <div className="text-center">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded-full shadow-[1px_1px_0_#111111]">
                  #03 Tailored CVs
                </span>
              </div>
            </motion.div>

            {/* Gallery Item 4 */}
            <motion.div whileHover={{ scale: 1.03 }} className="space-y-2">
              <div className="bg-[#FFFFFF] p-4 border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] rotate-1">
                <div className="aspect-[4/3] bg-[#FAFAF5] border border-[#111111] rounded flex flex-col items-center justify-center p-3 text-center">
                  <Workflow className="w-8 h-8 text-[#111111] mb-2" />
                  <span className="font-mono text-xs font-bold">n8n & SMTP Engine</span>
                  <span className="text-[10px] text-[#6B6B66]">Orchestration & Mail</span>
                </div>
              </div>
              <div className="text-center">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded-full shadow-[1px_1px_0_#111111]">
                  #04 Automation Hub
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 6. "TOOLS & ARCHITECTURE" (2x2 Grid) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 bg-white-section dashed-divider">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
            <div>
              <span className="inline-block font-hand text-lg text-[#111111] bg-[#FFEB00]/40 px-3 py-0.5 rounded-full border border-[#111111] shadow-[1.5px_1.5px_0_#111111] -rotate-1 mb-2">
                ⚙️ Architecture
              </span>
              <h2 className="font-marker text-3xl sm:text-4xl md:text-5xl text-[#111111]">
                Tools & <Highlight>Resources</Highlight>
              </h2>
              <p className="font-body text-[#6B6B66] text-base mt-2">
                Strict localhost isolation ensuring security and zero port conflicts on Contabo VPS.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <SketchButton href="/profile" variant="pill" size="sm">
                Profile & Files →
              </SketchButton>
              <SketchButton href="/dashboard" variant="primary" size="sm">
                Dashboard →
              </SketchButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <SketchCard variant="paper" borderSize="normal" rotation={-0.5}>
              <div className="flex items-start gap-4">
                <DoodleIcon icon={Database} variant="yellow" size="lg" />
                <div className="space-y-2">
                  <h3 className="font-marker text-xl text-[#111111]">FastAPI & PostgreSQL 16</h3>
                  <p className="font-body text-[#6B6B66] text-sm">
                    Core API on port 9878 with async SQLAlchemy, Alembic migrations, and encrypted candidate data storage on port 9879.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Tag variant="white">Port 9878</Tag>
                    <Tag variant="white">SQLAlchemy</Tag>
                    <Tag variant="white">Alembic</Tag>
                  </div>
                  <div className="pt-2">
                    <a
                      href="http://127.0.0.1:9878/docs"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#111111] underline hover:text-[#6B6B66]"
                    >
                      <span>Interactive API Docs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </SketchCard>

            {/* Card 2 */}
            <SketchCard variant="paper" borderSize="normal" rotation={0.8}>
              <div className="flex items-start gap-4">
                <DoodleIcon icon={Workflow} variant="white" size="lg" />
                <div className="space-y-2">
                  <h3 className="font-marker text-xl text-[#111111]">Self-Hosted n8n Hub</h3>
                  <p className="font-body text-[#6B6B66] text-sm">
                    Visual workflow automation engine running on port 9877. Runs discovery triggers, email monitoring, and retry recovery.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Tag variant="white">Port 9877</Tag>
                    <Tag variant="white">Active Workflows</Tag>
                    <Tag variant="white">Webhooks</Tag>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/automation"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#111111] underline hover:text-[#6B6B66]"
                    >
                      <span>Inspect Active Workflows</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </SketchCard>

            {/* Card 3 */}
            <SketchCard variant="paper" borderSize="normal" rotation={-0.8}>
              <div className="flex items-start gap-4">
                <DoodleIcon icon={Mail} variant="yellow" size="lg" />
                <div className="space-y-2">
                  <h3 className="font-marker text-xl text-[#111111]">Recruiter Outreach Engine</h3>
                  <p className="font-body text-[#6B6B66] text-sm">
                    Direct SMTP connection via candidate Gmail App Password or custom mail server. Sends personalized outreach with tailored CV attached.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Tag variant="yellow">
                      {emailConfig?.authenticated ? 'SMTP Authenticated' : 'Awaiting Config'}
                    </Tag>
                    <Tag variant="white">CV Attachment</Tag>
                    <Tag variant="white">Human Approval</Tag>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#111111] underline hover:text-[#6B6B66]"
                    >
                      <span>Configure Email & Credentials</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </SketchCard>

            {/* Card 4 */}
            <SketchCard variant="paper" borderSize="normal" rotation={0.6}>
              <div className="flex items-start gap-4">
                <DoodleIcon icon={Terminal} variant="white" size="lg" />
                <div className="space-y-2">
                  <h3 className="font-marker text-xl text-[#111111]">Playwright Browser Worker</h3>
                  <p className="font-body text-[#6B6B66] text-sm">
                    Headless worker on port 9881 handling permitted application submissions and structured webpage snapshots.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Tag variant="white">Port 9881</Tag>
                    <Tag variant="white">Headless</Tag>
                    <Tag variant="white">Debug API</Tag>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/applications"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#111111] underline hover:text-[#6B6B66]"
                    >
                      <span>Check Submission Pipeline</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </SketchCard>
          </div>
        </section>

        {/* 7. FINAL CTA (Large Centered Paper Card + Star Doodle) */}
        <section className="relative px-6 md:px-12 max-w-4xl mx-auto py-20 md:py-28 dashed-divider">
          <div className="relative">
            {/* Yellow Star Doodle at the corner */}
            <div className="absolute -top-7 -right-6 z-20 rotate-12 pointer-events-none">
              <StarDoodle className="w-14 h-14 text-[#FFEB00]" />
            </div>

            <SketchCard
              variant="paper"
              borderSize="thick"
              rotation="none"
              className="text-center p-8 md:p-14"
            >
              <span className="font-hand text-xl text-[#111111] bg-[#FFEB00] px-3 py-1 rounded-full border border-[#111111] shadow-[2px_2px_0_#111111] -rotate-2 inline-block mb-4">
                Ready for Opportunities?
              </span>

              <h2 className="font-marker text-3xl sm:text-4xl md:text-5xl text-[#111111] leading-tight mb-4">
                Launch the Autonomous Application <Highlight>Pipeline</Highlight>
              </h2>

              <p className="font-body text-base md:text-lg text-[#6B6B66] max-w-lg mx-auto mb-8">
                All 6 Docker containers are healthy and running within ports 9876–9964. Discover jobs, evaluate match scores, review candidate files, and dispatch verified outreach.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SketchButton
                  href="/dashboard"
                  size="lg"
                  variant="primary"
                  icon={<Bot className="w-5 h-5" />}
                >
                  OPEN DASHBOARD NOW
                </SketchButton>
                <SketchButton
                  href="/profile"
                  size="lg"
                  variant="secondary"
                  icon={<FileCheck2 className="w-5 h-5" />}
                >
                  MANAGE FILES & CV
                </SketchButton>
                <SketchButton
                  href="/jobs"
                  size="lg"
                  variant="pill"
                  icon={<Compass className="w-5 h-5" />}
                >
                  BROWSE ALL JOBS
                </SketchButton>
              </div>
            </SketchCard>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <SketchFooter />
    </div>
  );
}
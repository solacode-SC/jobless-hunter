'use client';

import React from 'react';
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

export default function SketchHomePage() {
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
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-full shadow-[2px_2px_0_#111111] -rotate-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Live Agent Running in Docker
                </span>
              </div>

              <h1 className="font-marker text-4xl sm:text-5xl md:text-6xl text-[#111111] leading-[1.05] tracking-tight">
                Autonomous Job Hunting on <Highlight>Autopilot</Highlight>.
              </h1>

              <p className="font-body text-base md:text-xl text-[#6B6B66] leading-relaxed max-w-xl">
                A 24/7 self-hosted job agent tailored for{' '}
                <strong className="text-[#111111] font-semibold underline decoration-[#FFEB00] decoration-4">
                  Solayman El Mouden
                </strong>
                . Continuously discovers opportunities, scores them truthfully with DeepSeek & Gemini, and delivers tailored applications.
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
                  href="/jobs"
                  size="lg"
                  variant="secondary"
                  icon={<Compass className="w-4 h-4" />}
                >
                  DISCOVERED JOBS
                </SketchButton>
              </div>

              {/* Little handwritten stat note */}
              <div className="pt-4 flex items-center gap-4 text-xs font-mono text-[#6B6B66]">
                <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1337 UM6P Profile
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-bold text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> RiLyMed DevOps
                </span>
                <span>•</span>
                <span>Ports 9876–9964</span>
              </div>
            </motion.div>

            {/* Right Column: Large Floating Tilted Polaroid + Doodle Arrow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative flex flex-col items-center"
            >
              <div className="w-full max-w-md animate-float-polaroid relative">
                <Polaroid
                  caption="Live Agent in Docker"
                  subcaption="Port 9876 • Fast, Truthful & Continuous"
                  rotation={2}
                  showHeart={true}
                  initialLikes={42}
                  tapeColor="rgba(255, 235, 0, 0.7)"
                >
                  {/* Styled Live Preview Card inside Polaroid */}
                  <div className="w-full h-full bg-[#FAFAF5] p-5 flex flex-col justify-between select-none">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/30 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#111111]" />
                        <span className="font-mono text-xs font-bold text-[#111111]">
                          JOBLESS-HUNTER // AGENT
                        </span>
                      </div>
                      <Tag variant="yellow">READY</Tag>
                    </div>

                    <div className="space-y-2 py-3">
                      <div className="p-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-[8px] shadow-[2px_2px_0_#111111]">
                        <p className="font-hand text-base font-bold text-[#111111] truncate">
                          🎯 Software Engineer, AI Coding
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] font-mono text-[#6B6B66]">Askable • Remote</span>
                          <span className="text-xs font-mono font-bold bg-[#FFEB00] px-1.5 border border-[#111111] rounded">
                            Score: 72%
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-[8px] shadow-[2px_2px_0_#111111]">
                        <p className="font-hand text-base font-bold text-[#111111] truncate">
                          🚀 Full-Stack Developer
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[11px] font-mono text-[#6B6B66]">Fluence • Remote</span>
                          <span className="text-xs font-mono font-bold bg-[#FFEB00] px-1.5 border border-[#111111] rounded">
                            Score: 84%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#6B6B66] border-t-2 border-dashed border-[#111111]/30 pt-2">
                      <span>47 Jobs Found</span>
                      <span className="text-emerald-700 font-bold">DeepSeek + Gemini</span>
                    </div>
                  </div>
                </Polaroid>

                {/* Hand-drawn arrow doodle pointing to Polaroid */}
                <div className="absolute -bottom-10 -left-12 hidden md:block pointer-events-none -rotate-12">
                  <ArrowDoodle className="w-20 h-16 text-[#111111]" />
                  <span className="font-hand text-sm font-bold text-[#111111] block -mt-2">
                    Running 24/7!
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3. "FROM THE NOTEBOOK" (3 Feature Cards) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 dashed-divider">
          <SectionHeading
            eyebrow="From The Notebook"
            title={
              <>
                Engineered for <Highlight>Truth</Highlight> & Autonomy
              </>
            }
            description="Built to run unattended while strictly adhering to factual candidate data from 1337 UM6P & RiLyMed."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            {/* Note Card 1 */}
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
                    <DoodleIcon icon={Compass} variant="yellow" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #01</span>
                  </div>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-2">
                    Multi-Channel Discovery
                  </h3>
                  <p className="font-body text-[#6B6B66] text-sm leading-relaxed">
                    Automated connectors pull from LinkedIn, Indeed, Google Jobs, Remotive, and Arbeitnow. Built-in SHA-256 fingerprinting prevents duplicates across runs.
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-dashed border-[#111111]/20">
                  <Tag variant="paper">Cron: 30m</Tag>
                </div>
              </SketchCard>
            </motion.div>

            {/* Note Card 2 */}
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
                    <DoodleIcon icon={Cpu} variant="white" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #02</span>
                  </div>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-2">
                    DeepSeek & Gemini AI
                  </h3>
                  <p className="font-body text-[#6B6B66] text-sm leading-relaxed">
                    Evaluates job descriptions against C, C++, Python, TypeScript, Docker, and Linux competencies. Produces granular 0–100 match scores with justifications.
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-dashed border-[#111111]/20">
                  <Tag variant="yellow">Dual LLM Core</Tag>
                </div>
              </SketchCard>
            </motion.div>

            {/* Note Card 3 */}
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
                    <DoodleIcon icon={FileCheck2} variant="paper" size="md" />
                    <span className="font-hand text-lg text-[#6B6B66]">Note #03</span>
                  </div>
                  <h3 className="font-hand text-2xl font-bold text-[#111111] mb-2">
                    Truthful Documents
                  </h3>
                  <p className="font-body text-[#6B6B66] text-sm leading-relaxed">
                    Generates job-tailored CVs and cover letters in English and French. Preserves strict factual integrity—never invents credentials or unverified history.
                  </p>
                </div>
                <div className="pt-6 mt-4 border-t border-dashed border-[#111111]/20">
                  <Tag variant="paper">PDF & DOCX Export</Tag>
                </div>
              </SketchCard>
            </motion.div>
          </div>
        </section>

        {/* 4. "RECENT WORK" (3 Polaroid Cards) */}
        <section className="relative px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24 bg-white-section dashed-divider">
          <SectionHeading
            eyebrow="Recent Work"
            title={
              <>
                Real <Highlight>Deployments</Highlight> & Systems
              </>
            }
            description="Proven foundations in autonomous AI agents, DevOps infrastructure, and rigorous 1337 computer science."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-4">
            {/* Polaroid 1: Jobless Hunter */}
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

            {/* Polaroid 2: RiLyMed DevOps */}
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

            {/* Polaroid 3: 1337 UM6P */}
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
          </div>
        </section>

        {/* 5. "GALLERY" (4 Tilted Images / Systems with Labels) */}
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
                  <span className="text-[10px] text-[#6B6B66]">47+ active feeds</span>
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
                  <span className="text-[10px] text-[#6B6B66]">Automated failover</span>
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
                  <span className="font-mono text-xs font-bold">n8n Orchestration</span>
                  <span className="text-[10px] text-[#6B6B66]">7 workflows active</span>
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

        {/* 6. "TOOLS & RESOURCES" (2x2 Grid) */}
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
                Strict localhost isolation ensuring high security and zero port conflicts.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <SketchButton href="/settings" variant="pill" size="sm">
                View all settings →
              </SketchButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 (Yellow Icon Box) */}
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
                    <Tag variant="white">7 Workflows</Tag>
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
                <DoodleIcon icon={Cpu} variant="white" size="lg" />
                <div className="space-y-2">
                  <h3 className="font-marker text-xl text-[#111111]">Multi-Provider AI Core</h3>
                  <p className="font-body text-[#6B6B66] text-sm">
                    DeepSeek (deepseek-chat) and Google Gemini (gemini-2.5-flash) with runtime switching, auto-failover, and structured outputs.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Tag variant="yellow">DeepSeek</Tag>
                    <Tag variant="yellow">Gemini</Tag>
                    <Tag variant="white">Auto-Failover</Tag>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#111111] underline hover:text-[#6B6B66]"
                    >
                      <span>View Live Match Scores</span>
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
                Ready to Deploy?
              </span>

              <h2 className="font-marker text-3xl sm:text-4xl md:text-5xl text-[#111111] leading-tight mb-4">
                Start the Autonomous Application <Highlight>Pipeline</Highlight>
              </h2>

              <p className="font-body text-base md:text-lg text-[#6B6B66] max-w-lg mx-auto mb-8">
                All 6 Docker containers are healthy and running within ports 9876–9964. Discover jobs, evaluate match scores, and review generated applications in real time.
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
                  href="/jobs"
                  size="lg"
                  variant="secondary"
                  icon={<Compass className="w-5 h-5" />}
                >
                  BROWSE JOBS
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

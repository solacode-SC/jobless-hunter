'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Globe,
  Save,
  CheckCircle,
  Link2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCandidateProfile, updateCandidateProfile } from '@/lib/api';
import { CandidateProfile } from '@/types';
import { Tag } from '@/components/sketch/tag';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await getCandidateProfile();
        setProfile(p);
        setName(p.name);
        setTitle(p.professional_title || '');
        setEmail(p.email);
        setPhone(p.phone || '');
        setSummary(p.summary || '');
        setPortfolio(p.portfolio_url || '');
        setGithub(p.github_url || '');
        setLinkedin(p.linkedin_url || '');
        setSkillsStr((p.skills || []).join(', '));
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const skills = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      await updateCandidateProfile({
        name,
        professional_title: title,
        email,
        phone,
        summary,
        portfolio_url: portfolio,
        github_url: github,
        linkedin_url: linkedin,
        skills,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout
      title="Candidate Profile & Fact Base"
      description="Truthful candidate background for Solayman El Mouden (1337 UM6P & RiLyMed DevOps)."
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        {success && (
          <div className="p-4 rounded-lg bg-[#FFEB00]/30 border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] font-mono text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>✓ Candidate fact base updated and verified successfully!</span>
          </div>
        )}

        {/* Identity & Contact */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#111111]" />
              <span>Identity &amp; Title</span>
            </CardTitle>
            <CardDescription>Primary candidate identification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1">Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg p-3 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-[#111111]" />
              <span>Verified Technical Skills</span>
            </CardTitle>
            <CardDescription>Comma-separated list of genuine candidate skills used for AI job evaluation.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3.5 py-2 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {skillsStr.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FFEB00] text-[#111111] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education & Experience Readonly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-5 w-5 text-[#111111]" />
              <h4 className="font-marker text-base text-[#111111]">Verified Education</h4>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FAFAF5] border border-[#111111]">
              <p className="font-marker text-sm text-[#111111]">1337 School – UM6P</p>
              <p className="font-hand text-sm text-[#6B6B66]">Software Engineering Education (2021-2024)</p>
              <p className="text-xs font-mono text-[#111111] mt-1.5 leading-snug">
                Peer-to-peer intensive curriculum: C, C++, UNIX systems, algorithms, system architecture.
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-lg p-5 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-[#111111]" />
              <h4 className="font-marker text-base text-[#111111]">Verified Experience</h4>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FAFAF5] border border-[#111111]">
              <p className="font-marker text-sm text-[#111111]">RiLyMed</p>
              <p className="font-hand text-sm text-[#6B6B66]">DevOps Engineer (2023 - 2024)</p>
              <p className="text-xs font-mono text-[#111111] mt-1.5 leading-snug">
                Containerization, Linux orchestration, Docker services, CI/CD automated deployment pipelines.
              </p>
            </div>
          </div>
        </div>

        {/* Links */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[#111111]" />
              <span>Public Portfolios &amp; Profiles</span>
            </CardTitle>
            <CardDescription>Verified online profiles referenced in generated documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>Portfolio Website</span>
              </label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          variant="default"
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving changes...' : 'Save Candidate Profile'}</span>
        </Button>
      </form>
    </MainLayout>
  );
}

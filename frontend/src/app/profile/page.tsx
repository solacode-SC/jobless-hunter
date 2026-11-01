'use client';

import React, { useEffect, useState } from 'react';
import { User, Briefcase, GraduationCap, Code2, Globe, Link2, Save, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCandidateProfile, updateCandidateProfile } from '@/lib/api';
import { CandidateProfile } from '@/types';

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCandidateProfile();
      setProfile(data);
      setName(data.name);
      setTitle(data.professional_title || '');
      setEmail(data.email);
      setPhone(data.phone || '');
      setPortfolio(data.portfolio_url || '');
      setGithub(data.github_url || '');
      setLinkedin(data.linkedin_url || '');
      setSummary(data.summary || '');
      setSkillsStr((data.skills || []).join(', '));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const skillsArray = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);

    try {
      await updateCandidateProfile({
        name,
        professional_title: title,
        email,
        phone,
        portfolio_url: portfolio,
        github_url: github,
        linkedin_url: linkedin,
        summary,
        skills: skillsArray,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout
      title="Candidate Profile & Fact Base"
      description="The definitive, truthful record used by the AI matching and tailoring engines."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {success && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>Profile and truthful candidate fact base updated successfully!</span>
          </div>
        )}

        {/* Identity & Contact */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              <span>Identity &amp; Title</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Professional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Skills */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span>Verified Technical Skills</span>
            </CardTitle>
            <CardDescription className="text-xs">Comma-separated list of genuine candidate skills.</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skillsStr.split(',').map((s) => s.trim()).filter(Boolean).map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded text-[11px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education & Experience Readonly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-300">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>Verified Education</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">1337 School – UM6P</p>
                <p className="text-slate-400">Software Engineering Education (2021-2024)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Peer-to-peer intensive curriculum: C, C++, UNIX systems, algorithms, architectures.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold flex items-center gap-2 text-slate-300">
                <Briefcase className="h-4 w-4 text-purple-400" />
                <span>Verified Experience</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <p className="font-semibold text-slate-200">RiLyMed</p>
                <p className="text-slate-400">DevOps Engineer (2023 - 2024)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Containerization, Linux orchestration, Docker services, CI/CD automation.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" />
              <span>Public Portfolios &amp; Profiles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span>Portfolio Website</span>
              </label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1 flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving}
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs px-6 py-2.5 h-auto font-medium"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Saving changes...' : 'Save Candidate Profile'}</span>
        </Button>
      </form>
    </MainLayout>
  );
}

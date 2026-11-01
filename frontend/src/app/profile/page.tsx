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
  Upload,
  FileText,
  Trash2,
  Download,
  Mail,
  ShieldCheck,
  Send,
  Lock,
  Sparkles,
  Paperclip,
  Target,
  Check,
  Plus,
  X,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/sketch/tag';
import {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCV,
  uploadCandidateFile,
  getCandidateFiles,
  deleteCandidateFile,
  getEmailConfig,
  saveEmailConfig,
  testEmailConnection,
  getTargetRoles,
  saveTargetRoles,
} from '@/lib/api';
import { CandidateProfile } from '@/types';

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

  // Target Roles & AI Suggested Titles state
  const [suggestedRoles, setSuggestedRoles] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [newCustomRole, setNewCustomRole] = useState('');
  const [savingRoles, setSavingRoles] = useState(false);
  const [rolesSavedMessage, setRolesSavedMessage] = useState<string | null>(null);

  // CV & Related Files state
  const [cvPath, setCvPath] = useState<string | null>(null);
  const [relatedFiles, setRelatedFiles] = useState<any[]>([]);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [fileCategory, setFileCategory] = useState('certificate');
  const [fileMessage, setFileMessage] = useState<string | null>(null);

  // Email Config & Auth state
  const [emailProvider, setEmailProvider] = useState('gmail');
  const [senderEmail, setSenderEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpPassword, setSmtpPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoOutreach, setAutoOutreach] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  // General profile state
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const loadData = async () => {
    try {
      const [p, filesData, emailCfg, rolesData] = await Promise.all([
        getCandidateProfile(),
        getCandidateFiles(),
        getEmailConfig(),
        getTargetRoles(),
      ]);

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
      setCvPath(p.original_cv_path || filesData.cv_path);
      setRelatedFiles(filesData.files || []);

      if (rolesData) {
        setTargetRoles(rolesData.target_roles || []);
        if (rolesData.suggested_job_titles && rolesData.suggested_job_titles.length > 0) {
          setSuggestedRoles(rolesData.suggested_job_titles);
        }
      }

      if (emailCfg) {
        setEmailProvider(emailCfg.provider || 'gmail');
        setSenderEmail(emailCfg.email || p.email);
        setDisplayName(emailCfg.display_name || p.name);
        setSmtpHost(emailCfg.smtp_host || 'smtp.gmail.com');
        setSmtpPort(emailCfg.smtp_port || 587);
        setIsAuthenticated(Boolean(emailCfg.is_authenticated));
        setRequireApproval(emailCfg.require_approval ?? true);
        setAutoOutreach(emailCfg.auto_outreach ?? true);
        setDailyLimit(emailCfg.daily_limit || 10);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCV(true);
    setFileMessage(null);
    try {
      const res = await uploadCV(file);
      setCvPath(res.original_cv_path || null);

      const suggested = res.suggested_job_titles || [];
      const active = res.active_target_roles || [];
      setSuggestedRoles(suggested);

      // Initialize selected roles
      const initialRoles = active.length > 0 ? active : (suggested.length > 0 ? suggested.slice(0, 5) : []);
      setTargetRoles(initialRoles);

      // Auto update form fields immediately from parsed CV response
      if (res.candidate) {
        const c = res.candidate;
        if (c.name) setName(c.name);
        if (c.professional_title) setTitle(c.professional_title);
        if (c.email) setEmail(c.email);
        if (c.phone) setPhone(c.phone);
        if (c.summary) setSummary(c.summary);
        if (c.skills) setSkillsStr(c.skills.join(', '));
        if (c.portfolio_url) setPortfolio(c.portfolio_url);
        if (c.github_url) setGithub(c.github_url);
        if (c.linkedin_url) setLinkedin(c.linkedin_url);
      }

      setShowRolesModal(true);
      setFileMessage(`✓ Master CV (${file.name}) parsed! All profile fields updated with extracted facts & 10 matching roles detected.`);
      await loadData();
    } catch (err: any) {
      setFileMessage(`Upload failed: ${err.message}`);
    } finally {
      setUploadingCV(false);
    }
  };

  const toggleRole = (role: string) => {
    if (targetRoles.includes(role)) {
      setTargetRoles(targetRoles.filter((r) => r !== role));
    } else {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const handleAddCustomRole = () => {
    const val = newCustomRole.trim();
    if (val && !targetRoles.some((r) => r.toLowerCase() === val.toLowerCase())) {
      setTargetRoles([...targetRoles, val]);
      setNewCustomRole('');
    }
  };

  const handleSaveTargetRoles = async () => {
    setSavingRoles(true);
    try {
      await saveTargetRoles(targetRoles);
      setRolesSavedMessage(`✓ Saved ${targetRoles.length} target job roles for the agent!`);
      setTimeout(() => setRolesSavedMessage(null), 4000);
    } catch (err: any) {
      setRolesSavedMessage(`Failed to save roles: ${err.message}`);
    } finally {
      setSavingRoles(false);
    }
  };

  const handleRelatedFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setFileMessage(null);
    try {
      const res = await uploadCandidateFile(file, fileCategory);
      setRelatedFiles(res.files || []);
      setFileMessage(`✓ Uploaded ${file.name} as ${fileCategory}!`);
    } catch (err: any) {
      setFileMessage(`File upload error: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await deleteCandidateFile(fileId);
      setRelatedFiles(res.files || []);
      setFileMessage('File deleted.');
    } catch (err: any) {
      setFileMessage(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveEmailConfig = async () => {
    try {
      await saveEmailConfig({
        provider: emailProvider,
        email: senderEmail,
        display_name: displayName,
        smtp_host: smtpHost,
        smtp_port: Number(smtpPort),
        smtp_password: smtpPassword || undefined,
        use_tls: true,
        require_approval: requireApproval,
        auto_outreach: autoOutreach,
        daily_limit: Number(dailyLimit),
      });
      setEmailMessage('✓ Email settings saved.');
      setTimeout(() => setEmailMessage(null), 3000);
    } catch (err: any) {
      setEmailMessage(`Error: ${err.message}`);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailMessage(null);
    try {
      // First save configuration with password
      await handleSaveEmailConfig();
      const res = await testEmailConnection(senderEmail);
      if (res.success) {
        setIsAuthenticated(true);
        setEmailMessage(`✓ ${res.message}`);
      } else {
        setIsAuthenticated(false);
        setEmailMessage(`⚠️ ${res.message}`);
      }
    } catch (err: any) {
      setEmailMessage(`Test failed: ${err.message}`);
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
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
      title="Candidate Fact Base & Document Center"
      description="CV source of truth, certificates, email authorization & outreach dispatcher."
      onRefresh={loadData}
    >
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* MODAL: 10 MATCHING TARGET ROLES DETECTED FOR CV */}
        {showRolesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-[#FAFAF5] border-[3px] border-[#111111] shadow-[8px_8px_0_#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 border-b-2 border-dashed border-[#111111]/20 pb-4">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-[#FFEB00] border border-[#111111] rounded text-[11px] font-mono font-bold -rotate-1 mb-1.5">
                    🎯 CV Analysis &amp; Extraction Complete
                  </span>
                  <h3 className="font-marker text-2xl md:text-3xl text-[#111111]">
                    10 Matching Job Titles for Your Profile
                  </h3>
                  <p className="font-hand text-base text-[#6B6B66] mt-1">
                    Select which titles you accept. The agent will immediately filter offers and prioritize applications based on your chosen roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRolesModal(false)}
                  className="w-8 h-8 rounded-full border-2 border-[#111111] bg-[#FFFFFF] shadow-[2px_2px_0_#111111] flex items-center justify-center hover:bg-[#FFEB00] font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 10 Suggested Titles Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66]">
                  <span>Click to accept / reject matching roles:</span>
                  <span className="font-bold text-[#111111]">{targetRoles.length} Accepted</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(suggestedRoles.length > 0 ? suggestedRoles : [
                    "Software Engineer",
                    "Full-Stack Developer",
                    "DevOps Engineer",
                    "Backend Systems Engineer",
                    "Cloud Infrastructure Engineer",
                    "Linux Systems Engineer",
                    "Site Reliability Engineer (SRE)",
                    "Platform Engineer",
                    "Python Developer",
                    "Systems Software Engineer",
                  ]).map((role) => {
                    const isSelected = targetRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`p-3 rounded-lg border-2 border-[#111111] text-left transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#FFEB00] shadow-[3px_3px_0_#111111] -translate-y-0.5'
                            : 'bg-[#FFFFFF] shadow-[1.5px_1.5px_0_#111111] hover:bg-[#FAFAF5]'
                        }`}
                      >
                        <span className="font-marker text-sm text-[#111111] leading-tight truncate">
                          {role}
                        </span>
                        <span
                          className={`w-5 h-5 rounded border border-[#111111] flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#111111] text-[#FFFFFF]' : 'bg-transparent text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Role */}
              <div className="p-3 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] flex gap-2">
                <input
                  type="text"
                  value={newCustomRole}
                  onChange={(e) => setNewCustomRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomRole();
                    }
                  }}
                  placeholder="Type another role title..."
                  className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#FAFAF5] border border-[#111111] rounded focus:outline-none"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddCustomRole}
                  className="text-xs"
                >
                  + Add Role
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t-2 border-dashed border-[#111111]/20">
                <Button
                  type="button"
                  variant="default"
                  size="default"
                  onClick={async () => {
                    await handleSaveTargetRoles();
                    setShowRolesModal(false);
                  }}
                  disabled={savingRoles}
                  className="w-full sm:w-auto gap-2 font-marker text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Accept Selected ({targetRoles.length}) &amp; Save</span>
                </Button>

                <a
                  href="/jobs?filter_target_roles=true"
                  onClick={async () => {
                    await handleSaveTargetRoles();
                    setShowRolesModal(false);
                  }}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#111111] underline hover:text-emerald-700"
                >
                  <span>Start Displaying Matching Offers →</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Success / Alert Banner */}
        {success && (
          <div className="p-4 rounded-lg bg-[#FFEB00]/30 border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] font-mono text-xs font-bold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>✓ Candidate fact base updated and verified successfully!</span>
          </div>
        )}

        {/* 1. MASTER CV & RELATED FILES SECTION */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#111111]" />
                  <span>Master CV &amp; Candidate Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload your CV and supporting files (Certificates, Recommendations, Transcripts) for 24/7 AI verification.
                </CardDescription>
              </div>
              <Tag variant="yellow">Source of Truth</Tag>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-5">
            {fileMessage && (
              <div className="p-3 bg-[#FFEB00]/25 border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg text-xs font-mono font-bold text-[#111111]">
                {fileMessage}
              </div>
            )}

            {/* Primary CV Upload Box */}
            <div className="p-5 bg-[#FAFAF5] border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-marker text-lg text-[#111111] block">
                  📄 Primary Master CV (Authoritative Resume)
                </span>
                <p className="font-hand text-sm text-[#6B6B66]">
                  The AI extracts factual experience from this document. It will never fabricate jobs, degrees, or skills.
                </p>
                {cvPath ? (
                  <p className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5 pt-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>Active CV: {cvPath.split('/').pop()}</span>
                  </p>
                ) : (
                  <p className="text-xs font-mono text-amber-700">No master CV uploaded yet.</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {cvPath && (
                  <a href={`http://localhost:9878/${cvPath}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      <span>View CV</span>
                    </Button>
                  </a>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-[120px_8px_100px_6px/8px_100px_6px_120px] bg-[#FFEB00] border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-[#111111] text-xs font-mono font-bold uppercase hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingCV ? 'Analyzing with AI...' : 'Upload Master CV'}</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleCVUpload}
                    className="hidden"
                    disabled={uploadingCV}
                  />
                </label>
              </div>
            </div>

            {/* Target Job Roles & AI Matching Titles Card */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-marker text-lg text-[#111111] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#111111]" />
                    <span>Target Job Roles for Autonomous Hunting ({targetRoles.length} Active)</span>
                  </h4>
                  <p className="font-hand text-sm text-[#6B6B66]">
                    These accepted titles filter discovered offers, trigger crawler keywords, and tailor applications.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRolesModal(true)}
                  className="text-xs gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Review 10 AI Titles</span>
                </Button>
              </div>

              {rolesSavedMessage && (
                <div className="p-2.5 bg-[#FFEB00] border-2 border-[#111111] rounded-lg text-xs font-mono font-bold text-[#111111] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-800" />
                  <span>{rolesSavedMessage}</span>
                </div>
              )}

              {/* Active Roles Chips */}
              <div className="flex flex-wrap gap-2">
                {targetRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFEB00] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] text-xs font-mono font-bold text-[#111111] -rotate-1"
                  >
                    <span>{role}</span>
                    <button
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="hover:text-red-700 focus:outline-none"
                      title="Remove role"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add and Save row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-dashed border-[#111111]/20">
                <div className="flex gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    value={newCustomRole}
                    onChange={(e) => setNewCustomRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomRole();
                      }
                    }}
                    placeholder="Type custom role title..."
                    className="flex-1 bg-[#FAFAF5] border-2 border-[#111111] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomRole}
                    className="text-xs"
                  >
                    + Add
                  </Button>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={handleSaveTargetRoles}
                    disabled={savingRoles}
                    className="text-xs gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingRoles ? 'Saving...' : 'Save Accepted Roles'}</span>
                  </Button>

                  <a
                    href="/jobs?filter_target_roles=true"
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#111111] underline hover:text-emerald-700 ml-2"
                  >
                    <span>Display Matching Offers →</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Related Files Upload & List */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-marker text-base text-[#111111] flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4" />
                  <span>Supporting Files &amp; Credentials ({relatedFiles.length})</span>
                </h4>

                {/* Upload related file form */}
                <div className="flex items-center gap-2">
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="certificate">Certificate</option>
                    <option value="recommendation">Recommendation</option>
                    <option value="transcript">Transcript</option>
                    <option value="portfolio">Portfolio / Work Sample</option>
                    <option value="other">Other Supporting File</option>
                  </select>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-[#111111] text-xs font-mono font-bold uppercase hover:bg-[#FFEB00] transition-colors">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{uploadingFile ? 'Uploading...' : 'Attach File'}</span>
                    <input
                      type="file"
                      onChange={handleRelatedFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                  </label>
                </div>
              </div>

              {/* Related Files Table */}
              {relatedFiles.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-[#111111]/30 rounded-lg bg-[#FAFAF5]">
                  <p className="font-hand text-base text-[#6B6B66]">
                    No supporting files attached yet. You can attach 1337 transcripts, recommendation letters, or cloud certifications.
                  </p>
                </div>
              ) : (
                <div className="divide-y-2 divide-dashed divide-[#111111]/20 border-2 border-[#111111] rounded-lg bg-[#FFFFFF] overflow-hidden">
                  {relatedFiles.map((f: any) => (
                    <div key={f.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-marker text-sm text-[#111111] truncate">{f.filename}</p>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#6B6B66] mt-0.5">
                          <Tag variant={f.category === 'certificate' ? 'yellow' : 'paper'}>
                            {f.category}
                          </Tag>
                          <span>{f.size_kb} KB</span>
                          <span>•</span>
                          <span>{f.uploaded_at ? new Date(f.uploaded_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a href={`http://localhost:9878${f.url}`} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="secondary" className="h-7 px-2 text-xs">
                            <Download className="h-3 w-3" />
                          </Button>
                        </a>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteFile(f.id)}
                          className="h-7 px-2 text-xs"
                          title="Delete file"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. EMAIL AUTHORIZATION & OUTREACH DISPATCHER */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#111111]" />
                  <span>Email Account Authorization &amp; Recruiter Outreach</span>
                </CardTitle>
                <CardDescription>
                  Authorize Gmail or custom SMTP so the 24/7 agent can dispatch applications &amp; outreach directly to companies.
                </CardDescription>
              </div>

              {isAuthenticated ? (
                <Tag variant="yellow">✓ Authenticated &amp; Ready</Tag>
              ) : (
                <Tag variant="paper">⚠️ Authorization Required</Tag>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {emailMessage && (
              <div className="p-3 bg-[#FFEB00]/25 border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg text-xs font-mono font-bold text-[#111111]">
                {emailMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  Email Provider
                </label>
                <select
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none"
                >
                  <option value="gmail">Gmail (Google App Password)</option>
                  <option value="custom_smtp">Custom SMTP Server (Office365 / Corporate)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  Sending Email Address
                </label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                  placeholder="e.g. solayman.elmouden@gmail.com"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                  placeholder="Solayman El Mouden"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Google App Password / SMTP Password</span>
                </label>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                  placeholder={isAuthenticated ? '•••••••••••••••• (Saved)' : 'Enter 16-character App Password'}
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border-2 border-[#111111] shadow-[2px_2px_0_#111111] rounded-lg px-3 py-2 text-xs font-mono text-[#111111] focus:outline-none"
                />
              </div>
            </div>

            {/* Helper notice for Google App Password */}
            <div className="p-3 bg-[#FAFAF5] border border-[#111111] rounded-lg text-xs font-hand text-[#6B6B66] leading-snug">
              💡 <strong>How to connect Gmail:</strong> Go to Google Account → Security → 2-Step Verification → App passwords. Generate an App Password for &quot;Jobless Hunter&quot; and paste the 16-letter key above.
            </div>

            {/* Automated Outreach Governance Toggles */}
            <div className="space-y-3 pt-2 border-t-2 border-dashed border-[#111111]/20">
              <h5 className="font-marker text-sm text-[#111111]">Outreach Governance &amp; Safety</h5>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] cursor-pointer">
                <div>
                  <p className="font-marker text-xs text-[#111111]">Require Human Approval Before Dispatch</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">
                    Agent queues outreach emails in Dashboard/Pipeline; never sends without your 1-click confirmation.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111] cursor-pointer">
                <div>
                  <p className="font-marker text-xs text-[#111111]">Enable 24/7 Recruiter Outreach</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">
                    Allow the agent to locate recruiter/company contacts for qualified jobs and draft messages.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoOutreach}
                  onChange={(e) => setAutoOutreach(e.target.checked)}
                  className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
                />
              </label>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                <div>
                  <p className="font-marker text-xs text-[#111111]">Daily Dispatch Limit</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">
                    Protects domain reputation and respects provider rate limits.
                  </p>
                </div>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-20 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-center"
                />
              </div>
            </div>

            {/* Actions: Save Settings & Test Connection */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                type="button"
                variant="default"
                size="default"
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="gap-2 text-xs"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{testingEmail ? 'Authenticating...' : 'Authenticate & Test Connection'}</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="default"
                onClick={handleSaveEmailConfig}
                className="gap-1.5 text-xs"
              >
                <Save className="h-4 w-4" />
                <span>Save Email Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 3. IDENTITY & CANDIDATE FACT BASE */}
        <form onSubmit={handleSubmitProfile} className="space-y-6">
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
              <CardDescription>Genuine skills used for scoring and cover letters.</CardDescription>
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
                  C, C++, UNIX systems, algorithms, architectures.
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
                  Containerization, Docker, Linux orchestration, CI/CD pipelines.
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
      </div>
    </MainLayout>
  );
}

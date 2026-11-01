'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Sparkles,
  CheckCircle2,
  Save,
  Building2,
  MapPin,
  Briefcase,
  Key,
  Ban,
  X,
  Filter,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/sketch/tag';
import { getSystemSettings, saveSystemSettings, BlockKeys } from '@/lib/api';

export default function SettingsPage() {
  // Block keys state
  const [companies, setCompanies] = useState<string[]>([
    'Revature',
    'Infosys',
    'Wipro',
    'Tata Consultancy Services',
  ]);
  const [locations, setLocations] = useState<string[]>([
    'On-site Only',
    'No Remote Allowed',
  ]);
  const [roles, setRoles] = useState<string[]>([
    'Sales Representative',
    'Account Executive',
    'Marketing Specialist',
    'Unpaid Intern',
    'Cold Caller',
  ]);
  const [keywords, setKeywords] = useState<string[]>([
    'security clearance required',
    'polygraph required',
    'us citizenship required',
    'unpaid internship',
    'commission only',
    'no c2c',
    'must be us citizen',
  ]);

  // Input states for adding new block keys
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  // AI & Discovery Settings
  const [providerPreference, setProviderPreference] = useState('auto');
  const [deepseekModel, setDeepseekModel] = useState('deepseek-chat');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [threshold, setThreshold] = useState(70);
  const [remoteBoardActive, setRemoteBoardActive] = useState(true);
  const [linkedinActive, setLinkedinActive] = useState(true);
  const [indeedActive, setIndeedActive] = useState(true);
  const [googleJobsActive, setGoogleJobsActive] = useState(true);

  // Status flags
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing settings on mount
  useEffect(() => {
    async function loadData() {
      try {
        const settings = await getSystemSettings();
        if (settings.block_keys) {
          if (settings.block_keys.companies) setCompanies(settings.block_keys.companies);
          if (settings.block_keys.locations) setLocations(settings.block_keys.locations);
          if (settings.block_keys.roles) setRoles(settings.block_keys.roles);
          if (settings.block_keys.keywords) setKeywords(settings.block_keys.keywords);
        }
        if (settings.ai_provider_preference) setProviderPreference(settings.ai_provider_preference);
        if (settings.qualification_threshold) setThreshold(settings.qualification_threshold);
        if (settings.connectors) {
          setRemoteBoardActive(settings.connectors.remote_board ?? true);
          setLinkedinActive(settings.connectors.linkedin ?? true);
          setIndeedActive(settings.connectors.indeed ?? true);
          setGoogleJobsActive(settings.connectors.google_jobs ?? true);
        }
      } catch (err) {
        console.warn('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handlers for adding/removing items
  const handleAddCompany = () => {
    const val = newCompany.trim();
    if (val && !companies.some((c) => c.toLowerCase() === val.toLowerCase())) {
      setCompanies([...companies, val]);
      setNewCompany('');
    }
  };

  const handleRemoveCompany = (idx: number) => {
    setCompanies(companies.filter((_, i) => i !== idx));
  };

  const handleAddLocation = () => {
    const val = newLocation.trim();
    if (val && !locations.some((l) => l.toLowerCase() === val.toLowerCase())) {
      setLocations([...locations, val]);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (idx: number) => {
    setLocations(locations.filter((_, i) => i !== idx));
  };

  const handleAddRole = () => {
    const val = newRole.trim();
    if (val && !roles.some((r) => r.toLowerCase() === val.toLowerCase())) {
      setRoles([...roles, val]);
      setNewRole('');
    }
  };

  const handleRemoveRole = (idx: number) => {
    setRoles(roles.filter((_, i) => i !== idx));
  };

  const handleAddKeyword = () => {
    const val = newKeyword.trim();
    if (val && !keywords.some((k) => k.toLowerCase() === val.toLowerCase())) {
      setKeywords([...keywords, val]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (idx: number) => {
    setKeywords(keywords.filter((_, i) => i !== idx));
  };

  // Submit all settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      const blockKeysPayload: BlockKeys = {
        companies,
        locations,
        roles,
        keywords,
      };

      await saveSystemSettings({
        block_keys: blockKeysPayload,
        ai_provider_preference: providerPreference,
        qualification_threshold: threshold,
        connectors: {
          remote_board: remoteBoardActive,
          linkedin: linkedinActive,
          indeed: indeedActive,
          google_jobs: googleJobsActive,
        },
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalBlockedCount =
    companies.length + locations.length + roles.length + keywords.length;

  return (
    <MainLayout
      title="Settings & Autonomous Guardrails"
      description="Configure AI provider failover, discovery feeds, and exclusion block keys to automatically skip unwanted offers."
    >
      <form onSubmit={handleSave} className="space-y-8 max-w-5xl mx-auto pb-12">
        {saved && (
          <div className="p-4 rounded-lg bg-[#FFEB00] border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] font-mono text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-800" />
              <span>✓ Settings and Exclusion Block Keys saved successfully! Agent will immediately skip matching offers.</span>
            </div>
            <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] rounded text-[11px]">Active</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-lg bg-red-100 border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-red-900 font-mono text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. EXCLUSION & BLOCK KEYS (NEW CORE FEATURE) */}
        <Card className="border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111]">
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 font-marker text-2xl">
                  <Ban className="h-6 w-6 text-[#111111]" />
                  <span>Job Exclusion Rules &amp; Block Keys</span>
                </CardTitle>
                <CardDescription className="text-xs font-mono mt-1">
                  Specify companies, countries/regions, roles, and keywords. The agent will skip matching offers during discovery and evaluation with zero token waste.
                </CardDescription>
              </div>
              <Tag variant="yellow">
                {totalBlockedCount} Active Rules
              </Tag>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-5">
            {/* Informational Callout Note */}
            <div className="p-3.5 bg-[#FAFAF5] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#111111] shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-[#111111] leading-relaxed">
                <strong>Autonomous Skip Guardrail:</strong> When the agent processes or scrapes a job, it evaluates these block keys before LLM scoring. Any matched listing is automatically labeled <code>disqualified</code> with score <code>0%</code> and an explanation (e.g. <em>&quot;SKIPPED by blocklist rule: Blocked company &#39;Infosys&#39;&quot;</em>).
              </div>
            </div>

            {/* A. Blocked Companies */}
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#111111]" />
                  <span className="font-marker text-base text-[#111111]">
                    1. Blocked Companies &amp; Agencies ({companies.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6B6B66]">
                  Case-insensitive company name match
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-[#FAFAF5] border border-[#111111] rounded-md">
                {companies.length === 0 ? (
                  <span className="text-xs font-mono text-[#6B6B66] italic">No blocked companies added yet.</span>
                ) : (
                  companies.map((comp, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111]"
                    >
                      <span>{comp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(idx)}
                        className="hover:text-red-600 focus:outline-none"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCompany();
                    }
                  }}
                  placeholder="Type company name (e.g., Revature, Infosys, Meta) and press Enter..."
                  className="flex-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleAddCompany}
                  className="text-xs px-3 py-1"
                >
                  + Add Company
                </Button>
              </div>
            </div>

            {/* B. Blocked Locations / Countries / Regions */}
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#111111]" />
                  <span className="font-marker text-base text-[#111111]">
                    2. Blocked Countries, Cities &amp; Regions ({locations.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6B6B66]">
                  Matches location field (e.g., On-site only, specific countries)
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-[#FAFAF5] border border-[#111111] rounded-md">
                {locations.length === 0 ? (
                  <span className="text-xs font-mono text-[#6B6B66] italic">No blocked locations added yet.</span>
                ) : (
                  locations.map((loc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111]"
                    >
                      <span>{loc}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(idx)}
                        className="hover:text-red-600 focus:outline-none"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLocation();
                    }
                  }}
                  placeholder="Type country/region (e.g., On-site Only, India, No Remote) and press Enter..."
                  className="flex-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleAddLocation}
                  className="text-xs px-3 py-1"
                >
                  + Add Region
                </Button>
              </div>
            </div>

            {/* C. Blocked Roles / Job Titles */}
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#111111]" />
                  <span className="font-marker text-base text-[#111111]">
                    3. Blocked Roles &amp; Job Titles ({roles.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6B6B66]">
                  Matches title field (e.g., Sales, Unpaid Intern, Marketing)
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-[#FAFAF5] border border-[#111111] rounded-md">
                {roles.length === 0 ? (
                  <span className="text-xs font-mono text-[#6B6B66] italic">No blocked roles added yet.</span>
                ) : (
                  roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111]"
                    >
                      <span>{role}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(idx)}
                        className="hover:text-red-600 focus:outline-none"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRole();
                    }
                  }}
                  placeholder="Type role name (e.g., Sales Representative, Account Executive, Unpaid Intern) and press Enter..."
                  className="flex-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleAddRole}
                  className="text-xs px-3 py-1"
                >
                  + Add Role
                </Button>
              </div>
            </div>

            {/* D. Blocked Keywords & Requirement Phrases */}
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg shadow-[2px_2px_0_#111111] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#111111]" />
                  <span className="font-marker text-base text-[#111111]">
                    4. Blocked Keywords &amp; Phrases ({keywords.length})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6B6B66]">
                  Scans job description &amp; skill tags for deal-breakers
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-[#FAFAF5] border border-[#111111] rounded-md">
                {keywords.length === 0 ? (
                  <span className="text-xs font-mono text-[#6B6B66] italic">No blocked keywords added yet.</span>
                ) : (
                  keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md shadow-[1.5px_1.5px_0_#111111] text-xs font-mono font-bold text-[#111111]"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="hover:text-red-600 focus:outline-none"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Type phrase (e.g., security clearance, polygraph, us citizenship only) and press Enter..."
                  className="flex-1 bg-[#FFFFFF] border-2 border-[#111111] rounded-md px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFEB00]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="default"
                  onClick={handleAddKeyword}
                  className="text-xs px-3 py-1"
                >
                  + Add Keyword
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. AI MULTI-PROVIDER CONFIGURATION */}
        <Card className="border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111]">
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 font-marker text-2xl">
                  <Sparkles className="h-5 w-5 text-[#111111]" />
                  <span>AI Engine — DeepSeek &amp; Google Gemini</span>
                </CardTitle>
                <CardDescription className="text-xs font-mono">
                  Autonomous intelligence with multi-model selection and runtime auto-failover.
                </CardDescription>
              </div>
              <Tag variant="yellow">Dual LLM Core</Tag>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            <div>
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1.5">
                Active Provider Selection Strategy
              </label>
              <select
                value={providerPreference}
                onChange={(e) => setProviderPreference(e.target.value)}
                className="w-full bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg px-3.5 py-2.5 text-xs font-mono text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FFEB00] font-bold"
              >
                <option value="auto">
                  ⚡ Auto-Select (Recommended: Evaluates with DeepSeek, fails over to Gemini seamlessly)
                </option>
                <option value="deepseek">
                  🧠 DeepSeek AI Only (deepseek-chat / deepseek-reasoner)
                </option>
                <option value="gemini">
                  ✨ Google Gemini Only (gemini-2.5-flash)
                </option>
                <option value="openai">
                  🌐 OpenAI (gpt-4o fallback)
                </option>
              </select>
            </div>

            {/* Provider Status Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] flex items-center justify-between">
                <div>
                  <p className="font-marker text-sm text-[#111111]">DeepSeek AI</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">Endpoint: api.deepseek.com</p>
                  <p className="text-xs font-mono font-bold text-[#111111] mt-0.5">Model: {deepseekModel}</p>
                </div>
                <Tag variant="yellow">Configured</Tag>
              </div>

              <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] flex items-center justify-between">
                <div>
                  <p className="font-marker text-sm text-[#111111]">Google Gemini</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">Endpoint: generativelanguage.googleapis.com</p>
                  <p className="text-xs font-mono font-bold text-[#111111] mt-0.5">Model: {geminiModel}</p>
                </div>
                <Tag variant="paper">Configured</Tag>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="pt-3 border-t-2 border-dashed border-[#111111]/20">
              <label className="text-xs font-mono font-bold text-[#111111] block mb-1">
                AI Match Qualification Threshold: <span className="bg-[#FFEB00] px-1.5 py-0.5 border border-[#111111] rounded">{threshold}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-[#111111] mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-xs font-mono text-[#6B6B66] mt-1">
                <span>50% (Permissive)</span>
                <span>70% (Balanced Fit)</span>
                <span>95% (Strict Systems Match)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. DISCOVERY SOURCES */}
        <Card className="border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111]">
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2 font-marker text-2xl">
              <Sliders className="h-5 w-5 text-[#111111]" />
              <span>Active Discovery Connectors</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono">
              Continuous background crawling every 30 minutes across official APIs and feeds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <label className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2px_2px_0_#111111] cursor-pointer hover:bg-[#FFFFFF] transition-colors">
              <div>
                <p className="font-marker text-sm text-[#111111]">Remote Developer Boards (Remotive, Arbeitnow)</p>
                <p className="text-xs font-mono text-[#6B6B66]">Direct verified API feeds for remote tech roles</p>
              </div>
              <input
                type="checkbox"
                checked={remoteBoardActive}
                onChange={(e) => setRemoteBoardActive(e.target.checked)}
                className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2px_2px_0_#111111] cursor-pointer hover:bg-[#FFFFFF] transition-colors">
              <div>
                <p className="font-marker text-sm text-[#111111]">LinkedIn Feed Indexer</p>
                <p className="text-xs font-mono text-[#6B6B66]">Public guest search endpoint (compliant, no CAPTCHA bypass)</p>
              </div>
              <input
                type="checkbox"
                checked={linkedinActive}
                onChange={(e) => setLinkedinActive(e.target.checked)}
                className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2px_2px_0_#111111] cursor-pointer hover:bg-[#FFFFFF] transition-colors">
              <div>
                <p className="font-marker text-sm text-[#111111]">Indeed RSS Search Indexer</p>
                <p className="text-xs font-mono text-[#6B6B66]">Structured RSS feed parsing for software engineering roles</p>
              </div>
              <input
                type="checkbox"
                checked={indeedActive}
                onChange={(e) => setIndeedActive(e.target.checked)}
                className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2px_2px_0_#111111] cursor-pointer hover:bg-[#FFFFFF] transition-colors">
              <div>
                <p className="font-marker text-sm text-[#111111]">Google Jobs Indexer</p>
                <p className="text-xs font-mono text-[#6B6B66]">Google-indexed tech job postings</p>
              </div>
              <input
                type="checkbox"
                checked={googleJobsActive}
                onChange={(e) => setGoogleJobsActive(e.target.checked)}
                className="h-5 w-5 accent-[#111111] rounded cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>

        {/* 4. INFRASTRUCTURE PORT ALLOCATIONS */}
        <Card className="border-[2.5px] border-[#111111] shadow-[4px_4px_0_#111111]">
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2 font-marker text-2xl">
              <Shield className="h-5 w-5 text-[#111111]" />
              <span>Assigned Ports (Mandatory Range 9876–9964)</span>
            </CardTitle>
            <CardDescription className="text-xs font-mono">
              Strict internal isolation bound to 127.0.0.1 without external port conflicts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                Next.js Dashboard: <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded">9876</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                n8n Engine: <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded">9877</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                FastAPI API: <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded">9878</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                PostgreSQL: <span className="font-bold bg-[#FAFAF5] px-1 border border-[#111111] rounded">9879</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                Redis 7: <span className="font-bold bg-[#FAFAF5] px-1 border border-[#111111] rounded">9880</span>
              </div>
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                Browser Worker: <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded">9881</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pt-2 flex items-center justify-end">
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isSaving}
            className="gap-2 text-sm font-marker px-6 py-3"
          >
            <Save className="h-5 w-5" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings & Exclusion Rules'}</span>
          </Button>
        </div>
      </form>
    </MainLayout>
  );
}

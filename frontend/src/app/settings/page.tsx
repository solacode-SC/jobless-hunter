'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Sparkles, CheckCircle2, Save, Cpu } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/sketch/tag';

export default function SettingsPage() {
  const [providerPreference, setProviderPreference] = useState('auto');
  const [deepseekModel, setDeepseekModel] = useState('deepseek-chat');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [threshold, setThreshold] = useState(70);
  const [remoteBoardActive, setRemoteBoardActive] = useState(true);
  const [linkedinActive, setLinkedinActive] = useState(true);
  const [indeedActive, setIndeedActive] = useState(true);
  const [googleJobsActive, setGoogleJobsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);

    try {
      await fetch(`http://localhost:9878/api/ai/select?provider=${providerPreference}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout
      title="System Settings &amp; AI Engine Configuration"
      description="Autonomous crawler frequency, AI provider switching & strict port compliance for Solayman El Mouden."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        {saved && (
          <div className="p-4 rounded-lg bg-[#FFEB00]/30 border-2 border-[#111111] shadow-[3px_3px_0_#111111] text-[#111111] font-mono text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            <span>✓ Settings saved successfully. Active AI engine updated.</span>
          </div>
        )}

        {/* AI Multi-Provider Configuration */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#111111]" />
                  <span>AI Engine — DeepSeek &amp; Google Gemini</span>
                </CardTitle>
                <CardDescription>
                  Automated intelligence with multi-model selection and runtime auto-failover.
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
                <Tag variant="yellow">Active</Tag>
              </div>

              <div className="p-4 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] flex items-center justify-between">
                <div>
                  <p className="font-marker text-sm text-[#111111]">Google Gemini</p>
                  <p className="text-[11px] font-mono text-[#6B6B66]">Endpoint: generativelanguage.googleapis.com</p>
                  <p className="text-xs font-mono font-bold text-[#111111] mt-0.5">Model: {geminiModel}</p>
                </div>
                <Tag variant="paper">Supported</Tag>
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

        {/* Discovery Sources */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#111111]" />
              <span>Active Discovery Connectors</span>
            </CardTitle>
            <CardDescription>
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

        {/* Infrastructure Port Allocations */}
        <Card>
          <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#111111]" />
              <span>Assigned Ports (Mandatory Range 9876–9964)</span>
            </CardTitle>
            <CardDescription>
              Strict internal isolation bound to 127.0.0.1 without external port conflicts.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#FAFAF5] border-2 border-[#111111] shadow-[1.5px_1.5px_0_#111111]">
                Next.js: <span className="font-bold bg-[#FFEB00] px-1 border border-[#111111] rounded">9876</span>
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

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings &amp; AI Engine Configuration</span>
        </Button>
      </form>
    </MainLayout>
  );
}

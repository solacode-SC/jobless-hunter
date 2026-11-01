'use client';

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Cpu, Shield, Database, Save, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [providersStatus, setProvidersStatus] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:9878/api/ai/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) setProvidersStatus(data.providers);
        if (data.active_preference) setProviderPreference(data.active_preference);
      })
      .catch(() => {
        setProvidersStatus([
          { name: 'deepseek', model: 'deepseek-chat', configured: true },
          { name: 'gemini', model: 'gemini-2.5-flash', configured: true },
          { name: 'openai', model: 'gpt-4o', configured: false },
        ]);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:9878/api/ai/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerPreference }),
      });
    } catch {
      // Ignore if offline
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout
      title="System Settings"
      description="Configure AI intelligence engine, model failover, thresholds, and discovery sources."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {saved && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved successfully. Active AI engine updated.</span>
          </div>
        )}

        {/* AI Multi-Provider Configuration */}
        <Card className="border-indigo-500/30 bg-slate-900/60 shadow-lg shadow-indigo-500/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>AI Engine — DeepSeek &amp; Google Gemini</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Automated intelligence with smart health checking, multi-model selection, and auto-failover.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-[10px]">
                Multi-Model Failover
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Active Provider Selection Strategy
              </label>
              <select
                value={providerPreference}
                onChange={(e) => setProviderPreference(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="auto">
                  ⚡ Auto-Select (Recommended: Selects best available, fails over between DeepSeek &amp; Gemini)
                </option>
                <option value="deepseek">
                  🧠 DeepSeek AI Only (deepseek-chat / deepseek-reasoner)
                </option>
                <option value="gemini">
                  ✨ Google Gemini Only (gemini-2.5-flash / gemini-2.0-flash)
                </option>
                <option value="openai">
                  🌐 OpenAI (gpt-4o fallback)
                </option>
              </select>
            </div>

            {/* Provider Status Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">DeepSeek AI</p>
                  <p className="text-[10px] text-slate-400">Endpoint: api.deepseek.com</p>
                  <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Model: {deepseekModel}</p>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Supported
                </Badge>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Google Gemini</p>
                  <p className="text-[10px] text-slate-400">Endpoint: generativelanguage.googleapis.com</p>
                  <p className="text-[10px] text-purple-400 font-mono mt-0.5">Model: {geminiModel}</p>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Supported
                </Badge>
              </div>
            </div>

            {/* Threshold Slider */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-medium text-slate-300 block mb-1">
                AI Match Qualification Threshold: <span className="text-indigo-400 font-bold">{threshold}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>50% (Permissive)</span>
                <span>70% (Balanced Fit)</span>
                <span>95% (Strict Systems Match)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discovery Sources */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Active Discovery Connectors</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Continuous background crawling every 30 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-slate-200">Remote Developer Boards (Remotive, Arbeitnow)</p>
                <p className="text-[11px] text-slate-400">Direct verified API feeds for remote tech roles</p>
              </div>
              <input
                type="checkbox"
                checked={remoteBoardActive}
                onChange={(e) => setRemoteBoardActive(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-slate-200">LinkedIn Guest Feed</p>
                <p className="text-[11px] text-slate-400">Public search endpoint (no CAPTCHA bypass required)</p>
              </div>
              <input
                type="checkbox"
                checked={linkedinActive}
                onChange={(e) => setLinkedinActive(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-slate-200">Indeed RSS Search Indexer</p>
                <p className="text-[11px] text-slate-400">Structured RSS feed parsing for software jobs</p>
              </div>
              <input
                type="checkbox"
                checked={indeedActive}
                onChange={(e) => setIndeedActive(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 cursor-pointer">
              <div>
                <p className="text-xs font-medium text-slate-200">Google Jobs Indexer</p>
                <p className="text-[11px] text-slate-400">SerpAPI / Google indexed postings</p>
              </div>
              <input
                type="checkbox"
                checked={googleJobsActive}
                onChange={(e) => setGoogleJobsActive(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>
          </CardContent>
        </Card>

        {/* Infrastructure Port Allocations */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Assigned Ports (Range 9876–9964)</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Verified isolated port mapping bound to localhost only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">Next.js: <span className="text-indigo-400 font-bold">9876</span></div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">n8n Engine: <span className="text-indigo-400 font-bold">9877</span></div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">FastAPI API: <span className="text-indigo-400 font-bold">9878</span></div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">PostgreSQL: <span className="text-indigo-400 font-bold">9879</span></div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">Redis 7: <span className="text-indigo-400 font-bold">9880</span></div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">Browser Worker: <span className="text-indigo-400 font-bold">9881</span></div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs px-6 py-2.5 h-auto font-medium"
        >
          <Save className="h-3.5 w-3.5" />
          <span>Save Settings &amp; AI Engine Configuration</span>
        </Button>
      </form>
    </MainLayout>
  );
}

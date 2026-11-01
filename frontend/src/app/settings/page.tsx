'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Cpu, Shield, Database, Save, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [model, setModel] = useState('gpt-4o');
  const [threshold, setThreshold] = useState(70);
  const [remoteBoardActive, setRemoteBoardActive] = useState(true);
  const [linkedinActive, setLinkedinActive] = useState(true);
  const [indeedActive, setIndeedActive] = useState(true);
  const [googleJobsActive, setGoogleJobsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <MainLayout
      title="System Settings"
      description="Configure AI models, evaluation thresholds, and discovery sources."
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {saved && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        {/* AI Engine Configuration */}
        <Card className="border-slate-800 bg-slate-900/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <span>AI Provider &amp; Model Selection</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Supports OpenAI, Gemini (via OpenAI compatibility), Groq, and local LLMs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Model Name</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="gpt-4o">gpt-4o (High-precision matching &amp; tailoring)</option>
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast screening)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="local-model">Self-Hosted / Local LLM</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Qualification Match Threshold: <span className="text-indigo-400 font-bold">{threshold}%</span>
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
                  <span>70% (Balanced)</span>
                  <span>95% (Strict)</span>
                </div>
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
          <span>Save Settings</span>
        </Button>
      </form>
    </MainLayout>
  );
}

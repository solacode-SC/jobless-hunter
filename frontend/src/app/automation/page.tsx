'use client';

import React, { useState } from 'react';
import { Bot, ExternalLink, Play, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { triggerDiscovery } from '@/lib/api';

const WORKFLOWS = [
  {
    id: 'wf-1',
    name: 'Workflow 1 — Job Discovery Engine',
    description: 'Crawls LinkedIn, Indeed, Google Jobs, and Remote Boards every 30 minutes, deduplicating with SHA-256 fingerprints.',
    schedule: 'Every 30 minutes',
    status: 'active',
    lastRun: '12 minutes ago',
  },
  {
    id: 'wf-2',
    name: 'Workflow 2 — AI Evaluation & Scoring',
    description: 'Evaluates new jobs against CV facts, generates 0-100 match score, and classifies qualified opportunities.',
    schedule: 'Webhook Triggered',
    status: 'active',
    lastRun: '12 minutes ago',
  },
  {
    id: 'wf-3',
    name: 'Workflow 3 — Document Generation',
    description: 'Generates tailored CV and personalized cover letter preserving strictly truthful candidate information.',
    schedule: 'Webhook Triggered',
    status: 'active',
    lastRun: '45 minutes ago',
  },
  {
    id: 'wf-4',
    name: 'Workflow 4 — Application Submission',
    description: 'Validates approval status and queues applications; handles manual submission flags for CAPTCHA sites.',
    schedule: 'Hourly',
    status: 'active',
    lastRun: '50 minutes ago',
  },
  {
    id: 'wf-5',
    name: 'Workflow 5 — Email Response Monitoring',
    description: 'Integrates with Gmail OAuth to detect recruiter responses and interview calendar invitations.',
    schedule: 'Every 15 minutes',
    status: 'active',
    lastRun: '6 minutes ago',
  },
  {
    id: 'wf-6',
    name: 'Workflow 6 — Daily Summary Digest',
    description: 'Generates executive daily markdown report of discovered jobs, sent applications, and conversion rates.',
    schedule: 'Daily at 08:00 UTC',
    status: 'active',
    lastRun: 'Today at 08:00 UTC',
  },
  {
    id: 'wf-7',
    name: 'Workflow 7 — Error Recovery & Alerting',
    description: 'Detects failed executions, retries transient API errors, and alerts admin without duplicate submissions.',
    schedule: 'On Error Trigger',
    status: 'active',
    lastRun: 'Idle / Healthy',
  },
];

export default function AutomationCenterPage() {
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleManualTrigger = async (wfId: string) => {
    setTriggering(wfId);
    try {
      await triggerDiscovery('Software Engineer');
      alert('Workflow execution triggered successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setTriggering(null);
    }
  };

  return (
    <MainLayout
      title="Automation Orchestration Center"
      description="Self-hosted n8n workflows executing continuously 24/7."
    >
      <div className="space-y-6">
        {/* Banner with n8n Link */}
        <Card className="border-indigo-500/20 bg-indigo-950/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-400" />
                <span>n8n Visual Workflow Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected to self-hosted n8n instance at <span className="text-indigo-400 font-mono">automation.solaymanbuilds.com</span> on internal port 9877.
              </p>
            </div>
            <a
              href="https://automation.solaymanbuilds.com"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs">
                <span>Open n8n Editor</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKFLOWS.map((wf) => (
            <Card key={wf.id} className="border-slate-800 bg-slate-900/40 p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-slate-200">{wf.name}</h4>
                  <Badge variant="success" className="text-[10px] capitalize">Active</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{wf.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{wf.schedule}</span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleManualTrigger(wf.id)}
                  disabled={triggering === wf.id}
                  className="h-7 text-[11px] gap-1 border-slate-700 text-slate-300 hover:text-slate-100"
                >
                  <Play className="h-3 w-3" />
                  <span>{triggering === wf.id ? 'Running...' : 'Run Now'}</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

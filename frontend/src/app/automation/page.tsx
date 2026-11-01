'use client';

import React, { useState } from 'react';
import { Bot, ExternalLink, Play, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/sketch/tag';
import { triggerDiscovery } from '@/lib/api';

const WORKFLOWS = [
  {
    id: 'wf-1',
    name: 'Workflow 1 — Job Discovery Harvester',
    description: 'Crawls LinkedIn, Indeed, Google Jobs & Remote Boards every 30 minutes, deduplicating with SHA-256 fingerprints.',
    schedule: 'Every 30 minutes',
    status: 'active',
    lastRun: '12 minutes ago',
  },
  {
    id: 'wf-2',
    name: 'Workflow 2 — AI Evaluation & Scoring',
    description: 'Evaluates new jobs against candidate facts with DeepSeek & Gemini, generates 0-100 match score and marks status.',
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
      description="Self-hosted n8n workflows executing continuously 24/7 on internal port 9877."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Banner with n8n Link */}
        <div className="p-6 bg-[#FAFAF5] border-[2.5px] border-[#111111] shadow-[3.5px_3.5px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-marker text-xl text-[#111111] flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#111111]" />
              <span>n8n Visual Workflow Engine</span>
            </h3>
            <p className="font-hand text-base text-[#6B6B66]">
              Connected to self-hosted n8n instance at <span className="text-[#111111] font-mono font-bold">automation.solaymanbuilds.com</span> on internal port 9877.
            </p>
          </div>
          <a
            href="https://automation.solaymanbuilds.com"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="default" className="gap-2 text-xs">
              <span>Open n8n Editor</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0_#111111] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-transform"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-marker text-base text-[#111111]">{wf.name}</h4>
                  <Tag variant="yellow">Active</Tag>
                </div>
                <p className="font-body text-xs text-[#6B6B66] mt-2 leading-relaxed">{wf.description}</p>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-[#111111]/20 flex items-center justify-between text-xs font-mono text-[#6B6B66]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#111111]" />
                  <span>{wf.schedule}</span>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleManualTrigger(wf.id)}
                  disabled={triggering === wf.id}
                  className="h-7 text-[11px] gap-1"
                >
                  <Play className="h-3 w-3" />
                  <span>{triggering === wf.id ? 'Running...' : 'Run Now'}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

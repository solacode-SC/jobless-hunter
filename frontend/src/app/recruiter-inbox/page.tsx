'use client';

import React, { useState } from 'react';
import { Mail, Calendar, CheckCircle2, AlertCircle, Clock, Send, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RecruiterMessage {
  id: string;
  sender: string;
  company: string;
  role: string;
  subject: string;
  body: string;
  received_at: string;
  type: 'interview' | 'assessment' | 'general' | 'rejection';
}

const MOCK_MESSAGES: RecruiterMessage[] = [
  {
    id: 'msg-1',
    sender: 'alexa.miller@hyperflow.ai',
    company: 'HyperFlow AI',
    role: 'Full Stack Systems Engineer',
    subject: 'Interview Invitation: Technical Round with Engineering Team',
    body: 'Hi Solayman,\n\nWe reviewed your application and GitHub projects. The team was particularly impressed with your low-level C and full-stack TypeScript background from 1337 UM6P.\n\nWe would love to schedule a 45-minute technical screen with our tech lead next week.\n\nPlease pick a slot here: https://calendly.com/hyperflow-alexa/tech-screen\n\nBest,\nAlexa Miller',
    received_at: '2 hours ago',
    type: 'interview',
  },
  {
    id: 'msg-2',
    sender: 'recruiting@scaleops.io',
    company: 'ScaleOps Technologies',
    role: 'Senior DevOps / Cloud Engineer',
    subject: 'Update regarding your application',
    body: 'Hello Solayman,\n\nThank you for applying. We are actively reviewing your DevOps experience at RiLyMed and containerization workflows. We will provide an update within 48 hours.\n\nWarm regards,\nScaleOps Talent Team',
    received_at: 'Yesterday',
    type: 'general',
  },
];

export default function RecruiterInboxPage() {
  const [messages] = useState<RecruiterMessage[]>(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<RecruiterMessage>(MOCK_MESSAGES[0]);

  return (
    <MainLayout
      title="Recruiter Communications Inbox"
      description="Gmail OAuth integration detecting interview requests and recruiter updates."
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recruiter Messages ({messages.length})
            </h4>
            {messages.map((msg) => (
              <Card
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`border-slate-800/80 bg-slate-900/40 cursor-pointer p-4 transition-all hover:border-slate-700 ${
                  selectedMessage?.id === msg.id ? 'border-indigo-500/50 bg-indigo-950/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-200">{msg.company}</span>
                  {msg.type === 'interview' ? (
                    <Badge variant="success" className="text-[10px]">Interview</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">Update</Badge>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-300 mt-1 truncate">{msg.subject}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>{msg.sender}</span>
                  <span>{msg.received_at}</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Email View and Reply Generator */}
          <div className="lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/40 h-full flex flex-col">
              <CardHeader className="border-b border-slate-800/60 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">{selectedMessage.subject}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      From: <span className="text-indigo-400">{selectedMessage.sender}</span> ({selectedMessage.company})
                    </CardDescription>
                  </div>
                  <span className="text-xs text-slate-500">{selectedMessage.received_at}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {selectedMessage.body}
                </div>

                {/* AI Reply Assistant */}
                <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Suggested Response</span>
                    </span>
                    <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 gap-1.5">
                      <Send className="h-3 w-3" />
                      <span>Send via Gmail</span>
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={`Hi Alexa,\n\nThank you for the update! I am excited to discuss the role and walk through my engineering work at 1337 UM6P and RiLyMed.\n\nI have selected a slot on your Calendly link for Tuesday at 3:00 PM.\n\nLooking forward to speaking with the team.\n\nBest regards,\nSolayman El Mouden`}
                    className="w-full h-32 bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 text-xs text-slate-300 focus:outline-none resize-none font-sans"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}


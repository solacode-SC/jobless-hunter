'use client';

import React, { useState } from 'react';
import { Mail, Calendar, CheckCircle2, AlertCircle, Clock, Send, Sparkles } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/sketch/tag';

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
      description="Authorized email monitoring detecting interview requests & updates for Solayman El Mouden."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thread List */}
          <div className="space-y-3">
            <h4 className="font-marker text-base text-[#111111]">
              Recruiter Messages ({messages.length})
            </h4>
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] ${
                  selectedMessage?.id === msg.id ? 'bg-[#FFEB00]/25 -rotate-1 border-[2.5px]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-marker text-sm text-[#111111]">{msg.company}</span>
                  <Tag variant={msg.type === 'interview' ? 'yellow' : 'paper'}>
                    {msg.type}
                  </Tag>
                </div>
                <p className="font-hand text-base font-bold text-[#111111] mt-1 truncate">{msg.subject}</p>
                <div className="flex items-center justify-between text-xs font-mono text-[#6B6B66] mt-2">
                  <span>{msg.sender}</span>
                  <span>{msg.received_at}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Email View and Reply Generator */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b-2 border-dashed border-[#111111]/20 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <CardDescription>
                      From: <span className="font-bold text-[#111111]">{selectedMessage.sender}</span> ({selectedMessage.company})
                    </CardDescription>
                  </div>
                  <Tag variant="paper">{selectedMessage.received_at}</Tag>
                </div>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="text-sm font-hand text-[#111111] leading-relaxed whitespace-pre-line bg-[#FAFAF5] p-5 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0_#111111]">
                  {selectedMessage.body}
                </div>

                {/* AI Reply Assistant */}
                <div className="border-2 border-[#111111] bg-[#FAFAF5] rounded-xl p-4 space-y-3 shadow-[3px_3px_0_#111111]">
                  <div className="flex items-center justify-between">
                    <span className="font-marker text-sm text-[#111111] flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Suggested Response (Ready for Review)</span>
                    </span>
                    <Button size="sm" variant="default" className="h-8 gap-1.5 text-xs">
                      <Send className="h-3.5 w-3.5" />
                      <span>Authorize Send</span>
                    </Button>
                  </div>
                  <textarea
                    readOnly
                    value={`Hi Alexa,\n\nThank you for the update! I am excited to discuss the role and walk through my engineering work at 1337 UM6P and RiLyMed.\n\nI have selected a slot on your Calendly link for Tuesday at 3:00 PM.\n\nLooking forward to speaking with the team.\n\nBest regards,\nSolayman El Mouden`}
                    className="w-full h-32 bg-[#FFFFFF] border-2 border-[#111111] rounded-lg p-3 text-xs font-mono text-[#111111] focus:outline-none resize-none"
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

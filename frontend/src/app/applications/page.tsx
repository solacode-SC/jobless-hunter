'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  List,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { getPipeline, updateApplicationStatus, approveApplication } from '@/lib/api';

const PIPELINE_COLUMNS = [
  { key: 'qualified', label: 'Qualified', color: 'border-blue-500/30' },
  { key: 'awaiting_approval', label: 'Awaiting Approval', color: 'border-amber-500/30' },
  { key: 'documents_ready', label: 'Documents Ready', color: 'border-indigo-500/30' },
  { key: 'applied', label: 'Applied', color: 'border-sky-500/30' },
  { key: 'interview', label: 'Interview', color: 'border-purple-500/30' },
  { key: 'offer', label: 'Offer', color: 'border-emerald-500/30' },
];

export default function ApplicationsPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const data = await getPipeline();
      setStages(data.stages);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const handleApprove = async (id: string) => {
    setUpdatingId(id);
    try {
      await approveApplication(id);
      await loadPipeline();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      await loadPipeline();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <MainLayout
      title="Application Pipeline"
      description={`Tracking ${total} active application workflows.`}
      onRefresh={loadPipeline}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map((col) => {
            const stage = stages.find((s) => s.status === col.key);
            const apps = stage?.applications || [];
            return (
              <div key={col.key} className="flex flex-col min-w-[220px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-3">
                  <span className="text-xs font-semibold text-slate-300">{col.label}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {stage?.count || 0}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[70vh]">
                  {apps.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-slate-600 border border-dashed border-slate-800/60 rounded-lg">
                      Empty
                    </div>
                  ) : (
                    apps.map((item: any) => (
                      <Card key={item.id} className="border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-all text-xs space-y-2">
                        <Link href={`/jobs/${item.job_id}`} className="font-semibold text-slate-200 hover:text-indigo-400 block truncate">
                          {item.job_title}
                        </Link>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          <span>{item.company}</span>
                        </div>

                        {col.key === 'awaiting_approval' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            disabled={updatingId === item.id}
                            className="w-full h-7 text-[10px] bg-emerald-600 hover:bg-emerald-500 font-medium"
                          >
                            Approve for Submission
                          </Button>
                        )}

                        {col.key === 'documents_ready' && (
                          <Button
                            size="sm"
                            onClick={() => handleMoveStatus(item.id, 'applied')}
                            disabled={updatingId === item.id}
                            className="w-full h-7 text-[10px] bg-indigo-600 hover:bg-indigo-500 font-medium"
                          >
                            Mark as Applied
                          </Button>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}


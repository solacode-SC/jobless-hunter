'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Kanban,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { getPipeline, updateApplicationStatus, approveApplication } from '@/lib/api';

const PIPELINE_COLUMNS = [
  { key: 'qualified', label: 'Qualified', badge: 'bg-[#FFEB00]' },
  { key: 'awaiting_approval', label: 'Awaiting Approval', badge: 'bg-[#FEF08A]' },
  { key: 'documents_ready', label: 'Documents Ready', badge: 'bg-[#BAE6FD]' },
  { key: 'applied', label: 'Applied', badge: 'bg-[#DDD6FE]' },
  { key: 'interview', label: 'Interview', badge: 'bg-[#BBF7D0]' },
  { key: 'offer', label: 'Offer', badge: 'bg-[#86EFAC]' },
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
      title="Application Kanban Board"
      description={`Tracking ${total} active application workflows for Solayman El Mouden.`}
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
              <div
                key={col.key}
                className="flex flex-col min-w-[240px] bg-[#FAFAF5] rounded-[15px_225px_15px_255px/255px_15px_225px_15px] border-2 border-[#111111] shadow-[3.5px_3.5px_0_#111111] p-3.5"
              >
                <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#111111]/30 mb-3">
                  <span className="font-hand text-base font-bold text-[#111111]">{col.label}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-[#111111] shadow-[1px_1px_0_#111111] ${col.badge} text-[#111111]`}>
                    {stage?.count || 0}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
                  {apps.length === 0 ? (
                    <div className="p-4 text-center border border-dashed border-[#111111]/30 rounded-lg">
                      <p className="font-hand text-sm text-[#6B6B66]">Empty column</p>
                    </div>
                  ) : (
                    apps.map((app: any) => (
                      <div
                        key={app.id}
                        className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg p-3 space-y-2 hover:-translate-y-0.5 transition-transform"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-marker text-sm text-[#111111] leading-tight line-clamp-2">
                            {app.job?.title || 'Target Role'}
                          </p>
                        </div>
                        <p className="text-xs font-mono text-[#6B6B66] flex items-center gap-1 font-bold">
                          <Building2 className="w-3 h-3" />
                          {app.job?.company || 'Company'}
                        </p>

                        <div className="pt-2 border-t border-dashed border-[#111111]/20 flex items-center justify-between gap-1">
                          {col.key === 'awaiting_approval' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(app.id)}
                              disabled={updatingId === app.id}
                              className="w-full text-[10px] h-7"
                            >
                              Approve
                            </Button>
                          )}
                          {col.key === 'qualified' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleMoveStatus(app.id, 'awaiting_approval')}
                              disabled={updatingId === app.id}
                              className="w-full text-[10px] h-7"
                            >
                              Move to Review
                            </Button>
                          )}
                          {col.key === 'documents_ready' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleMoveStatus(app.id, 'applied')}
                              disabled={updatingId === app.id}
                              className="w-full text-[10px] h-7"
                            >
                              Mark Applied
                            </Button>
                          )}
                          {(col.key === 'applied' || col.key === 'interview' || col.key === 'offer') && (
                            <span className="text-[10px] font-mono text-[#6B6B66]">
                              {app.submission_method || 'Direct'}
                            </span>
                          )}
                        </div>
                      </div>
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

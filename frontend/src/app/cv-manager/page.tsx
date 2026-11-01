'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDocuments, getCandidateProfile, uploadCV } from '@/lib/api';
import { Document, CandidateProfile } from '@/types';
import { Tag } from '@/components/sketch/tag';

export default function CVManagerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, cand] = await Promise.all([getDocuments('cv'), getCandidateProfile()]);
      setDocuments(docsRes.items);
      setCandidate(cand);
      if (docsRes.items.length > 0) {
        setSelectedDoc(docsRes.items[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess(false);

    try {
      const res = await uploadCV(file);
      setUploadSuccess(true);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout
      title="Curriculum Vitae Studio"
      description="Original CV source of truth & job-tailored resumes for Solayman El Mouden."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Upload Original CV Banner */}
        <div className="p-6 bg-[#FAFAF5] border-[2.5px] border-[#111111] shadow-[3.5px_3.5px_0_#111111] rounded-[220px_12px_200px_12px/12px_200px_12px_220px] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-marker text-xl text-[#111111] flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#111111]" />
              <span>Primary Master CV (Source of Truth)</span>
            </h3>
            <p className="font-hand text-base text-[#6B6B66]">
              Uploaded document is parsed to extract strictly factual background (1337 UM6P, RiLyMed DevOps). AI will never fabricate credentials.
            </p>
            {candidate?.original_cv_path && (
              <p className="text-xs text-[#111111] flex items-center gap-1.5 font-mono pt-1">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="font-bold">Active File: {candidate.original_cv_path.split('/').pop()}</span>
              </p>
            )}
          </div>

          <div>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-[150px_10px_120px_8px/10px_120px_8px_150px] bg-[#FFEB00] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] text-[#111111] text-xs font-mono font-bold uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0.5 transition-all">
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Parsing CV...' : 'Upload PDF / DOCX'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            {uploadSuccess && (
              <p className="text-xs font-mono font-bold text-emerald-700 text-center mt-1">
                ✓ Parsed successfully!
              </p>
            )}
          </div>
        </div>

        {/* Tailored Resumes List & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of tailored CVs */}
          <div className="space-y-3">
            <h4 className="font-marker text-base text-[#111111]">
              Tailored CV Versions ({documents.length})
            </h4>
            {documents.length === 0 ? (
              <Card className="p-6 text-center text-xs font-hand text-[#6B6B66]">
                No tailored CVs generated yet. Open a qualified job and click &quot;Generate Tailored CV&quot;.
              </Card>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] ${
                    selectedDoc?.id === doc.id ? 'bg-[#FFEB00]/25 -rotate-1 border-[2.5px]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-marker text-sm text-[#111111]">
                      {doc.metadata_?.company ? `${doc.metadata_.company} — CV` : `CV v${doc.version}`}
                    </span>
                    <Tag variant={selectedDoc?.id === doc.id ? 'yellow' : 'paper'}>
                      {doc.language}
                    </Tag>
                  </div>
                  <p className="font-hand text-sm text-[#6B6B66] mt-1 truncate">
                    {doc.metadata_?.job_title || 'Software Engineer'}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Document Preview Pane */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
                <div>
                  <CardTitle>Document Preview</CardTitle>
                  <CardDescription>
                    {selectedDoc
                      ? `Version ${selectedDoc.version} (${selectedDoc.language.toUpperCase()})`
                      : 'Select a document'}
                  </CardDescription>
                </div>
                {selectedDoc && (
                  <a
                    href={`http://localhost:9878/api/documents/${selectedDoc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="default" className="h-8 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </Button>
                  </a>
                )}
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto max-h-[650px] font-mono text-xs text-[#111111] bg-[#FAFAF5] m-4 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0_#111111] leading-relaxed whitespace-pre-wrap">
                {selectedDoc?.content || 'No document content selected.'}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

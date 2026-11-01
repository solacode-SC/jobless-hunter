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
import { getDocuments, getCandidateProfile } from '@/lib/api';
import { Document, CandidateProfile } from '@/types';

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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:9878/api/candidate/upload-cv', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setUploadSuccess(true);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <MainLayout
      title="Curriculum Vitae Manager"
      description="Original CV source of truth and AI-tailored job-specific resumes."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        {/* Upload Original CV Banner */}
        <Card className="border-indigo-500/20 bg-indigo-950/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span>Primary CV (Source of Truth)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Uploaded document is parsed to extract strictly factual background. AI will never fabricate credentials.
              </p>
              {candidate?.original_cv_path && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono pt-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Current: {candidate.original_cv_path.split('/').pop()}</span>
                </p>
              )}
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all">
                <Upload className="h-3.5 w-3.5" />
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
                <p className="text-[11px] text-emerald-400 text-center mt-1">Uploaded &amp; parsed!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tailored Resumes List & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of tailored CVs */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tailored CV Versions ({documents.length})
            </h4>
            {documents.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
                No tailored CVs generated yet. Open a qualified job and click &quot;Generate Tailored CV&quot;.
              </Card>
            ) : (
              documents.map((doc) => (
                <Card
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`border-slate-800/80 bg-slate-900/40 cursor-pointer p-4 transition-all hover:border-slate-700 ${
                    selectedDoc?.id === doc.id ? 'border-indigo-500/50 bg-indigo-950/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 text-xs">
                      {doc.metadata_?.company ? `${doc.metadata_.company} — CV` : `CV v${doc.version}`}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {doc.language}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    {doc.metadata_?.job_title || 'Software Engineer'}
                  </p>
                </Card>
              ))
            )}
          </div>

          {/* Document Preview Pane */}
          <div className="lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/40 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/60 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Document Preview</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedDoc ? `Version ${selectedDoc.version} (${selectedDoc.language.toUpperCase()})` : 'Select a document'}
                  </CardDescription>
                </div>
                {selectedDoc && (
                  <a
                    href={`http://localhost:9878/api/documents/${selectedDoc.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="outline" className="h-8 gap-2 border-slate-700 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download PDF</span>
                    </Button>
                  </a>
                )}
              </CardHeader>
              <CardContent className="p-6 flex-1 overflow-y-auto max-h-[650px] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedDoc?.content || 'No document content selected.'}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

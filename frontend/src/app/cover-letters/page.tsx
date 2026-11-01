'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Download, Edit3, Save, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDocuments } from '@/lib/api';
import { Document } from '@/types';

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<Document[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDocuments('cover_letter');
      setLetters(res.items);
      if (res.items.length > 0) {
        setSelectedLetter(res.items[0]);
        setContent(res.items[0].content || '');
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

  const handleSelectLetter = (doc: Document) => {
    setSelectedLetter(doc);
    setContent(doc.content || '');
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    if (!selectedLetter) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:9878/api/documents/${selectedLetter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, is_approved: true }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout
      title="Cover Letter Studio"
      description="Tailored, high-impact letters generated for each application."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letters list */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cover Letters ({letters.length})
            </h4>
            {letters.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
                No cover letters generated yet. Generate one from a job detail page.
              </Card>
            ) : (
              letters.map((doc) => (
                <Card
                  key={doc.id}
                  onClick={() => handleSelectLetter(doc)}
                  className={`border-slate-800/80 bg-slate-900/40 cursor-pointer p-4 transition-all hover:border-slate-700 ${
                    selectedLetter?.id === doc.id ? 'border-purple-500/50 bg-purple-950/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 text-xs">
                      {doc.metadata_?.company ? `${doc.metadata_.company}` : `Cover Letter v${doc.version}`}
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

          {/* Letter Editor */}
          <div className="lg:col-span-2">
            <Card className="border-slate-800 bg-slate-900/40 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/60 pb-3">
                <div>
                  <CardTitle className="text-sm font-semibold">Cover Letter Editor</CardTitle>
                  <CardDescription className="text-xs">
                    {selectedLetter?.metadata_?.company
                      ? `Application for ${selectedLetter.metadata_.company}`
                      : 'Edit and approve before dispatch'}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedLetter && (
                    <a
                      href={`http://localhost:9878/api/documents/${selectedLetter.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="outline" className="h-8 gap-2 border-slate-700 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </Button>
                    </a>
                  )}

                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !selectedLetter}
                    className="h-8 gap-1.5 bg-purple-600 hover:bg-purple-500 text-xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? 'Saving...' : 'Save & Approve'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                {savedSuccess && (
                  <div className="mb-3 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Cover letter saved and PDF updated!</span>
                  </div>
                )}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Select a cover letter to view or edit..."
                  className="flex-1 w-full bg-slate-950/60 border border-slate-800 rounded-lg p-4 font-sans text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none min-h-[450px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

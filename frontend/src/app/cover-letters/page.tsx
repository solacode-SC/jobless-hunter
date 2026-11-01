'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Download, Edit3, Save, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDocuments } from '@/lib/api';
import { Document } from '@/types';
import { Tag } from '@/components/sketch/tag';

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
      description="Tailored, high-impact letters generated for Solayman El Mouden's applications."
      onRefresh={loadData}
      isRefreshing={loading}
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letters list */}
          <div className="space-y-3">
            <h4 className="font-marker text-base text-[#111111]">
              Cover Letters ({letters.length})
            </h4>
            {letters.length === 0 ? (
              <Card className="p-6 text-center text-xs font-hand text-[#6B6B66]">
                No cover letters generated yet. Generate one from a job detail page.
              </Card>
            ) : (
              letters.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectLetter(doc)}
                  className={`bg-[#FFFFFF] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111111] ${
                    selectedLetter?.id === doc.id ? 'bg-[#FFEB00]/25 -rotate-1 border-[2.5px]' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-marker text-sm text-[#111111]">
                      {doc.metadata_?.company ? `${doc.metadata_.company}` : `Cover Letter v${doc.version}`}
                    </span>
                    <Tag variant={selectedLetter?.id === doc.id ? 'yellow' : 'paper'}>
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

          {/* Letter Editor */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-dashed border-[#111111]/20 pb-3">
                <div>
                  <CardTitle>Cover Letter Editor</CardTitle>
                  <CardDescription>
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
                      <Button size="sm" variant="secondary" className="h-8 gap-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        <span>Download PDF</span>
                      </Button>
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={saving || !selectedLetter}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? 'Saving...' : 'Save & Approve'}</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                {savedSuccess && (
                  <div className="mb-3 p-3 rounded-lg bg-[#FFEB00]/30 border-2 border-[#111111] shadow-[2px_2px_0_#111111] text-[#111111] text-xs font-mono font-bold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-700" />
                    <span>✓ Cover letter saved and PDF updated!</span>
                  </div>
                )}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Select a cover letter to view or edit..."
                  className="flex-1 w-full bg-[#FAFAF5] border-2 border-[#111111] shadow-[2.5px_2.5px_0_#111111] rounded-lg p-4 font-mono text-xs text-[#111111] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#FFEB00] resize-none min-h-[450px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

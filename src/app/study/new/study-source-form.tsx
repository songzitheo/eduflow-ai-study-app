'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { createStudySource, createStudySourceFromPDF } from './actions';

type InputMode = 'text' | 'pdf';

export function StudySourceForm() {
  const [mode, setMode] = useState<InputMode>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'text') {
        await createStudySource(formData);
      } else {
        await createStudySourceFromPDF(formData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create study source');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'text'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Text
        </button>
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            mode === 'pdf'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-gray-700">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            placeholder="Enter study source title"
            required
            disabled={isSubmitting}
            className="border border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Content Field - Text or PDF based on mode */}
        {mode === 'text' ? (
          <div className="space-y-2">
            <Label htmlFor="rawText" className="text-gray-700">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rawText"
              name="rawText"
              placeholder="Paste your study content here..."
              required
              rows={12}
              disabled={isSubmitting}
              className="border border-gray-300 focus:border-blue-500 resize-y"
            />
            <p className="text-sm text-gray-500">
              Paste the raw text content you want to study from.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="pdfFile" className="text-gray-700">
              PDF File <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pdfFile"
              name="pdfFile"
              type="file"
              accept=".pdf"
              required
              disabled={isSubmitting}
              className="border border-gray-300 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500">
              Upload a PDF file and we&apos;ll extract the text automatically.
            </p>
          </div>
        )}

        {/* Deadline Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-gray-700">
            Deadline (Optional)
          </Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            disabled={isSubmitting}
            className="border border-gray-300 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500">
            Set a deadline for when you want to complete this study source.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Study Source'}
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            className="border-gray-300 hover:bg-gray-100"
            asChild
          >
            <Link href="/">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Container } from '@/components/container';

import { createStudySource } from './actions';

export default function NewStudySourcePage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Create New Study Source</h1>
          <p className="text-gray-600">
            Add a new study source by entering a title and pasting your content below.
          </p>
        </div>

        <form action={createStudySource} className="space-y-6">
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
              className="border border-gray-300 focus:border-blue-500"
            />
          </div>

          {/* Raw Text Content Field */}
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
              className="border border-gray-300 focus:border-blue-500 resize-y"
            />
            <p className="text-sm text-gray-500">
              Paste the raw text content you want to study from.
            </p>
          </div>

          {/* Deadline Field (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-gray-700">
              Deadline (Optional)
            </Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              className="border border-gray-300 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500">
              Set a deadline for when you want to complete this study source.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Create Study Source
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 hover:bg-gray-100"
              asChild
            >
              <Link href="/">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
}

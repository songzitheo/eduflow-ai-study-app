import { Container } from '@/components/container';

import { StudySourceForm } from './study-source-form';

export default function NewStudySourcePage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Create New Study Source</h1>
          <p className="text-gray-600">
            Add a new study source by pasting text or uploading a PDF file.
          </p>
        </div>

        <StudySourceForm />
      </div>
    </Container>
  );
}

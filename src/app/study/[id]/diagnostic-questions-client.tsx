'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

import { generateDiagnosticQuestions,submitAnswer } from './actions';

interface Answer {
  user_answer: string;
  ai_feedback: string;
}

interface Question {
  id: string;
  question: string;
  order_index: number;
  diagnostic_answers?: Answer[];
}

export function DiagnosticQuestionsClient({
  questions = [],
  studySourceId,
}: {
  questions?: Question[];
  studySourceId: string;
}) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function handleGenerateQuestions() {
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('studySourceId', studySourceId);
      await generateDiagnosticQuestions(formData);
      toast({
        description: 'Diagnostic questions generated successfully! Refreshing page...',
      });
      // Give the revalidation time to complete, then reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Failed to generate questions. Please try again.',
      });
      setGenerating(false);
    }
  }

  // If no questions, show generate button
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <Button
          onClick={handleGenerateQuestions}
          disabled={generating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {generating ? 'Generating Questions...' : 'Generate Diagnostic Questions'}
        </Button>
      </div>
    );
  }

  async function handleSubmit(questionId: string, formData: FormData) {
    setSubmittingId(questionId);
    try {
      await submitAnswer(formData);
      toast({
        description: 'Answer submitted! Getting AI feedback...',
      });
      // Reload page to show AI feedback
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Failed to submit answer. Please try again.',
      });
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {questions.map((question, index) => {
        const answer = question.diagnostic_answers?.[0];
        const isAnswered = !!answer;

        return (
          <div
            key={question.id}
            className="p-6 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Question Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-700">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {question.question}
                </h3>
              </div>
            </div>

            {/* Answer Form or Display */}
            {isAnswered ? (
              <div className="ml-12 space-y-4">
                {/* User's Answer */}
                <div>
                  <Label className="text-gray-600 text-sm">Your Answer</Label>
                  <div className="mt-2 p-4 bg-white rounded-md border border-gray-200">
                    <p className="text-gray-800">{answer.user_answer}</p>
                  </div>
                </div>

                {/* AI Feedback */}
                <div>
                  <Label className="text-gray-600 text-sm">AI Feedback</Label>
                  <div className="mt-2 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-gray-700">{answer.ai_feedback}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form
                action={(formData) => handleSubmit(question.id, formData)}
                className="ml-12 space-y-4"
              >
                <input type="hidden" name="questionId" value={question.id} />
                <input type="hidden" name="studySourceId" value={studySourceId} />
                
                <div>
                  <Label htmlFor={`answer-${question.id}`} className="text-gray-700">
                    Your Answer
                  </Label>
                  <Textarea
                    id={`answer-${question.id}`}
                    name="answer"
                    placeholder="Type your answer here..."
                    required
                    rows={4}
                    className="mt-2 border-gray-300 focus:border-blue-500"
                    disabled={submittingId === question.id}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submittingId === question.id}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submittingId === question.id ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
